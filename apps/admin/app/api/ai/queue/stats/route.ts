import { aiQueueRepository } from '@repo/database';

import { isOllamaCloudConfigured, isWorkerRunning } from '@/lib/ai';
import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { aiLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

// =============================================================================
// GET /api/ai/queue/stats - Get queue statistics
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const stats = await aiQueueRepository.getStats();

    return apiSuccess({
      ...stats,
      workerRunning: isWorkerRunning(),
      ollamaConfigured: isOllamaCloudConfigured(),
    });
  } catch (error) {
    aiLogger.error({ error }, 'Greška pri dohvaćanju statistike');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri dohvaćanju statistike',
      500
    );
  }
}
