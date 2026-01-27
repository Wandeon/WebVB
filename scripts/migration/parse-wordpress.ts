/**
 * WordPress XML Export Parser
 * Sprint 4.3: Migration Scripts
 *
 * Parses WordPress WXR export and outputs JSON for database import.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Category mapping: WordPress slug → new system
const CATEGORY_MAP: Record<string, string> = {
  novosti: 'opcinske-vijesti',
  obavijesti_juo: 'obavijesti',
  dogadanja: 'dogadanja',
  istaknuti: 'opcinske-vijesti', // Featured posts go to main news
};

interface WPPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  status: string;
  author: string;
  categories: string[];
  tags: string[];
  featuredImageId: number | null;
  isFeatured: boolean;
  oldUrl: string;
}

interface WPPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  date: string;
  modified: string;
  status: string;
  parentId: number;
  menuOrder: number;
  oldUrl: string;
}

interface WPAttachment {
  id: number;
  title: string;
  url: string;
  filename: string;
  mimeType: string;
  date: string;
}

interface ParseResult {
  posts: WPPost[];
  pages: WPPage[];
  attachments: WPAttachment[];
  urlMap: Record<string, string>; // old URL → new URL
}

function extractCDATA(text: string): string {
  const match = text.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return match ? match[1] : text.replace(/<[^>]+>/g, '').trim();
}

function parseItems(xml: string): ParseResult {
  const posts: WPPost[] = [];
  const pages: WPPage[] = [];
  const attachments: WPAttachment[] = [];
  const urlMap: Record<string, string> = {};

  // Split by <item> tags
  const items = xml.split('<item>').slice(1);

  for (const item of items) {
    const postType = extractField(item, 'wp:post_type');
    const status = extractField(item, 'wp:status');

    // Skip drafts, trash, and non-content types
    if (status !== 'publish' && status !== 'inherit') continue;

    if (postType === 'post') {
      const post = parsePost(item);
      if (post) {
        posts.push(post);
        // Map old URL to new
        const newSlug = `/vijesti/${post.slug}`;
        urlMap[post.oldUrl] = newSlug;
      }
    } else if (postType === 'page') {
      const page = parsePage(item);
      if (page) {
        pages.push(page);
        urlMap[page.oldUrl] = `/${page.slug}`;
      }
    } else if (postType === 'attachment') {
      const attachment = parseAttachment(item);
      if (attachment) {
        attachments.push(attachment);
      }
    }
  }

  return { posts, pages, attachments, urlMap };
}

function extractField(item: string, field: string): string {
  const regex = new RegExp(`<${field}>([\\s\\S]*?)</${field}>`);
  const match = item.match(regex);
  if (!match) return '';
  return extractCDATA(match[1]);
}

function extractCategories(item: string): string[] {
  const categories: string[] = [];
  const regex = /<category domain="category" nicename="([^"]+)"/g;
  let match;
  while ((match = regex.exec(item)) !== null) {
    categories.push(match[1]);
  }
  return categories;
}

function extractTags(item: string): string[] {
  const tags: string[] = [];
  const regex = /<category domain="post_tag" nicename="([^"]+)"/g;
  let match;
  while ((match = regex.exec(item)) !== null) {
    tags.push(match[1]);
  }
  return tags;
}

function extractMeta(item: string, key: string): string | null {
  const regex = new RegExp(
    `<wp:postmeta>[\\s\\S]*?<wp:meta_key><!\\[CDATA\\[${key}\\]\\]></wp:meta_key>[\\s\\S]*?<wp:meta_value><!\\[CDATA\\[([^\\]]*?)\\]\\]></wp:meta_value>[\\s\\S]*?</wp:postmeta>`
  );
  const match = item.match(regex);
  return match ? match[1] : null;
}

function parsePost(item: string): WPPost | null {
  const id = parseInt(extractField(item, 'wp:post_id'), 10);
  const title = extractField(item, 'title');
  const slug = extractField(item, 'wp:post_name');
  const content = extractField(item, 'content:encoded');
  const excerpt = extractField(item, 'excerpt:encoded');
  const date = extractField(item, 'wp:post_date');
  const modified = extractField(item, 'wp:post_modified');
  const status = extractField(item, 'wp:status');
  const author = extractField(item, 'dc:creator');
  const categories = extractCategories(item);
  const tags = extractTags(item);
  const oldUrl = extractField(item, 'link');

  // Get featured image ID from meta
  const thumbnailIdStr = extractMeta(item, '_thumbnail_id');
  const featuredImageId = thumbnailIdStr ? parseInt(thumbnailIdStr, 10) : null;

  // Check if post is featured
  const isFeatured = categories.includes('istaknuti');

  if (!title || !slug) return null;

  return {
    id,
    title,
    slug,
    content: cleanContent(content),
    excerpt: excerpt || generateExcerpt(content),
    date,
    modified,
    status,
    author,
    categories: categories.map((c) => CATEGORY_MAP[c] || c).filter((c) => c !== 'istaknuti'),
    tags,
    featuredImageId,
    isFeatured,
    oldUrl,
  };
}

function parsePage(item: string): WPPage | null {
  const id = parseInt(extractField(item, 'wp:post_id'), 10);
  const title = extractField(item, 'title');
  const slug = extractField(item, 'wp:post_name');
  const content = extractField(item, 'content:encoded');
  const date = extractField(item, 'wp:post_date');
  const modified = extractField(item, 'wp:post_modified');
  const status = extractField(item, 'wp:status');
  const parentId = parseInt(extractField(item, 'wp:post_parent'), 10) || 0;
  const menuOrder = parseInt(extractField(item, 'wp:menu_order'), 10) || 0;
  const oldUrl = extractField(item, 'link');

  if (!title || !slug) return null;

  return {
    id,
    title,
    slug,
    content: cleanContent(content),
    date,
    modified,
    status,
    parentId,
    menuOrder,
    oldUrl,
  };
}

function parseAttachment(item: string): WPAttachment | null {
  const id = parseInt(extractField(item, 'wp:post_id'), 10);
  const title = extractField(item, 'title');
  const url = extractField(item, 'wp:attachment_url');
  const date = extractField(item, 'wp:post_date');

  if (!url) return null;

  const filename = url.split('/').pop() || '';
  const mimeType = extractField(item, 'wp:post_mime_type') || 'application/octet-stream';

  return {
    id,
    title,
    url,
    filename,
    mimeType,
    date,
  };
}

function cleanContent(html: string): string {
  if (!html) return '';

  let cleaned = html
    // Remove WordPress more tag
    .replace(/<!--more-->/g, '')
    // Remove empty paragraphs
    .replace(/<p>\s*<\/p>/g, '')
    // Remove Elementor artifacts
    .replace(/\[elementor[^\]]*\]/g, '')
    .replace(/<!-- wp:[^>]+-->/g, '')
    .replace(/<!-- \/wp:[^>]+-->/g, '')
    // Clean up excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
}

function generateExcerpt(content: string, maxLength = 200): string {
  // Strip HTML tags
  const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

function convertToTipTapJSON(html: string): object {
  // Basic conversion - for complex content, this would need enhancement
  const paragraphs = html
    .split(/<\/?p[^>]*>/i)
    .filter((p) => p.trim())
    .map((p) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: p.replace(/<[^>]+>/g, '').trim() }],
    }))
    .filter((p) => p.content[0].text);

  return {
    type: 'doc',
    content: paragraphs.length > 0 ? paragraphs : [{ type: 'paragraph', content: [] }],
  };
}

// Main execution
const xmlPath = process.argv[2] || join(process.cwd(), 'opinavelikibukovec.WordPress.2026-01-26.xml');
const outputDir = join(process.cwd(), 'scripts/migration/output');

console.log(`Reading WordPress export from: ${xmlPath}`);
const xml = readFileSync(xmlPath, 'utf-8');

console.log('Parsing content...');
const result = parseItems(xml);

console.log(`Found:`);
console.log(`  - ${result.posts.length} posts`);
console.log(`  - ${result.pages.length} pages`);
console.log(`  - ${result.attachments.length} attachments`);

// Create output directory
import { mkdirSync } from 'fs';
try {
  mkdirSync(outputDir, { recursive: true });
} catch {
  // Directory exists
}

// Write outputs
writeFileSync(join(outputDir, 'posts.json'), JSON.stringify(result.posts, null, 2));
writeFileSync(join(outputDir, 'pages.json'), JSON.stringify(result.pages, null, 2));
writeFileSync(join(outputDir, 'attachments.json'), JSON.stringify(result.attachments, null, 2));
writeFileSync(join(outputDir, 'url-map.json'), JSON.stringify(result.urlMap, null, 2));

// Generate TipTap content for posts
const postsWithTipTap = result.posts.map((post) => ({
  ...post,
  tipTapContent: convertToTipTapJSON(post.content),
}));
writeFileSync(join(outputDir, 'posts-tiptap.json'), JSON.stringify(postsWithTipTap, null, 2));

console.log(`\nOutput written to: ${outputDir}/`);
console.log('  - posts.json');
console.log('  - posts-tiptap.json');
console.log('  - pages.json');
console.log('  - attachments.json');
console.log('  - url-map.json');

// Print category distribution
const categoryCount: Record<string, number> = {};
for (const post of result.posts) {
  for (const cat of post.categories) {
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  }
}
console.log('\nCategory distribution:');
for (const [cat, count] of Object.entries(categoryCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  - ${cat}: ${count}`);
}
