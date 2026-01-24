import { PrismaClient } from '@prisma/client';
import { getBaseEnv } from '@repo/shared';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const env = getBaseEnv();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
