import { galleriesRepository } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { galleriesLogger } from '@/lib/logger';
import { deleteFromR2, getR2KeyFromUrl } from '@/lib/r2';
import { generateSlug } from '@/lib/utils/slug';
import { updateGallerySchema } from '@/lib/validations/gallery';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/galleries/[id] - Get single gallery with images
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const gallery = await galleriesRepository.findById(id);

    if (!gallery) {
      return apiError(ErrorCodes.NOT_FOUND, 'Galerija nije pronađena', 404);
    }

    return apiSuccess(gallery);
  } catch (error) {
    galleriesLogger.error({ error }, 'Greška prilikom dohvaćanja galerije');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja galerije',
      500
    );
  }
}

// PUT /api/galleries/[id] - Update gallery
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    const validationResult = updateGallerySchema.safeParse({
      ...(body as Record<string, unknown>),
      id,
    });

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const existingGallery = await galleriesRepository.findById(id);

    if (!existingGallery) {
      return apiError(ErrorCodes.NOT_FOUND, 'Galerija nije pronađena', 404);
    }

    const { name, description, eventDate, coverImage } = validationResult.data;

    // Build update data conditionally
    const updateData: Parameters<typeof galleriesRepository.update>[1] = {};

    if (name !== undefined) {
      updateData.name = name;

      // Regenerate slug if name changed
      if (name !== existingGallery.name) {
        let slug = generateSlug(name);
        let slugSuffix = 1;

        while (await galleriesRepository.slugExists(slug, id)) {
          slug = `${generateSlug(name)}-${slugSuffix}`;
          slugSuffix++;
        }
        updateData.slug = slug;
      }
    }

    if (description !== undefined) updateData.description = description;
    if (eventDate !== undefined) {
      updateData.eventDate = eventDate ? new Date(eventDate) : null;
    }

    // Handle coverImage replacement with R2 cleanup
    if (coverImage !== undefined) {
      // Clean up old cover from R2 if being replaced
      if (existingGallery.coverImage && existingGallery.coverImage !== coverImage) {
        const oldR2Key = getR2KeyFromUrl(existingGallery.coverImage);
        if (oldR2Key) {
          try {
            await deleteFromR2(oldR2Key);
            galleriesLogger.info(
              { galleryId: id, r2Key: oldR2Key },
              'Stara naslovna slika obrisana iz R2'
            );
          } catch (r2Error) {
            galleriesLogger.error(
              { galleryId: id, r2Key: oldR2Key, error: r2Error },
              'Nije uspjelo brisanje stare naslovne slike iz R2'
            );
          }
        }
      }
      updateData.coverImage = coverImage;
    }

    const gallery = await galleriesRepository.update(id, updateData);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.GALLERY,
      entityId: gallery.id,
      changes: {
        before: existingGallery,
        after: gallery,
      },
    });

    galleriesLogger.info({ galleryId: id, slug: gallery.slug }, 'Galerija uspješno ažurirana');

    return apiSuccess(gallery);
  } catch (error) {
    galleriesLogger.error({ error }, 'Greška prilikom ažuriranja galerije');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom ažuriranja galerije',
      500
    );
  }
}

// DELETE /api/galleries/[id] - Delete gallery with R2 cleanup
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    const existingGallery = await galleriesRepository.findById(id);

    if (!existingGallery) {
      return apiError(
        ErrorCodes.NOT_FOUND,
        'Galerija je već obrisana ili nije pronađena',
        404
      );
    }

    // Delete from DB first (cascades to images)
    const deletedGallery = await galleriesRepository.delete(id);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.DELETE,
      entityType: AUDIT_ENTITY_TYPES.GALLERY,
      entityId: deletedGallery.id,
      changes: {
        before: existingGallery,
      },
    });

    const deletedKeys = new Set<string>();
    const deleteR2Key = async (
      r2Key: string,
      meta: Record<string, unknown>,
      successMessage: string,
      errorMessage: string
    ) => {
      if (deletedKeys.has(r2Key)) {
        return;
      }
      deletedKeys.add(r2Key);

      try {
        await deleteFromR2(r2Key);
        galleriesLogger.info({ ...meta, r2Key }, successMessage);
      } catch (r2Error) {
        galleriesLogger.error({ ...meta, r2Key, error: r2Error }, errorMessage);
      }
    };

    // Best-effort R2 deletion for cover image
    if (existingGallery.coverImage) {
      const r2Key = getR2KeyFromUrl(existingGallery.coverImage);
      if (r2Key) {
        await deleteR2Key(
          r2Key,
          { galleryId: id },
          'Naslovna slika obrisana iz R2',
          'Nije uspjelo brisanje naslovne slike iz R2 (DB zapis već obrisan)'
        );
      }
    }

    // Best-effort R2 deletion for all gallery images
    for (const image of existingGallery.images) {
      // Delete main image
      const imageR2Key = getR2KeyFromUrl(image.imageUrl);
      if (imageR2Key) {
        await deleteR2Key(
          imageR2Key,
          { galleryId: id, imageId: image.id },
          'Slika galerije obrisana iz R2',
          'Nije uspjelo brisanje slike galerije iz R2'
        );
      }

      // Delete thumbnail if exists
      if (image.thumbnailUrl) {
        const thumbnailR2Key = getR2KeyFromUrl(image.thumbnailUrl);
        if (thumbnailR2Key) {
          await deleteR2Key(
            thumbnailR2Key,
            { galleryId: id, imageId: image.id },
            'Sličica galerije obrisana iz R2',
            'Nije uspjelo brisanje sličice galerije iz R2'
          );
        }
      }
    }

    galleriesLogger.info(
      { galleryId: id, name: deletedGallery.name },
      'Galerija uspješno obrisana'
    );

    return apiSuccess({ deleted: true });
  } catch (error) {
    galleriesLogger.error({ error }, 'Greška prilikom brisanja galerije');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom brisanja galerije',
      500
    );
  }
}
