/**
 * Migration Script: Move Posts and Documents to Announcements
 *
 * This script migrates:
 * 1. All posts with category 'obavijesti' → Announcements
 * 2. Posts from 'opcinske-vijesti' with announcement-like titles → Announcements
 * 3. Documents with category 'natjecaji' → Announcement attachments
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx scripts/migrate-to-announcements.ts [--dry-run] [--execute]
 *
 * Options:
 *   --dry-run   Show what would be migrated without making changes (default)
 *   --execute   Actually perform the migration
 */

import { db } from '../src/client';

// Patterns that indicate a post should be an announcement
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

// Map post content to announcement category
function determineAnnouncementCategory(title: string): string {
  const t = title.toUpperCase();
  if (t.includes('NATJEČAJ') || t.includes('STIPENDIJ')) return 'natjecaj';
  if (t.includes('OGLAS') || t.includes('PRODAJ')) return 'oglas';
  if (t.includes('POZIV')) return 'poziv';
  return 'obavijest';
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[čć]/g, 'c')
    .replace(/[šś]/g, 's')
    .replace(/[žź]/g, 'z')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    .replace(/^-|-$/g, '');
}

interface MigrationStats {
  postsFromObavijesti: number;
  postsFromVijesti: number;
  documentsToAttachments: number;
  errors: string[];
}

