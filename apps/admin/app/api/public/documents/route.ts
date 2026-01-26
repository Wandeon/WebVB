import { documentsRepository } from '@repo/database';
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return corsResponse(request);
}

// GET /api/public/documents - Public documents list for web app
export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category') || undefined;
  const yearParam = searchParams.get('year');
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');

  const year = yearParam ? parseInt(yearParam, 10) : undefined;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const limit = limitParam ? Math.min(50, Math.max(1, parseInt(limitParam, 10) || 20)) : 20;

  try {
    const validYear = year && !isNaN(year) ? year : undefined;
    const [documentsResult, years, counts] = await Promise.all([
      documentsRepository.findAll({
        page,
        limit,
        ...(category && { category }),
        ...(validYear && { year: validYear }),
      }),
      documentsRepository.getDistinctYears(),
      documentsRepository.getCategoryCounts(validYear),
    ]);

    const response = {
      documents: documentsResult.documents.map((d) => ({
        id: d.id,
        title: d.title,
        fileUrl: d.fileUrl,
        fileSize: d.fileSize ?? 0,
        createdAt: d.createdAt.toISOString(),
      })),
      pagination: documentsResult.pagination,
      years,
      counts,
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching public documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500, headers: corsHeaders }
    );
  }
}
