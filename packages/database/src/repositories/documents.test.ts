import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { documentsRepository } from './documents';
import { db } from '../client';

vi.mock('../client', () => ({
  db: {
    document: {
      groupBy: vi.fn(),
    },
  },
}));

const mockedDb = db as unknown as {
  document: {
    groupBy: Mock;
  };
};

describe('documentsRepository.getCategoryCounts', () => {
  beforeEach(() => {
    mockedDb.document.groupBy.mockReset();
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
});
