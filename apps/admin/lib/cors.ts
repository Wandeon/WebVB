// CORS helper for public API endpoints
// These endpoints are called from the static web app

const ALLOWED_ORIGINS = [
  'https://velikibukovec.hr',
  'https://www.velikibukovec.hr',
  'https://velikibukovec-web.pages.dev',
  // Development
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const DEFAULT_ORIGIN = 'https://velikibukovec.hr';

export function getCorsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : DEFAULT_ORIGIN;

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
