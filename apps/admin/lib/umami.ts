import { getOptionalUmamiEnv } from '@repo/shared';

import { analyticsLogger } from '@/lib/logger';

import type {
  UmamiActiveResponse,
  UmamiMetric,
  UmamiPageviewsResponse,
  UmamiSession,
  UmamiSessionsResponse,
  UmamiStatsResponse,
} from '@/lib/umami-types';

type UmamiEnv = NonNullable<ReturnType<typeof getOptionalUmamiEnv>>;

// Generic Umami API fetcher
async function umamiGet<T>(
  env: UmamiEnv,
  path: string,
  params?: Record<string, string | number>
): Promise<T | null> {
  try {
    const url = new URL(`/api/websites/${env.UMAMI_WEBSITE_ID}${path}`, env.UMAMI_API_URL);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${env.UMAMI_API_TOKEN}` },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      analyticsLogger.warn({ status: response.status, path }, 'Umami API request failed');
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    analyticsLogger.warn({ error, path }, 'Umami API request error');
    return null;
  }
}

// Fetch active visitors (different endpoint shape)
async function umamiGetActive(env: UmamiEnv): Promise<UmamiActiveResponse | null> {
  try {
    const url = `${env.UMAMI_API_URL}/api/websites/${env.UMAMI_WEBSITE_ID}/active`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${env.UMAMI_API_TOKEN}` },
      cache: 'no-store',
    });

    if (!response.ok) return null;
    return (await response.json()) as UmamiActiveResponse;
  } catch {
    return null;
  }
}

export function fetchStats(
  env: UmamiEnv,
  startAt: number,
  endAt: number
): Promise<UmamiStatsResponse | null> {
  return umamiGet<UmamiStatsResponse>(env, '/stats', { startAt, endAt });
}

export function fetchPageviews(
  env: UmamiEnv,
  startAt: number,
  endAt: number,
  unit: string
): Promise<UmamiPageviewsResponse | null> {
  return umamiGet<UmamiPageviewsResponse>(env, '/pageviews', { startAt, endAt, unit });
}

export function fetchMetrics(
  env: UmamiEnv,
  startAt: number,
  endAt: number,
  type: string,
  limit = 10
): Promise<UmamiMetric[]> {
  return umamiGet<UmamiMetric[]>(env, '/metrics', { startAt, endAt, type, limit }).then(
    (data) => data ?? []
  );
}

export async function fetchSessions(
  env: UmamiEnv,
  startAt: number,
  endAt: number,
  page = 1,
  pageSize = 20
): Promise<{ data: UmamiSession[]; count: number }> {
  const result = await umamiGet<UmamiSessionsResponse>(env, '/sessions', {
    startAt,
    endAt,
    page,
    pageSize,
  });
  return result ? { data: result.data, count: result.count } : { data: [], count: 0 };
}

export async function fetchActive(env: UmamiEnv): Promise<number> {
  const result = await umamiGetActive(env);
  return result?.x ?? 0;
}

type Period = '7d' | '30d' | '90d';

interface PeriodRange {
  startAt: number;
  endAt: number;
  prevStartAt: number;
  prevEndAt: number;
  unit: string;
}

export function periodToRange(period: Period): PeriodRange {
  const now = Date.now();
  const day = 86400000;
  let days: number;
  let unit: string;

  switch (period) {
    case '30d':
      days = 30;
      unit = 'day';
      break;
    case '90d':
      days = 90;
      unit = 'week';
      break;
    default:
      days = 7;
      unit = 'day';
  }

  const startAt = now - days * day;
  const prevStartAt = startAt - days * day;
  const prevEndAt = startAt;

  return { startAt, endAt: now, prevStartAt, prevEndAt, unit };
}
