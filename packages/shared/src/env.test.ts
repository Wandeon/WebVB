import { describe, expect, it } from 'vitest';

import { ADMIN_APP_URL_DEFAULT, PUBLIC_SITE_URL_DEFAULT } from './constants';
import {
  getAdminAuthEnv,
  getBaseEnv,
  getBuildEnv,
  getOptionalAdminEmailEnv,
  getPublicEnv,
  getPushEnv,
  getSeedEnv,
  isPushConfigured,
} from './env';

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
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const env = getPublicEnv();

    expect(env.NEXT_PUBLIC_APP_URL).toBe(ADMIN_APP_URL_DEFAULT);
    expect(env.NEXT_PUBLIC_SITE_URL).toBe(PUBLIC_SITE_URL_DEFAULT);
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

  it('returns build env flags when provided', () => {
    resetEnv();
    process.env.NODE_ENV = 'development';
    process.env.CI = 'true';
    process.env.ALLOW_EMPTY_STATIC_PARAMS = 'true';

    const env = getBuildEnv();

    expect(env.NODE_ENV).toBe('development');
    expect(env.CI).toBe('true');
    expect(env.ALLOW_EMPTY_STATIC_PARAMS).toBe('true');
  });

  describe('push env', () => {
    it('throws when PUSH_VAPID_PUBLIC_KEY is missing', () => {
      resetEnv();
      delete process.env.PUSH_VAPID_PUBLIC_KEY;
      process.env.PUSH_VAPID_PRIVATE_KEY = 'private-key';

      expect(() => getPushEnv()).toThrow();
    });

    it('throws when PUSH_VAPID_PRIVATE_KEY is missing', () => {
      resetEnv();
      process.env.PUSH_VAPID_PUBLIC_KEY = 'public-key';
      delete process.env.PUSH_VAPID_PRIVATE_KEY;

      expect(() => getPushEnv()).toThrow();
    });

    it('returns push env when both keys are provided', () => {
      resetEnv();
      process.env.PUSH_VAPID_PUBLIC_KEY = 'test-public-key';
      process.env.PUSH_VAPID_PRIVATE_KEY = 'test-private-key';

      const env = getPushEnv();

      expect(env.PUSH_VAPID_PUBLIC_KEY).toBe('test-public-key');
      expect(env.PUSH_VAPID_PRIVATE_KEY).toBe('test-private-key');
      expect(env.PUSH_VAPID_SUBJECT).toBe('mailto:admin@velikibukovec.hr');
    });

    it('uses custom PUSH_VAPID_SUBJECT when provided', () => {
      resetEnv();
      process.env.PUSH_VAPID_PUBLIC_KEY = 'test-public-key';
      process.env.PUSH_VAPID_PRIVATE_KEY = 'test-private-key';
      process.env.PUSH_VAPID_SUBJECT = 'mailto:custom@example.com';

      const env = getPushEnv();

      expect(env.PUSH_VAPID_SUBJECT).toBe('mailto:custom@example.com');
    });

    it('isPushConfigured returns false when keys missing', () => {
      resetEnv();
      delete process.env.PUSH_VAPID_PUBLIC_KEY;
      delete process.env.PUSH_VAPID_PRIVATE_KEY;

      expect(isPushConfigured()).toBe(false);
    });

    it('isPushConfigured returns true when keys present', () => {
      resetEnv();
      process.env.PUSH_VAPID_PUBLIC_KEY = 'test-public-key';
      process.env.PUSH_VAPID_PRIVATE_KEY = 'test-private-key';

      expect(isPushConfigured()).toBe(true);
    });
  });

  describe('email env', () => {
    it('returns null when email config is incomplete', () => {
      resetEnv();
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASSWORD;
      delete process.env.SMTP_FROM;
      delete process.env.ADMIN_EMAIL;

      const env = getOptionalAdminEmailEnv();

      expect(env).toBeNull();
    });

    it('parses optional email config when provided', () => {
      resetEnv();
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASSWORD = 'password';
      process.env.SMTP_FROM = 'Općina Veliki Bukovec <noreply@velikibukovec.hr>';
      process.env.ADMIN_EMAIL = 'opcina@velikibukovec.hr';

      const env = getOptionalAdminEmailEnv();

      expect(env).not.toBeNull();
      expect(env?.SMTP_PORT).toBe(587);
    });
  });

  describe('seed env', () => {
    it('requires a strong seed password', () => {
      resetEnv();
      process.env.SEED_USER_PASSWORD = 'very-strong-seed-password';

      const env = getSeedEnv();

      expect(env.SEED_USER_PASSWORD).toBe('very-strong-seed-password');
    });
  });
});
