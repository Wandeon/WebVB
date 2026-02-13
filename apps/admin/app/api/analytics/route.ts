import { getOptionalUmamiEnv } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess } from '@/lib/api-response';
import { analyticsLogger } from '@/lib/logger';
import {
  fetchActive,
  fetchMetrics,
  fetchPageviews,
  fetchSessions,
  fetchStats,
  periodToRange,
} from '@/lib/umami';

import type { AnalyticsData } from '@/lib/umami-types';
import type { NextRequest } from 'next/server';

function computeChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// GET /api/analytics?period=7d|30d|90d
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

    const periodParam = request.nextUrl.searchParams.get('period') ?? '7d';
    const period = (['7d', '30d', '90d'] as const).includes(periodParam as '7d' | '30d' | '90d')
      ? (periodParam as '7d' | '30d' | '90d')
      : ('7d' as const);

    const { startAt, endAt, prevStartAt, prevEndAt, unit } = periodToRange(period);

    const [
      currentStats,
      prevStats,
      pageviews,
      topPages,
      referrers,
      browsers,
      operatingSystems,
      devices,
      countries,
      sessions,
      activeVisitors,
    ] = await Promise.all([
      fetchStats(env, startAt, endAt),
      fetchStats(env, prevStartAt, prevEndAt),
      fetchPageviews(env, startAt, endAt, unit),
      fetchMetrics(env, startAt, endAt, 'path', 10),
      fetchMetrics(env, startAt, endAt, 'referrer', 10),
      fetchMetrics(env, startAt, endAt, 'browser', 10),
      fetchMetrics(env, startAt, endAt, 'os', 10),
      fetchMetrics(env, startAt, endAt, 'device', 5),
      fetchMetrics(env, startAt, endAt, 'country', 10),
      fetchSessions(env, startAt, endAt, 1, 20),
      fetchActive(env),
    ]);

    const visitors = currentStats?.visitors ?? 0;
    const pv = currentStats?.pageviews ?? 0;
    const visits = currentStats?.visits ?? 0;
    const bounces = currentStats?.bounces ?? 0;
    const totalTime = currentStats?.totaltime ?? 0;

    const bounceRate = visits > 0 ? Math.round((bounces / visits) * 100) : 0;
    const avgSessionTime = visits > 0 ? Math.round(totalTime / visits) : 0;

    const prevVisitors = prevStats?.visitors ?? 0;
    const prevPv = prevStats?.pageviews ?? 0;
    const prevVisits = prevStats?.visits ?? 0;
    const prevBounces = prevStats?.bounces ?? 0;
    const prevBounceRate = prevVisits > 0 ? Math.round((prevBounces / prevVisits) * 100) : 0;

    const data: AnalyticsData = {
      period,
      stats: {
        visitors,
        pageviews: pv,
        visits,
        bounceRate,
        avgSessionTime,
        activeVisitors,
      },
      comparison: {
        visitors: computeChange(visitors, prevVisitors),
        pageviews: computeChange(pv, prevPv),
        visits: computeChange(visits, prevVisits),
        bounceRate: computeChange(bounceRate, prevBounceRate),
      },
      timeSeries: {
        pageviews: pageviews?.pageviews ?? [],
        sessions: pageviews?.sessions ?? [],
      },
      topPages,
      referrers,
      browsers,
      operatingSystems,
      devices,
      countries,
      recentSessions: sessions.data,
    };

    return apiSuccess(data);
  } catch (error) {
    analyticsLogger.error({ error }, 'Failed to fetch analytics data');
    return apiError('INTERNAL_ERROR', 'Greska prilikom dohvacanja analitike', 500);
  }
}
