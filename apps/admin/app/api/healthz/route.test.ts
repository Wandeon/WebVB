import { describe, expect, it, vi } from 'vitest';

import { GET } from './route';

vi.mock('@repo/database', () => ({
  checkDatabaseHealth: vi.fn(),
}));

// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { checkDatabaseHealth, type DatabaseHealth } from '@repo/database';

const mockedCheckDatabaseHealth = vi.mocked(checkDatabaseHealth);

interface HealthResponse {
  ok: boolean;
  status: string;
  checks: {
    database: DatabaseHealth;
  };
}

describe('Healthz API', () => {
  it('returns healthy response when database is reachable', async () => {
    mockedCheckDatabaseHealth.mockResolvedValueOnce({ ok: true, latencyMs: 5 });

    const response = await GET();
    const payload = (await response.json()) as HealthResponse;

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.status).toBe('healthy');
    expect(payload.checks.database.ok).toBe(true);
  });

  it('returns degraded response when database is unreachable', async () => {
    mockedCheckDatabaseHealth.mockResolvedValueOnce({ ok: false, latencyMs: 12 });

    const response = await GET();
    const payload = (await response.json()) as HealthResponse;

    expect(response.status).toBe(503);
    expect(payload.ok).toBe(false);
    expect(payload.status).toBe('degraded');
    expect(payload.checks.database.ok).toBe(false);
  });
});
