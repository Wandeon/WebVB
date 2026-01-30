import { db } from '@repo/database';
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { searchLogger } from '@/lib/logger';

const OLLAMA_URL = process.env.OLLAMA_LOCAL_URL || 'http://127.0.0.1:11434';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  category: string | null;
  date: string | null;
  highlights: string;
  sourceType: string;
  score: number;
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

// Weights for hybrid scoring
const WEIGHTS = {
  keyword: 0.4,    // Full-text search
  fuzzy: 0.2,      // Typo tolerance
  semantic: 0.4,   // AI understanding
};

export function OPTIONS(request: Request) {
  return corsResponse(request);
}

async function getQueryEmbedding(query: string): Promise<number[] | null> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: query,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.embedding;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json(
      { results: { posts: [], documents: [], pages: [], events: [] }, totalCount: 0, query: query ?? '' },
      { headers: corsHeaders }
    );
  }

  try {
    // Build prefix search query for full-text search
    const prefixQuery = query
      .toLowerCase()
      .replace(/[&|!():*<>]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 2)
      .map(word => `${word}:*`)
      .join(' & ');

    // Get query embedding for semantic search (async, don't block if it fails)
    const embeddingPromise = getQueryEmbedding(query);

    // Hybrid search query combining:
    // 1. Full-text search with prefix matching (keyword_score)
    // 2. Trigram similarity for fuzzy/typo tolerance (fuzzy_score)
    // 3. Vector similarity for semantic search (semantic_score)

    const embedding = await embeddingPromise;
    const hasEmbedding = embedding !== null;
    const vectorString = hasEmbedding ? `[${embedding.join(',')}]` : null;

    let results: {
      id: string;
      source_type: string;
      source_id: string;
      title: string;
      url: string;
      category: string | null;
      published_at: Date | null;
      headline: string;
      keyword_score: number;
      fuzzy_score: number;
      semantic_score: number;
      combined_score: number;
    }[];

    if (hasEmbedding && vectorString) {
      // Full hybrid search with semantic
      results = await db.$queryRaw`
        WITH scores AS (
          SELECT
            id,
            source_type,
            source_id,
            title,
            url,
            category,
            published_at,
            content_text,
            -- Keyword score: full-text search with prefix matching
            CASE
              WHEN ${prefixQuery} = '' THEN 0
              WHEN search_vector @@ to_tsquery('simple', ${prefixQuery})
              THEN ts_rank(search_vector, to_tsquery('simple', ${prefixQuery}))
              ELSE 0
            END as keyword_score,
            -- Fuzzy score: trigram similarity for typo tolerance
            GREATEST(
              similarity(title, ${query}),
              similarity(LEFT(content_text, 1000), ${query})
            ) as fuzzy_score,
            -- Semantic score: vector cosine similarity (1 - distance)
            CASE
              WHEN embedding IS NOT NULL
              THEN 1 - (embedding <=> ${vectorString}::vector)
              ELSE 0
            END as semantic_score
          FROM search_index
        )
        SELECT
          id,
          source_type,
          source_id,
          title,
          url,
          category,
          published_at,
          ts_headline(
            'simple',
            content_text,
            to_tsquery('simple', ${prefixQuery}),
            'MaxWords=25, MinWords=15, StartSel=<mark>, StopSel=</mark>'
          ) as headline,
          keyword_score,
          fuzzy_score,
          semantic_score,
          -- Combined score with weights
          (keyword_score * ${WEIGHTS.keyword} +
           fuzzy_score * ${WEIGHTS.fuzzy} +
           semantic_score * ${WEIGHTS.semantic}) as combined_score
        FROM scores
        WHERE keyword_score > 0 OR fuzzy_score > 0.2 OR semantic_score > 0.5
        ORDER BY combined_score DESC
        LIMIT ${MAX_TOTAL_RESULTS}
      `;
    } else {
      // Fallback: keyword + fuzzy only (no semantic)
      results = await db.$queryRaw`
        WITH scores AS (
          SELECT
            id,
            source_type,
            source_id,
            title,
            url,
            category,
            published_at,
            content_text,
            CASE
              WHEN ${prefixQuery} = '' THEN 0
              WHEN search_vector @@ to_tsquery('simple', ${prefixQuery})
              THEN ts_rank(search_vector, to_tsquery('simple', ${prefixQuery}))
              ELSE 0
            END as keyword_score,
            GREATEST(
              similarity(title, ${query}),
              similarity(LEFT(content_text, 1000), ${query})
            ) as fuzzy_score,
            0::float as semantic_score
          FROM search_index
        )
        SELECT
          id,
          source_type,
          source_id,
          title,
          url,
          category,
          published_at,
          ts_headline(
            'simple',
            content_text,
            to_tsquery('simple', ${prefixQuery}),
            'MaxWords=25, MinWords=15, StartSel=<mark>, StopSel=</mark>'
          ) as headline,
          keyword_score,
          fuzzy_score,
          semantic_score,
          (keyword_score * 0.6 + fuzzy_score * 0.4) as combined_score
        FROM scores
        WHERE keyword_score > 0 OR fuzzy_score > 0.2
        ORDER BY combined_score DESC
        LIMIT ${MAX_TOTAL_RESULTS}
      `;
    }

    // Group results by source type
    const grouped: GroupedResults = {
      posts: [],
      documents: [],
      pages: [],
      events: [],
    };

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
        score: row.combined_score,
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
    searchLogger.error({ error, query }, 'Hybrid search error');
    return NextResponse.json(
      { error: 'Search failed', results: { posts: [], documents: [], pages: [], events: [] }, totalCount: 0, query },
      { status: 500, headers: corsHeaders }
    );
  }
}
