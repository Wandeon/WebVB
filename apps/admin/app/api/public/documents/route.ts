import { documentsRepository, type DocumentWithUploader } from '@repo/database';
import { DOCUMENT_CATEGORIES } from '@repo/shared';
import { z } from 'zod';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { documentsLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

const categoryKeys = Object.keys(DOCUMENT_CATEGORIES) as [
  keyof typeof DOCUMENT_CATEGORIES,
  ...Array<keyof typeof DOCUMENT_CATEGORIES>,
];

const publicDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.enum(categoryKeys).optional(),
  year: z.coerce.number().int().optional(),
});

const mapDocument = (doc: DocumentWithUploader) => ({
  id: doc.id,
  title: doc.title,
  fileUrl: doc.fileUrl,
  fileSize: doc.fileSize ?? 0,
  createdAt: doc.createdAt,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryResult = publicDocumentsQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      year: searchParams.get('year') ?? undefined,
    });

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { page, limit, category, year } = queryResult.data;

    const [documentsResult, years, counts] = await Promise.all([
      documentsRepository.findAll({ page, limit, category, year }),
      documentsRepository.getDistinctYears(),
      documentsRepository.getCategoryCounts(year),
    ]);

    return apiSuccess({
      documents: documentsResult.documents.map(mapDocument),
      pagination: documentsResult.pagination,
      years,
      counts,
    });
  } catch (error) {
    documentsLogger.error({ error }, 'Greška prilikom dohvaćanja dokumenata');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja dokumenata',
      500
    );
  }
}
