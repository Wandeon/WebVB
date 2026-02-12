// Orchestrator component — coordinates all analytics sections and manages data fetching.
// Exceeds 300-line guideline due to coordination of 5 visual rows + state management.
'use client';

import { Activity, Clock, Eye, FileText, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ShieldCheck } from 'lucide-react';

import { StatsCard } from '@/components/dashboard';
import {
  BrowserOsCharts,
  DevicesCountries,
  RecentSessionsTable,
  ReferrersTable,
  TopPagesTable,
  TrafficChart,
} from '@/components/analytics';

import type { AnalyticsData } from '@/lib/umami-types';

type Period = '7d' | '30d' | '90d';

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

export function AnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const periodParam = searchParams.get('period') ?? '7d';
  const period: Period = (['7d', '30d', '90d'] as const).includes(periodParam as Period)
    ? (periodParam as Period)
    : '7d';

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (p: Period) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/analytics?period=${p}`);
      if (!response.ok) {
        if (response.status === 503) {
          setError('Analitika nije konfigurirana');
          return;
        }
        setError('Greska prilikom dohvacanja podataka');
        return;
      }
      const json = (await response.json()) as { success: boolean; data: AnalyticsData };
      if (json.success) {
        setData(json.data);
      }
    } catch {
      setError('Greska prilikom dohvacanja podataka');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(period);
  }, [fetchData, period]);

  const handlePeriodChange = (newPeriod: Period) => {
    router.push(`/analytics?period=${newPeriod}`, { scroll: false });
  };

  if (error) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
        <p className="text-neutral-600">{error}</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-neutral-100" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-neutral-100" />
      </div>
    );
  }

  return (
    <>
      {/* Row 1: Stats Cards */}
      <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Posjetitelji"
          value={data.stats.visitors}
          icon={Users}
          trend={{
            value: data.comparison.visitors,
            isPositive: data.comparison.visitors >= 0,
          }}
          description={`U odnosu na prethodno razdoblje`}
        />
        <StatsCard
          title="Pregledi stranica"
          value={data.stats.pageviews}
          icon={FileText}
          trend={{
            value: data.comparison.pageviews,
            isPositive: data.comparison.pageviews >= 0,
          }}
          description={`U odnosu na prethodno razdoblje`}
        />
        <StatsCard
          title="Stopa napuštanja"
          value={`${data.stats.bounceRate}%`}
          icon={Eye}
          trend={{
            value: Math.abs(data.comparison.bounceRate),
            isPositive: data.comparison.bounceRate <= 0,
          }}
          description="Niža je bolja"
        />
        <StatsCard
          title="Prosj. trajanje"
          value={formatDuration(data.stats.avgSessionTime)}
          icon={Clock}
        />

        {/* Active visitors badge */}
        {data.stats.activeVisitors > 0 && (
          <div className="absolute -top-2 right-0 flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            <Activity className="h-3 w-3 animate-pulse" />
            {data.stats.activeVisitors} {data.stats.activeVisitors === 1 ? 'online' : 'online'}
          </div>
        )}
      </div>

      {/* Row 2: Traffic Chart */}
      <TrafficChart
        timeSeries={data.timeSeries}
        period={period}
        onPeriodChange={handlePeriodChange}
      />

      {/* Row 3: Top Pages + Referrers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopPagesTable pages={data.topPages} />
        <ReferrersTable referrers={data.referrers} />
      </div>

      {/* Row 4: Browsers/OS + Devices/Countries */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BrowserOsCharts browsers={data.browsers} operatingSystems={data.operatingSystems} />
        <DevicesCountries devices={data.devices} countries={data.countries} />
      </div>

      {/* Row 5: Recent Sessions */}
      <RecentSessionsTable sessions={data.recentSessions} />

      {/* Footer: Bot filtering note */}
      <div className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
        <p className="text-xs text-neutral-500">
          Umami automatski filtrira botove i crawlere pomoću isbot biblioteke. Svi prikazani podaci
          odnose se isključivo na stvarne posjetitelje.
        </p>
      </div>
    </>
  );
}
