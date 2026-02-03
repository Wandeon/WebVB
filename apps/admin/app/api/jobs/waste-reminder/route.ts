// Internal cron job endpoint for waste collection reminders
// Called daily at 18:00 Europe/Zagreb by system cron
// Protected by CRON_SECRET header

import { eventsRepository, pushSubscriptionsRepository, isInQuietHours } from '@repo/database';
import { isPushConfigured } from '@repo/shared';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { contactLogger } from '@/lib/logger';
import { isWebPushError, webpush } from '@/lib/web-push';

import type { PushTopic, PushSubscriptionWithPreferences } from '@repo/database';
import type { NextRequest } from 'next/server';

// Waste type display names for notifications
const WASTE_DISPLAY_NAMES: Record<string, string> = {
  'miješani komunalni otpad': 'miješani komunalni otpad (MKO)',
  'biootpad': 'biootpad',
  'plastika': 'plastika i ambalaža',
  'papir i karton': 'papir i karton',
  'metal': 'metal',
  'pelene': 'pelene',
  'staklo': 'staklo',
};

// Configure web-push
const VAPID_PUBLIC_KEY = process.env.PUSH_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.PUSH_VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.PUSH_VAPID_SUBJECT || 'mailto:admin@velikibukovec.hr';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/**
 * Get tomorrow's date in Europe/Zagreb timezone
 */
function getTomorrowInZagreb(): Date {
  // Get current time in Zagreb timezone
  const now = new Date();
  const zagrebTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Zagreb' }));

  // Add one day
  zagrebTime.setDate(zagrebTime.getDate() + 1);
  zagrebTime.setHours(0, 0, 0, 0);

  return zagrebTime;
}

/**
 * Extract waste type from event title
 * "Odvoz otpada: miješani komunalni otpad" -> "miješani komunalni otpad"
 */
function extractWasteType(title: string): string | null {
  const match = title.match(/^Odvoz otpada:\s*(.+)$/i);
  return match ? match[1]!.toLowerCase().trim() : null;
}

/**
 * Format date for display (Croatian format)
 */
