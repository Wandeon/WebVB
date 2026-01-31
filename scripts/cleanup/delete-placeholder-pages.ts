/**
 * Delete Legacy Placeholder Pages Script
 *
 * Deletes pages with "u izradi" placeholder content that have been replaced
 * by the consolidated /usluge page.
 *
 * Pages to delete:
 * - rad-uprave/financijski-dokumenti
 * - rad-uprave/sudjelovanje-gradana
 *
 * Run with: npx tsx scripts/cleanup/delete-placeholder-pages.ts
 *
 * Launch Readiness - Task 1: Delete 2 legacy placeholder pages
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({
  log: ['error'],
});

const SLUGS_TO_DELETE = [
  'rad-uprave/financijski-dokumenti',
  'rad-uprave/sudjelovanje-gradana',
];

async function main() {
  console.log('='.repeat(60));
  console.log('Delete Legacy Placeholder Pages');
  console.log('='.repeat(60));
  console.log();

  try {
    // First, list the pages we're about to delete
    console.log('Finding pages to delete...');
    const pagesToDelete = await db.page.findMany({
      where: {
        slug: { in: SLUGS_TO_DELETE },
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (pagesToDelete.length === 0) {
      console.log('No matching pages found. They may have already been deleted.');
      return;
    }

    console.log(`Found ${pagesToDelete.length} page(s) to delete:`);
    for (const page of pagesToDelete) {
      console.log(`  - ${page.slug} (${page.title})`);
    }
    console.log();

    // Delete the pages
    console.log('Deleting pages...');
    const result = await db.page.deleteMany({
      where: {
        slug: { in: SLUGS_TO_DELETE },
      },
    });

    console.log(`Deleted ${result.count} page(s).`);
    console.log();
    console.log('Done!');
  } catch (error) {
    console.error('Error deleting pages:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
