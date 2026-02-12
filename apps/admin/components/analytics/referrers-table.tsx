'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

import type { UmamiMetric } from '@/lib/umami-types';

interface ReferrersTableProps {
  referrers: UmamiMetric[];
}

export function ReferrersTable({ referrers }: ReferrersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Izvori prometa</CardTitle>
      </CardHeader>
      <CardContent>
        {referrers.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">Nema podataka.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="pb-2 text-left font-medium text-neutral-500">Izvor</th>
                  <th className="pb-2 text-right font-medium text-neutral-500">Posjeti</th>
                </tr>
              </thead>
              <tbody>
                {referrers.map((ref) => (
                  <tr key={ref.x || 'direct'} className="border-b border-neutral-100 last:border-0">
                    <td className="py-2 text-neutral-900">
                      <span className="block max-w-[250px] truncate" title={ref.x || 'Izravni promet'}>
                        {ref.x || 'Izravni promet'}
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums text-neutral-700">{ref.y}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
