import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import * as pushSubscriptionsRepository from './push-subscriptions';
import { db } from '../client';

vi.mock('../client', () => ({
  db: {
    pushSubscription: {
      upsert: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
    notificationSend: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const mockedDb = db as unknown as {
  pushSubscription: {
    upsert: Mock;
    update: Mock;
    findMany: Mock;
    count: Mock;
    deleteMany: Mock;
  };
  notificationSend: {
    create: Mock;
    findFirst: Mock;
    findMany: Mock;
  };
};

describe('pushSubscriptionsRepository', () => {
  beforeEach(() => {
    Object.values(mockedDb.pushSubscription).forEach((mock) => mock.mockReset());
    Object.values(mockedDb.notificationSend).forEach((mock) => mock.mockReset());
  });

  describe('upsertSubscription', () => {
    it('creates a new subscription with required fields', async () => {
      const mockSubscription = {
        id: 'uuid-123',
        endpoint: 'https://push.example.com/123',
        p256dh: 'public-key',
        auth: 'auth-key',
        userAgent: null,
        locale: 'hr',
        topics: ['all'],
        isActive: true,
        lastSeenAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockedDb.pushSubscription.upsert.mockResolvedValue(mockSubscription);

      const result = await pushSubscriptionsRepository.upsertSubscription({
        endpoint: 'https://push.example.com/123',
        p256dh: 'public-key',
        auth: 'auth-key',
      });

      expect(mockedDb.pushSubscription.upsert).toHaveBeenCalledWith({
        where: { endpoint: 'https://push.example.com/123' },
        create: expect.objectContaining({
          endpoint: 'https://push.example.com/123',
          p256dh: 'public-key',
          auth: 'auth-key',
          userAgent: null,
          locale: 'hr',
          topics: ['all'],
          isActive: true,
        }),
        update: expect.objectContaining({
          p256dh: 'public-key',
          auth: 'auth-key',
          isActive: true,
          lastErrorAt: null,
          lastErrorMessage: null,
        }),
      });
      expect(result).toEqual(mockSubscription);
    });

    it('includes userAgent and locale when provided', async () => {
      mockedDb.pushSubscription.upsert.mockResolvedValue({});

      await pushSubscriptionsRepository.upsertSubscription({
        endpoint: 'https://push.example.com/123',
        p256dh: 'public-key',
        auth: 'auth-key',
        userAgent: 'Mozilla/5.0',
        locale: 'en',
        topics: ['waste', 'news'],
      });

      expect(mockedDb.pushSubscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            userAgent: 'Mozilla/5.0',
            locale: 'en',
            topics: ['waste', 'news'],
          }),
          update: expect.objectContaining({
            userAgent: 'Mozilla/5.0',
            locale: 'en',
          }),
        })
      );
    });
  });

  describe('deactivateByEndpoint', () => {
    it('deactivates subscription and returns true', async () => {
      mockedDb.pushSubscription.update.mockResolvedValue({});

      const result = await pushSubscriptionsRepository.deactivateByEndpoint(
        'https://push.example.com/123'
      );

      expect(mockedDb.pushSubscription.update).toHaveBeenCalledWith({
        where: { endpoint: 'https://push.example.com/123' },
        data: { isActive: false },
      });
      expect(result).toBe(true);
    });

    it('returns false when subscription not found', async () => {
      mockedDb.pushSubscription.update.mockRejectedValue(new Error('Not found'));

      const result = await pushSubscriptionsRepository.deactivateByEndpoint(
        'https://push.example.com/nonexistent'
      );

      expect(result).toBe(false);
    });

    it('is idempotent - calling twice succeeds', async () => {
      mockedDb.pushSubscription.update.mockResolvedValue({});

      const result1 = await pushSubscriptionsRepository.deactivateByEndpoint(
        'https://push.example.com/123'
      );
      const result2 = await pushSubscriptionsRepository.deactivateByEndpoint(
        'https://push.example.com/123'
      );

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(mockedDb.pushSubscription.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('markGone', () => {
    it('deactivates and records error for expired subscription', async () => {
      mockedDb.pushSubscription.update.mockResolvedValue({});

      await pushSubscriptionsRepository.markGone('https://push.example.com/123');

      expect(mockedDb.pushSubscription.update).toHaveBeenCalledWith({
        where: { endpoint: 'https://push.example.com/123' },
        data: {
          isActive: false,
          lastErrorAt: expect.any(Date),
          lastErrorMessage: 'Subscription expired (410 Gone)',
        },
      });
    });

    it('silently ignores already deleted subscriptions', async () => {
      mockedDb.pushSubscription.update.mockRejectedValue(new Error('Not found'));

      await expect(
        pushSubscriptionsRepository.markGone('https://push.example.com/nonexistent')
      ).resolves.not.toThrow();
    });
  });

  describe('markFailed', () => {
    it('records error message for failed subscription', async () => {
      mockedDb.pushSubscription.update.mockResolvedValue({});

      await pushSubscriptionsRepository.markFailed(
        'https://push.example.com/123',
        'Push service error'
      );

      expect(mockedDb.pushSubscription.update).toHaveBeenCalledWith({
        where: { endpoint: 'https://push.example.com/123' },
        data: {
          lastErrorAt: expect.any(Date),
          lastErrorMessage: 'Push service error',
        },
      });
    });

    it('truncates long error messages', async () => {
      mockedDb.pushSubscription.update.mockResolvedValue({});
      const longMessage = 'A'.repeat(600);

      await pushSubscriptionsRepository.markFailed(
        'https://push.example.com/123',
        longMessage
      );

      expect(mockedDb.pushSubscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lastErrorMessage: 'A'.repeat(500),
          }),
        })
      );
    });
  });

  describe('getActiveByTopic', () => {
    it('returns subscriptions matching topic or all', async () => {
      const mockSubs = [
        { id: '1', endpoint: 'https://a.com', p256dh: 'key1', auth: 'auth1' },
        { id: '2', endpoint: 'https://b.com', p256dh: 'key2', auth: 'auth2' },
      ];
      mockedDb.pushSubscription.findMany.mockResolvedValue(mockSubs);

      const result = await pushSubscriptionsRepository.getActiveByTopic('waste');

      expect(mockedDb.pushSubscription.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { topics: { array_contains: ['waste'] } },
            { topics: { array_contains: ['all'] } },
          ],
        },
        select: { id: true, endpoint: true, p256dh: true, auth: true },
      });
      expect(result).toEqual(mockSubs);
    });
  });

  describe('countActive', () => {
    it('returns count of active subscriptions', async () => {
      mockedDb.pushSubscription.count.mockResolvedValue(42);

      const result = await pushSubscriptionsRepository.countActive();

      expect(mockedDb.pushSubscription.count).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(result).toBe(42);
    });
  });

  describe('createNotificationSend', () => {
    it('creates notification send record', async () => {
      const mockSend = {
        id: 'send-123',
        topic: 'news',
        title: 'Test',
        body: 'Test body',
        sentAt: new Date(),
        recipientCount: 10,
        successCount: 9,
        failureCount: 1,
      };
      mockedDb.notificationSend.create.mockResolvedValue(mockSend);

      const result = await pushSubscriptionsRepository.createNotificationSend({
        topic: 'news',
        title: 'Test',
        body: 'Test body',
        recipientCount: 10,
        successCount: 9,
        failureCount: 1,
      });

      expect(mockedDb.notificationSend.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          topic: 'news',
          title: 'Test',
          body: 'Test body',
          url: null,
          recipientCount: 10,
          successCount: 9,
          failureCount: 1,
          metadata: null,
        }),
      });
      expect(result).toEqual(mockSend);
    });
  });

  describe('getRecentSends', () => {
    it('returns recent notification sends', async () => {
      const mockSends = [{ id: '1' }, { id: '2' }];
      mockedDb.notificationSend.findMany.mockResolvedValue(mockSends);

      const result = await pushSubscriptionsRepository.getRecentSends(20);

      expect(mockedDb.notificationSend.findMany).toHaveBeenCalledWith({
        orderBy: { sentAt: 'desc' },
        take: 20,
      });
      expect(result).toEqual(mockSends);
    });
  });

  describe('pruneInactive', () => {
    it('deletes old inactive subscriptions', async () => {
      mockedDb.pushSubscription.deleteMany.mockResolvedValue({ count: 5 });

      const result = await pushSubscriptionsRepository.pruneInactive(30);

      expect(mockedDb.pushSubscription.deleteMany).toHaveBeenCalledWith({
        where: {
          isActive: false,
          updatedAt: { lt: expect.any(Date) },
        },
      });
      expect(result).toBe(5);
    });
  });
});
