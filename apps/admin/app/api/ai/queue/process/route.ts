import { triggerProcessing, isOllamaCloudConfigured } from '@/lib/ai';
import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { aiLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

// =============================================================================
// POST /api/ai/queue/process - Manually trigger job processing
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    // Only super_admin and admin can manually trigger
    const role = authResult.context.role;
    if (role !== 'super_admin' && role !== 'admin') {
      return apiError(ErrorCodes.FORBIDDEN, 'Nemate dozvolu za ovu akciju', 403);
    }

    if (!isOllamaCloudConfigured()) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 'Ollama Cloud nije konfiguriran', 400);
    }

    const result = await triggerProcessing();

    if (result.processed) {
      aiLogger.info({ jobId: result.jobId }, 'Manual processing triggered');
      return apiSuccess({
        message: 'Zadatak je obrađen',
        jobId: result.jobId,
      });
    } else {
      return apiSuccess({
        message: 'Nema zadataka na čekanju',
      });
    }
  } catch (error) {
    aiLogger.error({ error }, 'Greška pri obradi zadatka');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri obradi zadatka',
      500
    );
  }
}
