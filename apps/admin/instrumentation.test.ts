import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DatabaseHealth } from '@repo/database';
import type { AdminAuthEnv, DatabaseEnv, RuntimeEnv } from '@repo/shared';

const mockCheckDatabaseHealth = vi.fn<() => Promise<DatabaseHealth>>();
const mockDbDisconnect = vi.fn<() => Promise<void>>();
const mockStartQueueWorker = vi.fn<() => void>();
const mockShutdownQueueWorker = vi.fn<() => Promise<void>>();
const mockGetAdminAuthEnv = vi.fn<() => AdminAuthEnv>();
const mockGetDatabaseEnv = vi.fn<() => DatabaseEnv>();
const mockGetRuntimeEnv = vi.fn<() => RuntimeEnv>();
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.mock('@repo/database', () => ({
  checkDatabaseHealth: mockCheckDatabaseHealth,
  db: {
    $disconnect: mockDbDisconnect,
  },
}));

vi.mock('@repo/shared', () => ({
  getAdminAuthEnv: mockGetAdminAuthEnv,
  getDatabaseEnv: mockGetDatabaseEnv,
  getRuntimeEnv: mockGetRuntimeEnv,
}));

vi.mock('./lib/logger', () => ({
  logger: mockLogger,
}));

vi.mock('./lib/ai/queue-worker', () => ({
  startQueueWorker: mockStartQueueWorker,
  shutdownQueueWorker: mockShutdownQueueWorker,
}));

const originalEnv = process.env;
let register: () => Promise<void>;

describe('instrumentation register', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, NEXT_RUNTIME: 'nodejs' };
    vi.clearAllMocks();
    mockCheckDatabaseHealth.mockResolvedValue({ ok: true, latencyMs: 5 });
    mockGetRuntimeEnv.mockReturnValue({ NODE_ENV: 'test' } as RuntimeEnv);
    mockGetAdminAuthEnv.mockReturnValue({
      BETTER_AUTH_URL: 'https://admin.example.com',
      BETTER_AUTH_SECRET: 'secret',
    } as AdminAuthEnv);
    mockGetDatabaseEnv.mockReturnValue({
      DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
    } as DatabaseEnv);
    mockShutdownQueueWorker.mockResolvedValue(undefined);
    mockDbDisconnect.mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('runs startup checks and starts the queue worker', async () => {
    const instrumentationModule = (await import('./instrumentation')) as {
      register: () => Promise<void>;
    };
    register = instrumentationModule.register;
    await register();

    expect(mockGetRuntimeEnv).toHaveBeenCalled();
    expect(mockGetAdminAuthEnv).toHaveBeenCalled();
    expect(mockGetDatabaseEnv).toHaveBeenCalled();
    expect(mockCheckDatabaseHealth).toHaveBeenCalled();
    expect(mockStartQueueWorker).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      { latencyMs: 5 },
      'Database connection verified'
    );
  });

  it('throws when database is unavailable', async () => {
    mockCheckDatabaseHealth.mockResolvedValue({ ok: false, latencyMs: 50 });

    const instrumentationModule = (await import('./instrumentation')) as {
      register: () => Promise<void>;
    };
    register = instrumentationModule.register;
    await expect(register()).rejects.toThrow('Baza podataka nije dostupna tijekom pokretanja.');
    const errorPayload = mockLogger.error.mock.calls[0]?.[0] as
      | { error?: unknown }
      | undefined;
    expect(errorPayload?.error).toBeInstanceOf(Error);
    expect(mockLogger.error.mock.calls[0]?.[1]).toBe('Startup checks failed');
  });
});
