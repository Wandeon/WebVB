// Admin endpoint for push notification stats and health
import { pushSubscriptionsRepository } from '@repo/database';
import { isCronConfigured, isPushConfigured } from '@repo/shared';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/api-auth';
import { contactLogger } from '@/lib/logger';

import type { PushTopic } from '@repo/database';
import type { NextRequest } from 'next/server';

const TOPICS: PushTopic[] = ['all', 'waste', 'news', 'events', 'announcements'];

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);

  if ('response' in authResult) {
    return authResult.response;
  }

  try {
    // Get active subscription count
    const totalActive = await pushSubscriptionsRepository.countActive();

    // Get counts by topic
    const topicCounts: Record<string, number> = {};
    for (const topic of TOPICS) {
      if (topic === 'all') continue;
      topicCounts[topic] = await pushSubscriptionsRepository.countByTopic(topic);
    }

    // Get recent sends
    const recentSends = await pushSubscriptionsRepository.getRecentSends(5);
    const lastSuccessfulSend = recentSends.find((s) => s.successCount > 0);

    // Check system health
    const pushConfigured = isPushConfigured();
    const hasCronSecret = isCronConfigured();
    const hasVapidKeys = isPushConfigured();

    return NextResponse.json({
      success: true,
      data: {
        subscriptions: {
          total: totalActive,
          byTopic: topicCounts,
        },
        sends: {
          recent: recentSends.map((s) => ({
            id: s.id,
            topic: s.topic,
            title: s.title,
            sentAt: s.sentAt.toISOString(),
            successCount: s.successCount,
            failureCount: s.failureCount,
            recipientCount: s.recipientCount,
          })),
          lastSuccessful: lastSuccessfulSend
            ? {
                sentAt: lastSuccessfulSend.sentAt.toISOString(),
                title: lastSuccessfulSend.title,
                successCount: lastSuccessfulSend.successCount,
              }
            : null,
        },
        health: {
          pushConfigured,
          hasCronSecret,
          hasVapidKeys,
          status: pushConfigured && hasCronSecret && hasVapidKeys ? 'healthy' : 'degraded',
        },
      },
    });
  } catch (error) {
    contactLogger.error({ error }, 'Push stats error');
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Greška servera.' } },
      { status: 500 }
    );
  }
}
