import { aiQueueRepository } from '@repo/database';
import { z } from 'zod';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { aiLogger } from '@/lib/logger';

import type { AiRequestType } from '@repo/database';
import type { NextRequest } from 'next/server';

// =============================================================================
// Validation
// =============================================================================

const createJobSchema = z.object({
  requestType: z.enum(['post_generation', 'newsletter_intro', 'content_summary']),
  prompt: z.string().min(1, 'Prompt je obavezan'),
  system: z.string().optional(),
  context: z.record(z.string(), z.unknown()).optional(),
});

const listQuerySchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  requestType: z.enum(['post_generation', 'newsletter_intro', 'content_summary']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// =============================================================================
// POST /api/ai/queue - Submit new job
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();
    const result = createJobSchema.safeParse(body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        firstIssue?.message ?? 'Nevaljani podaci',
        400
      );
    }

    const { requestType, prompt, system, context } = result.data;

    const job = await aiQueueRepository.create({
      userId: authResult.context.userId,
      requestType: requestType as AiRequestType,
      inputData: {
        prompt,
        system,
        context,
      },
    });

    aiLogger.info({ jobId: job.id, requestType }, 'AI job created');

    return apiSuccess(job, 201);
  } catch (error) {
    aiLogger.error({ error }, 'Greška pri kreiranju AI zadatka');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri kreiranju AI zadatka',
      500
    );
  }
}

// =============================================================================
// GET /api/ai/queue - List jobs
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const query = listQuerySchema.safeParse({
      status: searchParams.get('status') ?? undefined,
      requestType: searchParams.get('requestType') ?? undefined,
      page: searchParams.get('page') ?? 1,
      limit: searchParams.get('limit') ?? 20,
    });

    if (!query.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { jobs, pagination } = await aiQueueRepository.findAll({
      status: query.data.status,
      requestType: query.data.requestType,
      page: query.data.page,
      limit: query.data.limit,
    });

    return apiSuccess({ jobs, pagination });
  } catch (error) {
    aiLogger.error({ error }, 'Greška pri dohvaćanju AI zadataka');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri dohvaćanju AI zadataka',
      500
    );
  }
}
