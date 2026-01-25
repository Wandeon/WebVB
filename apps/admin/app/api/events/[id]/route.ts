import { eventsRepository } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { eventsLogger } from '@/lib/logger';
import { deleteImageVariantsFromUrl } from '@/lib/r2';
import { updateEventSchema } from '@/lib/validations/event';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/events/[id] - Get single event
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const event = await eventsRepository.findById(id);

    if (!event) {
      return apiError(ErrorCodes.NOT_FOUND, 'Događaj nije pronađen', 404);
    }

    return apiSuccess(event);
  } catch (error) {
    eventsLogger.error({ error }, 'Greška prilikom dohvaćanja događaja');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja događaja',
      500
    );
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    const validationResult = updateEventSchema.safeParse({
      ...(body as Record<string, unknown>),
      id,
    });

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const existingEvent = await eventsRepository.findById(id);

    if (!existingEvent) {
      return apiError(ErrorCodes.NOT_FOUND, 'Događaj nije pronađen', 404);
    }

    const { title, description, eventDate, eventTime, endDate, location, posterImage } =
      validationResult.data;

    // Validate endDate > eventDate if both provided
    const effectiveEventDate = eventDate ? new Date(eventDate) : existingEvent.eventDate;
    const effectiveEndDate = endDate ? new Date(endDate) : existingEvent.endDate;

    if (effectiveEndDate && effectiveEventDate) {
      if (effectiveEndDate < effectiveEventDate) {
        return apiError(
          ErrorCodes.VALIDATION_ERROR,
          'Datum završetka mora biti nakon datuma početka',
          400
        );
      }
    }

    // Build update data conditionally
    const updateData: Parameters<typeof eventsRepository.update>[1] = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (eventDate !== undefined) updateData.eventDate = new Date(eventDate);
    if (eventTime !== undefined) {
      updateData.eventTime = eventTime ? new Date(`1970-01-01T${eventTime}:00`) : null;
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null;
    }
    if (location !== undefined) updateData.location = location;

    // Handle posterImage replacement with R2 cleanup
    if (posterImage !== undefined) {
      // Clean up old poster from R2 if being replaced
      if (existingEvent.posterImage && existingEvent.posterImage !== posterImage) {
        try {
          await deleteImageVariantsFromUrl(existingEvent.posterImage);
          eventsLogger.info(
            { eventId: id },
            'Stara slika plakata obrisana iz R2'
          );
        } catch (r2Error) {
          eventsLogger.error(
            { eventId: id, error: r2Error },
            'Nije uspjelo brisanje stare slike plakata iz R2'
          );
        }
      }
      updateData.posterImage = posterImage;
    }

    const event = await eventsRepository.update(id, updateData);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.EVENT,
      entityId: event.id,
      changes: {
        before: existingEvent,
        after: event,
      },
    });

    eventsLogger.info({ eventId: id }, 'Događaj uspješno ažuriran');

    return apiSuccess(event);
  } catch (error) {
    eventsLogger.error({ error }, 'Greška prilikom ažuriranja događaja');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom ažuriranja događaja',
      500
    );
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    const existingEvent = await eventsRepository.findById(id);

    if (!existingEvent) {
      return apiError(
        ErrorCodes.NOT_FOUND,
        'Događaj je već obrisan ili nije pronađen',
        404
      );
    }

    // Delete from DB first
    const deletedEvent = await eventsRepository.delete(id);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.DELETE,
      entityType: AUDIT_ENTITY_TYPES.EVENT,
      entityId: deletedEvent.id,
      changes: {
        before: existingEvent,
      },
    });

    // Best-effort R2 deletion for poster image (log errors but don't fail)
    if (existingEvent.posterImage) {
      try {
        await deleteImageVariantsFromUrl(existingEvent.posterImage);
        eventsLogger.info(
          { eventId: id },
          'Slika plakata obrisana iz R2'
        );
      } catch (r2Error) {
        eventsLogger.error(
          { eventId: id, error: r2Error },
          'Nije uspjelo brisanje slike plakata iz R2 (DB zapis već obrisan)'
        );
      }
    }

    eventsLogger.info(
      { eventId: id, title: deletedEvent.title },
      'Događaj uspješno obrisan'
    );

    return apiSuccess({ deleted: true });
  } catch (error) {
    eventsLogger.error({ error }, 'Greška prilikom brisanja događaja');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom brisanja događaja',
      500
    );
  }
}
