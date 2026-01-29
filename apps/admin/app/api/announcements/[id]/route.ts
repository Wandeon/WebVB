import { announcementsRepository } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { announcementsLogger } from '@/lib/logger';
import { generateSlug } from '@/lib/utils/slug';
import { updateAnnouncementSchema } from '@/lib/validations/announcement';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/announcements/[id] - Get single announcement by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const announcement = await announcementsRepository.findById(id);

    if (!announcement) {
      return apiError(ErrorCodes.NOT_FOUND, 'Obavijest nije pronađena', 404);
    }

    return apiSuccess(announcement);
  } catch (error) {
    announcementsLogger.error({ error }, 'Greška prilikom dohvaćanja obavijesti');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja obavijesti',
      500
    );
  }
}

// PUT /api/announcements/[id] - Update announcement
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    // Validate request body
    const validationResult = updateAnnouncementSchema.safeParse({
      ...(body as Record<string, unknown>),
      id,
    });

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    // Check if announcement exists
    const existingAnnouncement = await announcementsRepository.findById(id);

    if (!existingAnnouncement) {
      return apiError(ErrorCodes.NOT_FOUND, 'Obavijest nije pronađena', 404);
    }

    const {
      title,
      content,
      excerpt,
      category,
      validFrom,
      validUntil,
      publishedAt,
    } = validationResult.data;

    // Prepare update data
    const updateData: Parameters<typeof announcementsRepository.update>[1] = {};

    if (title !== undefined) {
      updateData.title = title;

      // Regenerate slug if title changed
      if (title !== existingAnnouncement.title) {
        let slug = generateSlug(title);
        let slugSuffix = 1;

        // Check for existing slug (excluding current announcement) and make it unique
        while (await announcementsRepository.slugExists(slug, id)) {
          slug = `${generateSlug(title)}-${slugSuffix}`;
          slugSuffix++;
        }
        updateData.slug = slug;
      }
    }

    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (category !== undefined) updateData.category = category;
    if (validFrom !== undefined) updateData.validFrom = validFrom;
    if (validUntil !== undefined) updateData.validUntil = validUntil;
    if (publishedAt !== undefined) updateData.publishedAt = publishedAt;

    // Update announcement
    const announcement = await announcementsRepository.update(id, updateData);

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

    announcementsLogger.info({ announcementId: id }, 'Obavijest uspješno ažurirana');

    return apiSuccess(announcement);
  } catch (error) {
    announcementsLogger.error({ error }, 'Greška prilikom ažuriranja obavijesti');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom ažuriranja obavijesti',
      500
    );
  }
}

// DELETE /api/announcements/[id] - Delete announcement
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    // Check if announcement exists
    const existingAnnouncement = await announcementsRepository.findById(id);

    if (!existingAnnouncement) {
      return apiError(ErrorCodes.NOT_FOUND, 'Obavijest nije pronađena', 404);
    }

    await announcementsRepository.delete(id);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.DELETE,
      entityType: AUDIT_ENTITY_TYPES.ANNOUNCEMENT,
      entityId: existingAnnouncement.id,
      changes: {
        before: existingAnnouncement,
      },
    });

    announcementsLogger.info({ announcementId: id }, 'Obavijest uspješno obrisana');

    return apiSuccess({ deleted: true });
  } catch (error) {
    announcementsLogger.error({ error }, 'Greška prilikom brisanja obavijesti');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom brisanja obavijesti',
      500
    );
  }
}
