import { pagesRepository } from '@repo/database';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { pagesLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get('excludeId') ?? undefined;

    const pages = await pagesRepository.findAllForParentSelect(excludeId);

    return apiSuccess(pages);
  } catch (error) {
    pagesLogger.error({ error }, 'Greška prilikom dohvaćanja stranica za odabir');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja stranica',
      500
    );
  }
}
