import { newsletterRepository } from '@repo/database';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { contactLogger } from '@/lib/logger';
import { getEmailLogFields } from '@/lib/pii';

import type { NextRequest } from 'next/server';

export function OPTIONS(request: Request) {
  return corsResponse(request);
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_ID',
            message: 'ID pretplatnika nije naveden.',
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const idResult = z
      .string()
      .uuid('Neispravan identifikator pretplatnika.')
      .safeParse(id);

    if (!idResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Neispravan identifikator pretplatnika.',
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    try {
      const result = await newsletterRepository.unsubscribe(idResult.data);

      contactLogger.info({ ...getEmailLogFields(result.email) }, 'Newsletter unsubscribed');

      return NextResponse.json(
        {
          success: true,
          data: {
            message: 'Uspješno ste se odjavili s newslettera.',
          },
        },
        { headers: corsHeaders }
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Pretplatnik nije pronađen.',
          },
        },
        { status: 404, headers: corsHeaders }
      );
    }
  } catch (error) {
    contactLogger.error({ error }, 'Newsletter unsubscribe error');
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Došlo je do greške. Pokušajte ponovno.' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
