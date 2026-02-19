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

    // Check if announcement exists (use findById to also get publishedAt for rebuild check)
    const announcementId = id;
    const existingAnnouncement = await announcementsRepository.findById(announcementId);

    if (!existingAnnouncement) {
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

    const attachment = await announcementsRepository.addAttachment(announcementId, {
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
      entityId: announcementId,
      changes: {
        addedAttachment: attachment,
      },
    });

    announcementsLogger.info(
      { announcementId, attachmentId: attachment.id },
      'Privitak uspješno dodan obavijesti'
    );

    // Only rebuild if the announcement is published (draft changes don't affect the public site)
    if (existingAnnouncement.publishedAt) {
      triggerRebuild(`announcement-attachment-added:${announcementId}`);
    }

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

    // Check if announcement exists (use findById to also get publishedAt for rebuild check)
    const announcementId = id;
    const announcement = await announcementsRepository.findById(announcementId);

    if (!announcement) {
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

    await announcementsRepository.reorderAttachments(announcementId, attachmentIds);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.ANNOUNCEMENT,
      entityId: announcementId,
      changes: {
        reorderedAttachments: attachmentIds,
      },
    });

    announcementsLogger.info(
      { announcementId },
      'Redoslijed privitaka uspješno ažuriran'
    );

    // Only rebuild if the announcement is published (draft changes don't affect the public site)
    if (announcement.publishedAt) {
      triggerRebuild(`announcement-attachments-reordered:${announcementId}`);
    }

    // Return updated announcement with attachments
    const updatedAnnouncement = await announcementsRepository.findById(announcementId);

    return apiSuccess(updatedAnnouncement);
  } catch (error) {
    announcementsLogger.error({ error }, 'Greška prilikom preuređivanja privitaka');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom preuređivanja privitaka',
      500
    );
  }
}
