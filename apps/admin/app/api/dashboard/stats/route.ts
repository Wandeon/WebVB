import { db } from '@repo/database';
import { POST_CATEGORIES, getOptionalUmamiEnv } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { dashboardLogger } from '@/lib/logger';
import { fetchStats } from '@/lib/umami';

import type { NextRequest } from 'next/server';

const CATEGORY_COLORS: Record<string, string> = {
  aktualnosti: '#22c55e',
  gospodarstvo: '#3b82f6',
  sport: '#f59e0b',
  komunalno: '#ef4444',
  kultura: '#8b5cf6',
  obrazovanje: '#06b6d4',
  ostalo: '#64748b',
};

interface UmamiStats {
  visitors: number;
  pageviews: number;
}

async function fetchUmamiStats(): Promise<UmamiStats | null> {
  const env = getOptionalUmamiEnv();
  if (!env) return null;

  try {
    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const stats = await fetchStats(env, startOfDay.getTime(), now);
    if (!stats) return null;

    return { visitors: stats.visitors, pageviews: stats.pageviews };
  } catch {
    dashboardLogger.warn('Failed to fetch Umami stats');
    return null;
  }
}

function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

// GET /api/dashboard/stats - Dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    const now = new Date();
    const thisMonth = getMonthRange(now);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = getMonthRange(lastMonthDate);

    // Run all independent DB queries + Umami stats in parallel
    const [
      postsThisMonth,
      postsLastMonth,
      totalDocuments,
      documentsThisMonth,
      unreadMessages,
      categoryGroups,
      auditLogs,
      umamiStats,
    ] = await Promise.all([
      db.post.count({
        where: {
          publishedAt: { gte: thisMonth.start, lte: thisMonth.end },
        },
      }),
      db.post.count({
        where: {
          publishedAt: { gte: lastMonth.start, lte: lastMonth.end },
        },
      }),
      db.document.count(),
      db.document.count({
        where: {
          createdAt: { gte: thisMonth.start, lte: thisMonth.end },
        },
      }),
      db.contactMessage.count({
        where: { status: 'new' },
      }),
      db.post.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
      db.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
      fetchUmamiStats(),
    ]);

    const postsTrend = Math.round(
      ((postsThisMonth - postsLastMonth) / Math.max(postsLastMonth, 1)) * 100
    );

    const categoryData = categoryGroups
      .filter((group) => group._count.id > 0)
      .map((group) => ({
        category:
          POST_CATEGORIES[group.category as keyof typeof POST_CATEGORIES] ??
          group.category,
        count: group._count.id,
        fill: CATEGORY_COLORS[group.category] ?? '#64748b',
      }));

    let recentActivity: Array<{
      id: string;
      action: string;
      target: string;
      user: string;
      timestamp: string;
    }>;

    if (auditLogs.length > 0) {
      recentActivity = auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        target: [log.entityType, log.entityId].filter(Boolean).join('/'),
        user: log.user?.name ?? 'Sustav',
        timestamp: log.createdAt.toISOString(),
      }));
    } else {
      // Fallback: combine recent items from multiple tables
      const [recentPosts, recentDocuments, recentMessages] = await Promise.all([
        db.post.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            createdAt: true,
            author: { select: { name: true } },
          },
        }),
        db.document.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            createdAt: true,
            uploader: { select: { name: true } },
          },
        }),
        db.contactMessage.findMany({
          take: 2,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            subject: true,
            name: true,
            createdAt: true,
          },
        }),
      ]);

      const combined = [
        ...recentPosts.map((p) => ({
          id: p.id,
          action: 'objavio',
          target: p.title,
          user: p.author?.name ?? 'Nepoznato',
          timestamp: p.createdAt.toISOString(),
          sortDate: p.createdAt,
        })),
        ...recentDocuments.map((d) => ({
          id: d.id,
          action: 'dodao dokument',
          target: d.title,
          user: d.uploader?.name ?? 'Nepoznato',
          timestamp: d.createdAt.toISOString(),
          sortDate: d.createdAt,
        })),
        ...recentMessages.map((m) => ({
          id: m.id,
          action: 'primljena poruka',
          target: m.subject ?? 'Bez predmeta',
          user: m.name,
          timestamp: m.createdAt.toISOString(),
          sortDate: m.createdAt,
        })),
      ];

      combined.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

      recentActivity = combined.slice(0, 8).map(({ sortDate: _, ...rest }) => rest);
    }

    return apiSuccess({
      stats: {
        postsThisMonth,
        postsTrend,
        totalDocuments,
        documentsTrend: documentsThisMonth,
        unreadMessages,
        visitorsToday: umamiStats?.visitors ?? null,
        pageviewsToday: umamiStats?.pageviews ?? null,
      },
      categoryData,
      recentActivity,
    });
  } catch (error) {
    dashboardLogger.error({ error }, 'Greska prilikom dohvacanja statistike nadzorne ploce');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greska prilikom dohvacanja statistike',
      500
    );
  }
}
