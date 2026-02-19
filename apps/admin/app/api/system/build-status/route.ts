import { requireAuth } from '@/lib/api-auth';
import { getBuildStatus } from '@/lib/rebuild';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, { requireAdmin: true });
    if ('response' in authResult) return authResult.response;

    return apiSuccess(getBuildStatus());
  } catch (error) {
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Greška pri dohvaćanju statusa', 500);
  }
}
