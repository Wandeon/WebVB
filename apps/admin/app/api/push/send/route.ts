// Admin-only endpoint for sending push notifications
import { pushSubscriptionsRepository } from '@repo/database';
import { sendNotificationSchema } from '@repo/shared';
import webpush from 'web-push';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { contactLogger } from '@/lib/logger';

import type { PushTopic } from '@repo/database';
import type { NextRequest } from 'next/server';

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.PUSH_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.PUSH_VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.PUSH_VAPID_SUBJECT || 'mailto:admin@velikibukovec.hr';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    // Check VAPID configuration
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return apiError(
        ErrorCodes.INTERNAL_ERROR,
        'Push obavijesti nisu konfigurirane. Nedostaju VAPID ključevi.',
        503
      );
    }

    const body: unknown = await request.json();
    const result = sendNotificationSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        result.error.issues[0]?.message ?? 'Neispravni podaci.',
        400
      );
    }

    const { topic, title, body: notificationBody, url, metadata } = result.data;

    // Get all active subscriptions for this topic
    const subscriptions = await pushSubscriptionsRepository.getActiveByTopic(topic as PushTopic);

    if (subscriptions.length === 0) {
      return apiSuccess({
        sent: 0,
        failed: 0,
        message: 'Nema aktivnih pretplata za ovu temu.',
      });
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body: notificationBody,
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      url: url ?? '/',
      topic,
      data: { url: url ?? '/', topic },
    });

    // Track send statistics
    let successCount = 0;
    let failureCount = 0;

    // Send to all subscriptions
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
          { TTL: 86400 } // 24 hours
        );
        successCount++;
      } catch (error) {
        failureCount++;

        // Handle specific errors
        if (error instanceof webpush.WebPushError) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            // Subscription expired or not found - mark as gone
            await pushSubscriptionsRepository.markGone(sub.endpoint);
            contactLogger.info({ endpoint: sub.endpoint.slice(0, 50) }, 'Push subscription expired (410)');
          } else {
            // Other error - mark as failed
            await pushSubscriptionsRepository.markFailed(sub.endpoint, error.message);
            contactLogger.warn(
              { endpoint: sub.endpoint.slice(0, 50), statusCode: error.statusCode },
              'Push send failed'
            );
          }
        } else {
          contactLogger.error({ error, endpoint: sub.endpoint.slice(0, 50) }, 'Push send error');
        }
      }
    });

    await Promise.all(sendPromises);

    // Log the send
    await pushSubscriptionsRepository.createNotificationSend({
      topic,
      title,
      body: notificationBody,
      ...(url && { url }),
      recipientCount: subscriptions.length,
      successCount,
      failureCount,
      ...(metadata && { metadata }),
    });

    contactLogger.info(
      { topic, title, sent: successCount, failed: failureCount },
      'Push notification sent'
    );

    return apiSuccess({
      sent: successCount,
      failed: failureCount,
      total: subscriptions.length,
      message: `Obavijest poslana ${successCount}/${subscriptions.length} pretplatnika.`,
    });
  } catch (error) {
    contactLogger.error({ error }, 'Push send endpoint error');
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Greška prilikom slanja obavijesti.', 500);
  }
}

// GET /api/push/send - Get notification send history
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    const sends = await pushSubscriptionsRepository.getRecentSends(50);

    return apiSuccess(sends);
  } catch (error) {
    contactLogger.error({ error }, 'Push send history error');
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Greška prilikom dohvaćanja povijesti.', 500);
  }
}
