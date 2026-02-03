// Public endpoint for subscribing to push notifications
import { pushSubscriptionsRepository } from '@repo/database';
import { pushSubscriptionSchema } from '@repo/shared';
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { contactLogger } from '@/lib/logger';
import { getTextLogFields } from '@/lib/pii';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

import type { PushTopic } from '@repo/database';

const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

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
    const result = pushSubscriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Neispravni podaci za pretplatu.',
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { endpoint, p256dh, auth, userAgent, locale, topics } = result.data;

    await pushSubscriptionsRepository.upsertSubscription({
      endpoint,
      p256dh,
      auth,
      ...(userAgent && { userAgent }),
      locale,
      topics: (topics ?? ['all']) as PushTopic[],
    });

    contactLogger.info(
      { endpoint: getTextLogFields(endpoint) },
      'Push subscription created/updated'
    );

    return NextResponse.json(
      {
        success: true,
        data: { message: 'Uspješno ste se pretplatili na obavijesti.' },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    contactLogger.error({ error }, 'Push subscription error');
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Došlo je do greške. Pokušajte ponovno.' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
