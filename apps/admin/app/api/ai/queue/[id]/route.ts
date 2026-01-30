import { aiQueueRepository } from '@repo/database';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { aiLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// =============================================================================
// GET /api/ai/queue/[id] - Get single job
// =============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const { id } = await params;
    const job = await aiQueueRepository.findById(id);

    if (!job) {
      return apiError(ErrorCodes.NOT_FOUND, 'AI zadatak nije pronađen', 404);
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
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const { id } = await params;
    const job = await aiQueueRepository.cancel(id);

    if (!job) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Samo zadaci na čekanju mogu biti otkazani',
        400
      );
    }

    aiLogger.info({ jobId: id }, 'AI job cancelled');
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
