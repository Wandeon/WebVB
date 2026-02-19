import { aiQueueRepository } from '@repo/database';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { aiLogger } from '@/lib/logger';
import { parseUuidParam } from '@/lib/request-validation';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// =============================================================================
// GET /api/ai/queue/[id] - Get single job
// =============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const jobId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const job = await aiQueueRepository.findById(jobId);

    if (!job) {
      return apiError(ErrorCodes.NOT_FOUND, 'AI zadatak nije pronađen', 404);
    }

    // Check ownership for non-admin users
    if (job.userId !== authResult.context.userId
        && authResult.context.role !== 'admin'
        && authResult.context.role !== 'super_admin') {
      return apiError(ErrorCodes.FORBIDDEN, 'Nemate pristup ovom zadatku', 403);
    }

    return apiSuccess(job);
  } catch (error) {
    aiLogger.error({ error }, 'Greška pri dohvaćanju AI zadatka');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri dohvaćanju AI zadatka',
      500
    );
  }
}

// =============================================================================
// DELETE /api/ai/queue/[id] - Cancel pending job
// =============================================================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const jobId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    // Check existence and ownership before cancelling
    const existingJob = await aiQueueRepository.findById(jobId);

    if (!existingJob) {
      return apiError(ErrorCodes.NOT_FOUND, 'AI zadatak nije pronađen', 404);
    }

    // Check ownership for non-admin users
    if (existingJob.userId !== authResult.context.userId
        && authResult.context.role !== 'admin'
        && authResult.context.role !== 'super_admin') {
      return apiError(ErrorCodes.FORBIDDEN, 'Nemate pristup ovom zadatku', 403);
    }

    const job = await aiQueueRepository.cancel(jobId);

    if (!job) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Samo zadaci na čekanju mogu biti otkazani',
        400
      );
    }

    aiLogger.info({ jobId }, 'AI job cancelled');
    return apiSuccess({ message: 'AI zadatak je otkazan', job });
  } catch (error) {
    aiLogger.error({ error }, 'Greška pri otkazivanju AI zadatka');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri otkazivanju AI zadatka',
      500
    );
  }
}
