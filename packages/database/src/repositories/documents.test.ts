import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { documentsRepository, resetDocumentsCacheForTests } from './documents';
import { db } from '../client';

vi.mock('../client', () => ({
  db: {
    document: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

const mockedDb = db as unknown as {
  document: {
    findMany: Mock;
    groupBy: Mock;
  };
};

describe('documentsRepository.getCategoryCounts', () => {
  beforeEach(() => {
    mockedDb.document.groupBy.mockReset();
    mockedDb.document.findMany.mockReset();
    resetDocumentsCacheForTests();
  });

  it('adds a year filter when a year is provided', async () => {
    mockedDb.document.groupBy.mockResolvedValue([
      { category: 'proracun', _count: { id: 3 } },
    ]);

    await documentsRepository.getCategoryCounts(2024);

    expect(mockedDb.document.groupBy).toHaveBeenCalledWith({
      by: ['category'],
      _count: { id: true },
      where: { year: 2024 },
    });
  });

  it('omits the year filter when no year is provided', async () => {
    mockedDb.document.groupBy.mockResolvedValue([]);

    await documentsRepository.getCategoryCounts();

    expect(mockedDb.document.groupBy).toHaveBeenCalledWith({
      by: ['category'],
      _count: { id: true },
    });
  });

  it('caches category counts per year to avoid repeated queries', async () => {
    mockedDb.document.groupBy.mockResolvedValue([
      { category: 'proracun', _count: { id: 2 } },
    ]);

    const first = await documentsRepository.getCategoryCounts(2023);
    const second = await documentsRepository.getCategoryCounts(2023);

    expect(first).toEqual({ proracun: 2 });
    expect(second).toEqual({ proracun: 2 });
    expect(mockedDb.document.groupBy).toHaveBeenCalledTimes(1);
  });
});

describe('documentsRepository.getDistinctYears', () => {
  beforeEach(() => {
    mockedDb.document.findMany.mockReset();
    mockedDb.document.groupBy.mockReset();
    resetDocumentsCacheForTests();
  });

  it('caches distinct years to avoid repeated queries', async () => {
    mockedDb.document.findMany.mockResolvedValue([
      { year: 2024 },
      { year: 2023 },
    ]);

    const first = await documentsRepository.getDistinctYears();
    const second = await documentsRepository.getDistinctYears();

    expect(first).toEqual([2024, 2023]);
    expect(second).toEqual([2024, 2023]);
    expect(mockedDb.document.findMany).toHaveBeenCalledTimes(1);
  });
});
