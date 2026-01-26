import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { contactMessagesRepository } from './contact-messages';
import { db } from '../client';

vi.mock('../client', () => ({
  db: {
    contactMessage: {
      create: vi.fn(),
    },
  },
}));

const mockedDb = db as unknown as {
  contactMessage: {
    create: Mock;
  };
};

describe('contactMessagesRepository.create', () => {
  beforeEach(() => {
    mockedDb.contactMessage.create.mockReset();
  });

  it('defaults optional fields to null and status to new', async () => {
    mockedDb.contactMessage.create.mockResolvedValue({ id: 'contact-1' });

    await contactMessagesRepository.create({
      name: 'Ana Example',
      email: 'ana@example.com',
      message: 'Pozdrav, trebam informacije.',
    });

    expect(mockedDb.contactMessage.create).toHaveBeenCalledWith({
      data: {
        name: 'Ana Example',
        email: 'ana@example.com',
        subject: null,
        message: 'Pozdrav, trebam informacije.',
        status: 'new',
        ipAddress: null,
      },
    });
  });

  it('uses provided optional values', async () => {
    mockedDb.contactMessage.create.mockResolvedValue({ id: 'contact-2' });

    await contactMessagesRepository.create({
      name: 'Marko Example',
      email: 'marko@example.com',
      subject: 'Upit',
      message: 'Imam pitanje.',
      status: 'read',
      ipAddress: '127.0.0.1',
    });

    expect(mockedDb.contactMessage.create).toHaveBeenCalledWith({
      data: {
        name: 'Marko Example',
        email: 'marko@example.com',
        subject: 'Upit',
        message: 'Imam pitanje.',
        status: 'read',
        ipAddress: '127.0.0.1',
      },
    });
  });
});
