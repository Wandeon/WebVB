import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { getBuildStatus } from '@/lib/rebuild';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, { requireAdmin: true });
    if ('response' in authResult) return authResult.response;

    return apiSuccess(getBuildStatus());
  } catch {
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Greška pri dohvaćanju statusa', 500);
  }
}
