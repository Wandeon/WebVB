import { describe, expect, it } from 'vitest';

import { ADMIN_APP_URL_DEFAULT } from './constants';
import { getAdminAuthEnv, getBaseEnv, getPublicEnv } from './env';

const originalEnv = process.env;

const resetEnv = () => {
  process.env = { ...originalEnv };
};

describe('env validation', () => {
  it('returns base env defaults', () => {
    resetEnv();
    delete process.env.NODE_ENV;

    const env = getBaseEnv();

    expect(env.NODE_ENV).toBe('development');
  });

  it('uses default public app url when missing', () => {
    resetEnv();
    delete process.env.NEXT_PUBLIC_APP_URL;

    const env = getPublicEnv();

    expect(env.NEXT_PUBLIC_APP_URL).toBe(ADMIN_APP_URL_DEFAULT);
  });

  it('validates admin auth env with required values', () => {
    resetEnv();
    process.env.BETTER_AUTH_URL = 'https://admin.example.com';
    process.env.BETTER_AUTH_SECRET = 'test-secret';

    const env = getAdminAuthEnv();

    expect(env.BETTER_AUTH_URL).toBe('https://admin.example.com');
    expect(env.BETTER_AUTH_SECRET).toBe('test-secret');
  });

  it('throws when google oauth values are incomplete', () => {
    resetEnv();
    process.env.BETTER_AUTH_URL = 'https://admin.example.com';
    process.env.BETTER_AUTH_SECRET = 'test-secret';
    process.env.GOOGLE_CLIENT_ID = 'client-id';
    delete process.env.GOOGLE_CLIENT_SECRET;

    expect(() => getAdminAuthEnv()).toThrow('Google OAuth requires both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  });
});
