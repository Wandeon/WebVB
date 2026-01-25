'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { cn } from '../lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
  pageParam?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl = '',
  pageParam = 'stranica',
  className,
}: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete(pageParam);
    } else {
      params.set(pageParam, page.toString());
    }
    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label="Navigacija stranicama"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100"
          aria-label="Prethodna stranica"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center text-neutral-300">
          <ChevronLeft className="h-5 w-5" />
        </span>
      )}

      {pageNumbers.map((page, index) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-10 w-10 items-center justify-center text-neutral-400"
          >
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-primary-600 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            )}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100"
          aria-label="Sljedeca stranica"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center text-neutral-300">
          <ChevronRight className="h-5 w-5" />
        </span>
      )}
    </nav>
  );
}
