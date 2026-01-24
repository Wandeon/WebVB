import { documentsRepository } from '@repo/database';
import { createDocumentSchema, documentQuerySchema } from '@repo/shared';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { documentsLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

// GET /api/documents - List documents with filtering, pagination, sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryResult = documentQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      category: searchParams.get('category'),
      year: searchParams.get('year'),
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

    const { page, limit, search, category, year, sortBy, sortOrder } =
      queryResult.data;

    const result = await documentsRepository.findAll({
      page,
      limit,
      search,
      category,
      year,
      sortBy,
      sortOrder,
    });

    return apiSuccess({
      data: result.documents,
      pagination: result.pagination,
    });
  } catch (error) {
    documentsLogger.error({ error }, 'Failed to fetch documents');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška servera. Pokušajte ponovno.',
      500
    );
  }
}

// POST /api/documents - Create new document (metadata only, file already uploaded)
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    const validationResult = createDocumentSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { title, category, subcategory, year, fileUrl, fileSize } =
      validationResult.data;

    const document = await documentsRepository.create({
      title,
      fileUrl,
      fileSize,
      category,
      subcategory: subcategory ?? null,
      year: year ?? null,
      uploadedBy: null, // TODO: get from session when auth is added
    });

    documentsLogger.info(
      { documentId: document.id, category, title },
      'Document created successfully'
    );

    return apiSuccess(document, 201);
  } catch (error) {
    documentsLogger.error({ error }, 'Failed to create document');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška servera. Pokušajte ponovno.',
      500
    );
  }
}
