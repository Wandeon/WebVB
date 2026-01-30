// apps/admin/app/api/public/newsletter/confirm/route.ts
import { newsletterRepository } from '@repo/database';
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { contactLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

export function OPTIONS(request: Request) {
  return corsResponse(request);
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Token za potvrdu nije naveden.',
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const subscriber = await newsletterRepository.findByToken(token);

    if (!subscriber) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Nevažeći ili istekli token za potvrdu.',
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (subscriber.confirmed) {
      return NextResponse.json(
        {
          success: true,
          data: {
            message: 'Vaša pretplata je već potvrđena.',
            alreadyConfirmed: true,
          },
        },
        { headers: corsHeaders }
      );
    }

    await newsletterRepository.confirm(subscriber.id);

    contactLogger.info({ email: subscriber.email }, 'Newsletter subscription confirmed');

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Vaša pretplata je uspješno potvrđena! Hvala vam.',
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    contactLogger.error({ error }, 'Newsletter confirmation error');
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Došlo je do greške. Pokušajte ponovno.' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
