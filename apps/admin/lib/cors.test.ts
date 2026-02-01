import { afterEach, describe, expect, it } from 'vitest';

import { getCorsHeaders } from './cors';

const originalEnv = process.env;

const resetEnv = (overrides: Record<string, string | undefined> = {}) => {
  process.env = { ...originalEnv, ...overrides };
};

describe('cors', () => {
  afterEach(() => {
    process.env = originalEnv;
  });

  it('allows any origin in development when explicitly enabled', () => {
    resetEnv({ NODE_ENV: 'development', ALLOW_ANY_ORIGIN: 'true' });

    const request = new Request('https://velikibukovec.hr', {
      headers: { Origin: 'https://unknown.example.com' },
    });

    const headers = new Headers(getCorsHeaders(request));

    expect(headers.get('Access-Control-Allow-Origin')).toBe('https://unknown.example.com');
  });

  it('rejects allow-any-origin in production', () => {
    resetEnv({ NODE_ENV: 'production', ALLOW_ANY_ORIGIN: 'true' });

    const request = new Request('https://velikibukovec.hr', {
      headers: { Origin: 'https://unknown.example.com' },
    });

    expect(() => getCorsHeaders(request)).toThrow('ALLOW_ANY_ORIGIN cannot be enabled in production.');
  });

  it('falls back to default origin in production for unknown origins', () => {
    resetEnv({ NODE_ENV: 'production', ALLOW_ANY_ORIGIN: 'false' });

    const request = new Request('https://velikibukovec.hr', {
      headers: { Origin: 'https://unknown.example.com' },
    });

    const headers = new Headers(getCorsHeaders(request));

    expect(headers.get('Access-Control-Allow-Origin')).toBe('https://velikibukovec.hr');
  });
});
