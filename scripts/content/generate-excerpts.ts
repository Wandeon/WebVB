/**
 * Generate Missing Excerpts Script
 *
 * Finds published posts with content but no/empty excerpt,
 * extracts text from TipTap JSON or HTML content,
 * takes first 160 characters (breaking at word boundary),
 * and updates the excerpt field.
 *
 * Run with: pnpm tsx scripts/content/generate-excerpts.ts
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({
  log: ['error'],
});

interface PostWithMissingExcerpt {
  id: string;
  slug: string;
  title: string;
  content: string;
}

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  attrs?: Record<string, string>;
}

/**
 * Strip HTML tags and normalize whitespace
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Extract text from TipTap/ProseMirror JSON content
 */
function extractTextFromTipTap(node: TipTapNode): string {
  const textParts: string[] = [];

  if (node.text) {
    textParts.push(node.text);
  }

  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      const childText = extractTextFromTipTap(child);
      if (childText) {
        textParts.push(childText);
      }
    }
  }

  return textParts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extract plain text from content (handles both TipTap JSON and HTML)
 */
function extractPlainText(content: string): string {
  if (!content || content.trim() === '') {
    return '';
  }

  // Try to parse as TipTap JSON
  if (content.startsWith('{')) {
    try {
      const json = JSON.parse(content) as TipTapNode;
      return extractTextFromTipTap(json);
    } catch {
      // Not valid JSON, treat as HTML
    }
  }

  // Treat as HTML
  return stripHtml(content);
}

/**
 * Generate excerpt from content
 * Takes first 160 characters, breaking at word boundary
 * Falls back to title if no text content is available
 */
function generateExcerpt(
  content: string,
  title: string,
  maxLength: number = 160
): string | null {
  const plainText = extractPlainText(content);

  // If no text content, return null (will use title as fallback)
  if (!plainText || plainText.length === 0) {
    return null;
  }

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find the last space before maxLength
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.5) {
    // Break at word boundary if it's not too short
    return truncated.substring(0, lastSpace) + '...';
  }

  // If breaking at word would make it too short, just truncate
  return truncated + '...';
}

/**
 * Find published posts with content but no/empty excerpt
 * Also finds posts with excerpts that look like raw JSON (broken excerpts)
 */
async function findPostsMissingExcerpts(): Promise<PostWithMissingExcerpt[]> {
  const posts = await db.post.findMany({
    where: {
      publishedAt: { not: null },
      content: { not: '' },
      OR: [
        { excerpt: null },
        { excerpt: '' },
        // Also fix previously broken excerpts that contain raw JSON
        { excerpt: { startsWith: '{"type":' } },
      ],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
    },
    orderBy: { title: 'asc' },
  });

  return posts;
}

/**
 * Update a post's excerpt
 */
async function updateExcerpt(postId: string, excerpt: string): Promise<void> {
  await db.post.update({
    where: { id: postId },
    data: { excerpt },
  });
}

/**
 * Verify no posts are still missing excerpts
 */
async function verifyNoMissingExcerpts(): Promise<number> {
  const count = await db.post.count({
    where: {
      publishedAt: { not: null },
      OR: [{ excerpt: null }, { excerpt: '' }],
    },
  });
  return count;
}

async function main(): Promise<void> {
  console.log('Generate Missing Excerpts');
  console.log('='.repeat(50));
  console.log('');

  try {
    // Find posts missing excerpts
    console.log('Finding published posts with content but no excerpt...');
    const posts = await findPostsMissingExcerpts();
    console.log(`  Found ${posts.length} posts missing excerpts`);
    console.log('');

    if (posts.length === 0) {
      console.log('No posts need excerpt generation.');
      return;
    }

    // Generate and update excerpts
    console.log('Generating excerpts...');
    console.log('');

    let updatedCount = 0;
    let skippedCount = 0;

    for (const post of posts) {
      const excerpt = generateExcerpt(post.content, post.title);

      if (excerpt === null) {
        // No text content available, use title as fallback excerpt
        const titleExcerpt = post.title;
        await updateExcerpt(post.id, titleExcerpt);

        console.log(`Updated (title fallback): ${post.title}`);
        console.log(`  Slug: ${post.slug}`);
        console.log(`  Excerpt: ${titleExcerpt}`);
        console.log(`  Note: Content only contains images, using title as excerpt`);
        console.log('');
        updatedCount++;
      } else {
        await updateExcerpt(post.id, excerpt);

        console.log(`Updated: ${post.title}`);
        console.log(`  Slug: ${post.slug}`);
        console.log(`  Excerpt: ${excerpt.substring(0, 80)}${excerpt.length > 80 ? '...' : ''}`);
        console.log('');
        updatedCount++;
      }
    }

    // Verify
    console.log('Verifying...');
    const remainingCount = await verifyNoMissingExcerpts();

    if (remainingCount === 0) {
      console.log('  All published posts now have excerpts.');
    } else {
      console.log(`  Warning: ${remainingCount} published posts still missing excerpts.`);
    }

    console.log('');
    console.log(`Summary: Updated ${updatedCount} posts with auto-generated excerpts.`);
    console.log('');
    console.log('Excerpt generation complete.');
  } catch (error) {
    console.error('Error during excerpt generation:', error);
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
