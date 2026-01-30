'use client';

import { ANNOUNCEMENT_CATEGORIES } from '@repo/shared';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui';
import { Mail, MoreHorizontal, Paperclip, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

import type { AnnouncementCategory } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: AnnouncementCategory;
  validFrom: string | null;
  validUntil: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  _count: {
    attachments: number;
  };
}

interface GetColumnsOptions {
  onDelete: (announcement: Announcement) => void;
  onAddToNewsletter: (announcement: Announcement) => void | Promise<void>;
}

function getValidityStatus(validFrom: string | null, validUntil: string | null): {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'secondary';
} {
  const now = new Date();

  if (validUntil) {
    const until = new Date(validUntil);
    if (until < now) {
      return { label: 'Isteklo', variant: 'danger' };
    }
  }

  if (validFrom) {
    const from = new Date(validFrom);
    if (from > now) {
      return { label: 'Planirano', variant: 'secondary' };
    }
  }

  return { label: 'Aktivno', variant: 'success' };
}

export function getColumns({ onDelete, onAddToNewsletter }: GetColumnsOptions): ColumnDef<Announcement>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Naslov',
      cell: ({ row }) => {
        const announcement = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/announcements/${announcement.id}`}
              className="font-medium text-primary-600 hover:underline"
            >
              {announcement.title}
            </Link>
            {announcement._count.attachments > 0 && (
              <span className="flex items-center text-neutral-500">
                <Paperclip className="mr-1 h-3 w-3" aria-hidden="true" />
                {announcement._count.attachments}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Kategorija',
      cell: ({ row }) => {
        const category = row.original.category;
        const label = ANNOUNCEMENT_CATEGORIES[category];
        return <Badge variant="secondary">{label}</Badge>;
      },
    },
    {
      accessorKey: 'publishedAt',
      header: 'Status',
      cell: ({ row }) => {
        const publishedAt = row.original.publishedAt;
        const isPublished = publishedAt !== null;
        return (
          <Badge variant={isPublished ? 'success' : 'warning'}>
            {isPublished ? 'Objavljeno' : 'Skica'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'validUntil',
      header: 'Valjanost',
      cell: ({ row }) => {
        const { validFrom, validUntil, publishedAt } = row.original;
        if (!publishedAt) return '-';

        const { label, variant } = getValidityStatus(validFrom, validUntil);
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Stvoreno',
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        return new Date(createdAt).toLocaleDateString('hr-HR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const announcement = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Otvori izbornik">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/announcements/${announcement.id}`}>
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Uredi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void onAddToNewsletter(announcement)}>
                <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                Dodaj u newsletter
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(announcement)}
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Obrisi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
