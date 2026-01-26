// apps/admin/app/api/public/events/route.test.ts
import { describe, expect, it, vi } from 'vitest';

import { GET } from './route';

import type { Event } from '@repo/database';

interface EventsResponse {
  success: boolean;
  data?: {
    events: Array<{ id: string }>;
  };
  error?: {
    message: string;
  };
}

vi.mock('@repo/database', () => ({
  eventsRepository: {
    findAll: vi.fn(),
    getPastEvents: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  eventsLogger: {
    error: vi.fn(),
  },
}));

// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { eventsRepository } from '@repo/database';

const mockedEventsRepository = vi.mocked(eventsRepository);

describe('Public Events API', () => {
  it('returns upcoming events by default', async () => {
    const mockEvent = {
      id: 'event-1',
      title: 'Događaj',
      description: null,
      eventDate: new Date('2026-02-01'),
      eventTime: null,
      endDate: null,
      location: null,
      posterImage: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    } satisfies Event;

    mockedEventsRepository.findAll.mockResolvedValue({
      events: [mockEvent],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const response = await GET(
      new Request('http://localhost/api/public/events') as never
    );
    const data = (await response.json()) as EventsResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    if (!data.data) {
      throw new Error('Missing response data');
    }
    expect(data.data.events).toHaveLength(1);
  });

  it('uses past events when requested', async () => {
    mockedEventsRepository.getPastEvents.mockResolvedValue({
      events: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await GET(
      new Request('http://localhost/api/public/events?past=true') as never
    );
    const data = (await response.json()) as EventsResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method -- Mock is safe to assert.
    expect(mockedEventsRepository.getPastEvents).toHaveBeenCalled();
  });

  it('rejects conflicting filters', async () => {
    const response = await GET(
      new Request('http://localhost/api/public/events?past=true&upcoming=true') as never
    );
    const data = (await response.json()) as EventsResponse;

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
