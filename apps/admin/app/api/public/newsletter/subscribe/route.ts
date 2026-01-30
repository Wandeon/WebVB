import { randomUUID } from 'node:crypto';

import { newsletterRepository } from '@repo/database';
import { newsletterSubscribeSchema } from '@repo/shared';
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { sendNewsletterConfirmation } from '@/lib/email';
import { contactLogger } from '@/lib/logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || 'https://velikibukovec.hr';

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
        { success: false, error: { code: 'RATE_LIMIT', message: 'Previše zahtjeva. Pokušajte ponovno za sat vremena.' } },
        { status: 429, headers: { ...corsHeaders, 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body: unknown = await request.json();
    const result = newsletterSubscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Neispravna email adresa',
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (result.data.honeypot) {
      return NextResponse.json({ success: true }, { headers: corsHeaders }); // Silent rejection for bots
    }

    const email = result.data.email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await newsletterRepository.findByEmail(email);

    if (existing) {
      if (existing.confirmed && !existing.unsubscribedAt) {
        // Already confirmed and active
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ALREADY_SUBSCRIBED',
              message: 'Ova email adresa je već pretplaćena na newsletter.',
            },
          },
          { status: 400, headers: corsHeaders }
        );
      }

      if (existing.unsubscribedAt) {
        // Was unsubscribed, resubscribe with new token
        const token = randomUUID();
        await newsletterRepository.updateToken(existing.id, token);

        const confirmUrl = `${PUBLIC_SITE_URL}/newsletter/potvrda?token=${token}`;
        sendNewsletterConfirmation(email, confirmUrl);

        contactLogger.info({ email }, 'Newsletter resubscription initiated');

        return NextResponse.json(
          {
            success: true,
            data: {
              message: 'Hvala na prijavi! Provjerite svoj email za potvrdu pretplate.',
            },
          },
          { headers: corsHeaders }
        );
      }

      // Exists but not confirmed - resend confirmation
      const token = randomUUID();
      await newsletterRepository.updateToken(existing.id, token);

      const confirmUrl = `${PUBLIC_SITE_URL}/newsletter/potvrda?token=${token}`;
      sendNewsletterConfirmation(email, confirmUrl);

      contactLogger.info({ email }, 'Newsletter confirmation resent');

      return NextResponse.json(
        {
          success: true,
          data: {
            message: 'Hvala na prijavi! Provjerite svoj email za potvrdu pretplate.',
          },
        },
        { headers: corsHeaders }
      );
    }

    // New subscriber
    const token = randomUUID();
    await newsletterRepository.create({ email, confirmationToken: token });

    const confirmUrl = `${PUBLIC_SITE_URL}/newsletter/potvrda?token=${token}`;
    sendNewsletterConfirmation(email, confirmUrl);

    contactLogger.info({ email }, 'New newsletter subscription initiated');

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Hvala na prijavi! Provjerite svoj email za potvrdu pretplate.',
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    contactLogger.error({ error }, 'Newsletter subscription error');
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Došlo je do greške. Pokušajte ponovno.' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
