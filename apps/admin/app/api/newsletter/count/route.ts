import { newsletterDraftRepository } from '@repo/database';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { newsletterLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

// GET /api/newsletter/count - Get draft item count for sidebar badge
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const count = await newsletterDraftRepository.getItemCount();
    return apiSuccess({ count });
  } catch (error) {
    newsletterLogger.error({ error }, 'Greska prilikom dohvacanja broja stavki u nacrtu');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greska prilikom dohvacanja broja stavki',
      500
    );
  }
}
