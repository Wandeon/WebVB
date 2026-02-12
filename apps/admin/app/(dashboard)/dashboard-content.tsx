'use client';

import { Eye, FileText, FolderOpen, Inbox } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

import { CategoryChart, QuickActions, RecentActivity, StatsCard } from '@/components/dashboard';

import type { SparklineData } from '@/lib/umami-types';

// Types matching the API response
interface DashboardStats {
  postsThisMonth: number;
  postsTrend: number;
  totalDocuments: number;
  documentsTrend: number;
  unreadMessages: number;
  visitorsToday: number | null;
  pageviewsToday: number | null;
}

interface CategoryDataPoint {
  category: string;
  count: number;
  fill: string;
}

interface ActivityItem {
  id: string;
  action: string;
  target: string;
  user: string;
  timestamp: string;
}

interface DashboardData {
  stats: DashboardStats;
  categoryData: CategoryDataPoint[];
  recentActivity: ActivityItem[];
}

export function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [sparkline, setSparkline] = useState<SparklineData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, sparklineRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/analytics/sparkline'),
      ]);

      if (statsRes.ok) {
        const json = (await statsRes.json()) as { success: boolean; data: DashboardData };
        if (json.success) {
          setData(json.data);
        }
      }

      if (sparklineRes.ok) {
        const json = (await sparklineRes.json()) as { success: boolean; data: SparklineData };
        if (json.success) {
          setSparkline(json.data);
        }
      }
    } catch {
      // Silently fail - dashboard will show empty state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Objave ovog mjeseca"
          value={data.stats.postsThisMonth}
          icon={FileText}
          trend={{ value: data.stats.postsTrend, isPositive: data.stats.postsTrend > 0 }}
          description="U odnosu na prošli mjesec"
        />
        <StatsCard
          title="Ukupno dokumenata"
          value={data.stats.totalDocuments}
          icon={FolderOpen}
          trend={{ value: data.stats.documentsTrend, isPositive: data.stats.documentsTrend > 0 }}
          description="Novih ovaj mjesec"
        />
        <StatsCard
          title="Nepročitane poruke"
          value={data.stats.unreadMessages}
          icon={Inbox}
          description="Čeka odgovor"
        />
        {sparkline ? (
          <SparklineCard sparkline={sparkline} />
        ) : data.stats.visitorsToday !== null ? (
          <StatsCard
            title="Posjetitelji danas"
            value={data.stats.visitorsToday}
            icon={Eye}
            description={`${data.stats.pageviewsToday ?? 0} pregleda stranica`}
          />
        ) : null}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryChart data={data.categoryData} />
        <RecentActivity items={data.recentActivity} />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </>
  );
}

function SparklineCard({ sparkline }: { sparkline: SparklineData }) {
  return (
    <StatsCard
      title="Posjetitelji (7 dana)"
      value={sparkline.totalVisitors}
      icon={Eye}
      description={`Danas: ${sparkline.visitorsToday} posjetitelja`}
    >
      {sparkline.daily.length > 0 && (
        <div className="mt-2 h-[40px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline.daily}>
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </StatsCard>
  );
}
