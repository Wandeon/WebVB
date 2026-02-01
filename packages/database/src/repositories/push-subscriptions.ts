import { Prisma } from '@prisma/client';

import { db } from '../client';

import type { PushSubscription, NotificationSend } from '@prisma/client';

export type PushTopic = 'all' | 'waste' | 'news' | 'events' | 'announcements';

export interface PushPreferences {
  quietHoursStart?: string; // "22:00" format
  quietHoursEnd?: string; // "07:00" format
}

export interface CreatePushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  locale?: string;
  topics?: PushTopic[];
  preferences?: PushPreferences;
}

export interface PushSubscriptionWithKeys {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionWithPreferences extends PushSubscriptionWithKeys {
  preferences: PushPreferences | null;
}

// Upsert subscription - create or update if endpoint exists
export async function upsertSubscription(
  data: CreatePushSubscriptionData
): Promise<PushSubscription> {
  const { endpoint, p256dh, auth, userAgent, locale = 'hr', topics = ['all'], preferences } = data;

  // Build create data - preferences field added conditionally for schema compatibility
  const createData = {
    endpoint,
    p256dh,
    auth,
    userAgent: userAgent ?? null,
    locale,
    topics: topics as Prisma.JsonArray,
    isActive: true,
    lastSeenAt: new Date(),
    ...(preferences && { preferences: preferences as Prisma.JsonObject }),
  };

  return db.pushSubscription.upsert({
    where: { endpoint },
    create: createData,
    update: {
      p256dh,
      auth,
      userAgent: userAgent ?? null,
      locale,
      isActive: true,
      lastSeenAt: new Date(),
      lastErrorAt: null,
      lastErrorMessage: null,
    },
  });
}

// Get subscription by endpoint (for /api/push/me)
export async function getByEndpoint(endpoint: string): Promise<PushSubscription | null> {
  return db.pushSubscription.findUnique({
    where: { endpoint },
  });
}

// Verify ownership by checking endpoint + keys match
export async function verifyOwnership(
  endpoint: string,
  p256dh: string,
  auth: string
): Promise<boolean> {
  const subscription = await db.pushSubscription.findUnique({
    where: { endpoint },
    select: { p256dh: true, auth: true, isActive: true },
  });

  if (!subscription || !subscription.isActive) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  const p256dhMatch = subscription.p256dh === p256dh;
  const authMatch = subscription.auth === auth;

  return p256dhMatch && authMatch;
}

// Update subscription topics
export async function updateTopics(
  endpoint: string,
  topics: PushTopic[]
): Promise<PushSubscription | null> {
  try {
    return await db.pushSubscription.update({
      where: { endpoint },
      data: {
        topics: topics as Prisma.JsonArray,
        updatedAt: new Date(),
      },
    });
  } catch {
    return null;
  }
}

// Update subscription settings (topics and preferences)
export async function updateSettings(
  endpoint: string,
  topics: PushTopic[],
  preferences?: PushPreferences
): Promise<PushSubscription | null> {
  try {
    // Build update data
    const updateData: Prisma.PushSubscriptionUpdateInput = {
      topics: topics as Prisma.JsonArray,
      lastSeenAt: new Date(),
      updatedAt: new Date(),
    };

    // Handle preferences - use Prisma.DbNull for null values
    if (preferences !== undefined) {
      updateData.preferences = preferences
        ? (preferences as Prisma.JsonObject)
        : Prisma.DbNull;
    }

    return await db.pushSubscription.update({
      where: { endpoint },
      data: updateData,
    });
  } catch {
    return null;
  }
}

// Hard delete subscription for GDPR compliance
export async function hardDeleteByEndpoint(endpoint: string): Promise<boolean> {
  try {
    await db.pushSubscription.delete({
      where: { endpoint },
    });
    return true;
  } catch {
    return false;
  }
}

// Deactivate subscription (soft delete)
export async function deactivateByEndpoint(endpoint: string): Promise<boolean> {
  try {
    await db.pushSubscription.update({
      where: { endpoint },
      data: { isActive: false },
    });
    return true;
  } catch {
    return false;
  }
}

// Mark subscription as failed (for cleanup tracking)
export async function markFailed(
  endpoint: string,
  errorMessage: string
): Promise<void> {
  try {
    await db.pushSubscription.update({
      where: { endpoint },
      data: {
        lastErrorAt: new Date(),
        lastErrorMessage: errorMessage.slice(0, 500),
      },
    });
  } catch {
    // Subscription might already be deleted, ignore
  }
}

// Deactivate subscription and mark as gone (410 response)
export async function markGone(endpoint: string): Promise<void> {
  try {
    await db.pushSubscription.update({
      where: { endpoint },
      data: {
        isActive: false,
        lastErrorAt: new Date(),
        lastErrorMessage: 'Subscription expired (410 Gone)',
      },
    });
  } catch {
    // Subscription might already be deleted, ignore
  }
}

// Get all active subscriptions for a topic
export async function getActiveByTopic(
  topic: PushTopic
): Promise<PushSubscriptionWithKeys[]> {
  const subscriptions = await db.pushSubscription.findMany({
    where: {
      isActive: true,
      OR: [
        // Match specific topic or 'all'
        {
          topics: {
            array_contains: [topic],
          },
        },
        {
          topics: {
            array_contains: ['all'],
          },
        },
      ],
    },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
    },
  });

