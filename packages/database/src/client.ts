import { PrismaClient } from '@prisma/client';
import { getBaseEnv, getBuildEnv, getDatabaseEnv, getOptionalDatabaseEnv } from '@repo/shared';

declare global {
  var prisma: PrismaClient | undefined;
}

const env = getBaseEnv();
const buildEnv = getBuildEnv();
const databaseEnv = getOptionalDatabaseEnv();
const allowEmptyValues = new Set(['true', '1']);
const allowEmpty = allowEmptyValues.has(buildEnv.ALLOW_EMPTY_STATIC_PARAMS ?? '');
const isCi = Boolean(buildEnv.CI) && buildEnv.CI !== 'false';
const allowMissingDatabase = allowEmpty && (isCi || env.NODE_ENV === 'development');

if (!databaseEnv && !allowMissingDatabase) {
  getDatabaseEnv();
}

const missingDatabaseClient = new Proxy(
  {},
  {
    get() {
      throw new Error(
        'DATABASE_URL is not configured. Set DATABASE_URL or disable ALLOW_EMPTY_STATIC_PARAMS.'
      );
    },
  }
) as PrismaClient;

export const db =
  databaseEnv
    ? globalThis.prisma ??
      new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    : missingDatabaseClient;

if (databaseEnv && env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}
