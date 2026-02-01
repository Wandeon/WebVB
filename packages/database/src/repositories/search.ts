import { db } from '../client';

export interface SearchIndexResultRow {
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
}

export interface SearchIndexOptions {
  query: string;
  prefixQuery: string;
  vectorString?: string | null;
  maxResults: number;
  weights: {
    keyword: number;
    fuzzy: number;
    semantic: number;
  };
  fallbackWeights?: {
    keyword: number;
    fuzzy: number;
  };
}

export async function searchIndex(options: SearchIndexOptions): Promise<SearchIndexResultRow[]> {
  const {
    query,
    prefixQuery,
    vectorString,
    maxResults,
    weights,
    fallbackWeights = { keyword: 0.6, fuzzy: 0.4 },
  } = options;

  if (vectorString) {
    return db.$queryRaw<SearchIndexResultRow[]>`
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
        (keyword_score * ${weights.keyword} +
         fuzzy_score * ${weights.fuzzy} +
         semantic_score * ${weights.semantic}) as combined_score
      FROM scores
      WHERE keyword_score > 0 OR fuzzy_score > 0.2 OR semantic_score > 0.5
      ORDER BY combined_score DESC
      LIMIT ${maxResults}
    `;
  }

  return db.$queryRaw<SearchIndexResultRow[]>`
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
      (keyword_score * ${fallbackWeights.keyword} + fuzzy_score * ${fallbackWeights.fuzzy}) as combined_score
    FROM scores
    WHERE keyword_score > 0 OR fuzzy_score > 0.2
    ORDER BY combined_score DESC
    LIMIT ${maxResults}
  `;
}
