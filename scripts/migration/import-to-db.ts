/**
 * Database Import Script
 * Sprint 4.4: Test Migration
 *
 * Imports parsed WordPress content into the new database.
 * Run with: pnpm --filter @repo/database tsx ../../scripts/migration/import-to-db.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ParsedPost {
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

interface ParsedPage {
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

interface ParsedAttachment {
  id: number;
  title: string;
  url: string;
  filename: string;
  mimeType: string;
  date: string;
}

// Convert HTML content to TipTap JSON format
function htmlToTipTap(html: string): string {
  if (!html) {
    return JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }],
    });
  }

  // Split by paragraph-like structures
  const blocks: object[] = [];

  // Handle <p> tags
  const paragraphRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  let lastIndex = 0;
  const tempContent = html;

  // Simple approach: split by double newlines or <p> tags
  const parts = html
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '') // Strip remaining HTML
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  for (const part of parts) {
    blocks.push({
      type: 'paragraph',
      content: [{ type: 'text', text: part }],
    });
  }

  if (blocks.length === 0) {
    blocks.push({ type: 'paragraph', content: [] });
  }

  return JSON.stringify({
    type: 'doc',
    content: blocks,
  });
}

// Map WordPress category to database category
function mapCategory(wpCategory: string): string {
  const categoryMap: Record<string, string> = {
    'opcinske-vijesti': 'opcinske-vijesti',
    obavijesti: 'obavijesti',
    dogadanja: 'dogadanja',
  };
  return categoryMap[wpCategory] || 'opcinske-vijesti';
}

async function importPosts(posts: ParsedPost[], dryRun = false) {
  console.log(`\nImporting ${posts.length} posts...`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const post of posts) {
    try {
      // Check if post already exists by slug
      const existing = await prisma.post.findUnique({
        where: { slug: post.slug },
      });

      if (existing) {
        skipped++;
        continue;
      }

      const category = post.categories[0] || 'opcinske-vijesti';
      const tipTapContent = htmlToTipTap(post.content);

      if (dryRun) {
        console.log(`  [DRY RUN] Would import: ${post.title.substring(0, 50)}...`);
        imported++;
        continue;
      }

      await prisma.post.create({
        data: {
          title: post.title,
          slug: post.slug,
          content: tipTapContent,
          excerpt: post.excerpt || null,
          category: category,
          isFeatured: post.isFeatured,
          publishedAt: new Date(post.date),
          createdAt: new Date(post.date),
          updatedAt: new Date(post.modified),
        },
      });

      imported++;

      if (imported % 50 === 0) {
        console.log(`  Imported ${imported}/${posts.length}...`);
      }
    } catch (error) {
      errors++;
      console.error(`  Error importing post "${post.title}": ${error}`);
    }
  }

  console.log(`Posts: ${imported} imported, ${skipped} skipped, ${errors} errors`);
  return { imported, skipped, errors };
}

async function importPages(pages: ParsedPage[], dryRun = false) {
  console.log(`\nImporting ${pages.length} pages...`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  // Sort by parent to handle hierarchy
  const sortedPages = [...pages].sort((a, b) => a.parentId - b.parentId);

  for (const page of sortedPages) {
    try {
      // Check if page already exists by slug
      const existing = await prisma.page.findUnique({
        where: { slug: page.slug },
      });

      if (existing) {
        skipped++;
        continue;
      }

      const tipTapContent = htmlToTipTap(page.content);

      if (dryRun) {
        console.log(`  [DRY RUN] Would import page: ${page.title.substring(0, 50)}...`);
        imported++;
        continue;
      }

      await prisma.page.create({
        data: {
          title: page.title,
          slug: page.slug,
          content: tipTapContent,
          menuOrder: page.menuOrder,
          createdAt: new Date(page.date),
          updatedAt: new Date(page.modified),
        },
      });

      imported++;
    } catch (error) {
      errors++;
      console.error(`  Error importing page "${page.title}": ${error}`);
    }
  }

  console.log(`Pages: ${imported} imported, ${skipped} skipped, ${errors} errors`);
  return { imported, skipped, errors };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const postsOnly = args.includes('--posts-only');
  const pagesOnly = args.includes('--pages-only');

  if (dryRun) {
    console.log('=== DRY RUN MODE - No changes will be made ===\n');
  }

  const outputDir = join(process.cwd(), '../../scripts/migration/output');

  console.log(`Loading parsed data from: ${outputDir}`);

  const posts: ParsedPost[] = JSON.parse(readFileSync(join(outputDir, 'posts.json'), 'utf-8'));
  const pages: ParsedPage[] = JSON.parse(readFileSync(join(outputDir, 'pages.json'), 'utf-8'));

  console.log(`Loaded: ${posts.length} posts, ${pages.length} pages`);

  const results = {
    posts: { imported: 0, skipped: 0, errors: 0 },
    pages: { imported: 0, skipped: 0, errors: 0 },
  };

  if (!pagesOnly) {
    results.posts = await importPosts(posts, dryRun);
  }

  if (!postsOnly) {
    results.pages = await importPages(pages, dryRun);
  }

  console.log('\n=== Migration Summary ===');
  console.log(`Posts: ${results.posts.imported} imported, ${results.posts.skipped} skipped, ${results.posts.errors} errors`);
  console.log(`Pages: ${results.pages.imported} imported, ${results.pages.skipped} skipped, ${results.pages.errors} errors`);

  if (dryRun) {
    console.log('\n[DRY RUN] No changes were made to the database.');
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
