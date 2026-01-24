'use client';

import { Button } from '@repo/ui';
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import type { Table } from '@tanstack/react-table';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-neutral-500">
        Stranica {pageIndex + 1} od {pageCount}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          aria-label="Prva stranica"
        >
          <ChevronFirst className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Prethodna stranica"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Sljedeca stranica"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          aria-label="Zadnja stranica"
        >
          <ChevronLast className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
