import { eventsRepository } from '@repo/database';
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return corsResponse(request);
}

// GET /api/public/events - Public events list for web app
export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  const { searchParams } = new URL(request.url);

  const upcoming = searchParams.get('upcoming') === 'true';
  const past = searchParams.get('past') === 'true';
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');

  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const limit = limitParam ? Math.min(50, Math.max(1, parseInt(limitParam, 10) || 10)) : 10;

  try {
    let result;

    if (past) {
      result = await eventsRepository.getPastEvents({ page, limit });
    } else if (upcoming) {
      result = await eventsRepository.findAll({ upcoming: true, page, limit });
    } else {
      result = await eventsRepository.findAll({ page, limit });
    }

    const response = {
      events: result.events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        eventDate: e.eventDate.toISOString(),
        eventTime: e.eventTime?.toISOString() ?? null,
        location: e.location,
        posterImage: e.posterImage,
      })),
      pagination: result.pagination,
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching public events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500, headers: corsHeaders }
    );
  }
}
