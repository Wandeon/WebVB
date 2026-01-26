import { galleriesRepository } from '@repo/database';
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return corsResponse(request);
}

// GET /api/public/galleries - Public galleries list for web app
export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  const { searchParams } = new URL(request.url);

  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');

  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const limit = limitParam ? Math.min(50, Math.max(1, parseInt(limitParam, 10) || 12)) : 12;

  try {
    const { galleries, pagination } = await galleriesRepository.findPublished({
      page,
      limit,
    });

    const response = {
      galleries: galleries.map((g) => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
        coverImage: g.coverImage,
        eventDate: g.eventDate?.toISOString() ?? null,
        _count: g._count,
      })),
      pagination,
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching public galleries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch galleries' },
      { status: 500, headers: corsHeaders }
    );
  }
}
