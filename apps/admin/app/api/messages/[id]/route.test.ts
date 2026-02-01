import { describe, expect, it, vi } from 'vitest';

import { requireAuth } from '@/lib/api-auth';

import { DELETE } from './route';

import type { ContactMessageRecord } from '@repo/database';

vi.mock('@repo/database', () => ({
  contactMessagesRepository: {
    findById: vi.fn(),
    deleteById: vi.fn(),
  },
}));

vi.mock('@/lib/api-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  contactLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { contactMessagesRepository } from '@repo/database';

const mockedRequireAuth = vi.mocked(requireAuth);
const mockedContactMessagesRepository = vi.mocked(contactMessagesRepository);

const mockMessage: ContactMessageRecord = {
  id: '7e6651a4-4c47-46c5-8d36-4b1d40f709e7',
  name: 'Ivan Horvat',
  email: 'ivan@example.com',
  subject: 'Upit',
  message: 'Test poruka',
  status: 'new',
  repliedAt: null,
  repliedBy: null,
  ipAddress: '192.168.0.0',
  createdAt: new Date(),
};

describe('DELETE /api/messages/[id]', () => {
  it('deletes a message when authorized', async () => {
    mockedRequireAuth.mockResolvedValue({
      context: {
        session: { user: { id: 'admin-1', role: 'admin' } },
        role: 'admin',
        userId: 'admin-1',
      },
    });
    mockedContactMessagesRepository.findById.mockResolvedValue(mockMessage);
    mockedContactMessagesRepository.deleteById.mockResolvedValue();

    const request = new Request('http://localhost/api/messages/7e6651a4-4c47-46c5-8d36-4b1d40f709e7', {
      method: 'DELETE',
    });
    const response = await DELETE(request as never, {
      params: Promise.resolve({ id: mockMessage.id }),
    });
    const payload = (await response.json()) as { success: boolean; data?: { message?: string } };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data?.message).toBe('Poruka je trajno obrisana.');
  });

  it('returns not found when message does not exist', async () => {
    mockedRequireAuth.mockResolvedValue({
      context: {
        session: { user: { id: 'admin-1', role: 'admin' } },
        role: 'admin',
        userId: 'admin-1',
      },
    });
    mockedContactMessagesRepository.findById.mockResolvedValue(null);

    const request = new Request('http://localhost/api/messages/7e6651a4-4c47-46c5-8d36-4b1d40f709e7', {
      method: 'DELETE',
    });
    const response = await DELETE(request as never, {
      params: Promise.resolve({ id: mockMessage.id }),
    });

    expect(response.status).toBe(404);
  });
});
