import { eventsRepository, indexEvent } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { eventsLogger } from '@/lib/logger';
import { createEventSchema, eventQuerySchema } from '@/lib/validations/event';

import type { NextRequest } from 'next/server';

// GET /api/events - List events with filtering, pagination, sorting
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);

    const queryResult = eventQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
      upcoming: searchParams.get('upcoming') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? undefined,
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
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

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

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.CREATE,
      entityType: AUDIT_ENTITY_TYPES.EVENT,
      entityId: event.id,
      changes: {
        after: event,
      },
    });

    // Index for search
    await indexEvent({
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      location: event.location,
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
