/**
 * Image URL Validation Script
 *
 * Re-validates all image URLs in the database with rate limiting
 * to avoid R2 rate limiting causing false positives.
 *
 * Run with: pnpm tsx scripts/audit/validate-images.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const db = new PrismaClient({
  log: ['error'],
});

// Rate limiting: 100ms delay between requests
const DELAY_MS = 100;

// Request timeout in milliseconds
const REQUEST_TIMEOUT_MS = 10000;

interface BrokenImage {
  url: string;
  source: string;
  sourceId: string;
  statusCode: number | null;
  error: string | null;
}

interface ValidationResult {
  totalImages: number;
  brokenImages: BrokenImage[];
  validImages: number;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make a HEAD request to check if image URL is accessible
 */
async function checkImageUrl(url: string): Promise<{ ok: boolean; status: number | null; error: string | null }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    return {
      ok: response.ok,
      status: response.status,
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { ok: false, status: null, error: 'Timeout' };
      }
      return { ok: false, status: null, error: error.message };
    }
    return { ok: false, status: null, error: 'Unknown error' };
  }
}

/**
 * Collect all unique image URLs from the database
 */
async function collectImageUrls(): Promise<Map<string, { source: string; sourceId: string }>> {
  const imageMap = new Map<string, { source: string; sourceId: string }>();

  // 1. Post.featuredImage
  console.log('Collecting Post featured images...');
  const posts = await db.post.findMany({
    where: {
      featuredImage: { not: null },
    },
    select: {
      id: true,
      featuredImage: true,
    },
  });

  for (const post of posts) {
    if (post.featuredImage) {
      imageMap.set(post.featuredImage, {
        source: 'Post.featuredImage',
        sourceId: post.id,
      });
    }
  }
  console.log(`  Found ${posts.length} posts with featured images`);

  // 2. GalleryImage.imageUrl
  console.log('Collecting GalleryImage URLs...');
  const galleryImages = await db.galleryImage.findMany({
    select: {
      id: true,
      imageUrl: true,
      thumbnailUrl: true,
    },
  });

  for (const img of galleryImages) {
    imageMap.set(img.imageUrl, {
      source: 'GalleryImage.imageUrl',
      sourceId: img.id,
    });

    // 3. GalleryImage.thumbnailUrl
    if (img.thumbnailUrl) {
      imageMap.set(img.thumbnailUrl, {
        source: 'GalleryImage.thumbnailUrl',
        sourceId: img.id,
      });
    }
  }
  console.log(`  Found ${galleryImages.length} gallery images`);

  return imageMap;
}

/**
 * Validate all collected image URLs with rate limiting
 */
async function validateImages(
  imageMap: Map<string, { source: string; sourceId: string }>
): Promise<ValidationResult> {
  const brokenImages: BrokenImage[] = [];
  const urls = Array.from(imageMap.entries());
  const total = urls.length;

  console.log(`\nValidating ${total} unique image URLs with ${DELAY_MS}ms rate limiting...`);
  console.log('This may take several minutes.\n');

  for (let i = 0; i < urls.length; i++) {
    const [url, info] = urls[i];

    // Progress update every 50 images
    if ((i + 1) % 50 === 0 || i === 0) {
      const percent = Math.round(((i + 1) / total) * 100);
      console.log(`Progress: ${i + 1}/${total} (${percent}%) - Broken so far: ${brokenImages.length}`);
    }

    const result = await checkImageUrl(url);

    if (!result.ok) {
      brokenImages.push({
        url,
        source: info.source,
        sourceId: info.sourceId,
        statusCode: result.status,
        error: result.error,
      });
    }

    // Rate limiting delay (skip on last item)
    if (i < urls.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\nValidation complete: ${total}/${total} (100%)`);

  return {
    totalImages: total,
    brokenImages,
    validImages: total - brokenImages.length,
  };
}

/**
 * Generate markdown report
 */
function generateReport(result: ValidationResult): string {
  const now = new Date().toISOString().split('T')[0];
  const lines: string[] = [];

  lines.push('# Broken Images Report');
  lines.push('');
  lines.push(`> Generated: ${now}`);
  lines.push(`> Rate limiting: ${DELAY_MS}ms between requests`);
  lines.push('');

  // Summary
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Total images checked:** ${result.totalImages}`);
  lines.push(`- **Valid images:** ${result.validImages}`);
  lines.push(`- **Broken images:** ${result.brokenImages.length}`);
  lines.push('');

  // Broken Images Table
  lines.push('## Broken Images');
  lines.push('');

  if (result.brokenImages.length === 0) {
    lines.push('No broken images found.');
  } else {
    lines.push('| URL | Source | Status | Error |');
    lines.push('|-----|--------|--------|-------|');

    for (const img of result.brokenImages) {
      // Truncate long URLs for readability
      const displayUrl = img.url.length > 60 ? `${img.url.substring(0, 57)}...` : img.url;
      const status = img.statusCode !== null ? `${img.statusCode}` : 'N/A';
      const error = img.error || 'Unknown';

      lines.push(`| \`${displayUrl}\` | ${img.source} | ${status} | ${error} |`);
    }
  }
  lines.push('');

  // Full URLs section (for easy copying)
  if (result.brokenImages.length > 0) {
    lines.push('## Full URLs (for reference)');
    lines.push('');
    lines.push('```');
    for (const img of result.brokenImages) {
      lines.push(img.url);
    }
    lines.push('```');
    lines.push('');
  }

  // Action Items
  lines.push('## Action Items');
  lines.push('');
  if (result.brokenImages.length === 0) {
    lines.push('All images are accessible. No action needed.');
  } else {
    lines.push('For each broken image:');
    lines.push('1. **404 errors**: Check if file was deleted or moved in R2');
    lines.push('2. **403 errors**: Check R2 bucket permissions');
    lines.push('3. **Timeout errors**: May indicate temporary R2 issues, try re-running');
    lines.push('4. **Other errors**: Investigate the specific error message');
  }
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('*Generated by scripts/audit/validate-images.ts*');
  lines.push('');

  return lines.join('\n');
}

/**
 * Write report to file
 */
function writeReport(content: string): void {
  const outputDir = path.join(process.cwd(), 'docs', 'content');
  const outputPath = path.join(outputDir, 'broken-images-report.md');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`\nReport written to: ${outputPath}`);
}

async function main(): Promise<void> {
  console.log('Image URL Validation Audit');
  console.log('='.repeat(50));
  console.log('');

  const startTime = Date.now();

  try {
    // Collect all image URLs
    const imageMap = await collectImageUrls();
    console.log(`\nTotal unique images to validate: ${imageMap.size}`);

    // Validate with rate limiting
    const result = await validateImages(imageMap);

    // Generate and write report
    const report = generateReport(result);
    writeReport(report);

    // Print summary
    const elapsedMs = Date.now() - startTime;
    const elapsedMin = Math.floor(elapsedMs / 60000);
    const elapsedSec = Math.floor((elapsedMs % 60000) / 1000);

    console.log('');
    console.log('Summary:');
    console.log(`  Total images checked: ${result.totalImages}`);
    console.log(`  Valid images: ${result.validImages}`);
    console.log(`  Broken images: ${result.brokenImages.length}`);
    console.log(`  Elapsed time: ${elapsedMin}m ${elapsedSec}s`);
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
