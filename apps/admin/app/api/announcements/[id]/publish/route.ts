import { announcementsRepository } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { announcementsLogger } from '@/lib/logger';
import { triggerRebuild } from '@/lib/rebuild';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/announcements/[id]/publish - Publish announcement
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    // Check if announcement exists
    const existingAnnouncement = await announcementsRepository.findById(id);

    if (!existingAnnouncement) {
      return apiError(ErrorCodes.NOT_FOUND, 'Obavijest nije pronađena', 404);
    }

    // Check if already published
    if (existingAnnouncement.publishedAt) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Obavijest je već objavljena',
        400
      );
    }

    const announcement = await announcementsRepository.publish(id);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.ANNOUNCEMENT,
      entityId: announcement.id,
      changes: {
        before: existingAnnouncement,
        after: announcement,
      },
    });

    announcementsLogger.info({ announcementId: id }, 'Obavijest uspješno objavljena');

    triggerRebuild(`announcement-published:${announcement.id}`);

    return apiSuccess(announcement);
  } catch (error) {
    announcementsLogger.error({ error }, 'Greška prilikom objavljivanja obavijesti');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom objavljivanja obavijesti',
      500
    );
  }
}

// DELETE /api/announcements/[id]/publish - Unpublish announcement
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    // Check if announcement exists
    const existingAnnouncement = await announcementsRepository.findById(id);

    if (!existingAnnouncement) {
      return apiError(ErrorCodes.NOT_FOUND, 'Obavijest nije pronađena', 404);
    }

    // Check if already unpublished
    if (!existingAnnouncement.publishedAt) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Obavijest nije objavljena',
        400
      );
    }

    const announcement = await announcementsRepository.unpublish(id);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.ANNOUNCEMENT,
      entityId: announcement.id,
      changes: {
        before: existingAnnouncement,
        after: announcement,
      },
    });

    announcementsLogger.info({ announcementId: id }, 'Obavijest uspješno povučena');

    triggerRebuild(`announcement-unpublished:${announcement.id}`);

    return apiSuccess(announcement);
  } catch (error) {
    announcementsLogger.error({ error }, 'Greška prilikom povlačenja obavijesti');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom povlačenja obavijesti',
      500
    );
  }
}
