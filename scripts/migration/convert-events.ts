/**
 * Convert Dogadanja Posts to Events Script
 *
 * Converts posts with category 'dogadanja' to events table entries.
 * Run with: cd apps/admin && npx tsx ../../scripts/migration/convert-events.ts
 */

import { readFileSync } from 'fs';
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

async function main() {
  console.log('=== Converting Dogadanja Posts to Events ===\n');

  // Find all posts with category 'dogadanja'
  const dogadjanjaPosts = await prisma.post.findMany({
    where: { category: 'dogadanja' },
  });

  console.log(`Found ${dogadjanjaPosts.length} posts with category 'dogadanja'\n`);

  let created = 0;
  let deleted = 0;
  const errors: string[] = [];

  for (const post of dogadjanjaPosts) {
    try {
      // Determine eventDate - use publishedAt or fall back to createdAt
      const eventDate = post.publishedAt || post.createdAt;

      // Create event record
      await prisma.event.create({
        data: {
          title: post.title,
          description: post.excerpt || null,
          eventDate: eventDate,
          posterImage: post.featuredImage || null,
          // Note: Event model doesn't have 'content' or 'slug' fields
          // The content is stored in description, and the event doesn't need a slug
        },
      });
      created++;
      console.log(`[CREATED] Event: ${post.title}`);

      // Delete the post after event is created
      await prisma.post.delete({
        where: { id: post.id },
      });
      deleted++;
      console.log(`[DELETED] Post: ${post.slug}`);
    } catch (error) {
      const errorMsg = `Failed to convert post '${post.slug}': ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      console.error(`[ERROR] ${errorMsg}`);
    }
  }

  console.log('\n=== Conversion Summary ===');
  console.log(`Events created: ${created}`);
  console.log(`Posts deleted: ${deleted}`);
  if (errors.length > 0) {
    console.log(`Errors: ${errors.length}`);
    errors.forEach((e) => console.log(`  - ${e}`));
  }

  // Verify counts
  const totalEvents = await prisma.event.count();
  const remainingDogadanja = await prisma.post.count({
    where: { category: 'dogadanja' },
  });

  console.log('\n=== Verification ===');
  console.log(`Total events in database: ${totalEvents}`);
  console.log(`Remaining 'dogadanja' posts: ${remainingDogadanja}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
