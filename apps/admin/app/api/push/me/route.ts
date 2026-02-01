// Public endpoint for fetching current push subscription settings
import { pushSubscriptionsRepository } from '@repo/database';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { contactLogger } from '@/lib/logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = 30;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

const querySchema = z
  .object({
    endpoint: z.string().url(),
  })
  .strict();

export function OPTIONS(request: Request) {
  return corsResponse(request);
}

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const endpointParam = url.searchParams.get('endpoint');

    const result = querySchema.safeParse({ endpoint: endpointParam });
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Neispravan endpoint.',
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const subscription = await pushSubscriptionsRepository.getByEndpoint(result.data.endpoint);

    if (!subscription || !subscription.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Pretplata nije pronađena.' },
        },
        { status: 404, headers: corsHeaders }
      );
    }

    // Return subscription settings (exclude sensitive internal fields)
    // Cast to access preferences field (added in migration, may not be in current Prisma types)
    const subscriptionData = subscription as typeof subscription & { preferences?: unknown };

    return NextResponse.json(
      {
        success: true,
        data: {
          topics: subscription.topics,
          preferences: subscriptionData.preferences ?? null,
          locale: subscription.locale,
          createdAt: subscription.createdAt.toISOString(),
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    contactLogger.error({ error }, 'Fetch subscription settings error');
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Došlo je do greške.' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
