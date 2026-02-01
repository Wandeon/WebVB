import { PAGINATION } from '@repo/shared';

export interface PaginationInput {
  page?: number | undefined;
  limit?: number | undefined;
  defaultLimit: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export function normalizePagination({
  page,
  limit,
  defaultLimit,
}: PaginationInput): PaginationResult {
  const safeLimit = Number.isFinite(limit) && Number(limit) > 0
    ? Math.min(Math.floor(Number(limit)), PAGINATION.MAX_LIMIT)
    : defaultLimit;
  const safePage = Number.isFinite(page) && Number(page) > 0
    ? Math.floor(Number(page))
    : PAGINATION.DEFAULT_PAGE;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export function clampLimit(limit: number, defaultLimit: number): number {
  if (!Number.isFinite(limit) || limit <= 0) {
    return defaultLimit;
  }

  return Math.min(Math.floor(limit), PAGINATION.MAX_LIMIT);
}
