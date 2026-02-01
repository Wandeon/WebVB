/**
 * Fix Remaining URLs Script
 *
 * Fixes all remaining WordPress dependencies:
 * 1. Updates internal links using url-map.json
 * 2. Downloads external images (Facebook, Google) to R2
 * 3. Verifies zero old URLs remain
 *
 * Run with: cd apps/admin && npx tsx ../../scripts/migration/fix-remaining-urls.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import https from 'https';
import http from 'http';
import { getAdminR2Env, type AdminR2Env } from '@repo/shared';

// Load env manually
function loadEnv(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([^#=]+)=["']?(.*)["']?$/);
      if (match && !process.env[match[1].trim()]) {
        process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch { /* ignore */ }
}
loadEnv('/mnt/c/VelikiBukovec_web/.env');
loadEnv('/mnt/c/VelikiBukovec_web/apps/admin/.env');

const prisma = new PrismaClient();

let r2Env: AdminR2Env | null = null;
let s3Client: S3Client | null = null;

function getR2Env(): AdminR2Env {
  if (!r2Env) {
    r2Env = getAdminR2Env();
  }
  return r2Env;
}

function getR2Client(): S3Client {
  if (!s3Client) {
    const env = getR2Env();
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

// Stats
const stats = {
  postsUpdated: 0,
  pagesUpdated: 0,
  internalLinksFixed: 0,
  externalImagesDownloaded: 0,
  errors: [] as string[],
};

// External image URL to R2 URL mapping (populated during download)
const externalImageMap: Record<string, string> = {};

/**
 * Download an image from URL and return buffer
 */
async function downloadImage(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;

    // Clean URL (remove HTML entities)
    const cleanUrl = url.replace(/&amp;/g, '&');

    const request = client.get(cleanUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        console.log(`  Failed to download ${cleanUrl}: HTTP ${response.statusCode}`);
        resolve(null);
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', () => resolve(null));
    });

    request.on('error', (err) => {
      console.log(`  Download error for ${cleanUrl}: ${err.message}`);
      resolve(null);
    });

    request.on('timeout', () => {
      request.destroy();
      console.log(`  Download timeout for ${cleanUrl}`);
      resolve(null);
    });
  });
}

/**
 * Upload buffer to R2 and return public URL
 */
