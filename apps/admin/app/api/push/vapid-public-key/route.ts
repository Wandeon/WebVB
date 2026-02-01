// Public endpoint to get VAPID public key for push subscription
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';

export function OPTIONS(request: Request) {
  return corsResponse(request);
}

export function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  const publicKey = process.env.PUSH_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOT_CONFIGURED', message: 'Push obavijesti nisu konfigurirane.' },
      },
      { status: 503, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    { success: true, data: { publicKey } },
    { headers: corsHeaders }
  );
}
