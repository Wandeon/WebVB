import { announcementsRepository, db } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { announcementsLogger } from '@/lib/logger';
import { triggerRebuild } from '@/lib/rebuild';
import { parseUuidParam } from '@/lib/request-validation';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/announcements/[id]/publish - Publish announcement
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const announcementId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    // Atomic conditional publish: only updates if currently unpublished
    const result = await db.announcement.updateMany({
      where: { id: announcementId, publishedAt: null },
      data: { publishedAt: new Date() },
    });

    if (result.count === 0) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Obavijest je već objavljena ili ne postoji',
        400
      );
    }

    // Fetch the updated record for audit log and response
    const announcement = await announcementsRepository.findById(announcementId);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.ANNOUNCEMENT,
      entityId: announcementId,
      changes: {
        publishedAt: { before: null, after: announcement?.publishedAt },
      },
    });

    announcementsLogger.info({ announcementId }, 'Obavijest uspješno objavljena');

    triggerRebuild(`announcement-published:${announcementId}`);

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
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const announcementId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    // Atomic conditional unpublish: only updates if currently published
    const result = await db.announcement.updateMany({
      where: { id: announcementId, publishedAt: { not: null } },
      data: { publishedAt: null },
    });

    if (result.count === 0) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Obavijest nije objavljena ili ne postoji',
        400
      );
    }

    // Fetch the updated record for audit log and response
    const announcement = await announcementsRepository.findById(announcementId);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.ANNOUNCEMENT,
      entityId: announcementId,
      changes: {
        publishedAt: { before: 'was published', after: null },
      },
    });

    announcementsLogger.info({ announcementId }, 'Obavijest uspješno povučena');

    triggerRebuild(`announcement-unpublished:${announcementId}`);

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
