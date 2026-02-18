import { galleriesRepository } from '@repo/database';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { galleriesLogger } from '@/lib/logger';
import { deleteFromR2, getR2KeyFromUrl } from '@/lib/r2';
import { triggerRebuild } from '@/lib/rebuild';
import { updateImageCaptionSchema } from '@/lib/validations/gallery';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string; imageId: string }>;
}

// PUT /api/galleries/[id]/images/[imageId] - Update image caption
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, imageId } = await params;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    // Validate gallery exists
    const galleryExists = await galleriesRepository.exists(id);

    if (!galleryExists) {
      return apiError(ErrorCodes.NOT_FOUND, 'Galerija nije pronađena', 404);
    }

    // Validate image exists
    const existingImage = await galleriesRepository.getImageById(imageId);

    if (!existingImage) {
      return apiError(ErrorCodes.NOT_FOUND, 'Slika nije pronađena', 404);
    }

    // Validate image belongs to this gallery
    if (existingImage.galleryId !== id) {
      return apiError(ErrorCodes.NOT_FOUND, 'Slika ne pripada ovoj galeriji', 404);
    }

    const validationResult = updateImageCaptionSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { caption } = validationResult.data;

    const updatedImage = await galleriesRepository.updateImageCaption(imageId, caption ?? null);

    galleriesLogger.info(
      { galleryId: id, imageId },
      'Opis slike uspješno ažuriran'
    );

    triggerRebuild(`gallery-image-updated:${id}`);

    return apiSuccess(updatedImage);
  } catch (error) {
    galleriesLogger.error({ error }, 'Greška prilikom ažuriranja opisa slike');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom ažuriranja opisa slike',
      500
    );
  }
}

// DELETE /api/galleries/[id]/images/[imageId] - Delete image with R2 cleanup
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, imageId } = await params;
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    // Validate gallery exists
    const galleryExists = await galleriesRepository.exists(id);

    if (!galleryExists) {
      return apiError(ErrorCodes.NOT_FOUND, 'Galerija nije pronađena', 404);
    }

    // Validate image exists
    const existingImage = await galleriesRepository.getImageById(imageId);

    if (!existingImage) {
      return apiError(
        ErrorCodes.NOT_FOUND,
        'Slika je već obrisana ili nije pronađena',
        404
      );
    }

    // Validate image belongs to this gallery
    if (existingImage.galleryId !== id) {
      return apiError(ErrorCodes.NOT_FOUND, 'Slika ne pripada ovoj galeriji', 404);
    }

    // Delete from DB first
    await galleriesRepository.deleteImage(imageId);

    // Best-effort R2 deletion for main image
    const imageR2Key = getR2KeyFromUrl(existingImage.imageUrl);
    if (imageR2Key) {
      try {
        await deleteFromR2(imageR2Key);
        galleriesLogger.info(
          { galleryId: id, imageId, r2Key: imageR2Key },
          'Slika obrisana iz R2'
        );
      } catch (r2Error) {
        galleriesLogger.error(
          { galleryId: id, imageId, r2Key: imageR2Key, error: r2Error },
          'Nije uspjelo brisanje slike iz R2 (DB zapis već obrisan)'
        );
      }
    }

    // Best-effort R2 deletion for thumbnail if exists
    if (existingImage.thumbnailUrl) {
      const thumbnailR2Key = getR2KeyFromUrl(existingImage.thumbnailUrl);
      if (thumbnailR2Key) {
        try {
          await deleteFromR2(thumbnailR2Key);
          galleriesLogger.info(
            { galleryId: id, imageId, r2Key: thumbnailR2Key },
            'Sličica obrisana iz R2'
          );
        } catch (r2Error) {
          galleriesLogger.error(
            { galleryId: id, imageId, r2Key: thumbnailR2Key, error: r2Error },
            'Nije uspjelo brisanje sličice iz R2 (DB zapis već obrisan)'
          );
        }
      }
    }

    galleriesLogger.info(
      { galleryId: id, imageId },
      'Slika uspješno obrisana iz galerije'
    );

    triggerRebuild(`gallery-image-deleted:${id}`);

    return apiSuccess({ deleted: true });
  } catch (error) {
    galleriesLogger.error({ error }, 'Greška prilikom brisanja slike');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom brisanja slike',
      500
    );
  }
}
