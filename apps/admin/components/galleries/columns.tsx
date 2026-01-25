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
import { ImageIcon, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { ColumnDef } from '@tanstack/react-table';

export interface Gallery {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  imageCount: number;
  eventDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GetColumnsOptions {
  onDelete: (gallery: Gallery) => void;
}

function formatDate(dateString: string | null): string {
  if (!dateString) {
    return '—';
  }
  const date = new Date(dateString);
  return date.toLocaleDateString('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getColumns({ onDelete }: GetColumnsOptions): ColumnDef<Gallery>[] {
  return [
    {
      accessorKey: 'coverImage',
      header: '',
      cell: ({ row }) => {
        const coverImage = row.original.coverImage;
        return (
          <div className="flex items-center justify-center w-16 h-16">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={row.original.name}
                width={64}
                height={64}
                sizes="64px"
                className="rounded object-cover w-16 h-16"
              />
            ) : (
              <div className="w-16 h-16 rounded bg-neutral-100 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-neutral-400" aria-hidden="true" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Naziv',
      cell: ({ row }) => {
        const gallery = row.original;
        return (
          <Link
            href={`/galleries/${gallery.id}`}
            className="font-medium text-primary-600 hover:underline"
          >
            {gallery.name}
          </Link>
        );
      },
    },
    {
      accessorKey: 'imageCount',
      header: 'Slike',
      cell: ({ row }) => {
        const imageCount = row.original.imageCount;
        return (
          <Badge variant="secondary">
            {imageCount} {imageCount === 1 ? 'slika' : imageCount >= 2 && imageCount <= 4 ? 'slike' : 'slika'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'eventDate',
      header: 'Datum dogadaja',
      cell: ({ row }) => {
        return (
          <span className="text-sm text-neutral-600">
            {formatDate(row.original.eventDate)}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Kreirano',
      cell: ({ row }) => {
        return (
          <span className="text-sm text-neutral-600">
            {formatDate(row.original.createdAt)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const gallery = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Otvori izbornik">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/galleries/${gallery.id}`}>
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Uredi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(gallery)}
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
