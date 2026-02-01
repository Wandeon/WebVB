import { indexPage, pagesRepository } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, isReservedPageSlug } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { pagesLogger } from '@/lib/logger';
import { generateSlug } from '@/lib/utils/slug';
import { createPageSchema, pageQuerySchema } from '@/lib/validations/page';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);

    const queryResult = pageQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      parentId: searchParams.get('parentId') ?? undefined,
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

    const { page, limit, search, parentId, sortBy, sortOrder } = queryResult.data;

    const result = await pagesRepository.findAll({
      page,
      limit,
      search,
      parentId,
      sortBy,
      sortOrder,
    });

    return apiSuccess(result);
  } catch (error) {
    pagesLogger.error({ error }, 'Greška prilikom dohvaćanja stranica');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja stranica',
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    const validationResult = createPageSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { title, content, parentId, menuOrder } = validationResult.data;

    // Validate parent exists if provided
    if (parentId) {
      const parentExists = await pagesRepository.exists(parentId);
      if (!parentExists) {
        return apiError(ErrorCodes.NOT_FOUND, 'Nadređena stranica ne postoji', 404);
      }
    }

    // Generate unique slug
    let slug = generateSlug(title);
    let slugSuffix = 1;

    if (isReservedPageSlug(slug)) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Odabrani naslov koristi rezerviranu adresu. Promijenite naslov stranice.',
        400
      );
    }

    while (await pagesRepository.slugExists(slug)) {
      slug = `${generateSlug(title)}-${slugSuffix}`;
      slugSuffix++;
    }

    const page = await pagesRepository.create({
      title,
      slug,
      content,
      parentId: parentId ?? null,
      menuOrder: menuOrder ?? 0,
    });

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.CREATE,
      entityType: AUDIT_ENTITY_TYPES.PAGE,
      entityId: page.id,
      changes: {
        after: page,
      },
    });

    // Index for search
    await indexPage({
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
    });

    pagesLogger.info({ pageId: page.id, slug }, 'Stranica uspješno stvorena');

    return apiSuccess(page, 201);
  } catch (error) {
    pagesLogger.error({ error }, 'Greška prilikom stvaranja stranice');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom stvaranja stranice',
      500
    );
  }
}
