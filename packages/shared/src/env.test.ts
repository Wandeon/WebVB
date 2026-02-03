import { describe, expect, it } from 'vitest';

import { ADMIN_APP_URL_DEFAULT, PUBLIC_SITE_URL_DEFAULT } from './constants';
import {
  getAdminAuthEnv,
  getBaseEnv,
  getBuildEnv,
  getDatabaseEnv,
  getAdminPublicEnv,
  getOllamaCloudEnv,
  getOptionalAdminEmailEnv,
  getOptionalDatabaseEnv,
  getOptionalOllamaCloudEnv,
  getPublicEnv,
  getPushEnv,
  getRuntimeEnv,
  getSeedEnv,
  isCronConfigured,
  isPushConfigured,
} from './env';

const originalEnv = process.env;

const resetEnv = () => {
  process.env = { ...originalEnv, NODE_ENV: 'development' };
};

describe('env validation', () => {
  it('throws when NODE_ENV is missing', () => {
    resetEnv();
    delete process.env.NODE_ENV;
    expect(() => getBaseEnv()).toThrow('NODE_ENV must be set to development, test, or production.');
  });

  it('returns base env when NODE_ENV is set', () => {
    resetEnv();
    process.env.NODE_ENV = 'development';

    const env = getBaseEnv();

    expect(env.NODE_ENV).toBe('development');
  });

  it('uses default public web urls when missing in development', () => {
    resetEnv();
    process.env.NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    const env = getPublicEnv();

    expect(env.NEXT_PUBLIC_SITE_URL).toBe(PUBLIC_SITE_URL_DEFAULT);
    expect(env.NEXT_PUBLIC_API_URL).toBe(ADMIN_APP_URL_DEFAULT);
  });

  it('uses default admin app url when missing in development', () => {
    resetEnv();
    process.env.NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    const env = getAdminPublicEnv();

    expect(env.NEXT_PUBLIC_APP_URL).toBe(ADMIN_APP_URL_DEFAULT);
    expect(env.NEXT_PUBLIC_SITE_URL).toBe(PUBLIC_SITE_URL_DEFAULT);
    expect(env.NEXT_PUBLIC_API_URL).toBe(ADMIN_APP_URL_DEFAULT);
  });

  it('requires explicit public web URLs in production', () => {
    resetEnv();
    process.env.NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    expect(() => getPublicEnv()).toThrow(
      'Missing required public environment variables in production: NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_API_URL.'
    );
  });

  it('requires explicit admin public URLs in production', () => {
    resetEnv();
    process.env.NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    expect(() => getAdminPublicEnv()).toThrow(
      'Missing required public environment variables in production: NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_API_URL.'
    );
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

  describe('database env', () => {
    it('requires a postgres connection string', () => {
      resetEnv();
      process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';

      const env = getDatabaseEnv();

      expect(env.DATABASE_URL).toContain('postgresql://');
    });

    it('returns null when database env is missing', () => {
      resetEnv();
      delete process.env.DATABASE_URL;

      const env = getOptionalDatabaseEnv();

      expect(env).toBeNull();
    });

    it('throws for invalid database url', () => {
      resetEnv();
      process.env.DATABASE_URL = 'mysql://user:password@localhost:3306/db';

      expect(() => getDatabaseEnv()).toThrow('DATABASE_URL must start with postgres:// or postgresql://');
    });
  });

  describe('runtime env', () => {
    it('allows LOG_LEVEL overrides', () => {
      resetEnv();
      process.env.LOG_LEVEL = 'warn';

      const env = getRuntimeEnv();

      expect(env.LOG_LEVEL).toBe('warn');
    });

    it('parses optional Ollama local URL', () => {
      resetEnv();
      process.env.OLLAMA_LOCAL_URL = 'http://127.0.0.1:11434';

      const env = getRuntimeEnv();

      expect(env.OLLAMA_LOCAL_URL).toBe('http://127.0.0.1:11434');
    });

    it('rejects ALLOW_ANY_ORIGIN in production', () => {
      resetEnv();
      process.env.NODE_ENV = 'production';
      process.env.ALLOW_ANY_ORIGIN = 'true';

      expect(() => getRuntimeEnv()).toThrow('ALLOW_ANY_ORIGIN cannot be enabled in production.');
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

  describe('cron env', () => {
    it('isCronConfigured returns false when missing', () => {
      resetEnv();
      delete process.env.CRON_SECRET;

      expect(isCronConfigured()).toBe(false);
    });
  });

  describe('ollama cloud env', () => {
    it('returns env when configured', () => {
      resetEnv();
      process.env.OLLAMA_CLOUD_API_KEY = 'api-key';
      process.env.OLLAMA_CLOUD_URL = 'https://api.ollama.com';
      process.env.OLLAMA_CLOUD_MODEL = 'deepseek-v3.2';

      const env = getOllamaCloudEnv();

      expect(env.OLLAMA_CLOUD_API_KEY).toBe('api-key');
      expect(env.OLLAMA_CLOUD_URL).toBe('https://api.ollama.com');
      expect(env.OLLAMA_CLOUD_MODEL).toBe('deepseek-v3.2');
    });

    it('returns null for optional env when missing', () => {
      resetEnv();
      delete process.env.OLLAMA_CLOUD_API_KEY;

      expect(getOptionalOllamaCloudEnv()).toBeNull();
    });
  });
});
