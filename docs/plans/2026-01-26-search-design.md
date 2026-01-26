# Search (Basic) Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add global search with Cmd+K shortcut, PostgreSQL full-text search, and grouped results.

**Architecture:** Search modal triggered by header input (desktop) or icon (mobile) and Cmd+K shortcut. API queries SearchIndex table using tsvector. Results grouped by type with relevance scoring.

**Tech Stack:** Next.js App Router, PostgreSQL tsvector/tsquery, Radix Dialog, localStorage for recent searches.

---

## User Experience

### Search Triggers
- **Desktop**: Search input field in header, clicking opens modal with focus
- **Mobile**: Search icon in header, tapping opens full-screen modal
- **Keyboard**: Cmd+K (Mac) / Ctrl+K (Windows) opens modal globally

### Search Modal
- Large search input with autofocus
- Debounced input (150ms)
- Shows recent searches when empty
- Grouped results by type (Vijesti, Dokumenti, Stranice, Događanja)
- Top 2-3 results per group based on relevance
- Keyboard navigation (↑↓ to navigate, Enter to select, Esc to close)
- Highlighted matching text in results
- Mobile: Full-screen modal

### Result Item Display
- Icon by content type
- Title with highlighted matches
- Short excerpt/description with highlighted matches
- Category/date metadata
- Click navigates to content page

---

## Technical Architecture

### Components

```
packages/ui/src/components/
├── search-trigger.tsx      # Header search (input desktop, icon mobile)
├── search-modal.tsx        # Main search dialog
├── search-results.tsx      # Grouped results display
├── search-result-item.tsx  # Individual result with highlighting
└── search-modal.test.tsx   # Tests

packages/ui/src/hooks/
├── use-search.ts           # Search state, debounce, keyboard nav
└── use-recent-searches.ts  # localStorage management
```

### API Route

```
apps/web/app/api/search/route.ts
GET /api/search?q=<query>

Response:
{
  results: {
    posts: [{ id, title, excerpt, url, category, publishedAt, highlights }],
    documents: [{ id, title, url, category, year, highlights }],
    pages: [{ id, title, url, highlights }],
    events: [{ id, title, url, eventDate, highlights }]
  },
  totalCount: number,
  query: string
}
```

### Database Query

```sql
SELECT
  source_type,
  source_id,
  title,
  url,
  category,
  published_at,
  ts_rank(search_vector, query) AS rank,
  ts_headline('croatian', content_text, query,
    'StartSel=<mark>, StopSel=</mark>, MaxWords=20, MinWords=10'
  ) AS highlights
FROM search_index,
  plainto_tsquery('croatian', $1) query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;
```

### SearchIndex Population

Modify admin API routes to maintain SearchIndex:

**On Create/Update:**
```typescript
// After saving content
await prisma.searchIndex.upsert({
  where: { sourceType_sourceId: { sourceType: 'post', sourceId: post.id } },
  create: {
    sourceType: 'post',
    sourceId: post.id,
    title: post.title,
    contentText: stripHtml(post.content),
    category: post.category,
    url: `/vijesti/${post.slug}`,
    publishedAt: post.publishedAt,
  },
  update: { ... }
});

// Update tsvector via raw query
await prisma.$executeRaw`
  UPDATE search_index
  SET search_vector = to_tsvector('croatian', title || ' ' || content_text)
  WHERE source_id = ${post.id}
`;
```

**On Delete:**
```typescript
await prisma.searchIndex.delete({
  where: { sourceType_sourceId: { sourceType: 'post', sourceId: post.id } }
});
```

---

## Content Type Mapping

| Source | sourceType | URL Pattern | Category Field |
|--------|------------|-------------|----------------|
| Post | `post` | `/vijesti/{slug}` | category |
| Document | `document` | `/dokumenti?doc={id}` | category |
| Page | `page` | `/{slug}` | null |
| Event | `event` | `/dogadanja/{id}` | null |

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| Cmd/Ctrl+K | Open search modal |
| Escape | Close modal |
| ↑ / ↓ | Navigate results |
| Enter | Go to selected result |
| Tab | Move between groups |

---

## Recent Searches

Stored in localStorage:
```typescript
interface RecentSearch {
  query: string;
  timestamp: number;
}

// Key: 'velikibukovec-recent-searches'
// Max: 5 recent searches
// Clear individual or all
```

---

## Mobile Considerations

- Full-screen modal on mobile (< 768px)
- Touch-friendly result items (min 44px tap targets)
- No keyboard shortcut hints on mobile
- Swipe down to close (optional, native dialog behavior)

---

## Error Handling

- Empty query: Show recent searches
- No results: "Nema rezultata za '{query}'"
- API error: "Greška pri pretraživanju. Pokušajte ponovno."
- Loading state: Skeleton or spinner in results area

---

## Performance

- Debounce: 150ms to reduce API calls
- Limit: 20 total results (5 per type max)
- Index: GIN index on search_vector column
- Caching: Consider SWR/React Query for result caching

---

## Croatian Language Support

PostgreSQL Croatian text search configuration:
```sql
-- Check if Croatian config exists
SELECT * FROM pg_ts_config WHERE cfgname = 'croatian';

-- If not, use 'simple' or create custom
-- For MVP, 'simple' config works for basic tokenization
```

Note: PostgreSQL may not have built-in Croatian stemming. Use 'simple' configuration which does basic word tokenization without stemming. This still enables full-text search with ranking.
