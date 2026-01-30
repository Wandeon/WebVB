/**
 * Backfill embeddings for search_index using Ollama nomic-embed-text
 * Run with: npx tsx packages/database/scripts/backfill-embeddings.ts
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const OLLAMA_URL = process.env.OLLAMA_LOCAL_URL || 'http://127.0.0.1:11434';
const BATCH_SIZE = 10;
const EMBEDDING_MODEL = 'nomic-embed-text';

interface OllamaEmbeddingResponse {
  embedding: number[];
}

async function getEmbedding(text: string): Promise<number[]> {
  // Truncate text to ~8000 chars to stay within context limits
  const truncated = text.slice(0, 8000);

  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      prompt: truncated,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as OllamaEmbeddingResponse;
  return data.embedding;
}

async function backfillEmbeddings() {
  console.log('🚀 Starting embedding backfill...');
  console.log(`   Ollama URL: ${OLLAMA_URL}`);
  console.log(`   Model: ${EMBEDDING_MODEL}`);

  // Get records without embeddings
  const records = await db.$queryRaw<{ id: string; title: string; content_text: string }[]>`
    SELECT id, title, content_text
    FROM search_index
    WHERE embedding IS NULL
    ORDER BY updated_at DESC
  `;

  console.log(`📊 Found ${records.length} records without embeddings\n`);

  let processed = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (record) => {
        try {
          // Combine title and content for embedding
          const textToEmbed = `${record.title}\n\n${record.content_text}`;
          const embedding = await getEmbedding(textToEmbed);

          // Convert to pgvector format: [0.1, 0.2, ...] -> '[0.1,0.2,...]'
          const vectorString = `[${embedding.join(',')}]`;

          // Update using raw SQL for vector type
          await db.$executeRaw`
            UPDATE search_index
            SET embedding = ${vectorString}::vector
            WHERE id = ${record.id}
          `;

          processed++;
        } catch (error) {
          errors++;
          console.error(`❌ Error processing ${record.id}: ${error}`);
        }
      })
    );

    const progress = Math.round(((i + batch.length) / records.length) * 100);
    console.log(`   Progress: ${i + batch.length}/${records.length} (${progress}%) - ${processed} success, ${errors} errors`);
  }

  console.log(`\n✅ Backfill complete!`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Errors: ${errors}`);

  await db.$disconnect();
}

backfillEmbeddings().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
