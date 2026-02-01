import { galleriesRepository, type GalleryWithCount } from '@repo/database';
import { z } from 'zod';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { galleriesLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

const publicGalleriesQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(12),
  })
  .strict();

const mapGallery = (gallery: GalleryWithCount) => ({
  id: gallery.id,
  name: gallery.name,
  slug: gallery.slug,
  coverImage: gallery.coverImage,
  eventDate: gallery.eventDate,
  imageCount: gallery._count.images,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryResult = publicGalleriesQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { page, limit } = queryResult.data;
    const result = await galleriesRepository.findPublished({ page, limit });

    return apiSuccess({
      galleries: result.galleries.map(mapGallery),
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
