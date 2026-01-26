import { db } from '../client';

export type SourceType = 'post' | 'document' | 'page' | 'event';

export interface IndexablePost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string;
  publishedAt: Date | null;
}

export interface IndexableDocument {
  id: string;
  title: string;
  fileUrl: string;
  category: string;
  subcategory: string | null;
  year: number | null;
}

export interface IndexablePage {
  id: string;
  title: string;
  slug: string;
  content: string;
}

export interface IndexableEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: Date;
  location: string | null;
}

/**
 * Strip HTML tags from content for plain text indexing
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Index a post into the SearchIndex table
 * Only indexes published posts (publishedAt not null)
 */
export async function indexPost(post: IndexablePost): Promise<void> {
  if (!post.publishedAt) {
    // Don't index unpublished posts
    await removeFromIndex('post', post.id);
    return;
  }

  const contentText = [
    post.title,
    stripHtml(post.content),
    post.excerpt ?? '',
  ].join(' ');

  const url = `/vijesti/${post.slug}`;

  await upsertSearchIndex({
    sourceType: 'post',
    sourceId: post.id,
    title: post.title,
    contentText,
    category: post.category,
    url,
    publishedAt: post.publishedAt,
  });
}

/**
 * Index a document into the SearchIndex table
 */
export async function indexDocument(doc: IndexableDocument): Promise<void> {
  const contentText = [
    doc.title,
    doc.category,
    doc.subcategory ?? '',
    doc.year?.toString() ?? '',
  ].join(' ');

  const url = doc.fileUrl;

  await upsertSearchIndex({
    sourceType: 'document',
    sourceId: doc.id,
    title: doc.title,
    contentText,
    category: doc.category,
    url,
    publishedAt: null,
  });
}

/**
 * Index a static page into the SearchIndex table
 */
export async function indexPage(page: IndexablePage): Promise<void> {
  const contentText = [page.title, stripHtml(page.content)].join(' ');

  const url = `/${page.slug}`;

  await upsertSearchIndex({
    sourceType: 'page',
    sourceId: page.id,
    title: page.title,
    contentText,
    category: null,
    url,
    publishedAt: null,
  });
}

/**
 * Index an event into the SearchIndex table
 */
export async function indexEvent(event: IndexableEvent): Promise<void> {
  const contentText = [
    event.title,
    event.description ?? '',
    event.location ?? '',
  ].join(' ');

  const url = `/dogadanja/${event.id}`;

  await upsertSearchIndex({
    sourceType: 'event',
    sourceId: event.id,
    title: event.title,
    contentText,
    category: null,
    url,
    publishedAt: event.eventDate,
  });
}

/**
 * Remove an entry from the SearchIndex
 */
export async function removeFromIndex(
  sourceType: SourceType,
  sourceId: string
): Promise<void> {
  await db.searchIndex.deleteMany({
    where: {
      sourceType,
      sourceId,
    },
  });
}

interface UpsertData {
  sourceType: SourceType;
  sourceId: string;
  title: string;
  contentText: string;
  category: string | null;
  url: string;
  publishedAt: Date | null;
}

/**
 * Upsert a search index entry and update the tsvector
 */
async function upsertSearchIndex(data: UpsertData): Promise<void> {
  // Use raw SQL for upsert with tsvector update
  await db.$executeRaw`
    INSERT INTO search_index (
      id, source_type, source_id, title, content_text, category, url, published_at, search_vector, updated_at
    ) VALUES (
      gen_random_uuid(),
      ${data.sourceType},
      ${data.sourceId},
      ${data.title},
      ${data.contentText},
      ${data.category},
      ${data.url},
      ${data.publishedAt},
      to_tsvector('simple', ${data.title} || ' ' || ${data.contentText}),
      NOW()
    )
    ON CONFLICT (source_type, source_id) DO UPDATE SET
      title = EXCLUDED.title,
      content_text = EXCLUDED.content_text,
      category = EXCLUDED.category,
      url = EXCLUDED.url,
      published_at = EXCLUDED.published_at,
      search_vector = to_tsvector('simple', EXCLUDED.title || ' ' || EXCLUDED.content_text),
      updated_at = NOW()
  `;
}
