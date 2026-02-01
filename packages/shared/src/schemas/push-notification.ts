import { z } from 'zod';

// Push subscription from browser's PushManager.subscribe()
export const PushSubscriptionKeysSchema = z
  .object({
  p256dh: z.string().min(1, 'p256dh key is required'),
  auth: z.string().min(1, 'auth key is required'),
})
  .strict();

export const PushSubscriptionSchema = z
  .object({
    endpoint: z.string().url('Invalid endpoint URL'),
    keys: PushSubscriptionKeysSchema,
  })
  .strict();

// Full subscription with metadata
export const CreatePushSubscriptionSchema = z
  .object({
    endpoint: z.string().url('Invalid endpoint URL'),
    p256dh: z.string().min(1, 'p256dh key is required'),
    auth: z.string().min(1, 'auth key is required'),
    userAgent: z.string().optional(),
    locale: z.string().min(2).max(5).default('hr'),
    topics: z.array(z.enum(['all', 'waste', 'news', 'events', 'announcements'])).default(['all']),
  })
  .strict();

export const UpdatePushSubscriptionTopicsSchema = z
  .object({
    endpoint: z.string().url('Invalid endpoint URL'),
    topics: z.array(z.enum(['all', 'waste', 'news', 'events', 'announcements'])).min(1),
  })
  .strict();

export const UnsubscribePushSchema = z
  .object({
    endpoint: z.string().url('Invalid endpoint URL'),
  })
  .strict();

// Notification payload for sending
export const SendNotificationSchema = z
  .object({
    title: z.string().min(1, 'Naslov je obavezan').max(100, 'Naslov je predugačak'),
    body: z.string().min(1, 'Poruka je obavezna').max(500, 'Poruka je predugačka'),
    url: z.string().url('Nevažeći URL').optional(),
    topic: z.enum(['all', 'waste', 'news', 'events', 'announcements']).default('all'),
    icon: z.string().optional(),
    badge: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

// Lower-case aliases for API compatibility
export const pushSubscriptionSchema = CreatePushSubscriptionSchema;
export const sendNotificationSchema = SendNotificationSchema;

// Internal notification payload (what gets sent to browser)
export const NotificationPayloadSchema = z
  .object({
    title: z.string(),
    body: z.string(),
    icon: z.string().optional(),
    badge: z.string().optional(),
    data: z
      .object({
        url: z.string().optional(),
        topic: z.string().optional(),
      })
      .optional(),
  })
  .strict();

export type PushSubscriptionKeys = z.infer<typeof PushSubscriptionKeysSchema>;
export type PushSubscription = z.infer<typeof PushSubscriptionSchema>;
export type CreatePushSubscription = z.infer<typeof CreatePushSubscriptionSchema>;
export type UpdatePushSubscriptionTopics = z.infer<typeof UpdatePushSubscriptionTopicsSchema>;
export type UnsubscribePush = z.infer<typeof UnsubscribePushSchema>;
export type SendNotification = z.infer<typeof SendNotificationSchema>;
export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;
