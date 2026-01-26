import { NextResponse } from 'next/server';

import { problemReportsRepository } from '@repo/database';
import { problemReportSchema } from '@repo/shared';

import { problemReportsLogger } from '@/lib/logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = 3;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    const rateCheck = checkRateLimit(ip, RATE_LIMIT, RATE_WINDOW);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT', message: 'Previše zahtjeva. Pokušajte ponovno za sat vremena.' } },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
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
        { status: 400 }
      );
    }

    if (result.data.honeypot) {
      return NextResponse.json({ success: true }); // Silent rejection for bots
    }

    await problemReportsRepository.create({
      problemType: result.data.problemType,
      location: result.data.location,
      description: result.data.description,
      reporterName: result.data.reporterName || null,
      reporterEmail: result.data.reporterEmail || null,
      reporterPhone: result.data.reporterPhone || null,
      images: result.data.images ?? null,
      status: 'new',
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Vaša prijava je uspješno zaprimljena. Zahvaljujemo na javljanju!',
      },
    });
  } catch (error) {
    problemReportsLogger.error({ error }, 'Greška prilikom slanja prijave problema');
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Došlo je do greške. Pokušajte ponovno.' } },
      { status: 500 }
    );
  }
}
