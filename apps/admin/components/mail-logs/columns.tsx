'use client';

import { Badge } from '@repo/ui';
import { formatDistanceToNow } from 'date-fns';
import { hr } from 'date-fns/locale';

import type { BadgeProps } from '@repo/ui';
import type { ColumnDef } from '@tanstack/react-table';

export interface MailLogEvent {
  timestamp: string;
  level: string;
  event: string;
  eventId: string;
  category: 'auth' | 'security' | 'smtp' | 'delivery';
  details: Record<string, string>;
}

const CATEGORY_LABELS: Record<MailLogEvent['category'], string> = {
  auth: 'Prijava',
  security: 'Sigurnost',
  smtp: 'SMTP',
  delivery: 'Dostava',
};

const CATEGORY_VARIANTS: Record<MailLogEvent['category'], BadgeProps['variant']> = {
  auth: 'default',
  security: 'danger',
  smtp: 'secondary',
  delivery: 'outline',
};

export function getColumns(): ColumnDef<MailLogEvent, unknown>[] {
  return [
    {
      accessorKey: 'timestamp',
      header: 'Vrijeme',
      cell: ({ row }) => {
        const date = new Date(row.original.timestamp);
        const relative = formatDistanceToNow(date, {
          addSuffix: true,
          locale: hr,
        });
        return (
          <span title={date.toLocaleString('hr-HR')}>
            {relative}
          </span>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Kategorija',
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <Badge variant={CATEGORY_VARIANTS[category]}>
            {CATEGORY_LABELS[category]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'event',
      header: 'Događaj',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.event}</span>
      ),
    },
    {
      id: 'account',
      header: 'Račun',
      cell: ({ row }) => {
        const account = row.original.details.accountName;
        return account ? (
          <span className="text-sm">{account}</span>
        ) : (
          <span className="text-sm text-neutral-400">-</span>
        );
      },
    },
    {
      id: 'info',
      header: 'Detalji',
      cell: ({ row }) => {
        const { remoteIp, from, to, protocol } = row.original.details;
        const parts: string[] = [];
        if (remoteIp) parts.push(`IP: ${remoteIp}`);
        if (from) parts.push(`Od: ${from}`);
        if (to) parts.push(`Za: ${to}`);
        if (protocol) parts.push(protocol.toUpperCase());
        return parts.length > 0 ? (
          <span className="text-sm text-neutral-600">{parts.join(' | ')}</span>
        ) : (
          <span className="text-sm text-neutral-400">-</span>
        );
      },
    },
  ];
}
