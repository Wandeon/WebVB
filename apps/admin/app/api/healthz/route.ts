import { NextResponse } from 'next/server';

import { checkDatabaseHealth } from '@repo/database';

import packageJson from '../../../package.json';

const commitSha = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.CF_PAGES_COMMIT_SHA ?? 'local';

export async function GET() {
  const database = await checkDatabaseHealth();
  const ok = database.ok;

  return NextResponse.json(
    {
      ok,
      status: ok ? 'healthy' : 'degraded',
      service: packageJson.name,
      version: packageJson.version,
      commit: commitSha.slice(0, 7),
      timestamp: new Date().toISOString(),
      checks: {
        database,
      },
    },
    {
      status: ok ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
