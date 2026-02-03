// Public endpoint for GDPR-compliant hard deletion of push subscription
import { pushSubscriptionsRepository } from '@repo/database';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { contactLogger } from '@/lib/logger';
import { getTextLogFields } from '@/lib/pii';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

const deleteSchema = z
  .object({
    endpoint: z.string().url(),
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  })
  .strict();

export function OPTIONS(request: Request) {
  return corsResponse(request);
}

export async function DELETE(request: Request) {
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
    const result = deleteSchema.safeParse(body);

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

    const { endpoint, p256dh, auth } = result.data;

    // Verify ownership before allowing deletion
    const isOwner = await pushSubscriptionsRepository.verifyOwnership(endpoint, p256dh, auth);
    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Nemate ovlasti za brisanje ove pretplate.' },
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // Hard delete the subscription (GDPR compliance)
    const deleted = await pushSubscriptionsRepository.hardDeleteByEndpoint(endpoint);

    if (!deleted) {
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
      'Push subscription permanently deleted (GDPR)'
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Vaši podaci o pretplati na obavijesti su trajno izbrisani.',
          deletedAt: new Date().toISOString(),
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    contactLogger.error({ error }, 'Delete subscription error');
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Došlo je do greške.' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
