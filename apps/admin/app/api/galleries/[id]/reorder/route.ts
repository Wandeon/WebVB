import { galleriesRepository } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { galleriesLogger } from '@/lib/logger';
import { reorderImagesSchema } from '@/lib/validations/gallery';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/galleries/[id]/reorder - Reorder images in gallery
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    // Validate gallery exists
    const gallery = await galleriesRepository.findById(id);

    if (!gallery) {
      return apiError(ErrorCodes.NOT_FOUND, 'Galerija nije pronađena', 404);
    }

    const validationResult = reorderImagesSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { imageIds } = validationResult.data;

    const uniqueIds = new Set(imageIds);

    if (uniqueIds.size !== imageIds.length) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Redoslijed sadrži duplicirane slike',
        400
      );
    }

    if (imageIds.length !== gallery.images.length) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Redoslijed mora sadržavati sve slike galerije',
        400
      );
    }

    // Validate all image IDs belong to this gallery
    const galleryImageIds = new Set(gallery.images.map((img) => img.id));
    const invalidIds = imageIds.filter((imgId) => !galleryImageIds.has(imgId));

    if (invalidIds.length > 0) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Neke slike ne pripadaju ovoj galeriji',
        400,
        { invalidIds }
      );
    }

    await galleriesRepository.reorderImages(id, imageIds);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.GALLERY,
      entityId: id,
      changes: {
        imageIds,
      },
    });

    galleriesLogger.info(
      { galleryId: id, imageCount: imageIds.length },
      'Redoslijed slika uspješno ažuriran'
    );

    return apiSuccess({ reordered: true });
  } catch (error) {
    galleriesLogger.error({ error }, 'Greška prilikom promjene redoslijeda slika');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom promjene redoslijeda slika',
      500
    );
  }
}
