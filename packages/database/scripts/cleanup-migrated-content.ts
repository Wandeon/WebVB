/**
 * Cleanup Script: Delete Posts and Documents that were migrated to Announcements
 *
 * This script deletes:
 * 1. All posts with category 'obavijesti' (migrated to Announcements)
 * 2. Posts from 'opcinske-vijesti' with announcement-like titles (migrated)
 * 3. Documents with category 'natjecaji' (now announcement attachments)
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx scripts/cleanup-migrated-content.ts [--dry-run] [--execute]
 *
 * Options:
 *   --dry-run   Show what would be deleted without making changes (default)
 *   --execute   Actually perform the deletion
 */

import { db } from '../src/client';

// Same patterns used in migration script
const ANNOUNCEMENT_TITLE_PATTERNS = [
  /^OBAVIJEST/i,
  /^JAVNI POZIV/i,
  /^JAVNI NATJEČAJ/i,
  /^NATJEČAJ/i,
  /^OGLAS/i,
  /^POZIV/i,
  /^LISTA REDA PRVENSTVA/i,
  /^OBJAVA/i,
  /PRIJAVA ŠTETE/i,
  /DODJEL[AEI] STIPENDIJ/i,
  /POTICANJE RJEŠAVANJA STAMBENOG/i,
];

interface CleanupData {
  postsObavijesti: { id: string; title: string }[];
  postsVijesti: { id: string; title: string }[];
  documents: { id: string; title: string }[];
}

