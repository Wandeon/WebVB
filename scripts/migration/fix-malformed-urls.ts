/**
 * Fix Malformed URLs in Pages
 *
 * Fixes paths like /pocetnawp-content/uploads/... that got concatenated incorrectly
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
const R2_PUBLIC_URL = 'https://pub-920c291ea0c74945936ae9819993768a.r2.dev';

async function main() {
  // Load media URL map
  const mediaUrlMap: Record<string, string> = JSON.parse(
    readFileSync('/mnt/c/VelikiBukovec_web/scripts/migration/output/media-url-map.json', 'utf-8')
  );

  console.log('Loaded', Object.keys(mediaUrlMap).length, 'media URL mappings');

  // Find pages with malformed paths
  const pages = await prisma.page.findMany({
    where: {
      OR: [
        { content: { contains: '/pocetnawp-content' } },
        { content: { contains: '/pocetna/wp-content' } }
      ]
    },
    select: { id: true, slug: true, content: true }
  });

  console.log('Found', pages.length, 'pages to fix\n');

  let totalFixed = 0;

  for (const page of pages) {
    console.log('Fixing page:', page.slug);

    let newContent = page.content;
    let fixCount = 0;

    // Pattern 1: /pocetnawp-content/uploads/...
    const pattern1 = /\/pocetnawp-content\/uploads\/([^"'\s\}]+)/g;
    newContent = newContent.replace(pattern1, (match, path) => {
      const wpUrl = `https://velikibukovec.hr/wp-content/uploads/${path}`;
      if (mediaUrlMap[wpUrl]) {
        fixCount++;
        return mediaUrlMap[wpUrl];
      }
      // Construct R2 URL directly
      fixCount++;
      return `${R2_PUBLIC_URL}/migration/${path}`;
    });

    // Pattern 2: /pocetna/wp-content/uploads/...
    const pattern2 = /\/pocetna\/wp-content\/uploads\/([^"'\s\}]+)/g;
    newContent = newContent.replace(pattern2, (match, path) => {
      const wpUrl = `https://velikibukovec.hr/wp-content/uploads/${path}`;
      if (mediaUrlMap[wpUrl]) {
        fixCount++;
        return mediaUrlMap[wpUrl];
      }
      fixCount++;
      return `${R2_PUBLIC_URL}/migration/${path}`;
    });

    if (newContent !== page.content) {
      await prisma.page.update({
        where: { id: page.id },
        data: { content: newContent }
      });
      console.log(`  Fixed ${fixCount} URLs`);
      totalFixed += fixCount;
    } else {
      console.log('  No changes needed');
    }
  }

  // Verify
  const remaining = await prisma.page.count({
    where: {
      OR: [
        { content: { contains: '/pocetnawp-content' } },
        { content: { contains: '/pocetna/wp-content' } }
      ]
    }
  });

  console.log(`\nTotal URLs fixed: ${totalFixed}`);
  console.log('Pages still with malformed paths:', remaining);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
