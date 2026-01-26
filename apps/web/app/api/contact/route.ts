import { db } from '@repo/database';
import { contactFormSchema } from '@repo/shared';
import { NextResponse } from 'next/server';

import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    const rateCheck = checkRateLimit(ip, RATE_LIMIT, RATE_WINDOW);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Previše zahtjeva. Pokušajte ponovno za sat vremena.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body: unknown = await request.json();
    const result = contactFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Neispravni podaci', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (result.data.honeypot) {
      return NextResponse.json({ success: true }); // Silent rejection for bots
    }

    await db.contactMessage.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        subject: result.data.subject || null,
        message: result.data.message,
        status: 'new',
        ipAddress: ip,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Vaša poruka je uspješno poslana. Odgovorit ćemo vam u najkraćem mogućem roku.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: 'Došlo je do greške. Pokušajte ponovno.' },
      { status: 500 }
    );
  }
}
