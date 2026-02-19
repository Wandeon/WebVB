/**
 * AI Queue Worker
 * Background worker that polls for pending AI jobs and processes them.
 * Features: lease renewal (#94), circuit breaker (#141), graceful shutdown (#154).
 */

import { randomUUID } from 'crypto';

import { aiQueueRepository } from '@repo/database';
import { getRuntimeEnv } from '@repo/shared';
import { z } from 'zod';

import { aiLogger } from '../logger';
import { generate, isOllamaCloudConfigured } from './ollama-cloud';
import { runArticlePipeline, STAGE_TEMPERATURE } from './pipeline';
import { FEW_SHOT_EXAMPLES } from './prompts/generate';
import { extractJson, hashText } from './prompt-utils';

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
const FALLBACK_WORKER_ID = randomUUID();
const LEASE_DURATION_MS = 5 * 60 * 1000;
const MAX_CONTENT_LENGTH = 20000;

// Circuit breaker configuration (#141)
const MAX_CONSECUTIVE_FAILURES = 5;
const BACKOFF_BASE_MS = 30_000; // 30 seconds
const BACKOFF_MAX_MS = 300_000; // 5 minutes

// =============================================================================
// State
// =============================================================================

let workerActive = false;
let pollTimeout: ReturnType<typeof setTimeout> | null = null;
let isProcessing = false;
let processingPromise: Promise<void> | null = null;
let shutdownRequested = false;

// Circuit breaker state (#141)
let consecutiveFailures = 0;

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

// extractJson is imported from prompt-utils (balanced-brace parser, #92)

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

function getWorkerConfig() {
  const env = getRuntimeEnv();

  return {
    enabled: env.AI_WORKER_ENABLED !== 'false',
    workerId: env.AI_WORKER_ID ?? FALLBACK_WORKER_ID,
  };
}

/**
 * Check if generated content is too similar to any few-shot example (#125).
 * Prevents the LLM from copying example responses verbatim.
 */
function isTooSimilarToExample(content: string): boolean {
  for (const example of FEW_SHOT_EXAMPLES) {
    const exampleContent = example.response.content;
    const exampleSentences = exampleContent
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);
    const contentSentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);

    let matches = 0;
    for (const cs of contentSentences) {
      if (
        exampleSentences.some(
          (es) => cs.trim().includes(es.trim()) || es.trim().includes(cs.trim())
        )
      ) {
        matches++;
      }
    }

    if (contentSentences.length > 0 && matches / contentSentences.length > 0.5) {
      return true;
    }
  }
  return false;
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
// Circuit Breaker (#141)
// =============================================================================

/**
 * Calculate exponential backoff delay based on consecutive failure count.
 * Returns 0 when under the failure threshold (no backoff needed).
 */
function getBackoffDelay(): number {
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    const exponent = consecutiveFailures - MAX_CONSECUTIVE_FAILURES;
    return Math.min(BACKOFF_BASE_MS * Math.pow(2, exponent), BACKOFF_MAX_MS);
  }
  return 0;
}

// =============================================================================
// Lease Renewal (#94)
// =============================================================================

/**
 * Extend the lease for a job before a long-running pipeline stage.
 * Logs a warning if the lease could not be extended (job may have been stolen).
 */
async function extendJobLease(jobId: string, workerId: string): Promise<void> {
  const extended = await aiQueueRepository.extendLease(jobId, workerId, LEASE_DURATION_MS);
  if (!extended) {
    aiLogger.warn({ jobId, workerId }, 'Failed to extend lease — job may have been reassigned');
  }
}

// =============================================================================
// Job Processing
// =============================================================================

/**
 * Process a single AI queue job
 * 1. Log start
 * 2. Extend lease before each major stage
 * 3. Call generate() with job input data
 * 4. If success: mark completed with response data
 * 5. If failure: retry if attempts < maxAttempts, otherwise mark failed
 * 6. Check shutdownRequested before each stage (#154)
 */
