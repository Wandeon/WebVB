/**
 * AI Queue Worker
 * Background worker that polls for pending AI jobs and processes them
 */

import { randomUUID } from 'crypto';

import { aiQueueRepository } from '@repo/database';
import { z } from 'zod';

import { aiLogger } from '../logger';
import { generate, isOllamaCloudConfigured } from './ollama-cloud';
import { runArticlePipeline } from './pipeline';
import { hashText } from './prompt-utils';

import type { AiQueueRecord } from '@repo/database';

// =============================================================================
// Types
// =============================================================================

interface PostGenerationResult {
  title: string;
  content: string;
  excerpt: string;
}

// =============================================================================
// Configuration
// =============================================================================

const POLL_INTERVAL_MS = 10_000; // 10 seconds
const WORKER_ENABLED = process.env.AI_WORKER_ENABLED !== 'false';
const WORKER_ID = process.env.AI_WORKER_ID ?? randomUUID();
const LEASE_DURATION_MS = 5 * 60 * 1000;
const MAX_CONTENT_LENGTH = 20000;

// =============================================================================
// State
// =============================================================================

let workerInterval: ReturnType<typeof setInterval> | null = null;
let isProcessing = false;

// =============================================================================
// Helper Functions
// =============================================================================

const postGenerationSchema = z
  .object({
    title: z.string().min(1).max(100),
    content: z.string().min(1).max(MAX_CONTENT_LENGTH),
    excerpt: z.string().min(1).max(200),
  })
  .strict();

const ALLOWED_HTML_TAGS = new Set(['p', 'h2', 'h3', 'ul', 'li', 'strong', 'em', 'a', 'br']);

function extractJson(response: string): unknown {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]) as unknown;
  } catch {
    return null;
  }
}

function containsUnsafeMarkup(value: string): boolean {
  return /<\s*script\b|javascript:|on\w+\s*=|<\s*iframe\b/i.test(value);
}

function hasOnlyAllowedTags(value: string): boolean {
  const tagRegex = /<\/?([a-z0-9-]+)(\s[^>]*)?>/gi;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(value)) !== null) {
    const tagName = match[1]?.toLowerCase();
    if (!tagName || !ALLOWED_HTML_TAGS.has(tagName)) {
      return false;
    }
  }

  return true;
}

function validatePostGenerationResult(response: string): {
  result: PostGenerationResult | null;
  error?: string;
} {
  const extracted = extractJson(response);
  if (!extracted) {
    return { result: null, error: 'Neispravan JSON odgovor' };
  }

  const parsed = postGenerationSchema.safeParse(extracted);
  if (!parsed.success) {
    return { result: null, error: 'Neispravna struktura AI odgovora' };
  }

  const { title, content, excerpt } = parsed.data;

  if (/[<>]/.test(title) || /[<>]/.test(excerpt)) {
    return { result: null, error: 'Naslov ili sažetak sadrži HTML' };
  }

  if (containsUnsafeMarkup(content)) {
    return { result: null, error: 'Sadržaj sadrži nesiguran HTML' };
  }

  if (!hasOnlyAllowedTags(content)) {
    return { result: null, error: 'Sadržaj sadrži nepodržane HTML tagove' };
  }

  return { result: parsed.data };
}

// =============================================================================
// Job Processing
// =============================================================================

/**
 * Process a single AI queue job
 * 1. Log start
 * 2. Mark as processing
 * 3. Call generate() with job input data
 * 4. If success: mark completed with response data
 * 5. If failure: retry if attempts < maxAttempts, otherwise mark failed
 */
