import { searchIndex, type SearchIndexResultRow } from '@repo/database';
import { getRuntimeEnv } from '@repo/shared';
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';
import { searchLogger } from '@/lib/logger';
import { getTextLogFields } from '@/lib/pii';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

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
const EMBEDDING_TIMEOUT_MS = 2000;
const EMBEDDING_CACHE_TTL_MS = 10 * 60 * 1000;
const EMBEDDING_CACHE_MAX_ENTRIES = 200;
const SEARCH_RATE_LIMIT = 30;
const SEARCH_RATE_WINDOW = 60 * 1000; // 1 minute

// Weights for hybrid scoring
const WEIGHTS = {
  keyword: 0.4,    // Full-text search
  fuzzy: 0.2,      // Typo tolerance
  semantic: 0.4,   // AI understanding
};

type EmbeddingCacheEntry = {
  value: number[];
  expiresAt: number;
};

const embeddingCache = new Map<string, EmbeddingCacheEntry>();

function getCachedEmbedding(key: string): number[] | null {
  const entry = embeddingCache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    embeddingCache.delete(key);
    return null;
  }

  return entry.value;
}

function setCachedEmbedding(key: string, value: number[]): void {
  if (embeddingCache.has(key)) {
    embeddingCache.delete(key);
  }

  embeddingCache.set(key, { value, expiresAt: Date.now() + EMBEDDING_CACHE_TTL_MS });

  if (embeddingCache.size > EMBEDDING_CACHE_MAX_ENTRIES) {
    const oldestKey = embeddingCache.keys().next().value;
    if (oldestKey) {
      embeddingCache.delete(oldestKey);
    }
  }
}

export function OPTIONS(request: Request) {
  return corsResponse(request);
}

function getOllamaUrl(): string {
  const { OLLAMA_LOCAL_URL } = getRuntimeEnv();
  return OLLAMA_LOCAL_URL ?? 'http://127.0.0.1:11434';
}

async function getQueryEmbedding(query: string, ollamaUrl: string): Promise<number[] | null> {
  const cacheKey = query.toLowerCase();
  const cached = getCachedEmbedding(cacheKey);
  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EMBEDDING_TIMEOUT_MS);
  try {
    const response = await fetch(`${ollamaUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: query,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data = await response.json() as { embedding?: number[] };
    if (!data.embedding) {
      return null;
    }

    setCachedEmbedding(cacheKey, data.embedding);
    return data.embedding;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }

    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  // Rate limit check
  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(`search:${ip}`, SEARCH_RATE_LIMIT, SEARCH_RATE_WINDOW);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Previše zahtjeva. Pokušajte ponovno.', results: { posts: [], documents: [], pages: [], events: [] }, totalCount: 0, query: '' },
      { status: 429, headers: { ...corsHeaders, 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
    );
  }

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
    const embeddingPromise = getQueryEmbedding(query, getOllamaUrl());

    // Hybrid search query combining:
    // 1. Full-text search with prefix matching (keyword_score)
    // 2. Trigram similarity for fuzzy/typo tolerance (fuzzy_score)
    // 3. Vector similarity for semantic search (semantic_score)

    const embedding = await embeddingPromise;
    const hasEmbedding = embedding !== null;
    const vectorString = hasEmbedding ? `[${embedding.join(',')}]` : null;

    const results: SearchIndexResultRow[] = await searchIndex({
      query,
      prefixQuery,
      vectorString: hasEmbedding ? vectorString : null,
      maxResults: MAX_TOTAL_RESULTS,
      weights: WEIGHTS,
    });

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
    searchLogger.error({ error, ...getTextLogFields(query) }, 'Hybrid search error');
    return NextResponse.json(
      { error: 'Search failed', results: { posts: [], documents: [], pages: [], events: [] }, totalCount: 0, query },
      { status: 500, headers: corsHeaders }
    );
  }
}
