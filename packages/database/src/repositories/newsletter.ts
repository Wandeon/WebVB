// packages/database/src/repositories/newsletter.ts
import { db } from '../client';

export interface NewsletterSubscriberRecord {
  id: string;
  email: string;
  confirmed: boolean;
  confirmationToken: string | null;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
  createdAt: Date;
}

export interface CreateSubscriberData {
  email: string;
  confirmationToken: string;
}

export interface FindAllSubscribersOptions {
  confirmed?: boolean;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface FindAllSubscribersResult {
  subscribers: NewsletterSubscriberRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const newsletterRepository = {
  /**
   * Create a new unconfirmed subscriber
   */
  async create(data: CreateSubscriberData): Promise<NewsletterSubscriberRecord> {
    return await db.newsletterSubscriber.create({
      data: {
        email: data.email,
        confirmationToken: data.confirmationToken,
        confirmed: false,
      },
    });
  },

  /**
   * Find subscriber by email
   */
  async findByEmail(email: string): Promise<NewsletterSubscriberRecord | null> {
    return await db.newsletterSubscriber.findUnique({
      where: { email },
    });
  },

  /**
   * Find subscriber by confirmation token
   */
  async findByToken(token: string): Promise<NewsletterSubscriberRecord | null> {
    return await db.newsletterSubscriber.findFirst({
      where: { confirmationToken: token },
    });
  },

  /**
   * Confirm a subscriber - sets confirmed=true, confirmedAt, clears token
   */
  async confirm(id: string): Promise<NewsletterSubscriberRecord> {
    return await db.newsletterSubscriber.update({
      where: { id },
      data: {
        confirmed: true,
        confirmedAt: new Date(),
        confirmationToken: null,
      },
    });
  },

  /**
   * Unsubscribe - sets unsubscribedAt
   */
  async unsubscribe(id: string): Promise<NewsletterSubscriberRecord> {
    return await db.newsletterSubscriber.update({
      where: { id },
      data: {
        unsubscribedAt: new Date(),
        confirmed: false,
      },
    });
  },

  /**
   * Update confirmation token (for resend)
   */
  async updateToken(id: string, token: string): Promise<NewsletterSubscriberRecord> {
    return await db.newsletterSubscriber.update({
      where: { id },
      data: {
        confirmationToken: token,
      },
    });
  },

  /**
   * Find all confirmed subscribers (for sending newsletters)
   */
  async findAllConfirmed(
    options: FindAllSubscribersOptions = {}
  ): Promise<FindAllSubscribersResult> {
    const { page = 1, limit = 100 } = options;

    const where = {
      confirmed: true,
      unsubscribedAt: null,
    };

    const [total, subscribers] = await Promise.all([
      db.newsletterSubscriber.count({ where }),
      db.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Count subscribers with optional filtering
   */
  async count(options: { confirmed?: boolean } = {}): Promise<number> {
    const where: { confirmed?: boolean; unsubscribedAt?: null } = {};

    if (options.confirmed !== undefined) {
      where.confirmed = options.confirmed;
      if (options.confirmed) {
        where.unsubscribedAt = null;
      }
    }

    return db.newsletterSubscriber.count({ where });
  },
};
