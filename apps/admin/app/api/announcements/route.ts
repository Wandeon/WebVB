import { announcementsRepository, Prisma } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { announcementsLogger } from '@/lib/logger';
import { triggerRebuild } from '@/lib/rebuild';
import { generateSlug } from '@/lib/utils/slug';
import { announcementQuerySchema, createAnnouncementSchema } from '@/lib/validations/announcement';

import type { NextRequest } from 'next/server';

// GET /api/announcements - List announcements with filtering, pagination, sorting
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const queryResult = announcementQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      status: searchParams.get('status') ?? undefined,
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

    const { page, limit, search, category, status, sortBy, sortOrder } =
      queryResult.data;

    const result = await announcementsRepository.findAll({
      page,
      limit,
      search,
      category,
      status,
      sortBy,
      sortOrder,
    });

    return apiSuccess(result);
  } catch (error) {
    announcementsLogger.error({ error }, 'Greška prilikom dohvaćanja obavijesti');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja obavijesti',
      500
    );
  }
}

// POST /api/announcements - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    // Validate request body
    const validationResult = createAnnouncementSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
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

    // Generate unique slug with cap to prevent infinite loops
    const MAX_SLUG_ATTEMPTS = 10;
    let slug = generateSlug(title);
    let slugSuffix = 1;

    while (await announcementsRepository.slugExists(slug)) {
      if (slugSuffix > MAX_SLUG_ATTEMPTS) {
        return apiError(ErrorCodes.INTERNAL_ERROR, 'Ne mogu generirati jedinstveni slug', 500);
      }
      slug = `${generateSlug(title)}-${slugSuffix}`;
      slugSuffix++;
    }

    // Create announcement -- handle concurrent slug collision via unique constraint
    let announcement;
    try {
      announcement = await announcementsRepository.create({
        title,
        slug,
        content: content ?? null,
        excerpt: excerpt ?? null,
        category,
        validFrom: validFrom ?? null,
        validUntil: validUntil ?? null,
        publishedAt: publishedAt ?? null,
        authorId: authResult.context.userId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Slug collision from concurrent request -- retry with timestamp suffix
        slug = `${generateSlug(title)}-${Date.now().toString(36).slice(-4)}`;
        announcement = await announcementsRepository.create({
          title,
          slug,
          content: content ?? null,
          excerpt: excerpt ?? null,
          category,
          validFrom: validFrom ?? null,
          validUntil: validUntil ?? null,
          publishedAt: publishedAt ?? null,
          authorId: authResult.context.userId,
        });
      } else {
        throw error;
      }
    }

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.CREATE,
      entityType: AUDIT_ENTITY_TYPES.ANNOUNCEMENT,
      entityId: announcement.id,
      changes: {
        after: announcement,
      },
    });

    announcementsLogger.info(
      { announcementId: announcement.id, slug },
      'Obavijest uspješno stvorena'
    );

    if (announcement.publishedAt) {
      triggerRebuild(`announcement-created:${announcement.id}`);
    }

    return apiSuccess(announcement, 201);
  } catch (error) {
    announcementsLogger.error({ error }, 'Greška prilikom stvaranja obavijesti');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom stvaranja obavijesti',
      500
    );
  }
}
