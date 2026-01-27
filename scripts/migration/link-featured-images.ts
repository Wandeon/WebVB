/**
 * Link Featured Images Script
 * Run AFTER migrate-media.ts completes
 *
 * Maps WordPress attachment IDs to new R2 URLs and updates posts.
 * Run with: cd apps/admin && npx tsx ../../scripts/migration/link-featured-images.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

// Load env
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

const prisma = new PrismaClient();

interface Attachment {
  id: number;
  url: string;
  filename: string;
}

interface ParsedPost {
  id: number;
  slug: string;
  featuredImageId: number | null;
}

async function main() {
  const outputDir = '/mnt/c/VelikiBukovec_web/scripts/migration/output';

  // Load attachments (WP ID → old URL)
  const attachments: Attachment[] = JSON.parse(
    readFileSync(join(outputDir, 'attachments.json'), 'utf-8')
  );
  console.log(`Loaded ${attachments.length} attachments`);

  // Load media URL map (old URL → new URL)
  const mediaUrlMapPath = join(outputDir, 'media-url-map.json');
  if (!existsSync(mediaUrlMapPath)) {
    console.error('Error: media-url-map.json not found. Run migrate-media.ts first.');
    process.exit(1);
  }
  const mediaUrlMap: Record<string, string> = JSON.parse(
    readFileSync(mediaUrlMapPath, 'utf-8')
  );
  console.log(`Loaded ${Object.keys(mediaUrlMap).length} URL mappings`);

  // Build WP attachment ID → new R2 URL map
  const attachmentIdToR2: Record<number, string> = {};
  for (const att of attachments) {
    const newUrl = mediaUrlMap[att.url];
    if (newUrl) {
      attachmentIdToR2[att.id] = newUrl;
    }
  }
  console.log(`Mapped ${Object.keys(attachmentIdToR2).length} attachment IDs to R2 URLs\n`);

  // Load parsed posts (to get featuredImageId mapping)
  const parsedPosts: ParsedPost[] = JSON.parse(
    readFileSync(join(outputDir, 'posts.json'), 'utf-8')
  );

  // Update posts with featured images
  let updated = 0;
  let notFound = 0;
  let noFeatured = 0;

  for (const parsedPost of parsedPosts) {
    if (!parsedPost.featuredImageId) {
      noFeatured++;
      continue;
    }

    const r2Url = attachmentIdToR2[parsedPost.featuredImageId];
    if (!r2Url) {
      notFound++;
      continue;
    }

    // Find post in database by slug
    const dbPost = await prisma.post.findUnique({
      where: { slug: parsedPost.slug },
    });

    if (!dbPost) {
      continue;
    }

    // Update featured image
    await prisma.post.update({
      where: { id: dbPost.id },
      data: { featuredImage: r2Url },
    });

    updated++;
  }

  console.log('=== Featured Images Summary ===');
  console.log(`Posts without featured image: ${noFeatured}`);
  console.log(`Featured images not found in R2: ${notFound}`);
  console.log(`Posts updated with featured image: ${updated}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
