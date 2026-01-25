'use client';

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function DataTablePagination({
  page,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: DataTablePaginationProps) {
  const hasItems = total > 0;
  const startItem = hasItems ? (page - 1) * limit + 1 : 0;
  const endItem = hasItems ? Math.min(page * limit, total) : 0;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-neutral-600">
        Prikazuje {startItem}-{endItem} od {total} stranica
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Po stranici:</span>
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Prethodna stranica"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <span className="px-2 text-sm text-neutral-600">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Sljedeća stranica"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
