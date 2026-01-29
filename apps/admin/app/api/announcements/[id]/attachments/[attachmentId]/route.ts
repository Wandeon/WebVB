import { announcementsRepository } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { announcementsLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string; attachmentId: string }>;
}

// DELETE /api/announcements/[id]/attachments/[attachmentId] - Remove attachment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, attachmentId } = await params;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    // Check if announcement exists
    const announcementExists = await announcementsRepository.exists(id);

    if (!announcementExists) {
      return apiError(ErrorCodes.NOT_FOUND, 'Obavijest nije pronađena', 404);
    }

    // Check if attachment exists
    const attachment = await announcementsRepository.getAttachment(attachmentId);

    if (!attachment) {
      return apiError(ErrorCodes.NOT_FOUND, 'Privitak nije pronađen', 404);
    }

    // Verify attachment belongs to this announcement
    if (attachment.announcementId !== id) {
      return apiError(ErrorCodes.NOT_FOUND, 'Privitak nije pronađen', 404);
    }

    await announcementsRepository.removeAttachment(attachmentId);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.ANNOUNCEMENT,
      entityId: id,
      changes: {
        removedAttachment: attachment,
      },
    });

    announcementsLogger.info(
      { announcementId: id, attachmentId },
      'Privitak uspješno uklonjen'
    );

    return apiSuccess({ deleted: true });
  } catch (error) {
    announcementsLogger.error({ error }, 'Greška prilikom uklanjanja privitka');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom uklanjanja privitka',
      500
    );
  }
}
