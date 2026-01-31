/**
 * Empty Content Audit Script
 *
 * Identifies pages and posts with empty, null, or very short content.
 * Generates a markdown report for content review.
 *
 * Run with: pnpm tsx scripts/audit/list-empty-content.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const db = new PrismaClient({
  log: ['error'],
});

// Character threshold for "thin" content
const MIN_CONTENT_CHARS = 50;

interface EmptyPage {
  id: string;
  slug: string;
  title: string;
  status: string;
  contentLength: number;
}

interface EmptyPost {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  contentLength: number;
}

interface PostMissingExcerpt {
  id: string;
  slug: string;
  title: string;
  type: string;
}

/**
 * Strip HTML tags and get plain text length
 */
function getContentLength(html: string | null): number {
  if (!html || html.trim() === '') {
    return 0;
  }
  // Strip HTML tags
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length;
}

/**
 * Determine if content is empty or too short
 */
function isEmptyOrThin(content: string | null): boolean {
  return getContentLength(content) < MIN_CONTENT_CHARS;
}

/**
 * Find pages with empty or thin content
 */
async function findEmptyPages(): Promise<EmptyPage[]> {
  const pages = await db.page.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
    },
    orderBy: { title: 'asc' },
  });

  const emptyPages: EmptyPage[] = [];

  for (const page of pages) {
    if (isEmptyOrThin(page.content)) {
      emptyPages.push({
        id: page.id,
        slug: page.slug,
        title: page.title,
        status: 'published', // Pages don't have a status field - all are published
        contentLength: getContentLength(page.content),
      });
    }
  }

  return emptyPages;
}

/**
 * Find posts with empty or thin content
 */
async function findEmptyPosts(): Promise<EmptyPost[]> {
  const posts = await db.post.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      category: true,
      publishedAt: true,
    },
    orderBy: { title: 'asc' },
  });

  const emptyPosts: EmptyPost[] = [];

  for (const post of posts) {
    if (isEmptyOrThin(post.content)) {
      emptyPosts.push({
        id: post.id,
        slug: post.slug,
        title: post.title,
        type: post.category,
        status: post.publishedAt ? 'published' : 'draft',
        contentLength: getContentLength(post.content),
      });
    }
  }

  return emptyPosts;
}

/**
 * Find published posts missing excerpts
 */
async function findPostsMissingExcerpts(): Promise<PostMissingExcerpt[]> {
  const posts = await db.post.findMany({
    where: {
      publishedAt: { not: null },
      OR: [{ excerpt: null }, { excerpt: '' }],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
    },
    orderBy: { title: 'asc' },
  });

  return posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    type: post.category,
  }));
}

/**
 * Generate markdown report
 */
function generateReport(
  emptyPages: EmptyPage[],
  emptyPosts: EmptyPost[],
  postsMissingExcerpts: PostMissingExcerpt[]
): string {
  const now = new Date().toISOString().split('T')[0];
  const lines: string[] = [];

  lines.push('# Empty Content Report');
  lines.push('');
  lines.push(`> Generated: ${now}`);
  lines.push(`> Threshold: Content < ${MIN_CONTENT_CHARS} characters is considered empty/thin`);
  lines.push('');

  // Summary
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Empty/thin pages: **${emptyPages.length}**`);
  lines.push(`- Empty/thin posts: **${emptyPosts.length}**`);
  lines.push(`- Published posts missing excerpts: **${postsMissingExcerpts.length}**`);
  lines.push('');

  // Empty Pages
  lines.push('## Empty Pages');
  lines.push('');
  if (emptyPages.length === 0) {
    lines.push('No empty pages found.');
  } else {
    lines.push('| ID | Slug | Title | Status |');
    lines.push('|----|------|-------|--------|');
    for (const page of emptyPages) {
      lines.push(
        `| \`${page.id.slice(0, 8)}...\` | \`${page.slug}\` | ${page.title} | ${page.status} |`
      );
    }
  }
  lines.push('');

  // Empty Posts
  lines.push('## Empty Posts');
  lines.push('');
  if (emptyPosts.length === 0) {
    lines.push('No empty posts found.');
  } else {
    lines.push('| ID | Slug | Title | Type | Status |');
    lines.push('|----|------|-------|------|--------|');
    for (const post of emptyPosts) {
      lines.push(
        `| \`${post.id.slice(0, 8)}...\` | \`${post.slug}\` | ${post.title} | ${post.type} | ${post.status} |`
      );
    }
  }
  lines.push('');

  // Published Posts Missing Excerpts
  lines.push('## Published Posts Missing Excerpts');
  lines.push('');
  if (postsMissingExcerpts.length === 0) {
    lines.push('No published posts missing excerpts.');
  } else {
    lines.push('| ID | Slug | Title | Type |');
    lines.push('|----|------|-------|------|');
    for (const post of postsMissingExcerpts) {
      lines.push(
        `| \`${post.id.slice(0, 8)}...\` | \`${post.slug}\` | ${post.title} | ${post.type} |`
      );
    }
  }
  lines.push('');

  // Action Items
  lines.push('## Action Items');
  lines.push('');
  lines.push('Review each item and decide:');
  lines.push('- **Delete**: Remove content that is no longer needed');
  lines.push('- **Generate**: Create content using AI or manual writing');
  lines.push('- **Keep**: Content is intentionally minimal (e.g., redirect pages)');
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('*Generated by scripts/audit/list-empty-content.ts*');
  lines.push('');

  return lines.join('\n');
}

/**
 * Write report to file
 */
function writeReport(content: string): void {
  const outputDir = path.join(process.cwd(), 'docs', 'content');
  const outputPath = path.join(outputDir, 'empty-content-report.md');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`Report written to: ${outputPath}`);
}

async function main(): Promise<void> {
  console.log('Empty Content Audit');
  console.log('='.repeat(50));
  console.log('');

  try {
    // Gather data
    console.log('Finding empty pages...');
    const emptyPages = await findEmptyPages();
    console.log(`  Found ${emptyPages.length} empty/thin pages`);

    console.log('Finding empty posts...');
    const emptyPosts = await findEmptyPosts();
    console.log(`  Found ${emptyPosts.length} empty/thin posts`);

    console.log('Finding published posts missing excerpts...');
    const postsMissingExcerpts = await findPostsMissingExcerpts();
    console.log(`  Found ${postsMissingExcerpts.length} posts missing excerpts`);

    console.log('');

    // Generate and write report
    const report = generateReport(emptyPages, emptyPosts, postsMissingExcerpts);
    writeReport(report);

    // Print summary
    console.log('');
    console.log('Summary:');
    console.log(`  Empty/thin pages: ${emptyPages.length}`);
    console.log(`  Empty/thin posts: ${emptyPosts.length}`);
    console.log(`  Posts missing excerpts: ${postsMissingExcerpts.length}`);
    console.log('');
    console.log('Audit complete.');
  } catch (error) {
    console.error('Error during audit:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
