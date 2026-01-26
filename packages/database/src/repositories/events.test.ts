import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { eventsRepository } from './events';
import { db } from '../client';

vi.mock('../client', () => ({
  db: {
    event: {
      findMany: vi.fn(),
    },
  },
}));

const mockedDb = db as unknown as {
  event: {
    findMany: Mock;
  };
};

describe('eventsRepository.findAllForSitemap', () => {
  beforeEach(() => {
    mockedDb.event.findMany.mockReset();
  });

  it('returns event ids with dates', async () => {
    const updatedAt = new Date('2026-01-25T10:00:00.000Z');
    const eventDate = new Date('2026-02-01T00:00:00.000Z');
    mockedDb.event.findMany.mockResolvedValue([
      { id: 'event-1', updatedAt, eventDate },
    ]);

    const result = await eventsRepository.findAllForSitemap();

    expect(mockedDb.event.findMany).toHaveBeenCalledWith({
      select: { id: true, updatedAt: true, eventDate: true },
      orderBy: { eventDate: 'desc' },
    });
    expect(result).toEqual([{ id: 'event-1', updatedAt, eventDate }]);
  });
});
