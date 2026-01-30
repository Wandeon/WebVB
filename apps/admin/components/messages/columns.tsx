'use client';

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui';
import { Archive, Eye, Mail, MailOpen, MoreHorizontal } from 'lucide-react';

import type { ColumnDef } from '@tanstack/react-table';

// Contact message type matching the API response
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  repliedAt: string | null;
  repliedBy: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Nova',
  read: 'Pročitana',
  replied: 'Odgovoreno',
  archived: 'Arhivirana',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  new: 'warning',
  read: 'secondary',
  replied: 'success',
  archived: 'default',
};

interface GetColumnsOptions {
  onView: (message: ContactMessage) => void;
  onStatusChange: (message: ContactMessage, status: string) => void;
}

export function getColumns({ onView, onStatusChange }: GetColumnsOptions): ColumnDef<ContactMessage>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Pošiljatelj',
      cell: ({ row }) => {
        const message = row.original;
        return (
          <div>
            <button
              onClick={() => onView(message)}
              className="font-medium text-primary-600 hover:underline"
            >
              {message.name}
            </button>
            <div className="text-sm text-neutral-500">{message.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'subject',
      header: 'Predmet',
      cell: ({ row }) => {
        const subject = row.original.subject;
        return subject || <span className="text-neutral-400">—</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const label = STATUS_LABELS[status] ?? status;
        const variant = STATUS_VARIANTS[status] ?? 'default';
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Primljeno',
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        return new Date(createdAt).toLocaleDateString('hr-HR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const message = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Otvori izbornik">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(message)}>
                <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                Pregledaj
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {message.status === 'new' && (
                <DropdownMenuItem onClick={() => onStatusChange(message, 'read')}>
                  <MailOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                  Označi pročitano
                </DropdownMenuItem>
              )}
              {message.status !== 'replied' && (
                <DropdownMenuItem onClick={() => onStatusChange(message, 'replied')}>
                  <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                  Označi odgovoreno
                </DropdownMenuItem>
              )}
              {message.status !== 'archived' && (
                <DropdownMenuItem onClick={() => onStatusChange(message, 'archived')}>
                  <Archive className="mr-2 h-4 w-4" aria-hidden="true" />
                  Arhiviraj
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
