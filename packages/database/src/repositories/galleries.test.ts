import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { galleriesRepository } from './galleries';
import { db } from '../client';

vi.mock('../client', () => ({
  db: {
    gallery: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const mockedDb = db as unknown as {
  gallery: {
    count: Mock;
    findMany: Mock;
  };
};

const baseFindManyArgs = {
  where: { images: { some: {} } },
  include: { _count: { select: { images: true } } },
  orderBy: { eventDate: 'desc' },
};

describe('galleriesRepository.findPublished', () => {
  beforeEach(() => {
    mockedDb.gallery.count.mockReset();
    mockedDb.gallery.findMany.mockReset();
  });

  it('defaults to page 1 when page is invalid', async () => {
    mockedDb.gallery.count.mockResolvedValue(24);
    mockedDb.gallery.findMany.mockResolvedValue([]);

    const result = await galleriesRepository.findPublished({ page: Number.NaN, limit: 12 });

    expect(mockedDb.gallery.findMany).toHaveBeenCalledWith({
      ...baseFindManyArgs,
      skip: 0,
      take: 12,
    });
    expect(result.pagination.page).toBe(1);
  });

  it('clamps page to total pages when page exceeds total', async () => {
    mockedDb.gallery.count.mockResolvedValue(24);
    mockedDb.gallery.findMany.mockResolvedValue([]);

    const result = await galleriesRepository.findPublished({ page: 10, limit: 12 });

    expect(mockedDb.gallery.findMany).toHaveBeenCalledWith({
      ...baseFindManyArgs,
      skip: 12,
      take: 12,
    });
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.totalPages).toBe(2);
  });

  it('keeps pagination stable when there are no galleries', async () => {
    mockedDb.gallery.count.mockResolvedValue(0);
    mockedDb.gallery.findMany.mockResolvedValue([]);

    const result = await galleriesRepository.findPublished({ page: 5, limit: 12 });

    expect(mockedDb.gallery.findMany).toHaveBeenCalledWith({
      ...baseFindManyArgs,
      skip: 0,
      take: 12,
    });
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.totalPages).toBe(0);
  });
});
