import { describe, expect, it } from 'vitest';

import { formatCalendarDate, formatMonthParam, getCalendarEndDate } from './event-calendar';

describe('EventCalendar date formatting', () => {
  it('formats event dates for FullCalendar', () => {
    const date = new Date('2026-03-05T00:00:00.000Z');
    expect(formatCalendarDate(date)).toBe('2026-03-05');
  });

  it('formats the month query parameter', () => {
    const date = new Date('2026-11-15T00:00:00.000Z');
    expect(formatMonthParam(date)).toBe('2026-11');
  });

  it('returns an exclusive end date for multi-day events', () => {
    const startDate = new Date('2026-03-05T00:00:00.000Z');
    const endDate = new Date('2026-03-07T00:00:00.000Z');
    expect(getCalendarEndDate(startDate, endDate)).toBe('2026-03-08');
  });
});
