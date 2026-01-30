import { db } from '@repo/database';
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { searchLogger } from '@/lib/logger';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  category: string | null;
  date: string | null;
  highlights: string;
  sourceType: string;
}

interface GroupedResults {
  posts: SearchResult[];
  documents: SearchResult[];
  pages: SearchResult[];
  events: SearchResult[];
}

interface SearchResponse {
  results: GroupedResults;
  totalCount: number;
  query: string;
}

const MAX_RESULTS_PER_TYPE = 5;
const MAX_TOTAL_RESULTS = 20;
const MIN_QUERY_LENGTH = 2;

export function OPTIONS(request: Request) {
  return corsResponse(request);
}

export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    // Use raw SQL for full-text search with ts_rank and ts_headline
    const results = await db.$queryRaw<
      {
        id: string;
        source_type: string;
        source_id: string;
        title: string;
        url: string;
        category: string | null;
        published_at: Date | null;
        rank: number;
        headline: string;
      }[]
    >`
      SELECT
        id,
        source_type,
        source_id,
        title,
        url,
        category,
        published_at,
        ts_rank(search_vector, plainto_tsquery('simple', ${query})) as rank,
        ts_headline(
          'simple',
          content_text,
          plainto_tsquery('simple', ${query}),
          'MaxWords=25, MinWords=15, StartSel=<mark>, StopSel=</mark>'
        ) as headline
      FROM search_index
      WHERE search_vector @@ plainto_tsquery('simple', ${query})
      ORDER BY rank DESC
      LIMIT ${MAX_TOTAL_RESULTS}
    `;

    // Group results by source type
    const grouped: GroupedResults = {
      posts: [],
      documents: [],
      pages: [],
      events: [],
    };

    // Map singular source_type to plural keys
    const typeMapping: Record<string, keyof GroupedResults> = {
      post: 'posts',
      document: 'documents',
      page: 'pages',
      event: 'events',
    };

    for (const row of results) {
      const result: SearchResult = {
        id: row.source_id,
        title: row.title,
        url: row.url,
        category: row.category,
        date: row.published_at?.toISOString().split('T')[0] ?? null,
        highlights: row.headline,
        sourceType: row.source_type,
      };

      const type = typeMapping[row.source_type];
      if (type && grouped[type].length < MAX_RESULTS_PER_TYPE) {
        grouped[type].push(result);
      }
    }

    const totalCount =
      grouped.posts.length +
      grouped.documents.length +
      grouped.pages.length +
      grouped.events.length;

    const response: SearchResponse = {
      results: grouped,
      totalCount,
      query,
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    searchLogger.error({ error }, 'Search error');
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500, headers: corsHeaders }
    );
  }
}