async function analyzeMigration(): Promise<{
  postsObavijesti: any[];
  postsVijesti: any[];
  documents: any[];
}> {
  console.log('\n📊 Analyzing content for migration...\n');

  // Get all posts from 'obavijesti' category
  const postsObavijesti = await db.post.findMany({
    where: { category: 'obavijesti' },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      publishedAt: true,
      createdAt: true,
      authorId: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`✓ Found ${postsObavijesti.length} posts in 'obavijesti' category`);

  // Get posts from 'opcinske-vijesti' that match announcement patterns
  const allVijesti = await db.post.findMany({
    where: { category: 'opcinske-vijesti' },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      publishedAt: true,
      createdAt: true,
      authorId: true,
    },
  });

  const postsVijesti = allVijesti.filter((post) =>
    ANNOUNCEMENT_TITLE_PATTERNS.some((pattern) => pattern.test(post.title))
  );

  console.log(
    `✓ Found ${postsVijesti.length} posts in 'opcinske-vijesti' matching announcement patterns`
  );
  console.log(`  (out of ${allVijesti.length} total in that category)`);

  // Get documents from 'natjecaji' category
  const documents = await db.document.findMany({
    where: { category: 'natjecaji' },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      fileSize: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`✓ Found ${documents.length} documents in 'natjecaji' category`);

  return { postsObavijesti, postsVijesti, documents };
}

async function showPreview(data: {
  postsObavijesti: any[];
  postsVijesti: any[];
  documents: any[];
}) {
  console.log('\n' + '='.repeat(70));
  console.log('MIGRATION PREVIEW');
  console.log('='.repeat(70));

  console.log('\n📰 POSTS → ANNOUNCEMENTS (obavijesti category):');
  console.log('-'.repeat(50));
  data.postsObavijesti.slice(0, 10).forEach((p, i) => {
    const cat = determineAnnouncementCategory(p.title);
    console.log(`  ${i + 1}. [${cat}] ${p.title.substring(0, 55)}...`);
  });
  if (data.postsObavijesti.length > 10) {
    console.log(`  ... and ${data.postsObavijesti.length - 10} more`);
  }

  console.log('\n📰 POSTS → ANNOUNCEMENTS (opcinske-vijesti, matching patterns):');
  console.log('-'.repeat(50));
  data.postsVijesti.slice(0, 10).forEach((p, i) => {
    const cat = determineAnnouncementCategory(p.title);
    console.log(`  ${i + 1}. [${cat}] ${p.title.substring(0, 55)}...`);
  });
  if (data.postsVijesti.length > 10) {
    console.log(`  ... and ${data.postsVijesti.length - 10} more`);
  }

  console.log('\n📎 DOCUMENTS → ANNOUNCEMENT ATTACHMENTS (natjecaji):');
  console.log('-'.repeat(50));
  data.documents.slice(0, 10).forEach((d, i) => {
    console.log(`  ${i + 1}. ${d.title.substring(0, 60)}...`);
  });
  if (data.documents.length > 10) {
    console.log(`  ... and ${data.documents.length - 10} more`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY:');
  console.log(`  • ${data.postsObavijesti.length} posts from 'obavijesti' → Announcements`);
  console.log(`  • ${data.postsVijesti.length} posts from 'opcinske-vijesti' → Announcements`);
  console.log(`  • ${data.documents.length} documents → Standalone Announcements with PDF`);
  console.log(
    `  • TOTAL: ${data.postsObavijesti.length + data.postsVijesti.length + data.documents.length} new announcements`
  );
  console.log('='.repeat(70));
}

async function executeMigration(data: {
  postsObavijesti: any[];
  postsVijesti: any[];
  documents: any[];
}): Promise<MigrationStats> {
  const stats: MigrationStats = {
    postsFromObavijesti: 0,
    postsFromVijesti: 0,
    documentsToAttachments: 0,
    errors: [],
  };

  console.log('\n🚀 Starting migration...\n');

  // Keep track of used slugs to avoid duplicates
  const usedSlugs = new Set<string>();
  const existingSlugs = await db.announcement.findMany({
    select: { slug: true },
  });
  existingSlugs.forEach((a) => usedSlugs.add(a.slug));

  function getUniqueSlug(baseSlug: string): string {
    let slug = baseSlug;
    let counter = 1;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    usedSlugs.add(slug);
    return slug;
  }

  // Migrate posts from 'obavijesti'
  console.log('📰 Migrating posts from obavijesti category...');
  for (const post of data.postsObavijesti) {
    try {
      const slug = getUniqueSlug(post.slug || generateSlug(post.title));
      const category = determineAnnouncementCategory(post.title);

      await db.announcement.create({
        data: {
          title: post.title,
          slug,
          content: post.content,
          excerpt: post.excerpt,
          category,
          publishedAt: post.publishedAt,
          authorId: post.authorId,
          createdAt: post.createdAt,
        },
      });

      stats.postsFromObavijesti++;
      process.stdout.write(`\r  Migrated ${stats.postsFromObavijesti}/${data.postsObavijesti.length}`);
    } catch (error) {
      stats.errors.push(`Post ${post.id}: ${(error as Error).message}`);
    }
  }
  console.log(' ✓');

  // Migrate posts from 'opcinske-vijesti' matching patterns
  console.log('📰 Migrating matching posts from opcinske-vijesti...');
  for (const post of data.postsVijesti) {
    try {
      const slug = getUniqueSlug(post.slug || generateSlug(post.title));
      const category = determineAnnouncementCategory(post.title);

      await db.announcement.create({
        data: {
          title: post.title,
          slug,
          content: post.content,
          excerpt: post.excerpt,
          category,
          publishedAt: post.publishedAt,
          authorId: post.authorId,
          createdAt: post.createdAt,
        },
      });

      stats.postsFromVijesti++;
      process.stdout.write(`\r  Migrated ${stats.postsFromVijesti}/${data.postsVijesti.length}`);
    } catch (error) {
      stats.errors.push(`Post ${post.id}: ${(error as Error).message}`);
    }
  }
  console.log(' ✓');

  // Convert documents to announcements with attachments
  console.log('📎 Converting natjecaji documents to announcements...');
  for (const doc of data.documents) {
    try {
      const slug = getUniqueSlug(generateSlug(doc.title));
      const category = determineAnnouncementCategory(doc.title);

      // Create announcement with the document as attachment
      // Determine file extension from URL or default to .pdf
      const fileExt = doc.fileUrl.match(/\.([a-z0-9]+)$/i)?.[1] || 'pdf';
      const mimeType = fileExt === 'pdf' ? 'application/pdf' : `application/${fileExt}`;

      await db.announcement.create({
        data: {
          title: doc.title,
          slug,
          content: null,
          excerpt: null,
          category,
          publishedAt: doc.createdAt, // Use document creation date as publish date
          authorId: null,
          createdAt: doc.createdAt,
          attachments: {
            create: {
              fileName: doc.title + '.' + fileExt,
              fileUrl: doc.fileUrl,
              fileSize: doc.fileSize || 0,
              mimeType,
              sortOrder: 0,
            },
          },
        },
      });

      stats.documentsToAttachments++;
      process.stdout.write(`\r  Converted ${stats.documentsToAttachments}/${data.documents.length}`);
    } catch (error) {
      stats.errors.push(`Document ${doc.id}: ${(error as Error).message}`);
    }
  }
  console.log(' ✓');

  return stats;
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--execute');

  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║     MIGRATION SCRIPT: Posts/Documents → Announcements              ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');

  if (isDryRun) {
    console.log('\n⚠️  DRY RUN MODE - No changes will be made');
    console.log('   Run with --execute to perform the migration\n');
  } else {
    console.log('\n🔴 EXECUTE MODE - Changes WILL be made to the database!\n');
  }

  try {
    // Analyze what needs to be migrated
    const data = await analyzeMigration();

    // Show preview
    await showPreview(data);

    if (isDryRun) {
      console.log('\n💡 To execute this migration, run:');
      console.log('   DATABASE_URL="..." npx tsx scripts/migrate-to-announcements.ts --execute\n');
    } else {
      // Execute migration
      const stats = await executeMigration(data);

      console.log('\n' + '='.repeat(70));
      console.log('MIGRATION COMPLETE');
      console.log('='.repeat(70));
      console.log(`  ✓ ${stats.postsFromObavijesti} posts migrated from 'obavijesti'`);
      console.log(`  ✓ ${stats.postsFromVijesti} posts migrated from 'opcinske-vijesti'`);
      console.log(`  ✓ ${stats.documentsToAttachments} documents converted to announcements`);

      if (stats.errors.length > 0) {
        console.log(`\n  ⚠️  ${stats.errors.length} errors occurred:`);
        stats.errors.slice(0, 10).forEach((e) => console.log(`    - ${e}`));
        if (stats.errors.length > 10) {
          console.log(`    ... and ${stats.errors.length - 10} more`);
        }
      }

      console.log('\n📋 Next steps:');
      console.log('   1. Review the migrated announcements in the admin panel');
      console.log('   2. Optionally delete the original posts/documents');
      console.log('   3. Update category constants if needed');
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
