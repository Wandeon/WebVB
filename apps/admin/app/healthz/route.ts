import { NextResponse } from 'next/server';

import packageJson from '../../package.json';

const commitSha = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.CF_PAGES_COMMIT_SHA ?? 'local';

export function GET() {
  return NextResponse.json({
    ok: true,
    service: packageJson.name,
    version: packageJson.version,
    commit: commitSha.slice(0, 7),
    timestamp: new Date().toISOString(),
  });
}
