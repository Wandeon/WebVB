import { eventsRepository } from '@repo/database';
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return corsResponse(request);
}

// GET /api/public/events/calendar - Calendar events for a specific month
export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  const { searchParams } = new URL(request.url);

  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');

  const now = new Date();
  const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;

  // Validate year and month
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json(
      { error: 'Invalid year or month' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const events = await eventsRepository.getEventsByMonth(year, month);

    const response = {
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        eventDate: e.eventDate.toISOString(),
      })),
      year,
      month,
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500, headers: corsHeaders }
    );
  }
}
