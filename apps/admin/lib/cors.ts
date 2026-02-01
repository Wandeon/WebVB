// CORS helper for public API endpoints
// These endpoints are called from the static web app

import { getBaseEnv, getRuntimeEnv } from '@repo/shared';

const ALLOWED_ORIGINS = [
  'https://velikibukovec.hr',
  'https://www.velikibukovec.hr',
  'https://velikibukovec-web.pages.dev',
  // Development
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const DEFAULT_ORIGIN = 'https://velikibukovec.hr';

function isAllowedOrigin(origin: string): boolean {
  const baseEnv = getBaseEnv();
  const runtimeEnv = getRuntimeEnv();
  const allowAnyOrigin = runtimeEnv.ALLOW_ANY_ORIGIN === 'true';

  // Always allow configured origins
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // In non-production, allow any origin (for staging/dev with IP access)
  if (baseEnv.NODE_ENV !== 'production' && allowAnyOrigin) {
    return true;
  }

  // Allow IP-based origins only outside production
  if (
    baseEnv.NODE_ENV !== 'production' &&
    origin.match(/^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/)
  ) {
    return true;
  }

  return false;
}

export function getCorsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = isAllowedOrigin(origin) ? origin : DEFAULT_ORIGIN;

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

export function corsResponse(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}
