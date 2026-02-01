import { db } from '../client';

export interface DatabaseHealth {
  ok: boolean;
  latencyMs: number;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const start = Date.now();

  try {
    await db.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}