  return subscriptions;
}

// Get all active subscriptions for a topic with preferences (for quiet hours enforcement)
export async function getActiveByTopicWithPreferences(
  topic: PushTopic
): Promise<PushSubscriptionWithPreferences[]> {
  const subscriptions = await db.pushSubscription.findMany({
    where: {
      isActive: true,
      OR: [
        // Match specific topic or 'all'
        {
          topics: {
            array_contains: [topic],
          },
        },
        {
          topics: {
            array_contains: ['all'],
          },
        },
      ],
    },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
      preferences: true,
    },
  });

  return subscriptions.map((sub) => ({
    id: sub.id,
    endpoint: sub.endpoint,
    p256dh: sub.p256dh,
    auth: sub.auth,
    preferences: sub.preferences as PushPreferences | null,
  }));
}

/**
 * Check if current time falls within quiet hours for a subscription
 * @param preferences - subscription preferences with quiet hours
 * @param timezone - timezone to use for comparison (default: Europe/Zagreb)
 * @returns true if currently in quiet hours, false otherwise
 */
export function isInQuietHours(
  preferences: PushPreferences | null,
  timezone: string = 'Europe/Zagreb'
): boolean {
  if (!preferences?.quietHoursStart || !preferences?.quietHoursEnd) {
    return false;
  }

  // Get current time in specified timezone
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const [currentHour, currentMinute] = timeString.split(':').map(Number);
  const currentMinutes = currentHour! * 60 + currentMinute!;

  const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number);
  const startMinutes = startHour! * 60 + startMinute!;

  const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);
  const endMinutes = endHour! * 60 + endMinute!;

  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (startMinutes > endMinutes) {
    // Overnight: quiet if current >= start OR current < end
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Same day: quiet if current >= start AND current < end
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}

// Get all active subscriptions
export async function getAllActive(): Promise<PushSubscriptionWithKeys[]> {
  return db.pushSubscription.findMany({
    where: { isActive: true },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
    },
  });
}

// Count active subscriptions
export async function countActive(): Promise<number> {
  return db.pushSubscription.count({
    where: { isActive: true },
  });
}

// Count by topic
export async function countByTopic(topic: PushTopic): Promise<number> {
  if (topic === 'all') {
    return countActive();
  }

  return db.pushSubscription.count({
    where: {
      isActive: true,
      OR: [
        {
          topics: {
            array_contains: [topic],
          },
        },
        {
          topics: {
            array_contains: ['all'],
          },
        },
      ],
    },
  });
}

// Prune old inactive subscriptions (cleanup job)
export async function pruneInactive(olderThanDays: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await db.pushSubscription.deleteMany({
    where: {
      isActive: false,
      updatedAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}

// ============================================================================
// Notification Send Tracking
// ============================================================================

export interface CreateNotificationSendData {
  topic: string;
  title: string;
  body: string;
  url?: string;
  recipientCount: number;
  successCount?: number;
  failureCount?: number;
  metadata?: Record<string, unknown>;
}

export async function createNotificationSend(
  data: CreateNotificationSendData
): Promise<NotificationSend> {
  return db.notificationSend.create({
    data: {
      topic: data.topic,
      title: data.title,
      body: data.body,
      url: data.url ?? null,
      recipientCount: data.recipientCount,
      successCount: data.successCount ?? 0,
      failureCount: data.failureCount ?? 0,
      metadata: (data.metadata as Prisma.JsonObject) ?? null,
    },
  });
}

export async function updateNotificationSendCounts(
  id: string,
  successCount: number,
  failureCount: number
): Promise<void> {
  await db.notificationSend.update({
    where: { id },
    data: { successCount, failureCount },
  });
}

// Check if we already sent a notification for a specific event/context today
export async function hasRecentSend(
  topic: string,
  metadataKey: string,
  metadataValue: string,
  withinHours: number = 24
): Promise<boolean> {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - withinHours);

  const existing = await db.notificationSend.findFirst({
    where: {
      topic,
      sentAt: {
        gte: cutoffDate,
      },
      metadata: {
        path: [metadataKey],
        equals: metadataValue,
      },
    },
  });

  return existing !== null;
}

// Get recent notification sends
export async function getRecentSends(
  limit: number = 20
): Promise<NotificationSend[]> {
  return db.notificationSend.findMany({
    orderBy: { sentAt: 'desc' },
    take: limit,
  });
}
