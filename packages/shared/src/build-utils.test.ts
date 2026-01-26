import { describe, expect, it } from 'vitest';

import { withStaticParams } from './build-utils';

const originalEnv = process.env;

const resetEnv = (overrides: Record<string, string | undefined> = {}) => {
  process.env = { ...originalEnv, ...overrides };
};

describe('withStaticParams', () => {
  it('returns static params when factory succeeds', async () => {
    resetEnv({ NODE_ENV: 'production' });

    const factory = withStaticParams(
      () => Promise.resolve([{ slug: ['test'] }]),
      { routeName: 'test-route' }
    );

    await expect(factory()).resolves.toEqual([{ slug: ['test'] }]);
  });

  it('allows empty params in development when explicitly enabled', async () => {
    // Must explicitly clear CI to test development behavior (CI sets CI=true)
    resetEnv({ NODE_ENV: 'development', ALLOW_EMPTY_STATIC_PARAMS: 'true', CI: undefined });

    const factory = withStaticParams(
      () => Promise.reject(new Error('DB not reachable')),
      { routeName: 'test-route' }
    );

    await expect(factory()).resolves.toEqual([]);
  });

  it('throws when params generation fails without explicit allowance', async () => {
    resetEnv({ NODE_ENV: 'development', ALLOW_EMPTY_STATIC_PARAMS: undefined });

    const factory = withStaticParams(
      () => Promise.reject(new Error('DB not reachable')),
      { routeName: 'test-route' }
    );

    await expect(factory()).rejects.toThrow(
      'Neuspjelo generiranje statičkih ruta za test-route.'
    );
  });

  it('does not allow empty params in CI', async () => {
    resetEnv({
      NODE_ENV: 'development',
      ALLOW_EMPTY_STATIC_PARAMS: 'true',
      CI: 'true',
    });

    const factory = withStaticParams(
      () => Promise.reject(new Error('DB not reachable')),
      { routeName: 'test-route' }
    );

    await expect(factory()).rejects.toThrow(
      'Neuspjelo generiranje statičkih ruta za test-route.'
    );
  });
});
