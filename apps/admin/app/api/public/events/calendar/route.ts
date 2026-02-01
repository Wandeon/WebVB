import { eventsRepository } from '@repo/database';
import { z } from 'zod';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { eventsLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

const calendarQuerySchema = z
  .object({
    year: z.coerce.number().int().min(2000),
    month: z.coerce.number().int().min(1).max(12),
  })
  .strict();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryResult = calendarQuerySchema.safeParse({
      year: searchParams.get('year') ?? undefined,
      month: searchParams.get('month') ?? undefined,
    });

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { year, month } = queryResult.data;
    const events = await eventsRepository.getEventsByMonth(year, month);

    return apiSuccess({
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        eventDate: event.eventDate,
      })),
    });
  } catch (error) {
    eventsLogger.error({ error }, 'Greška prilikom dohvaćanja kalendara');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja kalendara',
      500
    );
  }
}
