import { contactMessagesRepository } from '@repo/database';
import { contactFormSchema } from '@repo/shared';
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { sendContactConfirmation, sendContactNotification } from '@/lib/email';
import { contactLogger } from '@/lib/logger';
import { anonymizeIp } from '@/lib/pii';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour
const DUPLICATE_WINDOW = 10 * 60 * 1000; // 10 minutes

export function OPTIONS(request: Request) {
  return corsResponse(request);
}

export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const clientIp = getClientIp(request);
    const storedIp = anonymizeIp(clientIp);

    const rateCheck = checkRateLimit(clientIp, RATE_LIMIT, RATE_WINDOW);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT', message: 'Previše zahtjeva. Pokušajte ponovno za sat vremena.' } },
        { status: 429, headers: { ...corsHeaders, 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body: unknown = await request.json();
    const result = contactFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Neispravni podaci',
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (result.data.honeypot) {
      return NextResponse.json({ success: true }, { headers: corsHeaders }); // Silent rejection for bots
    }

    const contactData = {
      name: result.data.name,
      email: result.data.email,
      subject: result.data.subject || null,
      message: result.data.message,
    };

    const duplicate = await contactMessagesRepository.findRecentDuplicate({
      email: contactData.email,
      subject: contactData.subject,
      message: contactData.message,
      windowMs: DUPLICATE_WINDOW,
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_SUBMISSION',
            message: 'Već smo zaprimili istu poruku. Ako imate dodatne informacije, pošaljite novu poruku.',
          },
        },
        { status: 409, headers: corsHeaders }
      );
    }

    await contactMessagesRepository.create({
      ...contactData,
      status: 'new',
      ipAddress: storedIp,
    });

    // Send email notifications (fire-and-forget, errors are logged but don't fail the request)
    sendContactNotification({ ...contactData, createdAt: new Date() });
    sendContactConfirmation(contactData);

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Vaša poruka je uspješno poslana. Odgovorit ćemo vam u najkraćem mogućem roku.',
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    contactLogger.error({ error }, 'Greška prilikom slanja kontakt poruke');
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Došlo je do greške. Pokušajte ponovno.' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
