'use client';

import { PROBLEM_TYPE_LABELS } from '@repo/shared';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui';
import { CheckCircle, Clock, Eye, MoreHorizontal, XCircle } from 'lucide-react';

import type { ColumnDef } from '@tanstack/react-table';

// Problem report type matching the API response
export interface ProblemReport {
  id: string;
  reporterName: string | null;
  reporterEmail: string | null;
  reporterPhone: string | null;
  problemType: string;
  location: string;
  description: string;
  images: { url: string; caption?: string | null }[] | null;
  status: string;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Nova',
  in_progress: 'U obradi',
  resolved: 'Riješeno',
  rejected: 'Odbijeno',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  new: 'warning',
  in_progress: 'secondary',
  resolved: 'success',
  rejected: 'danger',
};

interface GetColumnsOptions {
  onView: (report: ProblemReport) => void;
  onStatusChange: (report: ProblemReport, status: string) => void;
}

export function getColumns({ onView, onStatusChange }: GetColumnsOptions): ColumnDef<ProblemReport>[] {
  return [
    {
      accessorKey: 'location',
      header: 'Lokacija',
      cell: ({ row }) => {
        const report = row.original;
        return (
          <button
            onClick={() => onView(report)}
            className="font-medium text-primary-600 hover:underline"
          >
            {report.location}
          </button>
        );
      },
    },
    {
      accessorKey: 'problemType',
      header: 'Vrsta',
      cell: ({ row }) => {
        const problemType = row.original.problemType;
        const label = PROBLEM_TYPE_LABELS[problemType] ?? problemType;
        return <Badge variant="secondary">{label}</Badge>;
      },
    },
    {
      accessorKey: 'reporterName',
      header: 'Prijavitelj',
      cell: ({ row }) => {
        const name = row.original.reporterName;
        return name || <span className="text-neutral-400">Anonimno</span>;
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
      header: 'Prijavljeno',
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
        const report = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Otvori izbornik">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(report)}>
                <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                Pregledaj
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {report.status === 'new' && (
                <DropdownMenuItem onClick={() => onStatusChange(report, 'in_progress')}>
                  <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                  Označi u obradi
                </DropdownMenuItem>
              )}
              {report.status !== 'resolved' && (
                <DropdownMenuItem onClick={() => onStatusChange(report, 'resolved')}>
                  <CheckCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                  Označi riješeno
                </DropdownMenuItem>
              )}
              {report.status !== 'rejected' && (
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onStatusChange(report, 'rejected')}
                >
                  <XCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                  Odbij prijavu
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