async function analyzeCleanup(): Promise<CleanupData> {
  console.log('\n📊 Analyzing content for cleanup...\n');

  // Get all posts from 'obavijesti' category
  const postsObavijesti = await db.post.findMany({
    where: { category: 'obavijesti' },
    select: { id: true, title: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`✓ Found ${postsObavijesti.length} posts in 'obavijesti' category to delete`);

  // Get posts from 'opcinske-vijesti' that match announcement patterns
  const allVijesti = await db.post.findMany({
    where: { category: 'opcinske-vijesti' },
    select: { id: true, title: true },
  });

  const postsVijesti = allVijesti.filter((post) =>
    ANNOUNCEMENT_TITLE_PATTERNS.some((pattern) => pattern.test(post.title))
  );

  console.log(
    `✓ Found ${postsVijesti.length} posts in 'opcinske-vijesti' matching announcement patterns`
  );

  // Get documents from 'natjecaji' category
  const documents = await db.document.findMany({
    where: { category: 'natjecaji' },
    select: { id: true, title: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`✓ Found ${documents.length} documents in 'natjecaji' category to delete`);

  return { postsObavijesti, postsVijesti, documents };
}

async function showPreview(data: CleanupData) {
  console.log('\n' + '='.repeat(70));
  console.log('CLEANUP PREVIEW - ITEMS TO BE DELETED');
  console.log('='.repeat(70));

  console.log('\n🗑️  POSTS from obavijesti category:');
  console.log('-'.repeat(50));
  data.postsObavijesti.slice(0, 5).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.title.substring(0, 60)}...`);
  });
  if (data.postsObavijesti.length > 5) {
    console.log(`  ... and ${data.postsObavijesti.length - 5} more`);
  }

  console.log('\n🗑️  POSTS from opcinske-vijesti (announcement patterns):');
  console.log('-'.repeat(50));
  data.postsVijesti.slice(0, 5).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.title.substring(0, 60)}...`);
  });
  if (data.postsVijesti.length > 5) {
    console.log(`  ... and ${data.postsVijesti.length - 5} more`);
  }

  console.log('\n🗑️  DOCUMENTS from natjecaji category:');
  console.log('-'.repeat(50));
  data.documents.slice(0, 5).forEach((d, i) => {
    console.log(`  ${i + 1}. ${d.title.substring(0, 60)}...`);
  });
  if (data.documents.length > 5) {
    console.log(`  ... and ${data.documents.length - 5} more`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('DELETION SUMMARY:');
  console.log(`  • ${data.postsObavijesti.length} posts from 'obavijesti' will be DELETED`);
  console.log(`  • ${data.postsVijesti.length} posts from 'opcinske-vijesti' will be DELETED`);
  console.log(`  • ${data.documents.length} documents from 'natjecaji' will be DELETED`);
  console.log(
    `  • TOTAL: ${data.postsObavijesti.length + data.postsVijesti.length + data.documents.length} items will be DELETED`
  );
  console.log('='.repeat(70));
}

async function executeCleanup(data: CleanupData): Promise<{
  postsDeleted: number;
  documentsDeleted: number;
  errors: string[];
}> {
  const stats = {
    postsDeleted: 0,
    documentsDeleted: 0,
    errors: [] as string[],
  };

  console.log('\n🗑️  Starting cleanup...\n');

  // Delete posts from obavijesti
  console.log('Deleting posts from obavijesti category...');
  try {
    const result1 = await db.post.deleteMany({
      where: { category: 'obavijesti' },
    });
    stats.postsDeleted += result1.count;
    console.log(`  ✓ Deleted ${result1.count} posts`);
  } catch (error) {
    stats.errors.push(`Failed to delete obavijesti posts: ${(error as Error).message}`);
    console.log(`  ✗ Error: ${(error as Error).message}`);
  }

  // Delete posts from opcinske-vijesti matching patterns
  console.log('Deleting matching posts from opcinske-vijesti...');
  try {
    const postIds = data.postsVijesti.map((p) => p.id);
    const result2 = await db.post.deleteMany({
      where: { id: { in: postIds } },
    });
    stats.postsDeleted += result2.count;
    console.log(`  ✓ Deleted ${result2.count} posts`);
  } catch (error) {
    stats.errors.push(`Failed to delete opcinske-vijesti posts: ${(error as Error).message}`);
    console.log(`  ✗ Error: ${(error as Error).message}`);
  }

  // Delete documents from natjecaji
  console.log('Deleting documents from natjecaji category...');
  try {
    const result3 = await db.document.deleteMany({
      where: { category: 'natjecaji' },
    });
    stats.documentsDeleted = result3.count;
    console.log(`  ✓ Deleted ${result3.count} documents`);
  } catch (error) {
    stats.errors.push(`Failed to delete natjecaji documents: ${(error as Error).message}`);
    console.log(`  ✗ Error: ${(error as Error).message}`);
  }

  return stats;
}

async function showFinalState() {
  console.log('\n📊 Final database state:');
  console.log('-'.repeat(40));

  const posts = await db.post.count();
  const postsByCategory = (await db.$queryRawUnsafe(
    'SELECT category, COUNT(*)::int as count FROM posts GROUP BY category ORDER BY count DESC'
  )) as { category: string; count: number }[];

  console.log(`Posts: ${posts} total`);
  postsByCategory.forEach((p) => console.log(`  - ${p.category}: ${p.count}`));

  const docs = await db.document.count();
  const docsByCategory = (await db.$queryRawUnsafe(
    'SELECT category, COUNT(*)::int as count FROM documents GROUP BY category ORDER BY count DESC'
  )) as { category: string; count: number }[];

  console.log(`Documents: ${docs} total`);
  docsByCategory.forEach((d) => console.log(`  - ${d.category}: ${d.count}`));

  const announcements = await db.announcement.count();
  console.log(`Announcements: ${announcements} total`);
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--execute');

  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║     CLEANUP SCRIPT: Delete Migrated Posts/Documents                ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');

  if (isDryRun) {
    console.log('\n⚠️  DRY RUN MODE - No changes will be made');
    console.log('   Run with --execute to perform the cleanup\n');
  } else {
    console.log('\n🔴 EXECUTE MODE - Items WILL be PERMANENTLY DELETED!\n');
  }

  try {
    // Analyze what needs to be deleted
    const data = await analyzeCleanup();

    // Show preview
    await showPreview(data);

    if (isDryRun) {
      console.log('\n💡 To execute this cleanup, run:');
      console.log('   DATABASE_URL="..." npx tsx scripts/cleanup-migrated-content.ts --execute\n');
    } else {
      // Execute cleanup
      const stats = await executeCleanup(data);

      console.log('\n' + '='.repeat(70));
      console.log('CLEANUP COMPLETE');
      console.log('='.repeat(70));
      console.log(`  ✓ ${stats.postsDeleted} posts deleted`);
      console.log(`  ✓ ${stats.documentsDeleted} documents deleted`);

      if (stats.errors.length > 0) {
        console.log(`\n  ⚠️  ${stats.errors.length} errors occurred:`);
        stats.errors.forEach((e) => console.log(`    - ${e}`));
      }

      // Show final state
      await showFinalState();
    }
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
