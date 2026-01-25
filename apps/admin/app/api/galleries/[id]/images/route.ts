import { galleriesRepository } from '@repo/database';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { galleriesLogger } from '@/lib/logger';
import { addGalleryImagesSchema } from '@/lib/validations/gallery';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/galleries/[id]/images - Add images to gallery
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();

    // Validate gallery exists
    const galleryExists = await galleriesRepository.exists(id);

    if (!galleryExists) {
      return apiError(ErrorCodes.NOT_FOUND, 'Galerija nije pronađena', 404);
    }

    const validationResult = addGalleryImagesSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { images } = validationResult.data;

    const addedImages = await galleriesRepository.addImages(id, images);

    galleriesLogger.info(
      { galleryId: id, count: addedImages.length },
      'Slike uspješno dodane u galeriju'
    );

    return apiSuccess(addedImages, 201);
  } catch (error) {
    galleriesLogger.error({ error }, 'Greška prilikom dodavanja slika u galeriju');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dodavanja slika u galeriju',
      500
    );
  }
}
