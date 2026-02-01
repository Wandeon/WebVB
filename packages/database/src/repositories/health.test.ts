import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { checkDatabaseHealth } from './health';
import { db } from '../client';

vi.mock('../client', () => ({
  db: {
    $queryRaw: vi.fn(),
  },
}));

const mockedDb = db as unknown as {
  $queryRaw: Mock;
};

describe('checkDatabaseHealth', () => {
  it('returns ok when the query succeeds', async () => {
    mockedDb.$queryRaw.mockResolvedValueOnce(1);

    const result = await checkDatabaseHealth();

    expect(result.ok).toBe(true);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('returns not ok when the query fails', async () => {
    mockedDb.$queryRaw.mockRejectedValueOnce(new Error('Connection failed'));

    const result = await checkDatabaseHealth();

    expect(result.ok).toBe(false);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
