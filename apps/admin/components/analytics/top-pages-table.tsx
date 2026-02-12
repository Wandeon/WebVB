'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

import type { UmamiMetric } from '@/lib/umami-types';

interface TopPagesTableProps {
  pages: UmamiMetric[];
}

export function TopPagesTable({ pages }: TopPagesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Najpopularnije stranice</CardTitle>
      </CardHeader>
      <CardContent>
        {pages.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">Nema podataka.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="pb-2 text-left font-medium text-neutral-500">Stranica</th>
                  <th className="pb-2 text-right font-medium text-neutral-500">Posjeti</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.x} className="border-b border-neutral-100 last:border-0">
                    <td className="py-2 text-neutral-900">
                      <span className="block max-w-[250px] truncate" title={page.x}>
                        {page.x}
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums text-neutral-700">{page.y}</td>
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
