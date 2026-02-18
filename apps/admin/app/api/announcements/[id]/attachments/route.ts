import { announcementsRepository } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { announcementsLogger } from '@/lib/logger';
import { triggerRebuild } from '@/lib/rebuild';
import { addAttachmentSchema, reorderAttachmentsSchema } from '@/lib/validations/announcement';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/announcements/[id]/attachments - Add attachment to announcement
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    // Check if announcement exists
    const announcementExists = await announcementsRepository.exists(id);

    if (!announcementExists) {
      return apiError(ErrorCodes.NOT_FOUND, 'Obavijest nije pronađena', 404);
    }

    const body: unknown = await request.json();

    const validationResult = addAttachmentSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { fileName, fileUrl, fileSize, mimeType } = validationResult.data;

    const attachment = await announcementsRepository.addAttachment(id, {
      fileName,
      fileUrl,
      fileSize,
      mimeType,
    });

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.ANNOUNCEMENT,
      entityId: id,
      changes: {
        addedAttachment: attachment,
      },
    });

    announcementsLogger.info(
      { announcementId: id, attachmentId: attachment.id },
      'Privitak uspješno dodan obavijesti'
    );

    triggerRebuild(`announcement-attachment-added:${id}`);

    return apiSuccess(attachment, 201);
  } catch (error) {
    announcementsLogger.error({ error }, 'Greška prilikom dodavanja privitka');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dodavanja privitka',
      500
    );
  }
}

// PUT /api/announcements/[id]/attachments - Reorder attachments
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    // Check if announcement exists
    const announcementExists = await announcementsRepository.exists(id);

    if (!announcementExists) {
      return apiError(ErrorCodes.NOT_FOUND, 'Obavijest nije pronađena', 404);
    }

    const body: unknown = await request.json();

    const validationResult = reorderAttachmentsSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { attachmentIds } = validationResult.data;

    await announcementsRepository.reorderAttachments(id, attachmentIds);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.ANNOUNCEMENT,
      entityId: id,
      changes: {
        reorderedAttachments: attachmentIds,
      },
    });

    announcementsLogger.info(
      { announcementId: id },
      'Redoslijed privitaka uspješno ažuriran'
    );

    triggerRebuild(`announcement-attachments-reordered:${id}`);

    // Return updated announcement with attachments
    const announcement = await announcementsRepository.findById(id);

    return apiSuccess(announcement);
  } catch (error) {
    announcementsLogger.error({ error }, 'Greška prilikom preuređivanja privitaka');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom preuređivanja privitaka',
      500
    );
  }
}
