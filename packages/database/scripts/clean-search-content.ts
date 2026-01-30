/**
 * Clean search_index content_text by extracting plain text from TipTap JSON
 * Run with: npx tsx packages/database/scripts/clean-search-content.ts
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

function extractTextFromTipTap(json: string): string {
  try {
    const doc = JSON.parse(json) as TipTapNode;
    return extractTextFromNode(doc);
  } catch {
    // If it's not valid JSON, return as-is (might already be plain text)
    return json;
  }
}

function extractTextFromNode(node: TipTapNode): string {
  const parts: string[] = [];

  if (node.text) {
    parts.push(node.text);
  }

  if (node.content) {
    for (const child of node.content) {
      parts.push(extractTextFromNode(child));
    }
  }

  // Add spacing between block elements
  if (['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote'].includes(node.type)) {
    return parts.join('') + '\n';
  }

  return parts.join('');
}

async function cleanSearchContent() {
  console.log('🧹 Cleaning search_index content_text...\n');

  // Get records that contain TipTap JSON
  const records = await db.$queryRaw<{ id: string; title: string; content_text: string }[]>`
    SELECT id, title, content_text
    FROM search_index
    WHERE content_text LIKE '%{"type":"doc"%'
       OR content_text LIKE '%{"type":"paragraph"%'
  `;

  console.log(`📊 Found ${records.length} records with JSON content\n`);

  let updated = 0;
  let errors = 0;

  for (const record of records) {
    try {
      // Extract text starting from the JSON part
      const jsonMatch = record.content_text.match(/\{\"type\":\"doc\".*$/s);
      if (!jsonMatch) {
        // Try to find any JSON-like content
        const anyJsonMatch = record.content_text.match(/\{\"type\":.*$/s);
        if (!anyJsonMatch) continue;
      }

      const jsonPart = jsonMatch ? jsonMatch[0] : '';
      const prefixPart = record.content_text.slice(0, record.content_text.indexOf(jsonPart));

      // Extract plain text from JSON
      const plainText = extractTextFromTipTap(jsonPart);

      // Combine prefix (title, category, etc.) with extracted text
      const cleanedContent = (prefixPart + ' ' + plainText)
        .replace(/\s+/g, ' ')
        .trim();

      // Update the record
      await db.$executeRaw`
        UPDATE search_index
        SET content_text = ${cleanedContent},
            search_vector = to_tsvector('simple', ${record.title} || ' ' || ${cleanedContent}),
            embedding = NULL
        WHERE id = ${record.id}
      `;

      updated++;

      if (updated % 50 === 0) {
        console.log(`   Progress: ${updated}/${records.length}`);
      }
    } catch (error) {
      errors++;
      console.error(`❌ Error cleaning ${record.id} (${record.title}): ${error}`);
    }
  }

  console.log(`\n✅ Cleanup complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);

  await db.$disconnect();
}

cleanSearchContent().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
