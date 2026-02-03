import { checkDatabaseHealth } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
  const database = await checkDatabaseHealth();
  const ok = database.ok;

  return NextResponse.json(
    {
      ok,
      status: ok ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
