import { PrismaClient } from '@prisma/client';

// Direct Prisma client for test assertions (bypasses Better Auth)
const prisma = new PrismaClient();

export async function getSessionCount(userId: string): Promise<number> {
  return prisma.session.count({
    where: { userId },
  });
}

export async function getSessionByUserId(userId: string) {
  return prisma.session.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function clearUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}
