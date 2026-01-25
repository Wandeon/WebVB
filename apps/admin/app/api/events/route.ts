import { eventsRepository } from '@repo/database';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { eventsLogger } from '@/lib/logger';
import { createEventSchema, eventQuerySchema } from '@/lib/validations/event';

import type { NextRequest } from 'next/server';

// GET /api/events - List events with filtering, pagination, sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryResult = eventQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      upcoming: searchParams.get('upcoming'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { page, limit, search, from, to, upcoming, sortBy, sortOrder } =
      queryResult.data;

    const result = await eventsRepository.findAll({
      page,
      limit,
      search,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      upcoming,
      sortBy,
      sortOrder,
    });

    return apiSuccess({
      events: result.events,
      pagination: result.pagination,
    });
  } catch (error) {
    eventsLogger.error({ error }, 'Greška prilikom dohvaćanja događaja');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja događaja',
      500
    );
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    const validationResult = createEventSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { title, description, eventDate, eventTime, endDate, location, posterImage } =
      validationResult.data;

    // Validate endDate > eventDate if both provided
    if (endDate && eventDate) {
      const eventDateObj = new Date(eventDate);
      const endDateObj = new Date(endDate);
      if (endDateObj < eventDateObj) {
        return apiError(
          ErrorCodes.VALIDATION_ERROR,
          'Datum završetka mora biti nakon datuma početka',
          400
        );
      }
    }

    // Convert eventTime string "HH:MM" to Date
    let eventTimeDate: Date | null = null;
    if (eventTime) {
      eventTimeDate = new Date(`1970-01-01T${eventTime}:00`);
    }

    const event = await eventsRepository.create({
      title,
      description,
      eventDate: new Date(eventDate),
      eventTime: eventTimeDate,
      endDate: endDate ? new Date(endDate) : null,
      location,
      posterImage,
    });

    eventsLogger.info(
      { eventId: event.id, title },
      'Događaj uspješno stvoren'
    );

    return apiSuccess(event, 201);
  } catch (error) {
    eventsLogger.error({ error }, 'Greška prilikom stvaranja događaja');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom stvaranja događaja',
      500
    );
  }
}