async function uploadToR2(buffer: Buffer, filename: string, contentType: string): Promise<string | null> {
  try {
    const env = getR2Env();
    const key = `migration/external/${filename}`;

    await getR2Client().send(new PutObjectCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));

    return `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
  } catch (error) {
    console.log(`  Upload error: ${error}`);
    return null;
  }
}

/**
 * Extract filename from URL
 */
function extractFilename(url: string): string {
  // Generate unique filename from URL hash
  const hash = url.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  // Try to get extension from URL
  let ext = '.png';
  if (url.includes('.jpg') || url.includes('.jpeg')) ext = '.jpg';
  else if (url.includes('.gif')) ext = '.gif';
  else if (url.includes('.webp')) ext = '.webp';

  return `external-${Math.abs(hash)}${ext}`;
}

/**
 * Get content type from extension
 */
function getContentType(filename: string): string {
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  if (filename.endsWith('.gif')) return 'image/gif';
  if (filename.endsWith('.webp')) return 'image/webp';
  return 'image/png';
}

/**
 * Download and upload external images, return mapping
 */
async function processExternalImages(content: string, dryRun: boolean): Promise<string> {
  if (dryRun) {
    return content;
  }

  let result = content;

  // Find all external image URLs
  const externalPatterns = [
    /https?:\/\/[^"'\s]*fbcdn\.net[^"'\s]*/gi,
    /https?:\/\/[^"'\s]*googleusercontent\.com[^"'\s]*/gi,
    /https?:\/\/scontent[^"'\s]*\.fna\.fbcdn\.net[^"'\s]*/gi,
  ];

  const externalUrls = new Set<string>();
  for (const pattern of externalPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(url => externalUrls.add(url));
    }
  }

  for (const externalUrl of externalUrls) {
    // Check if already processed
    if (externalImageMap[externalUrl]) {
      result = result.split(externalUrl).join(externalImageMap[externalUrl]);
      continue;
    }

    console.log(`  Downloading external image: ${externalUrl.slice(0, 80)}...`);

    const buffer = await downloadImage(externalUrl);
    if (!buffer) {
      stats.errors.push(`Failed to download: ${externalUrl.slice(0, 100)}`);
      continue;
    }

    const filename = extractFilename(externalUrl);
    const contentType = getContentType(filename);

    const r2Url = await uploadToR2(buffer, filename, contentType);
    if (r2Url) {
      externalImageMap[externalUrl] = r2Url;
      result = result.split(externalUrl).join(r2Url);
      stats.externalImagesDownloaded++;
      console.log(`  -> Uploaded to: ${r2Url}`);
    } else {
      stats.errors.push(`Failed to upload: ${filename}`);
    }
  }

  return result;
}

/**
 * Replace internal WordPress URLs with new paths
 */
function replaceInternalUrls(content: string, urlMap: Record<string, string>): { content: string; count: number } {
  let result = content;
  let count = 0;

  // Sort by URL length (longest first) to avoid partial replacements
  const sortedEntries = Object.entries(urlMap).sort((a, b) => b[0].length - a[0].length);

  for (const [oldUrl, newPath] of sortedEntries) {
    // Handle with and without trailing slash
    const variations = [
      oldUrl,
      oldUrl.replace(/\/$/, ''),
      oldUrl.replace('https://', 'http://'),
      oldUrl.replace('https://', 'http://').replace(/\/$/, ''),
    ];

    for (const variant of variations) {
      if (result.includes(variant)) {
        const before = result;
        result = result.split(variant).join(newPath);
        if (result !== before) count++;
      }
    }
  }

  // Also handle any remaining velikibukovec.hr URLs that point to posts
  // Pattern: https://velikibukovec.hr/some-slug/ -> /vijesti/some-slug
  const remainingPattern = /https?:\/\/velikibukovec\.hr\/([a-z0-9-]+)\/?(?=["'\s\}])/gi;
  result = result.replace(remainingPattern, (match, slug) => {
    // Check if this looks like a post slug (not a known page path)
    if (!urlMap[match] && !urlMap[match + '/']) {
      count++;
      return `/vijesti/${slug}`;
    }
    return match;
  });

  return { content: result, count };
}

/**
 * Replace bare domain URLs
 */
function replaceBareDomainUrls(content: string): string {
  // Replace bare https://velikibukovec.hr or https://velikibukovec.hr/ with /
  return content
    .replace(/https?:\/\/velikibukovec\.hr\/?(?=["'\s\}])/gi, '/')
    .replace(/https?:\/\/velikibukovec\.hr\/?$/gi, '/');
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  console.log('=== Fix Remaining URLs ===\n');

  if (dryRun) {
    console.log('[DRY RUN MODE - No changes will be saved]\n');
  } else {
    getR2Env();
  }

  // Load URL maps
  const scriptDir = '/mnt/c/VelikiBukovec_web/scripts/migration';

  let urlMap: Record<string, string> = {};
  try {
    urlMap = JSON.parse(readFileSync(join(scriptDir, 'output/url-map.json'), 'utf-8'));
    console.log(`Loaded ${Object.keys(urlMap).length} internal URL mappings`);
  } catch (e) {
    console.error('Failed to load url-map.json');
    process.exit(1);
  }

  let mediaUrlMap: Record<string, string> = {};
  try {
    mediaUrlMap = JSON.parse(readFileSync(join(scriptDir, 'output/media-url-map.json'), 'utf-8'));
    console.log(`Loaded ${Object.keys(mediaUrlMap).length} media URL mappings`);
  } catch (e) {
    console.warn('Warning: Could not load media-url-map.json');
  }

  // Combine maps (media URLs take precedence for wp-content paths)
  const combinedMap = { ...urlMap, ...mediaUrlMap };

  // === PHASE 1: Fix Posts ===
  console.log('\n--- Phase 1: Fixing Posts ---');

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { content: { contains: 'velikibukovec.hr' } },
        { content: { contains: 'fbcdn.net' } },
        { content: { contains: 'googleusercontent.com' } },
      ]
    },
    select: { id: true, slug: true, content: true }
  });

  console.log(`Found ${posts.length} posts to fix`);

  for (const post of posts) {
    if (verbose) console.log(`\nProcessing post: ${post.slug}`);

    let newContent = post.content;

    // 1. Download and replace external images
    newContent = await processExternalImages(newContent, dryRun);

    // 2. Replace internal URLs
    const { content: fixedContent, count } = replaceInternalUrls(newContent, combinedMap);
    newContent = fixedContent;
    stats.internalLinksFixed += count;

    // 3. Replace bare domain URLs
    newContent = replaceBareDomainUrls(newContent);

    if (newContent !== post.content) {
      if (!dryRun) {
        await prisma.post.update({
          where: { id: post.id },
          data: { content: newContent }
        });
      }
      stats.postsUpdated++;
      if (verbose) console.log(`  Updated (${count} internal links fixed)`);
    }
  }

  // === PHASE 2: Fix Pages ===
  console.log('\n--- Phase 2: Fixing Pages ---');

  const pages = await prisma.page.findMany({
    where: {
      OR: [
        { content: { contains: 'velikibukovec.hr' } },
        { content: { contains: 'fbcdn.net' } },
        { content: { contains: 'googleusercontent.com' } },
      ]
    },
    select: { id: true, slug: true, content: true }
  });

  console.log(`Found ${pages.length} pages to fix`);

  for (const page of pages) {
    if (verbose) console.log(`\nProcessing page: ${page.slug}`);

    let newContent = page.content;

    // 1. Download and replace external images
    newContent = await processExternalImages(newContent, dryRun);

    // 2. Replace internal URLs
    const { content: fixedContent, count } = replaceInternalUrls(newContent, combinedMap);
    newContent = fixedContent;
    stats.internalLinksFixed += count;

    // 3. Replace bare domain URLs
    newContent = replaceBareDomainUrls(newContent);

    if (newContent !== page.content) {
      if (!dryRun) {
        await prisma.page.update({
          where: { id: page.id },
          data: { content: newContent }
        });
      }
      stats.pagesUpdated++;
      if (verbose) console.log(`  Updated (${count} internal links fixed)`);
    }
  }

  // === PHASE 3: Verification ===
  console.log('\n--- Phase 3: Verification ---');

  const remainingPostsWithOldUrls = await prisma.post.count({
    where: { content: { contains: 'velikibukovec.hr' } }
  });

  const remainingPagesWithOldUrls = await prisma.page.count({
    where: { content: { contains: 'velikibukovec.hr' } }
  });

  const remainingExternalFacebook = await prisma.post.count({
    where: { content: { contains: 'fbcdn.net' } }
  });

  const remainingExternalGoogle = await prisma.post.count({
    where: { content: { contains: 'googleusercontent.com' } }
  });

  // === Summary ===
  console.log('\n=== Summary ===');
  console.log(`Posts updated: ${stats.postsUpdated}`);
  console.log(`Pages updated: ${stats.pagesUpdated}`);
  console.log(`Internal links fixed: ${stats.internalLinksFixed}`);
  console.log(`External images downloaded to R2: ${stats.externalImagesDownloaded}`);

  if (stats.errors.length > 0) {
    console.log(`\nErrors (${stats.errors.length}):`);
    stats.errors.forEach(e => console.log(`  - ${e}`));
  }

  console.log('\n=== Verification Results ===');
  console.log(`Posts still with velikibukovec.hr URLs: ${remainingPostsWithOldUrls}`);
  console.log(`Pages still with velikibukovec.hr URLs: ${remainingPagesWithOldUrls}`);
  console.log(`Posts still with Facebook CDN: ${remainingExternalFacebook}`);
  console.log(`Posts still with Google images: ${remainingExternalGoogle}`);

  const allClear = remainingPostsWithOldUrls === 0 &&
                   remainingPagesWithOldUrls === 0 &&
                   remainingExternalFacebook === 0 &&
                   remainingExternalGoogle === 0;

  if (allClear) {
    console.log('\n✅ SUCCESS: All WordPress dependencies removed!');
  } else {
    console.log('\n⚠️  WARNING: Some URLs still remain - manual review needed');

    // Show remaining issues
    if (remainingPostsWithOldUrls > 0) {
      const remaining = await prisma.post.findMany({
        where: { content: { contains: 'velikibukovec.hr' } },
        select: { slug: true, content: true },
        take: 5
      });
      console.log('\nRemaining posts with old URLs:');
      for (const p of remaining) {
        const matches = p.content.match(/https?:\/\/velikibukovec\.hr[^"'\s}]*/g);
        console.log(`  - ${p.slug}: ${matches?.slice(0, 2).join(', ')}`);
      }
    }
  }

  // Save external image map for reference
  if (Object.keys(externalImageMap).length > 0) {
    writeFileSync(
      join(scriptDir, 'output/external-image-map.json'),
      JSON.stringify(externalImageMap, null, 2)
    );
    console.log(`\nExternal image map saved to output/external-image-map.json`);
  }

  await prisma.$disconnect();

  process.exit(allClear ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
