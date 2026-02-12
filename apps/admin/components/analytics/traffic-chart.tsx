'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { cn } from '@/lib/utils';

import type { TimeSeriesPoint } from '@/lib/umami-types';

type Period = '7d' | '30d' | '90d';

interface TrafficChartProps {
  timeSeries: {
    pageviews: TimeSeriesPoint[];
    sessions: TimeSeriesPoint[];
  };
  period: Period;
  onPeriodChange: (period: Period) => void;
}

const PERIOD_LABELS: Record<Period, string> = {
  '7d': '7 dana',
  '30d': '30 dana',
  '90d': '90 dana',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md">
      <p className="mb-1 text-xs font-medium text-neutral-600">{formatDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          {entry.name === 'visitors' ? 'Posjetitelji' : 'Pregledi'}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function TrafficChart({ timeSeries, period, onPeriodChange }: TrafficChartProps) {
  // Merge pageviews and sessions into a single data array
  const chartData = timeSeries.pageviews.map((pv, i) => ({
    date: pv.x,
    pageviews: pv.y,
    visitors: timeSeries.sessions[i]?.y ?? 0,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Promet</CardTitle>
        <div className="flex gap-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                p === period
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">Nema podataka za odabrano razdoblje.</p>
        ) : (
          <div className="h-[300px]" role="img" aria-label="Grafikon prometa">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatDate}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  name="visitors"
                />
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.05}
                  strokeWidth={2}
                  name="pageviews"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
