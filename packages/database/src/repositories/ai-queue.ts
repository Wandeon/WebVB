import { db } from '../client';

import type { Prisma } from '@prisma/client';

// Status type for AI queue jobs
export type AiQueueStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Request types supported by the AI queue
export type AiRequestType = 'post_generation' | 'newsletter_intro' | 'content_summary';

// Full record interface for AI queue items
export interface AiQueueRecord {
  id: string;
  userId: string | null;
  requestType: string;
  inputData: Record<string, unknown>;
  status: string;
  result: Record<string, unknown> | null;
  errorMessage: string | null;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  processedAt: Date | null;
}

// Input data for creating a new AI queue job
export interface CreateAiQueueData {
  userId?: string | null;
  requestType: AiRequestType;
  inputData: Record<string, unknown>;
  maxAttempts?: number;
}

// Options for finding all AI queue jobs
export interface FindAllAiQueueOptions {
  page?: number | undefined;
  limit?: number | undefined;
  status?: AiQueueStatus | undefined;
  requestType?: AiRequestType | undefined;
  userId?: string | undefined;
  sortBy?: 'createdAt' | 'processedAt' | 'status' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

// Result of findAll with pagination
export interface FindAllAiQueueResult {
  jobs: AiQueueRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Statistics by status
export interface AiQueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

/**
 * Transform Prisma result to AiQueueRecord
 * Handles Json field casting
 */
function transformToRecord(
  job: Prisma.AiQueueGetPayload<object>
): AiQueueRecord {
  return {
    id: job.id,
    userId: job.userId,
    requestType: job.requestType,
    inputData: job.inputData as Record<string, unknown>,
    status: job.status,
    result: job.result as Record<string, unknown> | null,
    errorMessage: job.errorMessage,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    createdAt: job.createdAt,
    processedAt: job.processedAt,
  };
}

export const aiQueueRepository = {
  /**
   * Create a new AI queue job
   */
  async create(data: CreateAiQueueData): Promise<AiQueueRecord> {
    const job = await db.aiQueue.create({
      data: {
        userId: data.userId ?? null,
        requestType: data.requestType,
        inputData: data.inputData as Prisma.InputJsonValue,
        maxAttempts: data.maxAttempts ?? 3,
      },
    });
    return transformToRecord(job);
  },

  /**
   * Find a single AI queue job by ID
   */
  async findById(id: string): Promise<AiQueueRecord | null> {
    const job = await db.aiQueue.findUnique({
      where: { id },
    });
    return job ? transformToRecord(job) : null;
  },

  /**
   * Find the oldest pending job for the worker to process
   * Returns the oldest job that is pending and hasn't exceeded max attempts
   */
  async findPending(): Promise<AiQueueRecord | null> {
    const job = await db.aiQueue.findFirst({
      where: {
        status: 'pending',
      },
      orderBy: { createdAt: 'asc' },
    });
    return job ? transformToRecord(job) : null;
  },

  /**
   * Mark a job as processing and increment attempts counter
   */
  async markProcessing(id: string): Promise<AiQueueRecord> {
    const job = await db.aiQueue.update({
      where: { id },
      data: {
        status: 'processing',
        attempts: { increment: 1 },
      },
    });
    return transformToRecord(job);
  },

  /**
   * Mark a job as completed with the result data
   */
  async markCompleted(
    id: string,
    result: Record<string, unknown>
  ): Promise<AiQueueRecord> {
    const job = await db.aiQueue.update({
      where: { id },
      data: {
        status: 'completed',
        result: result as Prisma.InputJsonValue,
        processedAt: new Date(),
      },
    });
    return transformToRecord(job);
  },

  /**
   * Mark a job as failed with an error message
   */
  async markFailed(id: string, errorMessage: string): Promise<AiQueueRecord> {
    const job = await db.aiQueue.update({
      where: { id },
      data: {
        status: 'failed',
        errorMessage,
        processedAt: new Date(),
      },
    });
    return transformToRecord(job);
  },

  /**
   * Reset a job to pending status for retry
   */
  async resetToPending(id: string): Promise<AiQueueRecord> {
    const job = await db.aiQueue.update({
      where: { id },
      data: {
        status: 'pending',
        errorMessage: null,
        processedAt: null,
      },
    });
    return transformToRecord(job);
  },

  /**
   * Cancel a pending job (only works for pending jobs)
   * Returns null if job doesn't exist or is not pending
   */
  async cancel(id: string): Promise<AiQueueRecord | null> {
    const existing = await db.aiQueue.findUnique({
      where: { id },
    });

    if (!existing || existing.status !== 'pending') {
      return null;
    }

    const job = await db.aiQueue.update({
      where: { id },
      data: {
        status: 'failed',
        errorMessage: 'Cancelled by user',
        processedAt: new Date(),
      },
    });
    return transformToRecord(job);
  },

  /**
   * Find all AI queue jobs with filtering, pagination, and sorting
   */
  async findAll(
    options: FindAllAiQueueOptions = {}
  ): Promise<FindAllAiQueueResult> {
    const {
      page = 1,
      limit = 20,
      status,
      requestType,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Build where clause
    const where: Prisma.AiQueueWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (requestType) {
      where.requestType = requestType;
    }

    if (userId) {
      where.userId = userId;
    }

    const [total, jobs] = await Promise.all([
      db.aiQueue.count({ where }),
      db.aiQueue.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      jobs: jobs.map(transformToRecord),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get statistics about queue jobs by status
   */
  async getStats(): Promise<AiQueueStats> {
    const [pending, processing, completed, failed] = await Promise.all([
      db.aiQueue.count({ where: { status: 'pending' } }),
      db.aiQueue.count({ where: { status: 'processing' } }),
      db.aiQueue.count({ where: { status: 'completed' } }),
      db.aiQueue.count({ where: { status: 'failed' } }),
    ]);

    return {
      pending,
      processing,
      completed,
      failed,
      total: pending + processing + completed + failed,
    };
  },

  /**
   * Delete old completed and failed jobs older than specified days
   * Returns the number of deleted jobs
   */
  async cleanup(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await db.aiQueue.deleteMany({
      where: {
        status: { in: ['completed', 'failed'] },
        processedAt: { lt: cutoffDate },
      },
    });

    return result.count;
  },
};
