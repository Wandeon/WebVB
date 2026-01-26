// apps/admin/app/api/public/events/calendar/route.test.ts
import { describe, expect, it, vi } from 'vitest';

import { GET } from './route';

import type { Event } from '@repo/database';

interface CalendarResponse {
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
    getEventsByMonth: vi.fn(),
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

describe('Public Events Calendar API', () => {
  it('returns calendar events for a month', async () => {
    const mockEvent = {
      id: 'event-1',
      title: 'Kalendarski događaj',
      description: null,
      eventDate: new Date('2026-03-01'),
      eventTime: null,
      endDate: null,
      location: null,
      posterImage: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    } satisfies Event;

    mockedEventsRepository.getEventsByMonth.mockResolvedValue([mockEvent]);

    const response = await GET(
      new Request('http://localhost/api/public/events/calendar?year=2026&month=3') as never
    );
    const data = (await response.json()) as CalendarResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    if (!data.data) {
      throw new Error('Missing response data');
    }
    expect(data.data.events).toHaveLength(1);
  });

  it('validates year and month', async () => {
    const response = await GET(
      new Request('http://localhost/api/public/events/calendar?year=2026&month=13') as never
    );
    const data = (await response.json()) as CalendarResponse;

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
