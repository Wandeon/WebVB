/**
 * Backfill script to index existing content into SearchIndex
 *
 * Run with: pnpm --filter @repo/database run backfill-search
 */

import { db } from '../client';
import {
  indexDocument,
  indexEvent,
  indexPage,
  indexPost,
} from '../search/indexer';

async function backfillSearchIndex() {
  console.log('Starting search index backfill...\n');

  // Index published posts
  console.log('Indexing posts...');
  const posts = await db.post.findMany({
    where: { publishedAt: { not: null } },
  });
  let postCount = 0;
  for (const post of posts) {
    await indexPost({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      publishedAt: post.publishedAt,
    });
    postCount++;
    if (postCount % 10 === 0) {
      console.log(`  Indexed ${postCount}/${posts.length} posts`);
    }
  }
  console.log(`  Completed: ${postCount} posts indexed\n`);

  // Index documents
  console.log('Indexing documents...');
  const documents = await db.document.findMany();
  let docCount = 0;
  for (const doc of documents) {
    await indexDocument({
      id: doc.id,
      title: doc.title,
      fileUrl: doc.fileUrl,
      category: doc.category,
      subcategory: doc.subcategory,
      year: doc.year,
    });
    docCount++;
    if (docCount % 10 === 0) {
      console.log(`  Indexed ${docCount}/${documents.length} documents`);
    }
  }
  console.log(`  Completed: ${docCount} documents indexed\n`);

  // Index pages
  console.log('Indexing pages...');
  const pages = await db.page.findMany();
  let pageCount = 0;
  for (const page of pages) {
    await indexPage({
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
    });
    pageCount++;
    if (pageCount % 10 === 0) {
      console.log(`  Indexed ${pageCount}/${pages.length} pages`);
    }
  }
  console.log(`  Completed: ${pageCount} pages indexed\n`);

  // Index events
  console.log('Indexing events...');
  const events = await db.event.findMany();
  let eventCount = 0;
  for (const event of events) {
    await indexEvent({
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      location: event.location,
    });
    eventCount++;
    if (eventCount % 10 === 0) {
      console.log(`  Indexed ${eventCount}/${events.length} events`);
    }
  }
  console.log(`  Completed: ${eventCount} events indexed\n`);

  // Summary
  const total = postCount + docCount + pageCount + eventCount;
  console.log('='.repeat(40));
  console.log('Backfill complete!');
  console.log(`Total indexed: ${total} items`);
  console.log(`  - Posts: ${postCount}`);
  console.log(`  - Documents: ${docCount}`);
  console.log(`  - Pages: ${pageCount}`);
  console.log(`  - Events: ${eventCount}`);
}

// Run the backfill
backfillSearchIndex()
  .then(() => {
    console.log('\nBackfill finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nBackfill failed:', error);
    process.exit(1);
  });
