import { db } from '../client';

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

export const contactMessagesRepository = {
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
};
