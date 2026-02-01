import { announcementsRepository, type AnnouncementWithAuthor } from '@repo/database';
import { ANNOUNCEMENT_CATEGORIES } from '@repo/shared';
import { z } from 'zod';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { announcementsLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

const categoryKeys = Object.keys(ANNOUNCEMENT_CATEGORIES) as [
  keyof typeof ANNOUNCEMENT_CATEGORIES,
  ...Array<keyof typeof ANNOUNCEMENT_CATEGORIES>,
];

const publicAnnouncementsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(12),
    category: z.enum(categoryKeys).optional(),
    includeExpired: z.coerce.boolean().default(false),
  })
  .strict();

const mapAnnouncement = (announcement: AnnouncementWithAuthor) => ({
  id: announcement.id,
  title: announcement.title,
  excerpt: announcement.excerpt,
  slug: announcement.slug,
  category: announcement.category,
  validFrom: announcement.validFrom,
  validUntil: announcement.validUntil,
  publishedAt: announcement.publishedAt,
  attachments: announcement.attachments.map((att) => ({
    id: att.id,
    fileName: att.fileName,
    fileUrl: att.fileUrl,
    fileSize: att.fileSize,
    mimeType: att.mimeType,
  })),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryResult = publicAnnouncementsQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      includeExpired: searchParams.get('includeExpired') ?? undefined,
    });

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { page, limit, category, includeExpired } = queryResult.data;
    const result = await announcementsRepository.findPublished({
      page,
      limit,
      ...(category ? { category } : {}),
      activeOnly: !includeExpired,
    });

    return apiSuccess({
      announcements: result.announcements.map(mapAnnouncement),
      pagination: result.pagination,
    });
  } catch (error) {
    announcementsLogger.error({ error }, 'Greška prilikom dohvaćanja javnih obavijesti');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja obavijesti',
      500
    );
  }
}
