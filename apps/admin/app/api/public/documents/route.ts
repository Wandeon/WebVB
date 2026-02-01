import { documentsRepository, type DocumentWithUploader } from '@repo/database';
import { DOCUMENT_CATEGORIES } from '@repo/shared';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { documentsLogger } from '@/lib/logger';

const categoryKeys = Object.keys(DOCUMENT_CATEGORIES) as [
  keyof typeof DOCUMENT_CATEGORIES,
  ...Array<keyof typeof DOCUMENT_CATEGORIES>,
];

const publicDocumentsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    category: z.enum(categoryKeys).optional(),
    year: z.coerce.number().int().optional(),
  })
  .strict();

const mapDocument = (doc: DocumentWithUploader) => ({
  id: doc.id,
  title: doc.title,
  fileUrl: doc.fileUrl,
  fileSize: doc.fileSize ?? 0,
  createdAt: doc.createdAt,
});

// Handle CORS preflight
export function OPTIONS(request: Request) {
  return corsResponse(request);
}

export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const { searchParams } = new URL(request.url);
    const queryResult = publicDocumentsQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      year: searchParams.get('year') ?? undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Nevaljani parametri upita' } },
        { status: 400, headers: corsHeaders }
      );
    }

    const { page, limit, category, year } = queryResult.data;

    const [documentsResult, years, counts] = await Promise.all([
      documentsRepository.findAll({ page, limit, category, year }),
      documentsRepository.getDistinctYears(),
      documentsRepository.getCategoryCounts(year),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          documents: documentsResult.documents.map(mapDocument),
          pagination: documentsResult.pagination,
          years,
          counts,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    documentsLogger.error({ error }, 'Greška prilikom dohvaćanja dokumenata');
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Greška prilikom dohvaćanja dokumenata' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
