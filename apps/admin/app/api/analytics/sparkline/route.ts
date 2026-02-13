import { getOptionalUmamiEnv } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess } from '@/lib/api-response';
import { analyticsLogger } from '@/lib/logger';
import { fetchPageviews, fetchStats } from '@/lib/umami';

import type { SparklineData } from '@/lib/umami-types';
import type { NextRequest } from 'next/server';

// GET /api/analytics/sparkline — lightweight data for dashboard card
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, { requireAdmin: true });
    if ('response' in authResult) {
      return authResult.response;
    }

    const env = getOptionalUmamiEnv();
    if (!env) {
      return apiError('ANALYTICS_UNAVAILABLE', 'Analitika nije konfigurirana', 503);
    }

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86400000;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [pageviews, todayStats] = await Promise.all([
      fetchPageviews(env, sevenDaysAgo, now, 'day'),
      fetchStats(env, startOfToday.getTime(), now),
    ]);

    const daily = (pageviews?.sessions ?? []).map((point) => ({
      date: point.x,
      visitors: point.y,
    }));

    const totalVisitors = daily.reduce((sum, d) => sum + d.visitors, 0);

    const data: SparklineData = {
      daily,
      totalVisitors,
      visitorsToday: todayStats?.visitors ?? 0,
      pageviewsToday: todayStats?.pageviews ?? 0,
    };

    return apiSuccess(data);
  } catch (error) {
    analyticsLogger.error({ error }, 'Failed to fetch sparkline data');
    return apiError('INTERNAL_ERROR', 'Greska prilikom dohvacanja sparkline podataka', 500);
  }
}
