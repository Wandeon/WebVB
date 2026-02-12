'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { UmamiMetric } from '@/lib/umami-types';

interface BrowserOsChartsProps {
  browsers: UmamiMetric[];
  operatingSystems: UmamiMetric[];
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

function HorizontalBarSection({
  title,
  data,
}: {
  title: string;
  data: UmamiMetric[];
}) {
  const top5 = data.slice(0, 5);

  if (top5.length === 0) {
    return (
      <div>
        <p className="mb-2 text-sm font-medium text-neutral-600">{title}</p>
        <p className="py-4 text-center text-xs text-neutral-400">Nema podataka.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-neutral-600">{title}</p>
      <div className="h-[160px]" role="img" aria-label={title}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top5} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="x"
              type="category"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value) => [`${String(value ?? 0)}`, 'Posjeti']}
            />
            <Bar dataKey="y" radius={[0, 4, 4, 0]}>
              {top5.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] ?? '#64748b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function BrowserOsCharts({ browsers, operatingSystems }: BrowserOsChartsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preglednici i sustavi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <HorizontalBarSection title="Preglednici" data={browsers} />
        <HorizontalBarSection title="Operativni sustavi" data={operatingSystems} />
      </CardContent>
    </Card>
  );
}
