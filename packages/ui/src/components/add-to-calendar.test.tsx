import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AddToCalendar, generateICS } from './add-to-calendar';

describe('AddToCalendar', () => {
  it('builds a Google Calendar link with timezone and sanitized details', () => {
    render(
      <AddToCalendar
        title="Sastanak"
        description="<p>Opis događaja</p>"
        startDate={new Date('2026-02-10T00:00:00.000Z')}
        startTime={new Date('1970-01-01T09:30:00.000Z')}
        endDate={null}
        location="Općina Veliki Bukovec"
      />
    );

    const link = screen.getByRole('link', { name: /Google Calendar/i });
    const href = link.getAttribute('href') ?? '';

    expect(href).toContain('ctz=Europe%2FZagreb');
    expect(href).toContain('dates=20260210T093000%2F20260210T103000');
    expect(href).toContain('details=Opis+doga%C4%91aja');
  });

  it('generates all-day ICS entries when start time is missing', () => {
    const ics = generateICS({
      title: 'Sajam',
      description: null,
      startDate: new Date('2026-05-01T00:00:00.000Z'),
      startTime: null,
      endDate: null,
      location: null,
    });

    expect(ics).toContain('DTSTART;VALUE=DATE:20260501');
    expect(ics).toContain('DTEND;VALUE=DATE:20260502');
  });
});