async function processJob(job: AiQueueRecord): Promise<void> {
  aiLogger.info(
    { jobId: job.id, requestType: job.requestType, attempt: job.attempts },
    'Processing AI queue job'
  );

  // Extract prompt and system from input data
  const inputData = job.inputData as { prompt?: string; system?: string };
  const prompt = inputData.prompt;
  const system = inputData.system;

  if (!prompt) {
    aiLogger.error({ jobId: job.id }, 'Job missing required prompt in inputData');
    await aiQueueRepository.markFailed(
      job.id,
      'Nedostaje obavezni prompt u inputData'
    );
    return;
  }

  if (job.attempts > job.maxAttempts) {
    await aiQueueRepository.markFailed(
      job.id,
      `Prekoračen maksimalni broj pokušaja (${job.maxAttempts})`
    );
    return;
  }

  // Call the AI generate function
  // Only include system if it's defined (exactOptionalPropertyTypes)
  const result = await generate(prompt, system ? { system } : {});

  if (result.success) {
    // Success - mark completed with response data
    aiLogger.info(
      { jobId: job.id, model: result.data.model },
      'AI queue job completed successfully'
    );

    // Build result data
    const responseHash = hashText(result.data.response);
    const resultData: Record<string, unknown> = {
      responseHash,
      responseLength: result.data.response.length,
      model: result.data.model,
      promptTokens: result.data.prompt_eval_count,
      completionTokens: result.data.eval_count,
      totalDurationMs: result.data.total_duration
        ? result.data.total_duration / 1_000_000
        : null,
    };

    // For post_generation jobs, parse the response and run through pipeline
    if (job.requestType === 'post_generation') {
      const validated = validatePostGenerationResult(result.data.response);

      if (!validated.result) {
        aiLogger.warn(
          { jobId: job.id, reason: validated.error },
          'Invalid post generation response'
        );
        await aiQueueRepository.markFailed(
          job.id,
          validated.error ?? 'Neispravan AI odgovor',
          resultData
        );
        return;
      }

      aiLogger.info({ jobId: job.id }, 'Running article through quality pipeline');

      // Run through REVIEW → REWRITE → POLISH pipeline
      const pipelineResult = await runArticlePipeline(validated.result);

      aiLogger.info(
        {
          jobId: job.id,
          finalScore: pipelineResult.finalScore,
          passed: pipelineResult.passed,
          rewriteCount: pipelineResult.rewriteCount,
        },
        'Article pipeline completed'
      );

      if (!pipelineResult.passed) {
        await aiQueueRepository.markFailed(
          job.id,
          'AI članak nije prošao provjeru kvalitete',
          {
            ...resultData,
            pipelineScore: pipelineResult.finalScore,
            pipelinePassed: pipelineResult.passed,
            pipelineRewriteCount: pipelineResult.rewriteCount,
          }
        );
        return;
      }

      resultData.title = pipelineResult.article.title;
      resultData.content = pipelineResult.article.content;
      resultData.excerpt = pipelineResult.article.excerpt;
      resultData.pipelineScore = pipelineResult.finalScore;
      resultData.pipelinePassed = pipelineResult.passed;
      resultData.pipelineRewriteCount = pipelineResult.rewriteCount;
    } else {
      if (containsUnsafeMarkup(result.data.response)) {
        await aiQueueRepository.markFailed(
          job.id,
          'AI odgovor sadrži nesiguran sadržaj',
          resultData
        );
        return;
      }

      resultData.response = result.data.response;
    }

    await aiQueueRepository.markCompleted(job.id, resultData);
  } else {
    // Failure - check if we should retry
    const errorMessage = result.error.message;
    const errorCode = result.error.code;

    aiLogger.warn(
      {
        jobId: job.id,
        errorCode,
        errorMessage,
        attempt: job.attempts,
        maxAttempts: job.maxAttempts,
      },
      'AI queue job failed'
    );

    if (job.attempts < job.maxAttempts) {
      // Reset to pending for retry
      aiLogger.info(
        { jobId: job.id, attemptsRemaining: job.maxAttempts - job.attempts },
        'Resetting job to pending for retry'
      );
      await aiQueueRepository.resetToPending(job.id);
    } else {
      // Max attempts reached - mark as permanently failed
      aiLogger.error(
        { jobId: job.id, attempts: job.attempts },
        'AI queue job permanently failed after max attempts'
      );
      await aiQueueRepository.markFailed(
        job.id,
        `${errorCode}: ${errorMessage} (after ${job.attempts} attempts)`
      );
    }
  }
}

// =============================================================================
// Polling
// =============================================================================

/**
 * Poll for pending jobs and process one if found
 * Skips if already processing or not configured
 */
async function pollAndProcess(): Promise<void> {
  // Skip if already processing
  if (isProcessing) {
    return;
  }

  // Skip if Ollama Cloud is not configured
  if (!isOllamaCloudConfigured()) {
    return;
  }

  isProcessing = true;

  try {
    // Find the oldest pending job
    const job = await aiQueueRepository.claimNext({
      workerId: WORKER_ID,
      leaseMs: LEASE_DURATION_MS,
    });

    if (job) {
      await processJob(job);
    }
  } catch (error) {
    aiLogger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Error during poll and process'
    );
  } finally {
    isProcessing = false;
  }
}

// =============================================================================
// Worker Control
// =============================================================================

/**
 * Start the queue worker
 * - Checks if worker is enabled via environment variable
 * - Skips if already running
 * - Performs initial poll immediately
 * - Starts interval for subsequent polls
 */
export function startQueueWorker(): void {
  // Check if worker is enabled
  if (!WORKER_ENABLED) {
    aiLogger.info('AI queue worker is disabled (AI_WORKER_ENABLED=false)');
    return;
  }

  // Skip if already running
  if (workerInterval !== null) {
    aiLogger.warn('AI queue worker is already running');
    return;
  }

  aiLogger.info(
    { pollIntervalMs: POLL_INTERVAL_MS, workerId: WORKER_ID, leaseMs: LEASE_DURATION_MS },
    'Starting AI queue worker'
  );

  // Initial poll immediately
  void pollAndProcess();

  // Start interval for subsequent polls
  workerInterval = setInterval(() => {
    void pollAndProcess();
  }, POLL_INTERVAL_MS);
}

/**
 * Stop the queue worker
 * - Clears the interval
 * - Sets interval to null
 * - Logs stop
 */
export function stopQueueWorker(): void {
  if (workerInterval !== null) {
    clearInterval(workerInterval);
    workerInterval = null;
    aiLogger.info('AI queue worker stopped');
  }
}

/**
 * Check if the worker is currently running
 */
export function isWorkerRunning(): boolean {
  return workerInterval !== null;
}

/**
 * Manually trigger processing of one job
 * For use from admin interface
 */
export async function triggerProcessing(): Promise<{
  processed: boolean;
  jobId?: string;
  error?: string;
}> {
  // Check if Ollama Cloud is configured
  if (!isOllamaCloudConfigured()) {
    return {
      processed: false,
      error: 'Ollama Cloud is not configured (missing OLLAMA_CLOUD_API_KEY)',
    };
  }

  try {
    // Find a pending job
    const job = await aiQueueRepository.claimNext({
      workerId: WORKER_ID,
      leaseMs: LEASE_DURATION_MS,
    });

    if (!job) {
      return { processed: false };
    }

    // Process the job
    await processJob(job);

    return { processed: true, jobId: job.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    aiLogger.error({ error: errorMessage }, 'Error during manual trigger processing');
    return { processed: false, error: errorMessage };
  }
}