async function processJob(
  job: AiQueueRecord,
  workerId: string,
  checkShutdown = true
): Promise<void> {
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

  // Shutdown check before AI generation (#154)
  if (checkShutdown && shutdownRequested) {
    aiLogger.info({ jobId: job.id }, 'Shutdown requested, aborting job processing');
    await aiQueueRepository.resetToPending(job.id);
    return;
  }

  // Extend lease before AI generation (#94)
  await extendJobLease(job.id, workerId);

  // Call the AI generate function with explicit temperature (#118)
  // Only include system if it's defined (exactOptionalPropertyTypes)
  const result = await generate(prompt, {
    ...(system ? { system } : {}),
    temperature: STAGE_TEMPERATURE.generate,
  });

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
      // Shutdown check before validation (#154)
      if (checkShutdown && shutdownRequested) {
        aiLogger.info({ jobId: job.id }, 'Shutdown requested, aborting job processing');
        await aiQueueRepository.resetToPending(job.id);
        return;
      }

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

      // Check if generated content is too similar to few-shot examples (#125)
      if (isTooSimilarToExample(validated.result.content)) {
        aiLogger.warn({ jobId: job.id }, 'Generated content too similar to few-shot example');
        await aiQueueRepository.markFailed(
          job.id,
          'Generirani sadržaj previše sličan primjeru',
          resultData
        );
        return;
      }

      // Shutdown check before pipeline (#154)
      if (checkShutdown && shutdownRequested) {
        aiLogger.info({ jobId: job.id }, 'Shutdown requested, aborting job processing');
        await aiQueueRepository.resetToPending(job.id);
        return;
      }

      // Extend lease before pipeline run (#94)
      await extendJobLease(job.id, workerId);

      aiLogger.info({ jobId: job.id }, 'Running article through quality pipeline');

      // Run through REVIEW -> REWRITE -> POLISH pipeline
      const pipelineResult = await runArticlePipeline(validated.result);

      if (!pipelineResult.success) {
        aiLogger.error(
          {
            jobId: job.id,
            stage: pipelineResult.stage,
            reason: pipelineResult.reason,
            rawSample: pipelineResult.rawSample,
          },
          'Article pipeline parse failure'
        );
        await aiQueueRepository.markFailed(
          job.id,
          `Pipeline greška u fazi "${pipelineResult.stage}": ${pipelineResult.reason}`,
          {
            ...resultData,
            pipelineStage: pipelineResult.stage,
            pipelineReason: pipelineResult.reason,
            pipelineRawSample: pipelineResult.rawSample,
          }
        );
        return;
      }

      aiLogger.info(
        {
          jobId: job.id,
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
            pipelinePassed: false,
            pipelineRewriteCount: pipelineResult.rewriteCount,
          }
        );
        return;
      }

      resultData.title = pipelineResult.article.title;
      resultData.content = pipelineResult.article.content;
      resultData.excerpt = pipelineResult.article.excerpt;
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
// Polling (#141 -- dynamic setTimeout chain instead of setInterval)
// =============================================================================

/**
 * Schedule the next poll cycle using setTimeout.
 * Applies backoff delay when circuit breaker is active.
 */
function scheduleNextPoll(): void {
  if (shutdownRequested) return;

  const backoff = getBackoffDelay();
  const delay = POLL_INTERVAL_MS + backoff;

  pollTimeout = setTimeout(() => {
    void pollAndProcess();
  }, delay);
}

/**
 * Poll for pending jobs and process one if found.
 * Skips if already processing or not configured.
 * Updates circuit breaker state on success/failure.
 */