function formatDateCroatian(date: Date): string {
  return date.toLocaleDateString('hr-HR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export async function POST(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get('x-cron-secret');

  if (!cronSecret || providedSecret !== cronSecret) {
    contactLogger.warn({ providedSecret: !!providedSecret }, 'Waste reminder job: invalid cron secret');
    return apiError(ErrorCodes.UNAUTHORIZED, 'Invalid cron secret', 401);
  }

  // Check if push is configured
  if (!isPushConfigured() || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    contactLogger.warn('Waste reminder job: push not configured');
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Push notifications not configured', 503);
  }

  try {
    const tomorrow = getTomorrowInZagreb();
    const dateKey = tomorrow.toISOString().slice(0, 10); // YYYY-MM-DD

    contactLogger.info({ date: dateKey }, 'Waste reminder job: checking for events');

    // Get waste events for tomorrow
    const wasteEvents = await eventsRepository.getWasteEventsForDate(tomorrow);

    if (wasteEvents.length === 0) {
      contactLogger.info({ date: dateKey }, 'Waste reminder job: no waste events tomorrow');
      return apiSuccess({ sent: false, reason: 'no_events', date: dateKey });
    }

    // Extract waste types
    const wasteTypes = wasteEvents
      .map((event) => extractWasteType(event.title))
      .filter((type): type is string => type !== null);

    if (wasteTypes.length === 0) {
      contactLogger.warn({ date: dateKey, events: wasteEvents.map(e => e.title) }, 'Waste reminder job: could not parse waste types');
      return apiSuccess({ sent: false, reason: 'parse_error', date: dateKey });
    }

    // Check for duplicate send (idempotency)
    const alreadySent = await pushSubscriptionsRepository.hasRecentSend(
      'waste',
      'date',
      dateKey,
      24 // within 24 hours
    );

    if (alreadySent) {
      contactLogger.info({ date: dateKey }, 'Waste reminder job: already sent today');
      return apiSuccess({ sent: false, reason: 'already_sent', date: dateKey });
    }

    // Build notification message
    const displayTypes = wasteTypes.map((type) => WASTE_DISPLAY_NAMES[type] || type);
    const formattedDate = formatDateCroatian(tomorrow);

    const title = 'Odvoz otpada sutra';
    const body = displayTypes.length === 1
      ? `Sutra (${formattedDate}) je odvoz: ${displayTypes[0]}`
      : `Sutra (${formattedDate}) je odvoz:\n• ${displayTypes.join('\n• ')}`;

    // Get subscriptions for waste topic with preferences (for quiet hours check)
    const allSubscriptions = await pushSubscriptionsRepository.getActiveByTopicWithPreferences('waste' as PushTopic);

    if (allSubscriptions.length === 0) {
      contactLogger.info({ date: dateKey }, 'Waste reminder job: no subscribers');
      return apiSuccess({ sent: false, reason: 'no_subscribers', date: dateKey });
    }

    // Filter out subscriptions currently in quiet hours
    const subscriptions: PushSubscriptionWithPreferences[] = [];
    let quietHoursSkipped = 0;

    for (const sub of allSubscriptions) {
      if (isInQuietHours(sub.preferences, 'Europe/Zagreb')) {
        quietHoursSkipped++;
      } else {
        subscriptions.push(sub);
      }
    }

    if (quietHoursSkipped > 0) {
      contactLogger.info(
        { date: dateKey, skipped: quietHoursSkipped, sending: subscriptions.length },
        'Waste reminder job: skipping subscribers in quiet hours'
      );
    }

    if (subscriptions.length === 0) {
      contactLogger.info({ date: dateKey, quietHoursSkipped }, 'Waste reminder job: all subscribers in quiet hours');
      return apiSuccess({ sent: false, reason: 'all_in_quiet_hours', date: dateKey, quietHoursSkipped });
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      tag: `waste-${dateKey}`, // Collapse duplicates
      renotify: false, // Don't vibrate if updating existing
      url: '/dogadanja',
      topic: 'waste',
      data: { url: '/dogadanja', topic: 'waste', date: dateKey },
    });

    // Send notifications
    let successCount = 0;
    let failureCount = 0;

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
          { TTL: 86400 }
        );
        successCount++;
      } catch (error) {
        failureCount++;
        if (isWebPushError(error)) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            await pushSubscriptionsRepository.markGone(sub.endpoint);
          } else {
            await pushSubscriptionsRepository.markFailed(sub.endpoint, error.message);
          }
        }
      }
    });

    await Promise.all(sendPromises);

    // Log the send for idempotency
    await pushSubscriptionsRepository.createNotificationSend({
      topic: 'waste',
      title,
      body,
      url: '/dogadanja',
      recipientCount: subscriptions.length,
      successCount,
      failureCount,
      metadata: {
        date: dateKey,
        wasteTypes,
        jobRun: true,
        quietHoursSkipped,
      },
    });

    contactLogger.info(
      { date: dateKey, wasteTypes, sent: successCount, failed: failureCount, quietHoursSkipped },
      'Waste reminder job: completed'
    );

    return apiSuccess({
      sent: true,
      date: dateKey,
      wasteTypes,
      recipients: subscriptions.length,
      success: successCount,
      failed: failureCount,
      quietHoursSkipped,
    });
  } catch (error) {
    contactLogger.error({ error }, 'Waste reminder job: error');
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Job failed', 500);
  }
}

// GET endpoint for status check (requires cron auth header)
export function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get('x-cron-secret');

  if (!cronSecret || providedSecret !== cronSecret) {
    return apiError(ErrorCodes.UNAUTHORIZED, 'Invalid cron secret', 401);
  }

  const configured = isPushConfigured();

  return apiSuccess({
    configured,
    status: configured ? 'ready' : 'not_configured',
  });
}
