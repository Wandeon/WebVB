'use client';

import { DOCUMENT_CATEGORIES } from '@repo/shared';
import { Badge, Button } from '@repo/ui';
import { formatDistanceToNow } from 'date-fns';
import { hr } from 'date-fns/locale';

import type { DocumentWithUploader } from '@repo/database';
import type { ColumnDef } from '@tanstack/react-table';

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): { relative: string; exact: string } {
  const d = new Date(date);
  return {
    relative: formatDistanceToNow(d, { addSuffix: true, locale: hr }),
    exact: d.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

interface ColumnsProps {
  onEdit: (document: DocumentWithUploader) => void;
  onDelete: (document: DocumentWithUploader) => void;
}

export function getColumns({ onEdit, onDelete }: ColumnsProps): ColumnDef<DocumentWithUploader>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Naslov',
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <a
            href={row.original.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary-600 hover:text-primary-700 hover:underline line-clamp-2"
          >
            {row.original.title}
          </a>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Kategorija',
      cell: ({ row }) => {
        const categoryKey = row.original.category as keyof typeof DOCUMENT_CATEGORIES;
        const label = DOCUMENT_CATEGORIES[categoryKey] ?? row.original.category;
        return <Badge variant="secondary">{label}</Badge>;
      },
    },
    {
      accessorKey: 'subcategory',
      header: 'Podkategorija',
      cell: ({ row }) => row.original.subcategory ?? '-',
    },
    {
      accessorKey: 'year',
      header: 'Godina',
      cell: ({ row }) => row.original.year ?? '-',
    },
    {
      accessorKey: 'fileSize',
      header: 'Velicina',
      cell: ({ row }) => formatFileSize(row.original.fileSize),
    },
    {
      accessorKey: 'createdAt',
      header: 'Dodano',
      cell: ({ row }) => {
        const { relative, exact } = formatDate(row.original.createdAt);
        return (
          <span title={exact} className="cursor-help">
            {relative}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Akcije',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            Uredi
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-error hover:text-error"
            onClick={() => onDelete(row.original)}
          >
            Obrisi
          </Button>
        </div>
      ),
    },
  ];
}
