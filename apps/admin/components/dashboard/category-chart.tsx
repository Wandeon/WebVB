'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface CategoryDataPoint {
  category: string;
  count: number;
  fill: string;
}

interface CategoryChartProps {
  data: CategoryDataPoint[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sadržaj po kategoriji</CardTitle>
          <CardDescription>Broj objava po kategoriji</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-neutral-500">Nema objava.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sadržaj po kategoriji</CardTitle>
        <CardDescription>Broj objava po kategoriji</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]" role="img" aria-label="Sadržaj po kategoriji">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="category"
                type="category"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ fontWeight: 600 }}
                formatter={(value) => [`${String(value ?? 0)} objava`, 'Broj']}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
