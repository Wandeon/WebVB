import { checkHealth, isOllamaCloudConfigured } from '@/lib/ai';
import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';

import type { NextRequest } from 'next/server';

/**
 * GET /api/ai/health - Check Ollama Cloud connection status
 * Returns health status including connectivity, model availability, and latency
 */
export async function GET(request: NextRequest) {
  // Require authentication to check AI health
  const authResult = await requireAuth(request);

  if ('response' in authResult) {
    return authResult.response;
  }

  try {
    // Quick check if configured at all
    if (!isOllamaCloudConfigured()) {
      return apiSuccess({
        configured: false,
        connected: false,
        model: null,
        modelAvailable: false,
        latencyMs: null,
        error: 'OLLAMA_CLOUD_API_KEY not set',
        checkedAt: new Date().toISOString(),
      });
    }

    // Full health check
    const health = await checkHealth();

    return apiSuccess({
      configured: true,
      ...health,
    });
  } catch (error) {
    console.error('AI health check failed:', error);
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Health check failed',
      500
    );
  }
}
