import { eventsRepository, type Event } from '@repo/database';
import { z } from 'zod';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { eventsLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

const booleanParamSchema = z
  .string()
  .optional()
  .refine(
    (value) => value === undefined || value === 'true' || value === 'false',
    { message: 'Nevaljani parametri upita' }
  )
  .transform((value) =>
    value === 'true' ? true : value === 'false' ? false : undefined
  );

const publicEventsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    upcoming: booleanParamSchema,
    past: booleanParamSchema,
  })
  .strict();

const mapEvent = (event: Event) => ({
  id: event.id,
  title: event.title,
  description: event.description,
  eventDate: event.eventDate,
  eventTime: event.eventTime,
  endDate: event.endDate,
  location: event.location,
  posterImage: event.posterImage,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryResult = publicEventsQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      upcoming: searchParams.get('upcoming') ?? undefined,
      past: searchParams.get('past') ?? undefined,
    });

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { page, limit, upcoming, past } = queryResult.data;

    if (upcoming && past) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const result = past
      ? await eventsRepository.getPastEvents({ page, limit })
      : await eventsRepository.findAll({ page, limit, upcoming: true });

    return apiSuccess({
      events: result.events.map(mapEvent),
      pagination: result.pagination,
    });
  } catch (error) {
    eventsLogger.error({ error }, 'Greška prilikom dohvaćanja događanja');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja događanja',
      500
    );
  }
}
