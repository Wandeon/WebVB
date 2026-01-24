'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { mockContentByCategory } from '@/lib/mock-data';

export function CategoryChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sadrzaj po kategoriji</CardTitle>
        <CardDescription>Broj objava po kategoriji</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockContentByCategory} layout="vertical">
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
                formatter={(value: number) => [`${value} objava`, 'Broj']}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {mockContentByCategory.map((entry, index) => (
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
