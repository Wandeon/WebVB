import { describe, expect, it } from 'vitest';

import {
  CreatePushSubscriptionSchema,
  SendNotificationSchema,
  UnsubscribePushSchema,
} from './push-notification';

describe('push notification schemas', () => {
  describe('CreatePushSubscriptionSchema', () => {
    it('validates a complete subscription', () => {
      const data = {
        endpoint: 'https://push.example.com/endpoint/123',
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlU',
        auth: 'auth_secret_here',
        userAgent: 'Mozilla/5.0',
        locale: 'hr',
        topics: ['waste', 'news'],
      };

      const result = CreatePushSubscriptionSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.endpoint).toBe(data.endpoint);
        expect(result.data.p256dh).toBe(data.p256dh);
        expect(result.data.auth).toBe(data.auth);
        expect(result.data.userAgent).toBe(data.userAgent);
        expect(result.data.locale).toBe('hr');
        expect(result.data.topics).toEqual(['waste', 'news']);
      }
    });

    it('uses defaults for optional fields', () => {
      const data = {
        endpoint: 'https://push.example.com/endpoint/123',
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlU',
        auth: 'auth_secret_here',
      };

      const result = CreatePushSubscriptionSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.locale).toBe('hr');
        expect(result.data.topics).toEqual(['all']);
        expect(result.data.userAgent).toBeUndefined();
      }
    });

    it('rejects invalid endpoint URL', () => {
      const data = {
        endpoint: 'not-a-url',
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlU',
        auth: 'auth_secret_here',
      };

      const result = CreatePushSubscriptionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejects empty p256dh', () => {
      const data = {
        endpoint: 'https://push.example.com/endpoint/123',
        p256dh: '',
        auth: 'auth_secret_here',
      };

      const result = CreatePushSubscriptionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejects empty auth', () => {
      const data = {
        endpoint: 'https://push.example.com/endpoint/123',
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlU',
        auth: '',
      };

      const result = CreatePushSubscriptionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejects invalid topic', () => {
      const data = {
        endpoint: 'https://push.example.com/endpoint/123',
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlU',
        auth: 'auth_secret_here',
        topics: ['invalid-topic'],
      };

      const result = CreatePushSubscriptionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('accepts all valid topics', () => {
      const data = {
        endpoint: 'https://push.example.com/endpoint/123',
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlU',
        auth: 'auth_secret_here',
        topics: ['all', 'waste', 'news', 'events', 'announcements'],
      };

      const result = CreatePushSubscriptionSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('rejects unknown fields', () => {
      const data = {
        endpoint: 'https://push.example.com/endpoint/123',
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlU',
        auth: 'auth_secret_here',
        extra: 'unexpected',
      };

      const result = CreatePushSubscriptionSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('SendNotificationSchema', () => {
    it('validates a complete notification', () => {
      const data = {
        title: 'Test Notification',
        body: 'This is the notification body',
        url: 'https://example.com/page',
        topic: 'news',
      };

      const result = SendNotificationSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe(data.title);
        expect(result.data.body).toBe(data.body);
        expect(result.data.url).toBe(data.url);
        expect(result.data.topic).toBe('news');
      }
    });

    it('uses default topic when not provided', () => {
      const data = {
        title: 'Test Notification',
        body: 'This is the notification body',
      };

      const result = SendNotificationSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.topic).toBe('all');
      }
    });

    it('rejects empty title', () => {
      const data = {
        title: '',
        body: 'This is the notification body',
      };

      const result = SendNotificationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejects empty body', () => {
      const data = {
        title: 'Test Notification',
        body: '',
      };

      const result = SendNotificationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejects title exceeding max length', () => {
      const data = {
        title: 'A'.repeat(101),
        body: 'This is the notification body',
      };

      const result = SendNotificationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejects body exceeding max length', () => {
      const data = {
        title: 'Test Notification',
        body: 'A'.repeat(501),
      };

      const result = SendNotificationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejects invalid URL', () => {
      const data = {
        title: 'Test Notification',
        body: 'This is the notification body',
        url: 'not-a-url',
      };

      const result = SendNotificationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejects invalid topic', () => {
      const data = {
        title: 'Test Notification',
        body: 'This is the notification body',
        topic: 'invalid',
      };

      const result = SendNotificationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('accepts optional metadata', () => {
      const data = {
        title: 'Test Notification',
        body: 'This is the notification body',
        metadata: { postId: '123', category: 'sport' },
      };

      const result = SendNotificationSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata).toEqual({ postId: '123', category: 'sport' });
      }
    });
  });

  describe('UnsubscribePushSchema', () => {
    it('validates valid endpoint', () => {
      const data = {
        endpoint: 'https://push.example.com/endpoint/123',
      };

      const result = UnsubscribePushSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('rejects invalid endpoint URL', () => {
      const data = {
        endpoint: 'not-a-url',
      };

      const result = UnsubscribePushSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejects missing endpoint', () => {
      const data = {};

      const result = UnsubscribePushSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });
});
