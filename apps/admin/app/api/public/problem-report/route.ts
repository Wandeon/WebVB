import { problemReportsRepository } from '@repo/database';
import { problemReportSchema } from '@repo/shared';
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { sendProblemConfirmation, sendProblemNotification } from '@/lib/email';
import { problemReportsLogger } from '@/lib/logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = 3;
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
        { success: false, error: { code: 'RATE_LIMIT', message: 'Previše zahtjeva. Pokušajte ponovno za sat vremena.' } },
        { status: 429, headers: { ...corsHeaders, 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body: unknown = await request.json();
    const result = problemReportSchema.safeParse(body);

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

    const reportData = {
      problemType: result.data.problemType,
      location: result.data.location,
      description: result.data.description,
      reporterName: result.data.reporterName || null,
      reporterEmail: result.data.reporterEmail || null,
      reporterPhone: result.data.reporterPhone || null,
      images: result.data.images?.map((img) => ({
        url: img.url,
        caption: img.caption ?? null,
      })) ?? null,
    };

    await problemReportsRepository.create({
      ...reportData,
      status: 'new',
      ipAddress: ip,
    });

    // Send email notifications (fire-and-forget, errors are logged but don't fail the request)
    sendProblemNotification({ ...reportData, createdAt: new Date() });
    sendProblemConfirmation(reportData); // Only sends if reporterEmail is provided

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Vaša prijava je uspješno zaprimljena. Zahvaljujemo na javljanju!',
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    problemReportsLogger.error({ error }, 'Greška prilikom slanja prijave problema');
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Došlo je do greške. Pokušajte ponovno.' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
