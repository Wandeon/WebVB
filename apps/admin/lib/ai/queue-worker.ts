/**
 * AI Queue Worker
 * Background worker that polls for pending AI jobs and processes them
 */

import { aiQueueRepository } from '@repo/database';

import { aiLogger } from '../logger';
import { generate, isOllamaCloudConfigured } from './ollama-cloud';

import type { AiQueueRecord } from '@repo/database';

// =============================================================================
// Configuration
// =============================================================================

const POLL_INTERVAL_MS = 10_000; // 10 seconds
const WORKER_ENABLED = process.env.AI_WORKER_ENABLED !== 'false';

// =============================================================================
// State
// =============================================================================

let workerInterval: ReturnType<typeof setInterval> | null = null;
let isProcessing = false;

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
    { jobId: job.id, requestType: job.requestType, attempt: job.attempts + 1 },
    'Processing AI queue job'
  );

  // Mark job as processing and increment attempts
  const updatedJob = await aiQueueRepository.markProcessing(job.id);

  // Extract prompt and system from input data
  const inputData = job.inputData as { prompt?: string; system?: string };
  const prompt = inputData.prompt;
  const system = inputData.system;

  if (!prompt) {
    aiLogger.error({ jobId: job.id }, 'Job missing required prompt in inputData');
    await aiQueueRepository.markFailed(job.id, 'Missing required prompt in inputData');
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

    await aiQueueRepository.markCompleted(job.id, {
      response: result.data.response,
      model: result.data.model,
      promptTokens: result.data.prompt_eval_count,
      completionTokens: result.data.eval_count,
      totalDurationMs: result.data.total_duration
        ? result.data.total_duration / 1_000_000
        : null,
    });
  } else {
    // Failure - check if we should retry
    const errorMessage = result.error.message;
    const errorCode = result.error.code;

    aiLogger.warn(
      {
        jobId: job.id,
        errorCode,
        errorMessage,
        attempt: updatedJob.attempts,
        maxAttempts: updatedJob.maxAttempts,
      },
      'AI queue job failed'
    );

    if (updatedJob.attempts < updatedJob.maxAttempts) {
      // Reset to pending for retry
      aiLogger.info(
        { jobId: job.id, attemptsRemaining: updatedJob.maxAttempts - updatedJob.attempts },
        'Resetting job to pending for retry'
      );
      await aiQueueRepository.resetToPending(job.id);
    } else {
      // Max attempts reached - mark as permanently failed
      aiLogger.error(
        { jobId: job.id, attempts: updatedJob.attempts },
        'AI queue job permanently failed after max attempts'
      );
      await aiQueueRepository.markFailed(
        job.id,
        `${errorCode}: ${errorMessage} (after ${updatedJob.attempts} attempts)`
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
    const job = await aiQueueRepository.findPending();

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
    { pollIntervalMs: POLL_INTERVAL_MS },
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
    const job = await aiQueueRepository.findPending();

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
