import { describe, expect, it } from 'vitest';

import { createEventSchema } from './event';

describe('createEventSchema', () => {
  it('accepts valid event payloads', () => {
    const result = createEventSchema.safeParse({
      title: 'Sjednica vijeća',
      description: 'Redovna sjednica općinskog vijeća.',
      eventDate: '2026-02-15',
      eventTime: '18:30',
      endDate: '2026-02-15',
      location: 'Općinska vijećnica',
      posterImage: 'https://example.com/poster.jpg',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eventTime).toBe('18:30');
    }
  });

  it('rejects invalid date format', () => {
    const result = createEventSchema.safeParse({
      title: 'Sjednica vijeća',
      eventDate: '15-02-2026',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid time format', () => {
    const result = createEventSchema.safeParse({
      title: 'Sjednica vijeća',
      eventDate: '2026-02-15',
      eventTime: '25:99',
    });

    expect(result.success).toBe(false);
  });

  it('rejects unknown fields', () => {
    const result = createEventSchema.safeParse({
      title: 'Sjednica vijeća',
      eventDate: '2026-02-15',
      extra: 'value',
    });

    expect(result.success).toBe(false);
  });
});
