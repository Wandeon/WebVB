'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

import type { UmamiSession } from '@/lib/umami-types';

interface RecentSessionsTableProps {
  sessions: UmamiSession[];
}

const COUNTRY_NAMES: Record<string, string> = {
  HR: 'Hrvatska',
  DE: 'Njemačka',
  AT: 'Austrija',
  SI: 'Slovenija',
  BA: 'BiH',
  RS: 'Srbija',
  HU: 'Mađarska',
  IT: 'Italija',
  US: 'SAD',
  GB: 'UK',
};

function DeviceIcon({ device }: { device: string }) {
  const d = device.toLowerCase();
  if (d === 'mobile') return <Smartphone className="h-4 w-4 text-neutral-400" />;
  if (d === 'tablet') return <Tablet className="h-4 w-4 text-neutral-400" />;
  return <Monitor className="h-4 w-4 text-neutral-400" />;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'upravo';
  if (minutes < 60) return `prije ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `prije ${hours}h`;
  const days = Math.floor(hours / 24);
  return `prije ${days}d`;
}

export function RecentSessionsTable({ sessions }: RecentSessionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nedavne sesije</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">Nema sesija.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="pb-2 text-left font-medium text-neutral-500">Preglednik</th>
                  <th className="pb-2 text-left font-medium text-neutral-500">OS</th>
                  <th className="pb-2 text-left font-medium text-neutral-500">Uređaj</th>
                  <th className="pb-2 text-left font-medium text-neutral-500">Zemlja</th>
                  <th className="pb-2 text-left font-medium text-neutral-500">Grad</th>
                  <th className="pb-2 text-right font-medium text-neutral-500">Stranice</th>
                  <th className="pb-2 text-right font-medium text-neutral-500">Vrijeme</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-neutral-100 last:border-0">
                    <td className="py-2 text-neutral-900">{session.browser || '—'}</td>
                    <td className="py-2 text-neutral-700">{session.os || '—'}</td>
                    <td className="py-2">
                      <DeviceIcon device={session.device} />
                    </td>
                    <td className="py-2 text-neutral-700">
                      {COUNTRY_NAMES[session.country] ?? session.country ?? '—'}
                    </td>
                    <td className="py-2 text-neutral-700">{session.city || '—'}</td>
                    <td className="py-2 text-right tabular-nums text-neutral-700">
                      {session.views}
                    </td>
                    <td className="py-2 text-right text-neutral-500">
                      {formatRelativeTime(session.lastAt)}
                    </td>
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
