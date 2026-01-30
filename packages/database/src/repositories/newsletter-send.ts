import { Prisma } from '@prisma/client';

import { db } from '../client';

export interface NewsletterSendRecord {
  id: string;
  subject: string;
  contentHtml: string;
  contentText: string;
  sentAt: Date;
  recipientCount: number | null;
  postsIncluded: { id: string; title: string }[] | null;
  eventsIncluded: { id: string; title: string }[] | null;
  isManual: boolean;
}

export interface CreateNewsletterSendData {
  subject: string;
  contentHtml: string;
  contentText: string;
  recipientCount: number;
  postsIncluded?: { id: string; title: string }[];
  eventsIncluded?: { id: string; title: string }[];
  isManual?: boolean;
}

export const newsletterSendRepository = {
  /**
   * Create a record of a sent newsletter
   */
  async create(data: CreateNewsletterSendData): Promise<NewsletterSendRecord> {
    const record = await db.newsletterSend.create({
      data: {
        subject: data.subject,
        contentHtml: data.contentHtml,
        contentText: data.contentText,
        recipientCount: data.recipientCount,
        postsIncluded: data.postsIncluded
          ? (data.postsIncluded as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        eventsIncluded: data.eventsIncluded
          ? (data.eventsIncluded as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        isManual: data.isManual ?? true,
      },
    });

    return {
      ...record,
      postsIncluded: record.postsIncluded as { id: string; title: string }[] | null,
      eventsIncluded: record.eventsIncluded as { id: string; title: string }[] | null,
    };
  },

  /**
   * Get recent sends for history display
   */
  async findRecent(limit: number = 10): Promise<NewsletterSendRecord[]> {
    const records = await db.newsletterSend.findMany({
      orderBy: { sentAt: 'desc' },
      take: limit,
    });

    return records.map(record => ({
      ...record,
      postsIncluded: record.postsIncluded as { id: string; title: string }[] | null,
      eventsIncluded: record.eventsIncluded as { id: string; title: string }[] | null,
    }));
  },
};
