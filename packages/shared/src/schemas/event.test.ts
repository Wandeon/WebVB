import { describe, expect, it } from 'vitest';

import { createEventSchema } from './event';

describe('createEventSchema', () => {
  it('accepts a valid date range', () => {
    const result = createEventSchema.safeParse({
      title: 'Dani općine',
      eventDate: new Date('2026-06-10'),
      endDate: new Date('2026-06-12'),
    });

    expect(result.success).toBe(true);
  });

  it('rejects end date before start date', () => {
    const result = createEventSchema.safeParse({
      title: 'Dani općine',
      eventDate: new Date('2026-06-10'),
      endDate: new Date('2026-06-08'),
    });

    expect(result.success).toBe(false);
  });
});
