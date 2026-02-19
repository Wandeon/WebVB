import { announcementsRepository, Prisma } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { announcementsLogger } from '@/lib/logger';
import { deleteFromR2, getR2KeyFromUrl } from '@/lib/r2';
import { triggerRebuild } from '@/lib/rebuild';
import { parseUuidParam } from '@/lib/request-validation';
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
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const announcementId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const announcement = await announcementsRepository.findById(announcementId);

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
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const announcementId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    // Validate request body
    const validationResult = updateAnnouncementSchema.safeParse({
      ...(body as Record<string, unknown>),
      id: announcementId,
    });

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    // Check if announcement exists
    const existingAnnouncement = await announcementsRepository.findById(announcementId);

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

      // Regenerate slug if title changed (cap to prevent infinite loops)
      if (title !== existingAnnouncement.title) {
        const MAX_SLUG_ATTEMPTS = 10;
        let slug = generateSlug(title);
        let slugSuffix = 1;

        while (await announcementsRepository.slugExists(slug, announcementId)) {
          if (slugSuffix > MAX_SLUG_ATTEMPTS) {
            return apiError(ErrorCodes.INTERNAL_ERROR, 'Ne mogu generirati jedinstveni slug', 500);
          }
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

    // Update announcement -- handle concurrent slug collision via unique constraint
    let announcement;
    try {
      announcement = await announcementsRepository.update(announcementId, updateData);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Slug collision from concurrent request -- retry with timestamp suffix
        if (updateData.slug) {
          updateData.slug = `${updateData.slug}-${Date.now().toString(36).slice(-4)}`;
        }
        announcement = await announcementsRepository.update(announcementId, updateData);
      } else {
        throw error;
      }
    }

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

    announcementsLogger.info({ announcementId }, 'Obavijest uspješno ažurirana');

    if (announcement.publishedAt || existingAnnouncement.publishedAt) {
      triggerRebuild(`announcement-updated:${announcement.id}`);
    }

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
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const announcementId = idResult.id;
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    // Check if announcement exists
    const existingAnnouncement = await announcementsRepository.findById(announcementId);

    if (!existingAnnouncement) {
      return apiError(ErrorCodes.NOT_FOUND, 'Obavijest nije pronađena', 404);
    }

    // Clean up R2 files for attachments (best-effort)
    if (existingAnnouncement.attachments && existingAnnouncement.attachments.length > 0) {
      await Promise.allSettled(
        existingAnnouncement.attachments.map(async (att) => {
          const key = getR2KeyFromUrl(att.fileUrl);
          if (key) {
            await deleteFromR2(key);
          }
        })
      );
    }

    await announcementsRepository.delete(announcementId);

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

    announcementsLogger.info({ announcementId }, 'Obavijest uspješno obrisana');

    if (existingAnnouncement.publishedAt) {
      triggerRebuild(`announcement-deleted:${existingAnnouncement.id}`);
    }

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
