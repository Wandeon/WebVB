import { db } from '../client';
import { normalizePagination } from './pagination';

import type { Prisma } from '@prisma/client';

export interface UsersQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  active?: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  role: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  active?: boolean;
}

export interface CreateCredentialAccountData {
  userId: string;
  password: string;
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const usersRepository = {
  async findMany(options: UsersQueryOptions = {}) {
    const { page = 1, limit = 10, search, role, active } = options;
    const { page: safePage, limit: safeLimit, skip } = normalizePagination({
      page,
      limit,
      defaultLimit: 10,
    });

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (active !== undefined) {
      where.active = active;
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      db.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },

  async findById(id: string) {
    return db.user.findUnique({
      where: { id },
      select: userSelect,
    });
  },

  async findByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
      select: userSelect,
    });
  },

  async create(data: CreateUserData) {
    return db.user.create({
      data: {
        ...data,
        emailVerified: false,
        active: true,
      },
      select: userSelect,
    });
  },

  async createCredentialAccount(data: CreateCredentialAccountData) {
    return db.account.create({
      data: {
        userId: data.userId,
        accountId: data.userId,
        providerId: 'credential',
        password: data.password,
      },
    });
  },

  async update(id: string, data: UpdateUserData) {
    return db.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  },

  async deactivate(id: string) {
    return db.user.update({
      where: { id },
      data: { active: false },
      select: userSelect,
    });
  },

  async activate(id: string) {
    return db.user.update({
      where: { id },
      data: { active: true },
      select: userSelect,
    });
  },
};
