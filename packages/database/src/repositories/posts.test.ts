import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { postsRepository } from './posts';
import { db } from '../client';

vi.mock('../client', () => ({
  db: {
    post: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const mockedDb = db as unknown as {
  post: {
    count: Mock;
    findMany: Mock;
  };
};

const baseFindManyArgs = {
  where: { publishedAt: { not: null } },
  include: { author: { select: { id: true, name: true, email: true, image: true } } },
  orderBy: { publishedAt: 'desc' },
};

describe('postsRepository.findPublished', () => {
  beforeEach(() => {
    mockedDb.post.count.mockReset();
    mockedDb.post.findMany.mockReset();
  });

  it('defaults to page 1 when page is invalid', async () => {
    mockedDb.post.count.mockResolvedValue(24);
    mockedDb.post.findMany.mockResolvedValue([]);

    const result = await postsRepository.findPublished({ page: Number.NaN, limit: 12 });

    expect(mockedDb.post.findMany).toHaveBeenCalledWith({
      ...baseFindManyArgs,
      skip: 0,
      take: 12,
    });
    expect(result.pagination.page).toBe(1);
  });

  it('clamps page to total pages when page exceeds total', async () => {
    mockedDb.post.count.mockResolvedValue(24);
    mockedDb.post.findMany.mockResolvedValue([]);

    const result = await postsRepository.findPublished({ page: 10, limit: 12 });

    expect(mockedDb.post.findMany).toHaveBeenCalledWith({
      ...baseFindManyArgs,
      skip: 12,
      take: 12,
    });
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.totalPages).toBe(2);
  });

  it('keeps pagination stable when there are no posts', async () => {
    mockedDb.post.count.mockResolvedValue(0);
    mockedDb.post.findMany.mockResolvedValue([]);

    const result = await postsRepository.findPublished({ page: 5, limit: 12 });

    expect(mockedDb.post.findMany).toHaveBeenCalledWith({
      ...baseFindManyArgs,
      skip: 0,
      take: 12,
    });
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.totalPages).toBe(0);
  });
});
