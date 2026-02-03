// Public endpoint for updating push subscription settings
import { pushSubscriptionsRepository } from '@repo/database';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { contactLogger } from '@/lib/logger';
import { getTextLogFields } from '@/lib/pii';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

import type { PushTopic, PushPreferences } from '@repo/database';

const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const settingsSchema = z
  .object({
    endpoint: z.string().url(),
    p256dh: z.string().min(1),
    auth: z.string().min(1),
    topics: z.array(z.enum(['all', 'waste', 'news', 'events', 'announcements'])).min(1),
    preferences: z
      .object({
        quietHoursStart: z.string().regex(timeRegex, 'Neispravan format vremena (HH:MM)').optional(),
        quietHoursEnd: z.string().regex(timeRegex, 'Neispravan format vremena (HH:MM)').optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export function OPTIONS(request: Request) {
  return corsResponse(request);
}

export async function PUT(request: Request) {
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
    const result = settingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Neispravni podaci.',
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { endpoint, p256dh, auth, topics, preferences } = result.data;

    // Verify ownership before allowing update
    const isOwner = await pushSubscriptionsRepository.verifyOwnership(endpoint, p256dh, auth);
    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Nemate ovlasti za izmjenu ove pretplate.' },
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // Validate quiet hours logic
    if (preferences?.quietHoursStart && !preferences?.quietHoursEnd) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Ako postavite početak tihih sati, morate postaviti i kraj.' },
        },
        { status: 400, headers: corsHeaders }
      );
    }
    if (!preferences?.quietHoursStart && preferences?.quietHoursEnd) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Ako postavite kraj tihih sati, morate postaviti i početak.' },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const subscription = await pushSubscriptionsRepository.updateSettings(
      endpoint,
      topics as PushTopic[],
      preferences as PushPreferences | undefined
    );

    if (!subscription) {
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
      'Push subscription settings updated'
    );

    // Cast to access preferences field (added in migration, may not be in current Prisma types)
    const subscriptionData = subscription as typeof subscription & { preferences?: unknown };

    return NextResponse.json(
      {
        success: true,
        data: {
          topics: subscription.topics,
          preferences: subscriptionData.preferences ?? null,
          message: 'Postavke su uspješno ažurirane.',
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    contactLogger.error({ error }, 'Update subscription settings error');
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Došlo je do greške.' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
