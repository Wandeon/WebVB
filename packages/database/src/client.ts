import { PrismaClient } from '@prisma/client';
import { getBaseEnv } from '@repo/shared';

declare global {
  var prisma: PrismaClient | undefined;
}

const env = getBaseEnv();

export const db =
  globalThis.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}
