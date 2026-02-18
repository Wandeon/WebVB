/* eslint-disable @typescript-eslint/unbound-method */
import { aiQueueRepository } from '@repo/database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { aiLogger } from '../../logger';
import { generate, isOllamaCloudConfigured } from '../ollama-cloud';
import { runArticlePipeline } from '../pipeline';
import {
  isWorkerRunning,
  startQueueWorker,
  stopQueueWorker,
  shutdownQueueWorker,
  triggerProcessing,
} from '../queue-worker';

import type { OllamaGenerateResponse } from '../types';
import type { AiQueueRecord } from '@repo/database';

// Mock dependencies BEFORE importing the module under test
// These mocks must be defined inside the factory to avoid hoisting issues
vi.mock('@repo/database', () => ({
  aiQueueRepository: {
    claimNext: vi.fn(),
    markCompleted: vi.fn(),
    markFailed: vi.fn(),
    resetToPending: vi.fn(),
  },
}));

vi.mock('../ollama-cloud', () => ({
  generate: vi.fn(),
  isOllamaCloudConfigured: vi.fn(),
}));

vi.mock('../pipeline', () => ({
  runArticlePipeline: vi.fn(),
}));

vi.mock('../../logger', () => ({
  aiLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Cast mocks to get proper typing using vi.mocked
const mockAiQueueRepository = vi.mocked(aiQueueRepository);
const mockGenerate = vi.mocked(generate);
const mockIsOllamaCloudConfigured = vi.mocked(isOllamaCloudConfigured);
const mockAiLogger = vi.mocked(aiLogger);
const mockRunArticlePipeline = vi.mocked(runArticlePipeline);

/**
 * Helper to create a complete mock AiQueueRecord with all required fields
 */
function createMockJob(overrides: Partial<AiQueueRecord> = {}): AiQueueRecord {
  return {
    id: 'job-123',
    userId: 'user-1',
    requestType: 'post_generation',
    inputData: { prompt: 'Test prompt' },
    status: 'pending',
    result: null,
    errorMessage: null,
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    processedAt: null,
    lockedAt: null,
    lockedBy: null,
    leaseExpiresAt: null,
    ...overrides,
  };
}

/**
 * Helper to create a complete mock OllamaGenerateResponse with all required fields
 */
function createMockGenerateResponse(
  overrides: Partial<OllamaGenerateResponse> = {}
): OllamaGenerateResponse {
  return {
    model: 'deepseek-v3.2',
    created_at: '2024-01-01T00:00:00Z',
    response: 'Generated response',
    done: true,
    prompt_eval_count: 10,
    eval_count: 20,
    total_duration: 1_000_000_000, // 1 second in nanoseconds
    ...overrides,
  };
}

describe('queue-worker', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    // Reset to clean state
    stopQueueWorker();

    // Default to worker enabled
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      AI_WORKER_ENABLED: 'true',
    };

    // Default mock implementations
    mockIsOllamaCloudConfigured.mockReturnValue(true);
  });

  afterEach(() => {
    // Always stop the worker to clean up
    stopQueueWorker();
    vi.useRealTimers();
    process.env = originalEnv;
  });

  describe('startQueueWorker', () => {
    it('starts the worker when enabled', () => {
      expect(isWorkerRunning()).toBe(false);

      startQueueWorker();

      expect(isWorkerRunning()).toBe(true);
      expect(mockAiLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ pollIntervalMs: 10_000 }),
        'Starting AI queue worker'
      );
    });

    it('does not start twice', () => {
      startQueueWorker();
      expect(isWorkerRunning()).toBe(true);

      // Attempt to start again
      startQueueWorker();

      expect(mockAiLogger.warn).toHaveBeenCalledWith(
        'AI queue worker is already running'
      );
      expect(isWorkerRunning()).toBe(true);
    });

    it('does not start when disabled via environment variable', () => {
      process.env.AI_WORKER_ENABLED = 'false';

      startQueueWorker();

      expect(isWorkerRunning()).toBe(false);
      expect(mockAiLogger.info).toHaveBeenCalledWith(
        'AI queue worker is disabled (AI_WORKER_ENABLED=false)'
      );
    });
  });

  describe('stopQueueWorker', () => {
    it('stops the worker', () => {
      startQueueWorker();
      expect(isWorkerRunning()).toBe(true);

      stopQueueWorker();

      expect(isWorkerRunning()).toBe(false);
      expect(mockAiLogger.info).toHaveBeenCalledWith('AI queue worker stopped');
    });

    it('does nothing when worker is not running', () => {
      expect(isWorkerRunning()).toBe(false);

      stopQueueWorker();

      expect(isWorkerRunning()).toBe(false);
      // Should not log stop message since it wasn't running
      expect(mockAiLogger.info).not.toHaveBeenCalledWith(
        'AI queue worker stopped'
      );
    });
  });

  describe('shutdownQueueWorker', () => {
    it('waits for in-flight work to complete', async () => {
      mockAiQueueRepository.claimNext.mockResolvedValue(null);

      startQueueWorker();
      await shutdownQueueWorker();

      expect(isWorkerRunning()).toBe(false);
    });
  });

  describe('triggerProcessing', () => {
    it('returns processed: false when no pending jobs', async () => {
      mockAiQueueRepository.claimNext.mockResolvedValue(null);

      const result = await triggerProcessing();

      expect(result).toEqual({ processed: false });
      expect(mockAiQueueRepository.claimNext).toHaveBeenCalled();
    });

    it('returns processed: false when not configured', async () => {
      mockIsOllamaCloudConfigured.mockReturnValue(false);

      const result = await triggerProcessing();

      expect(result).toEqual({
        processed: false,
        error: 'Ollama Cloud is not configured (missing OLLAMA_CLOUD_API_KEY)',
      });
      expect(mockAiQueueRepository.claimNext).not.toHaveBeenCalled();
    });

    it('processes a job successfully', async () => {
      const mockJob = createMockJob({
        id: 'job-123',
        requestType: 'content_summary',
        inputData: { prompt: 'Test prompt', system: 'Be helpful' },
        attempts: 1,
        maxAttempts: 3,
      });

      mockAiQueueRepository.claimNext.mockResolvedValue(mockJob);
      mockGenerate.mockResolvedValue({
        success: true,
        data: createMockGenerateResponse(),
      });

      const result = await triggerProcessing();

      expect(result).toEqual({ processed: true, jobId: 'job-123' });
      expect(mockAiQueueRepository.claimNext).toHaveBeenCalled();
      expect(mockGenerate).toHaveBeenCalledWith('Test prompt', {
        system: 'Be helpful',
      });
      expect(mockAiQueueRepository.markCompleted).toHaveBeenCalledWith(
        'job-123',
        expect.objectContaining({
          response: 'Generated response',
          model: 'deepseek-v3.2',
          promptTokens: 10,
          completionTokens: 20,
          totalDurationMs: 1000, // Converted from nanoseconds to ms
        })
      );
    });

    it('processes a job without system prompt', async () => {
      const mockJob = createMockJob({
        id: 'job-456',
        requestType: 'content_summary',
        inputData: { prompt: 'Simple prompt' },
        attempts: 1,
        maxAttempts: 3,
      });

      mockAiQueueRepository.claimNext.mockResolvedValue(mockJob);
      mockGenerate.mockResolvedValue({
        success: true,
        data: createMockGenerateResponse({
          response: 'Response without system',
        }),
      });

      const result = await triggerProcessing();

      expect(result).toEqual({ processed: true, jobId: 'job-456' });
      expect(mockGenerate).toHaveBeenCalledWith('Simple prompt', {});
    });

    it('marks job as failed after max attempts', async () => {
      const mockJob = createMockJob({
        id: 'job-789',
        requestType: 'content_summary',
        inputData: { prompt: 'Failing prompt' },
        attempts: 3,
        maxAttempts: 3,
      });

      mockAiQueueRepository.claimNext.mockResolvedValue(mockJob);
      mockGenerate.mockResolvedValue({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests',
        },
      });

      const result = await triggerProcessing();

      expect(result).toEqual({ processed: true, jobId: 'job-789' });
      expect(mockAiQueueRepository.markFailed).toHaveBeenCalledWith(
        'job-789',
        'RATE_LIMITED: Too many requests (after 3 attempts)'
      );
      expect(mockAiQueueRepository.resetToPending).not.toHaveBeenCalled();
    });

    it('resets job to pending for retry when under max attempts', async () => {
      const mockJob = createMockJob({
        id: 'job-retry',
        requestType: 'content_summary',
        inputData: { prompt: 'Retry prompt' },
        attempts: 1,
        maxAttempts: 3,
      });

      mockAiQueueRepository.claimNext.mockResolvedValue(mockJob);
      mockGenerate.mockResolvedValue({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Connection failed',
        },
      });

      const result = await triggerProcessing();

      expect(result).toEqual({ processed: true, jobId: 'job-retry' });
      expect(mockAiQueueRepository.resetToPending).toHaveBeenCalledWith(
        'job-retry'
      );
      expect(mockAiQueueRepository.markFailed).not.toHaveBeenCalled();
      expect(mockAiLogger.info).toHaveBeenCalledWith(
        { jobId: 'job-retry', attemptsRemaining: 2 },
        'Resetting job to pending for retry'
      );
    });

    it('marks job as failed when prompt is missing', async () => {
      const mockJob = createMockJob({
        id: 'job-no-prompt',
        requestType: 'content_summary',
        inputData: {}, // Missing prompt
        attempts: 1,
        maxAttempts: 3,
      });

      mockAiQueueRepository.claimNext.mockResolvedValue(mockJob);

      const result = await triggerProcessing();

      expect(result).toEqual({ processed: true, jobId: 'job-no-prompt' });
      expect(mockAiQueueRepository.markFailed).toHaveBeenCalledWith(
        'job-no-prompt',
        'Nedostaje obavezni prompt u inputData'
      );
      expect(mockGenerate).not.toHaveBeenCalled();
    });

    it('returns error when an exception occurs', async () => {
      mockAiQueueRepository.claimNext.mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await triggerProcessing();

      expect(result).toEqual({
        processed: false,
        error: 'Database connection failed',
      });
      expect(mockAiLogger.error).toHaveBeenCalledWith(
        { error: 'Database connection failed' },
        'Error during manual trigger processing'
      );
    });

    it('marks job failed when processing throws unexpectedly', async () => {
      const mockJob = createMockJob({
        id: 'job-crash',
        requestType: 'content_summary',
        inputData: { prompt: 'Crash prompt' },
        attempts: 1,
        maxAttempts: 3,
      });

      mockAiQueueRepository.claimNext.mockResolvedValue(mockJob);
      mockGenerate.mockRejectedValue(new Error('Boom'));

      const result = await triggerProcessing();

      expect(result).toEqual({
        processed: false,
        jobId: 'job-crash',
        error: 'Boom',
      });
      expect(mockAiQueueRepository.markFailed).toHaveBeenCalledWith(
        'job-crash',
        'Neočekivana greška tijekom ručne AI obrade'
      );
      expect(mockAiLogger.error).toHaveBeenCalledWith(
        { jobId: 'job-crash', error: 'Boom' },
        'Unhandled error during manual AI processing'
      );
    });
  });

  describe('isWorkerRunning', () => {
    it('returns false when worker is not started', () => {
      expect(isWorkerRunning()).toBe(false);
    });

    it('returns true when worker is started', () => {
      startQueueWorker();
      expect(isWorkerRunning()).toBe(true);
    });

    it('returns false after worker is stopped', () => {
      startQueueWorker();
      expect(isWorkerRunning()).toBe(true);

      stopQueueWorker();
      expect(isWorkerRunning()).toBe(false);
    });
  });

  describe('post_generation parsing', () => {
    it('parses valid JSON response for post_generation jobs', async () => {
      const mockJob = createMockJob({
        id: 'job-post-gen',
        requestType: 'post_generation',
        inputData: { prompt: 'Generate a post about...' },
        attempts: 1,
        maxAttempts: 3,
      });

      const validResponse = JSON.stringify({
        title: 'Test Title',
        content: '<p>Test content paragraph.</p>',
        excerpt: 'Short excerpt',
      });

      mockAiQueueRepository.claimNext.mockResolvedValue(mockJob);
      mockGenerate.mockResolvedValue({
        success: true,
        data: createMockGenerateResponse({
          response: validResponse,
        }),
      });
      mockRunArticlePipeline.mockResolvedValue({
        success: true,
        article: {
          title: 'Test Title',
          content: '<p>Test content paragraph.</p>',
          excerpt: 'Short excerpt',
        },
        reviewHistory: [],
        rewriteCount: 0,
        passed: true,
      });

      const result = await triggerProcessing();

      expect(result).toEqual({ processed: true, jobId: 'job-post-gen' });
      expect(mockAiQueueRepository.markCompleted).toHaveBeenCalledWith(
        'job-post-gen',
        expect.objectContaining({
          title: 'Test Title',
          content: '<p>Test content paragraph.</p>',
          excerpt: 'Short excerpt',
          pipelinePassed: true,
        })
      );
      expect(mockAiLogger.info).toHaveBeenCalledWith(
        { jobId: 'job-post-gen' },
        'Running article through quality pipeline'
      );
    });

    it('parses JSON embedded in extra text for post_generation jobs', async () => {
      const mockJob = createMockJob({
        id: 'job-post-gen-2',
        requestType: 'post_generation',
        inputData: { prompt: 'Generate a post about...' },
        attempts: 1,
        maxAttempts: 3,
      });

      const responseWithExtraText = `Here is the generated post:
{
  "title": "Embedded Title",
  "content": "<p>Embedded content here.</p>",
  "excerpt": "Brief summary"
}
I hope this helps!`;

      mockAiQueueRepository.claimNext.mockResolvedValue(mockJob);
      mockGenerate.mockResolvedValue({
        success: true,
        data: createMockGenerateResponse({
          response: responseWithExtraText,
        }),
      });
      mockRunArticlePipeline.mockResolvedValue({
        success: true,
        article: {
          title: 'Embedded Title',
          content: '<p>Embedded content here.</p>',
          excerpt: 'Brief summary',
        },
        reviewHistory: [],
        rewriteCount: 0,
        passed: true,
      });

      const result = await triggerProcessing();

      expect(result).toEqual({ processed: true, jobId: 'job-post-gen-2' });
      expect(mockAiQueueRepository.markCompleted).toHaveBeenCalledWith(
        'job-post-gen-2',
        expect.objectContaining({
          title: 'Embedded Title',
          content: '<p>Embedded content here.</p>',
          excerpt: 'Brief summary',
        })
      );
    });

    it('marks job as failed when JSON parsing fails for post_generation jobs', async () => {
      const mockJob = createMockJob({
        id: 'job-post-gen-fail',
        requestType: 'post_generation',
        inputData: { prompt: 'Generate a post about...' },
        attempts: 1,
        maxAttempts: 3,
      });

      const invalidResponse = 'This is just plain text without any JSON';

      mockAiQueueRepository.claimNext.mockResolvedValue(mockJob);
      mockGenerate.mockResolvedValue({
        success: true,
        data: createMockGenerateResponse({
          response: invalidResponse,
        }),
      });

      const result = await triggerProcessing();

      expect(result).toEqual({ processed: true, jobId: 'job-post-gen-fail' });
      expect(mockAiQueueRepository.markFailed).toHaveBeenCalledWith(
        'job-post-gen-fail',
        'Neispravan JSON odgovor',
        expect.objectContaining({
          responseLength: invalidResponse.length,
        })
      );
    });

    it('handles JSON with missing required fields for post_generation jobs', async () => {
      const mockJob = createMockJob({
        id: 'job-post-gen-incomplete',
        requestType: 'post_generation',
        inputData: { prompt: 'Generate a post about...' },
        attempts: 1,
        maxAttempts: 3,
      });

      const incompleteResponse = JSON.stringify({
        title: 'Only Title',
        // Missing content and excerpt
      });

      mockAiQueueRepository.claimNext.mockResolvedValue(mockJob);
      mockGenerate.mockResolvedValue({
        success: true,
        data: createMockGenerateResponse({
          response: incompleteResponse,
        }),
      });

      const result = await triggerProcessing();

      expect(result).toEqual({
        processed: true,
        jobId: 'job-post-gen-incomplete',
      });
      expect(mockAiQueueRepository.markFailed).toHaveBeenCalledWith(
        'job-post-gen-incomplete',
        'Neispravna struktura AI odgovora',
        expect.objectContaining({
          responseLength: incompleteResponse.length,
        })
      );
    });

    it('does not parse response for non-post_generation jobs', async () => {
      const mockJob = createMockJob({
        id: 'job-other-type',
        requestType: 'content_summary',
        inputData: { prompt: 'Regular generation' },
        attempts: 1,
        maxAttempts: 3,
      });

      const jsonResponse = JSON.stringify({
        title: 'Some Title',
        content: 'Some content',
        excerpt: 'Some excerpt',
      });

      mockAiQueueRepository.claimNext.mockResolvedValue(mockJob);
      mockGenerate.mockResolvedValue({
        success: true,
        data: createMockGenerateResponse({
          response: jsonResponse,
        }),
      });

      const result = await triggerProcessing();

      expect(result).toEqual({ processed: true, jobId: 'job-other-type' });
      // Should NOT include parsed fields since it's not a post_generation job
      expect(mockAiQueueRepository.markCompleted).toHaveBeenCalledWith(
        'job-other-type',
        expect.objectContaining({ response: jsonResponse })
      );
    });

    it('marks job as failed when pipeline does not pass', async () => {
      const mockJob = createMockJob({
        id: 'job-post-gen-quality',
        requestType: 'post_generation',
        inputData: { prompt: 'Generate a post about...' },
        attempts: 1,
        maxAttempts: 3,
      });

      const validResponse = JSON.stringify({
        title: 'Test Title',
        content: '<p>Test content paragraph.</p>',
        excerpt: 'Short excerpt',
      });

      mockAiQueueRepository.claimNext.mockResolvedValue(mockJob);
      mockGenerate.mockResolvedValue({
        success: true,
        data: createMockGenerateResponse({
          response: validResponse,
        }),
      });
      mockRunArticlePipeline.mockResolvedValue({
        success: true,
        article: {
          title: 'Test Title',
          content: '<p>Test content paragraph.</p>',
          excerpt: 'Short excerpt',
        },
        reviewHistory: [],
        rewriteCount: 2,
        passed: false,
      });

      const result = await triggerProcessing();

      expect(result).toEqual({ processed: true, jobId: 'job-post-gen-quality' });
      expect(mockAiQueueRepository.markFailed).toHaveBeenCalledWith(
        'job-post-gen-quality',
        'AI članak nije prošao provjeru kvalitete',
        expect.objectContaining({
          pipelinePassed: false,
        })
      );
    });
  });
});
