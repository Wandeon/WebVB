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

// Posts
export async function getPostByTitle(title: string) {
  return prisma.post.findFirst({
    where: { title },
  });
}

export async function deletePostByTitle(title: string) {
  return prisma.post.deleteMany({
    where: { title },
  });
}

// Pages
export async function getPageByTitle(title: string) {
  return prisma.page.findFirst({
    where: { title },
  });
}

export async function deletePageByTitle(title: string) {
  return prisma.page.deleteMany({
    where: { title },
  });
}

// Events
export async function getEventByTitle(title: string) {
  return prisma.event.findFirst({
    where: { title },
  });
}

export async function deleteEventByTitle(title: string) {
  return prisma.event.deleteMany({
    where: { title },
  });
}

// Galleries
export async function getGalleryByTitle(title: string) {
  return prisma.gallery.findFirst({
    where: { title },
  });
}

export async function deleteGalleryByTitle(title: string) {
  return prisma.gallery.deleteMany({
    where: { title },
  });
}

// Documents
export async function getDocumentByTitle(title: string) {
  return prisma.document.findFirst({
    where: { title },
  });
}

export async function deleteDocumentByTitle(title: string) {
  return prisma.document.deleteMany({
    where: { title },
  });
}

// Users
export async function getUserByName(name: string) {
  return prisma.user.findFirst({
    where: { name },
  });
}

export async function deleteUserByEmail(email: string) {
  // Delete associated accounts and sessions first
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.account.deleteMany({ where: { userId: user.id } });
  }
  return prisma.user.deleteMany({
    where: { email },
  });
}
