import { describe, expect, it } from 'vitest';

import { PAGINATION } from '@repo/shared';

import { clampLimit, normalizePagination } from './pagination';

describe('normalizePagination', () => {
  it('falls back to defaults for invalid values', () => {
    const result = normalizePagination({
      page: Number.NaN,
      limit: -5,
      defaultLimit: 20,
    });

    expect(result.page).toBe(PAGINATION.DEFAULT_PAGE);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
  });

  it('clamps limits to the maximum', () => {
    const result = normalizePagination({
      page: 2,
      limit: PAGINATION.MAX_LIMIT + 50,
      defaultLimit: 10,
    });

    expect(result.limit).toBe(PAGINATION.MAX_LIMIT);
    expect(result.skip).toBe(PAGINATION.MAX_LIMIT);
  });
});

describe('clampLimit', () => {
  it('uses default when limit is invalid', () => {
    expect(clampLimit(-1, 5)).toBe(5);
  });

  it('enforces max limit', () => {
    expect(clampLimit(PAGINATION.MAX_LIMIT + 10, 5)).toBe(PAGINATION.MAX_LIMIT);
  });
});
