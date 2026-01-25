import { pagesRepository } from '@repo/database';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { pagesLogger } from '@/lib/logger';
import { generateSlug } from '@/lib/utils/slug';
import { createPageSchema, pageQuerySchema } from '@/lib/validations/page';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryResult = pageQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      parentId: searchParams.get('parentId'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
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