async function pollAndProcess(): Promise<void> {
  // Skip if already processing
  if (isProcessing || shutdownRequested) {
    scheduleNextPoll();
    return;
  }

  // Skip if Ollama Cloud is not configured
  if (!isOllamaCloudConfigured()) {
    scheduleNextPoll();
    return;
  }

  const { workerId } = getWorkerConfig();

  isProcessing = true;
  processingPromise = (async () => {
    try {
      // Find the oldest pending job
      const job = await aiQueueRepository.claimNext({
        workerId,
        leaseMs: LEASE_DURATION_MS,
      });

      if (job) {
        try {
          await processJob(job, workerId);
          // Reset circuit breaker on success (#141)
          if (consecutiveFailures > 0) {
            aiLogger.info(
              { previousFailures: consecutiveFailures },
              'Circuit breaker reset after successful job'
            );
            consecutiveFailures = 0;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          aiLogger.error(
            { jobId: job.id, error: errorMessage },
            'Unhandled error while processing AI job'
          );

          // Increment circuit breaker (#141)
          consecutiveFailures++;
          if (consecutiveFailures === MAX_CONSECUTIVE_FAILURES) {
            aiLogger.warn(
              { consecutiveFailures, backoffMs: BACKOFF_BASE_MS },
              'Circuit breaker threshold reached, entering backoff'
            );
          }

          try {
            await aiQueueRepository.markFailed(
              job.id,
              'Neočekivana greška tijekom obrade AI zadatka'
            );
          } catch (markError) {
            aiLogger.error(
              {
                jobId: job.id,
                error: markError instanceof Error ? markError.message : 'Unknown error',
              },
              'Failed to mark AI job as failed after crash'
            );
          }
        }
      }
    } catch (error) {
      aiLogger.error(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Error during poll and process'
      );

      // Increment circuit breaker on poll errors (#141)
      consecutiveFailures++;
      if (consecutiveFailures === MAX_CONSECUTIVE_FAILURES) {
        aiLogger.warn(
          { consecutiveFailures, backoffMs: BACKOFF_BASE_MS },
          'Circuit breaker threshold reached, entering backoff'
        );
      }
    } finally {
      isProcessing = false;
      processingPromise = null;
      // Schedule next poll dynamically (#141)
      scheduleNextPoll();
    }
  })();

  await processingPromise;
}

// =============================================================================
// Worker Control
// =============================================================================

/**
 * Start the queue worker
 * - Checks if worker is enabled via environment variable
 * - Skips if already running
 * - Performs initial poll immediately
 * - Uses dynamic setTimeout chain for subsequent polls (#141)
 */
export function startQueueWorker(): void {
  const { enabled, workerId } = getWorkerConfig();

  // Check if worker is enabled
  if (!enabled) {
    aiLogger.info('AI queue worker is disabled (AI_WORKER_ENABLED=false)');
    return;
  }

  // Skip if already running
  if (workerActive) {
    aiLogger.warn('AI queue worker is already running');
    return;
  }

  shutdownRequested = false;
  consecutiveFailures = 0;
  workerActive = true;

  aiLogger.info(
    { pollIntervalMs: POLL_INTERVAL_MS, workerId, leaseMs: LEASE_DURATION_MS },
    'Starting AI queue worker'
  );

  // Initial poll immediately
  void pollAndProcess();
}

/**
 * Stop the queue worker
 * - Clears the poll timeout
 * - Sets timeout to null
 * - Logs stop
 */
export function stopQueueWorker(): void {
  if (workerActive) {
    shutdownRequested = true;
    workerActive = false;
    if (pollTimeout !== null) {
      clearTimeout(pollTimeout);
      pollTimeout = null;
    }
    aiLogger.info('AI queue worker stopped');
  }
}

/**
 * Gracefully stop the worker and wait for in-flight work to finish.
 * Default timeout increased to 120s for long pipeline jobs (#154).
 */
export async function shutdownQueueWorker(timeoutMs = 120_000): Promise<void> {
  shutdownRequested = true;
  stopQueueWorker();

  if (!processingPromise) {
    return;
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<'timeout'>(resolve => {
    timeoutId = setTimeout(() => resolve('timeout'), timeoutMs);
  });

  const outcome = await Promise.race([
    processingPromise.then(() => 'completed'),
    timeoutPromise,
  ]);

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  if (outcome === 'timeout') {
    aiLogger.warn(
      { timeoutMs },
      'AI queue worker shutdown timed out with in-flight work'
    );
  }
}

/**
 * Check if the worker is currently running
 */
export function isWorkerRunning(): boolean {
  return workerActive;
}

/**
 * Manually trigger processing of one job.
 * For use from admin interface. Does not affect circuit breaker state.
 */
export async function triggerProcessing(): Promise<{
  processed: boolean;
  jobId?: string;
  error?: string;
}> {
  const { workerId } = getWorkerConfig();

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
      workerId,
      leaseMs: LEASE_DURATION_MS,
    });

    if (!job) {
      return { processed: false };
    }

    try {
      // Process the job (manual trigger ignores shutdown flag)
      await processJob(job, workerId, false);
      return { processed: true, jobId: job.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      aiLogger.error(
        { jobId: job.id, error: errorMessage },
        'Unhandled error during manual AI processing'
      );

      try {
        await aiQueueRepository.markFailed(
          job.id,
          'Neočekivana greška tijekom ručne AI obrade'
        );
      } catch (markError) {
        aiLogger.error(
          {
            jobId: job.id,
            error: markError instanceof Error ? markError.message : 'Unknown error',
          },
          'Failed to mark AI job as failed after manual processing crash'
        );
      }

      return { processed: false, jobId: job.id, error: errorMessage };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    aiLogger.error({ error: errorMessage }, 'Error during manual trigger processing');
    return { processed: false, error: errorMessage };
  }
}
