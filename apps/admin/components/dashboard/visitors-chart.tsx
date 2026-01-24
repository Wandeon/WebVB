'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { mockVisitorData } from '@/lib/mock-data';

export function VisitorsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Posjetitelji</CardTitle>
        <CardDescription>Zadnjih 7 dana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]" role="img" aria-label="Posjetitelji u zadnjih 7 dana">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockVisitorData}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-neutral-500"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-neutral-500"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVisitors)"
                name="Posjetitelji"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
