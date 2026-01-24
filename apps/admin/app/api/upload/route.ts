import { randomUUID } from 'crypto';

import sharp from 'sharp';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { postsLogger } from '@/lib/logger';
import { deleteFromR2, uploadToR2 } from '@/lib/r2';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageVariants {
  id: string;
  thumb: string;
  medium: string;
  large: string;
}

async function processAndUpload(
  buffer: Buffer,
  id: string
): Promise<ImageVariants> {
  const sharpInstance = sharp(buffer);

  // Generate variants
  const [thumbBuffer, mediumBuffer, largeBuffer] = await Promise.all([
    sharpInstance.clone().resize(150, 150, { fit: 'cover' }).webp({ quality: 80 }).toBuffer(),
    sharpInstance.clone().resize(800, null, { withoutEnlargement: true }).webp({ quality: 85 }).toBuffer(),
    sharpInstance.clone().resize(1920, null, { withoutEnlargement: true }).webp({ quality: 90 }).toBuffer(),
  ]);

  // Upload all variants
  const [thumbUrl, mediumUrl, largeUrl] = await Promise.all([
    uploadToR2(`uploads/${id}/thumb.webp`, thumbBuffer, 'image/webp'),
    uploadToR2(`uploads/${id}/medium.webp`, mediumBuffer, 'image/webp'),
    uploadToR2(`uploads/${id}/large.webp`, largeBuffer, 'image/webp'),
  ]);

  return {
    id,
    thumb: thumbUrl,
    medium: mediumUrl,
    large: largeUrl,
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 'Datoteka nije odabrana', 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 'Dozvoljeni formati: JPEG, PNG, WebP, GIF', 400);
    }

    if (file.size > MAX_SIZE) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 'Maksimalna veličina je 10MB', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const id = randomUUID();

    const variants = await processAndUpload(buffer, id);

    postsLogger.info({ imageId: id }, 'Image uploaded successfully');

    return apiSuccess(variants);
  } catch (error) {
    postsLogger.error({ error }, 'Failed to upload image');
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Greška pri učitavanju slike', 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 'ID slike je obavezan', 400);
    }

    await Promise.all([
      deleteFromR2(`uploads/${id}/thumb.webp`),
      deleteFromR2(`uploads/${id}/medium.webp`),
      deleteFromR2(`uploads/${id}/large.webp`),
    ]);

    postsLogger.info({ imageId: id }, 'Image deleted successfully');

    return apiSuccess({ deleted: true });
  } catch (error) {
    postsLogger.error({ error }, 'Failed to delete image');
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Greška pri brisanju slike', 500);
  }
}
