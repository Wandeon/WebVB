import { db } from '../client';
import { normalizePagination } from './pagination';

import type { Prisma } from '@prisma/client';

// Status type for AI queue jobs
export type AiQueueStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'dead_letter';

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
  lockedAt: Date | null;
  lockedBy: string | null;
  leaseExpiresAt: Date | null;
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
  cancelled: number;
  deadLetter: number;
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
    lockedAt: job.lockedAt,
    lockedBy: job.lockedBy,
    leaseExpiresAt: job.leaseExpiresAt,
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
   * Find a job by idempotency key stored in inputData
   */
  async findByIdempotencyKey({
    userId,
    requestType,
    idempotencyKey,
  }: {
    userId?: string | null;
    requestType: AiRequestType;
    idempotencyKey: string;
  }): Promise<AiQueueRecord | null> {
    const job = await db.aiQueue.findFirst({
      where: {
        userId: userId ?? null,
        requestType,
        status: { notIn: ['failed', 'dead_letter', 'cancelled'] },
        inputData: {
          path: ['idempotencyKey'],
          equals: idempotencyKey,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return job ? transformToRecord(job) : null;
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
        lockedAt: new Date(),
        lockedBy: 'manual',
        leaseExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    return transformToRecord(job);
  },

  /**
   * Atomically claim the next available job using FOR UPDATE SKIP LOCKED.
   * Prevents double-claiming and handles expired leases in a single query.
   * The WHERE clause enforces attempts < max_attempts, fixing the dead-letter guard.
   */
  async claimNext({
    workerId,
    leaseMs,
  }: {
    workerId: string;
    leaseMs: number;
  }): Promise<AiQueueRecord | null> {
    const now = new Date();
    const leaseExpiresAt = new Date(now.getTime() + leaseMs);

    // Single atomic claim using FOR UPDATE SKIP LOCKED
    const jobs = await db.$queryRaw<Array<{
      id: string;
      user_id: string | null;
      request_type: string;
      input_data: unknown;
      status: string;
      result: unknown;
      error_message: string | null;
      attempts: number;
      max_attempts: number;
      locked_at: Date | null;
      locked_by: string | null;
      lease_expires_at: Date | null;
      created_at: Date;
      processed_at: Date | null;
    }>>`
      UPDATE ai_queue
      SET status = 'processing',
          locked_by = ${workerId},
          locked_at = ${now},
          lease_expires_at = ${leaseExpiresAt},
          attempts = attempts + 1,
          error_message = NULL
      WHERE id = (
        SELECT id FROM ai_queue
        WHERE (status = 'pending' OR (status = 'processing' AND lease_expires_at < ${now}))
          AND attempts < max_attempts
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *
    `;

    if (jobs.length === 0) return null;

    const raw = jobs[0]!;
    return {
      id: raw.id,
      userId: raw.user_id,
      requestType: raw.request_type,
      inputData: raw.input_data as Record<string, unknown>,
      status: raw.status,
      result: raw.result as Record<string, unknown> | null,
      errorMessage: raw.error_message,
      attempts: raw.attempts,
      maxAttempts: raw.max_attempts,
      lockedAt: raw.locked_at,
      lockedBy: raw.locked_by,
      leaseExpiresAt: raw.lease_expires_at,
      createdAt: raw.created_at,
      processedAt: raw.processed_at,
    };
  },

  /**
   * Atomically extend the lease for a job owned by a specific worker.
   * Only succeeds if the job is still processing and locked by the given worker.
   */
  async extendLease(jobId: string, workerId: string, leaseMs: number): Promise<boolean> {
    const result = await db.aiQueue.updateMany({
      where: {
        id: jobId,
        lockedBy: workerId,
        status: 'processing',
      },
      data: {
        leaseExpiresAt: new Date(Date.now() + leaseMs),
      },
    });
    return result.count > 0;
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
        lockedAt: null,
        lockedBy: null,
        leaseExpiresAt: null,
      },
    });
    return transformToRecord(job);
  },

  /**
   * Mark a job as failed with an error message
   */
  async markFailed(
    id: string,
    errorMessage: string,
    result?: Record<string, unknown>
  ): Promise<AiQueueRecord> {
    const job = await db.aiQueue.update({
      where: { id },
      data: {
        status: 'failed',
        errorMessage,
        processedAt: new Date(),
        ...(result ? { result: result as Prisma.InputJsonValue } : {}),
        lockedAt: null,
        lockedBy: null,
        leaseExpiresAt: null,
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
        lockedAt: null,
        lockedBy: null,
        leaseExpiresAt: null,
      },
    });
    return transformToRecord(job);
  },

  /**
   * Atomically cancel a pending job.
   * Uses updateMany with status guard to prevent race conditions.
   * Returns null if job doesn't exist or is not pending.
   */
  async cancel(id: string): Promise<AiQueueRecord | null> {
    // Atomic cancel -- only cancels pending jobs
    const result = await db.aiQueue.updateMany({
      where: {
        id,
        status: 'pending',
      },
      data: {
        status: 'cancelled',
        errorMessage: 'Otkazano od strane korisnika',
        processedAt: new Date(),
        lockedAt: null,
        lockedBy: null,
        leaseExpiresAt: null,
      },
    });

    if (result.count === 0) return null;

    const job = await db.aiQueue.findUnique({ where: { id } });
    return job ? transformToRecord(job) : null;
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
    const { page: safePage, limit: safeLimit, skip } = normalizePagination({
      page,
      limit,
      defaultLimit: 20,
    });

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
        skip,
        take: safeLimit,
      }),
    ]);

    return {
      jobs: jobs.map(transformToRecord),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },

  /**
   * Get statistics about queue jobs by status
   */
  async getStats(): Promise<AiQueueStats> {
    const [pending, processing, completed, failed, cancelled, deadLetter] = await Promise.all([
      db.aiQueue.count({ where: { status: 'pending' } }),
      db.aiQueue.count({ where: { status: 'processing' } }),
      db.aiQueue.count({ where: { status: 'completed' } }),
      db.aiQueue.count({ where: { status: 'failed' } }),
      db.aiQueue.count({ where: { status: 'cancelled' } }),
      db.aiQueue.count({ where: { status: 'dead_letter' } }),
    ]);

    return {
      pending,
      processing,
      completed,
      failed,
      cancelled,
      deadLetter,
      total: pending + processing + completed + failed + cancelled + deadLetter,
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
        status: { in: ['completed', 'failed', 'cancelled', 'dead_letter'] },
        processedAt: { lt: cutoffDate },
      },
    });

    return result.count;
  },
};
