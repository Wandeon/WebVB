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
import { ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

import type { ColumnDef } from '@tanstack/react-table';

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  parentId: string | null;
  menuOrder: number;
  createdAt: string;
  updatedAt: string;
  parent: {
    id: string;
    title: string;
    slug: string;
  } | null;
  children: {
    id: string;
    title: string;
    slug: string;
    menuOrder: number;
  }[];
}

interface GetColumnsOptions {
  onDelete: (page: Page) => void;
}

export function getColumns({ onDelete }: GetColumnsOptions): ColumnDef<Page>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Naslov',
      cell: ({ row }) => {
        const page = row.original;
        const hasParent = page.parentId !== null;

        return (
          <div className="flex items-center gap-2">
            {hasParent && (
              <ChevronRight className="h-4 w-4 text-neutral-400 ml-4" aria-hidden="true" />
            )}
            <Link
              href={`/pages/${page.id}/edit`}
              className="font-medium text-primary-600 hover:underline"
            >
              {page.title}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => {
        const slug = row.original.slug;
        return <code className="text-sm text-neutral-600">/{slug}</code>;
      },
    },
    {
      accessorKey: 'parent',
      header: 'Nadredena',
      cell: ({ row }) => {
        const parent = row.original.parent;
        return parent ? (
          <Badge variant="secondary">{parent.title}</Badge>
        ) : (
          <span className="text-neutral-400">—</span>
        );
      },
    },
    {
      accessorKey: 'menuOrder',
      header: 'Redoslijed',
      cell: ({ row }) => {
        return <span className="text-neutral-600">{row.original.menuOrder}</span>;
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Azurirano',
      cell: ({ row }) => {
        const updatedAt = row.original.updatedAt;
        return new Date(updatedAt).toLocaleDateString('hr-HR', {
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
        const page = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Otvori izbornik">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/pages/${page.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Uredi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(page)}
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
