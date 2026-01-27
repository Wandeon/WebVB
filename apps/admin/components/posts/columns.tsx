'use client';

import { POST_CATEGORIES } from '@repo/shared';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

import type { PostCategory } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';

// Post type matching the API response
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: PostCategory;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}

interface GetColumnsOptions {
  onDelete: (post: Post) => void;
}

export function getColumns({ onDelete }: GetColumnsOptions): ColumnDef<Post>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Naslov',
      cell: ({ row }) => {
        const post = row.original;
        return (
          <Link
            href={`/posts/${post.id}`}
            className="font-medium text-primary-600 hover:underline"
          >
            {post.title}
          </Link>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Kategorija',
      cell: ({ row }) => {
        const category = row.original.category;
        const label = POST_CATEGORIES[category];
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
      accessorKey: 'author',
      header: 'Autor',
      cell: ({ row }) => {
        const author = row.original.author;
        return author?.name ?? 'Nepoznato';
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
        const post = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Otvori izbornik">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/posts/${post.id}`}>
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Uredi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(post)}
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
