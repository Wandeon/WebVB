import { db } from '../client';

import type { Prisma } from '@prisma/client';

export interface CreateContactMessageData {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status?: string;
  ipAddress?: string | null;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  repliedAt: Date | null;
  repliedBy: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

export interface FindAllContactMessagesOptions {
  page?: number | undefined;
  limit?: number | undefined;
  status?: string | undefined;
  search?: string | undefined;
  sortBy?: 'createdAt' | 'status' | 'name' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface FindAllContactMessagesResult {
  messages: ContactMessageRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CountContactMessagesOptions {
  status?: string;
}

export type ContactMessageStatus = 'new' | 'read' | 'replied' | 'archived';

export const contactMessagesRepository = {
  /**
   * Create a new contact message
   */
  async create(data: CreateContactMessageData): Promise<ContactMessageRecord> {
    return await db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject ?? null,
        message: data.message,
        status: data.status ?? 'new',
        ipAddress: data.ipAddress ?? null,
      },
    });
  },

  /**
   * Find all contact messages with filtering, pagination, and sorting
   */
  async findAll(
    options: FindAllContactMessagesOptions = {}
  ): Promise<FindAllContactMessagesResult> {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Build where clause
    const where: Prisma.ContactMessageWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, messages] = await Promise.all([
      db.contactMessage.count({ where }),
      db.contactMessage.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Find a single contact message by ID
   */
  async findById(id: string): Promise<ContactMessageRecord | null> {
    return await db.contactMessage.findUnique({
      where: { id },
    });
  },

  /**
   * Update the status of a contact message
   */
  async updateStatus(
    id: string,
    status: ContactMessageStatus
  ): Promise<ContactMessageRecord> {
    return await db.contactMessage.update({
      where: { id },
      data: { status },
    });
  },

  /**
   * Mark a contact message as replied
   * Sets status to 'replied', repliedAt to current time, and repliedBy to userId
   */
  async markReplied(id: string, userId: string): Promise<ContactMessageRecord> {
    return await db.contactMessage.update({
      where: { id },
      data: {
        status: 'replied',
        repliedAt: new Date(),
        repliedBy: userId,
      },
    });
  },

  /**
   * Count contact messages with optional filtering
   * Useful for dashboard statistics
   */
  async count(options: CountContactMessagesOptions = {}): Promise<number> {
    const { status } = options;

    const where: Prisma.ContactMessageWhereInput = {};

    if (status) {
      where.status = status;
    }

    return db.contactMessage.count({ where });
  },
};
