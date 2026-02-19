// Public endpoint for unsubscribing from push notifications
import { pushSubscriptionsRepository } from '@repo/database';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { contactLogger } from '@/lib/logger';
import { getTextLogFields } from '@/lib/pii';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

const unsubscribeSchema = z
  .object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  })
  .strict();

export function OPTIONS(request: Request) {
  return corsResponse(request);
}

export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const ip = getClientIp(request);

    const rateCheck = checkRateLimit(ip, RATE_LIMIT, RATE_WINDOW);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'RATE_LIMIT', message: 'Previše zahtjeva. Pokušajte ponovno za sat vremena.' },
        },
        {
          status: 429,
          headers: { ...corsHeaders, 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    const body: unknown = await request.json();
    const result = unsubscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Neispravni podaci.',
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { endpoint, keys } = result.data;

    // Verify the caller owns this subscription
    const isOwner = await pushSubscriptionsRepository.verifyOwnership(endpoint, keys.p256dh, keys.auth);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Neovlašteni pristup.' } },
        { status: 403, headers: corsHeaders }
      );
    }

    const success = await pushSubscriptionsRepository.deactivateByEndpoint(endpoint);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Pretplata nije pronađena.' },
        },
        { status: 404, headers: corsHeaders }
      );
    }

    contactLogger.info(
      { endpoint: getTextLogFields(endpoint) },
      'Push subscription deactivated'
    );

    return NextResponse.json(
      {
        success: true,
        data: { message: 'Uspješno ste se odjavili od obavijesti.' },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    contactLogger.error({ error }, 'Push unsubscribe error');
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Došlo je do greške. Pokušajte ponovno.' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
