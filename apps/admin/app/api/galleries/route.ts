import { galleriesRepository } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { galleriesLogger } from '@/lib/logger';
import { triggerRebuild } from '@/lib/rebuild';
import { generateSlug } from '@/lib/utils/slug';
import { createGallerySchema, galleryQuerySchema } from '@/lib/validations/gallery';

import type { NextRequest } from 'next/server';

// GET /api/galleries - List galleries with filtering, pagination, sorting
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);

    const queryResult = galleryQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? undefined,
    });

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { page, limit, search, sortBy, sortOrder } = queryResult.data;

    const result = await galleriesRepository.findAll({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });

    return apiSuccess({
      data: result.galleries,
      pagination: result.pagination,
    });
  } catch (error) {
    galleriesLogger.error({ error }, 'Greška prilikom dohvaćanja galerija');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja galerija',
      500
    );
  }
}

// POST /api/galleries - Create new gallery
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    const validationResult = createGallerySchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { name, description, eventDate, coverImage } = validationResult.data;

    // Generate unique slug
    let slug = generateSlug(name);
    let slugSuffix = 1;

    while (await galleriesRepository.slugExists(slug)) {
      slug = `${generateSlug(name)}-${slugSuffix}`;
      slugSuffix++;
    }

    const gallery = await galleriesRepository.create({
      name,
      slug,
      description,
      eventDate: eventDate ? new Date(eventDate) : null,
      coverImage,
    });

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.CREATE,
      entityType: AUDIT_ENTITY_TYPES.GALLERY,
      entityId: gallery.id,
      changes: {
        after: gallery,
      },
    });

    galleriesLogger.info(
      { galleryId: gallery.id, slug },
      'Galerija uspješno stvorena'
    );

    triggerRebuild(`gallery-created:${gallery.id}`);

    return apiSuccess(gallery, 201);
  } catch (error) {
    galleriesLogger.error({ error }, 'Greška prilikom stvaranja galerije');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom stvaranja galerije',
      500
    );
  }
}
