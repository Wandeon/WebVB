/**
 * Document Import Script
 * Sprint 4.5: Import Documents with Categorization
 *
 * Scans WordPress uploads for PDFs/docs and imports into documents table.
 * Run with: cd apps/admin && npx tsx ../../scripts/migration/import-documents.ts
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { PrismaClient } from '@prisma/client';

// Load env manually
function loadEnv(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([^#=]+)=["']?(.*)["']?$/);
      if (match && !process.env[match[1].trim()]) {
        process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    /* ignore */
  }
}
loadEnv('/mnt/c/VelikiBukovec_web/.env');
loadEnv('/mnt/c/VelikiBukovec_web/apps/admin/.env');

const prisma = new PrismaClient();

// Document extensions to look for
const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.odt'];

// Folders to skip (plugin folders, etc.)
const SKIP_FOLDERS = [
  'elementor',
  'js_composer',
  'hugeit-slider',
  'grid-gallery',
  'auto-install-free-ssl',
  'download-manager-files',
  'nginx-helper',
  'photo-gallery',
  'sucuri',
  'the7-css',
  'wc-logs',
];

// Category keywords (Croatian)
const CATEGORY_RULES: Array<{ keywords: string[]; category: string }> = [
  { keywords: ['sjednic'], category: 'sjednice' },
  { keywords: ['proračun', 'proracun'], category: 'proracun' },
  { keywords: ['natječaj', 'natjecaj'], category: 'natjecaji' },
  { keywords: ['izvješć', 'izvjesc', 'izvjesce'], category: 'izvjesca' },
  { keywords: ['odluk'], category: 'odluke' },
];

interface MediaUrlMap {
  [key: string]: string;
}

interface DocumentStats {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  byCategory: Record<string, number>;
}

const stats: DocumentStats = {
  total: 0,
  imported: 0,
  skipped: 0,
  errors: 0,
  byCategory: {},
};

/**
 * Walk directory recursively and collect files
 */
function walkDirectory(dir: string): string[] {
  const files: string[] = [];

  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);

    // Skip plugin folders
    if (SKIP_FOLDERS.includes(entry)) {
      continue;
    }

    try {
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...walkDirectory(fullPath));
      } else {
        const ext = extname(fullPath).toLowerCase();
        if (DOCUMENT_EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
      }
    } catch {
      // Skip files we can't access
    }
  }

  return files;
}

/**
 * Determine category based on filename keywords
 */
function categorizeDocument(filename: string): string {
  const lowerFilename = filename.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (lowerFilename.includes(keyword.toLowerCase())) {
        return rule.category;
      }
    }
  }

  return 'ostalo';
}

/**
 * Extract year from path or filename
 * Looks for patterns like /2015/02/ or _2015. or -2015-
 */
function extractYear(filePath: string, filename: string): number | null {
  // First try to extract from path (WordPress uploads are usually in /YYYY/MM/ folders)
  const pathMatch = filePath.match(/\/(\d{4})\/\d{2}\//);
  if (pathMatch) {
    const year = parseInt(pathMatch[1], 10);
    if (year >= 2000 && year <= 2030) {
      return year;
    }
  }

  // Try to extract from filename
  const filenamePatterns = [
    /[_\-\.](\d{4})[_\-\.]/,
    /(\d{4})\.(?:pdf|doc|docx|xls|xlsx|odt)$/i,
    /za[_\-\s](\d{4})/i,
    /(\d{4})[_\-]?god/i,
  ];

  for (const pattern of filenamePatterns) {
    const match = filename.match(pattern);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 2000 && year <= 2030) {
        return year;
      }
    }
  }

  return null;
}

/**
 * Clean up filename to create a proper title
 * Remove extension, replace dashes/underscores with spaces, title case
 */
function filenameToTitle(filename: string): string {
  // Remove extension
  const ext = extname(filename);
  let title = filename.slice(0, -ext.length);

  // Replace dashes and underscores with spaces
  title = title.replace(/[-_]/g, ' ');

  // Replace multiple spaces with single space
  title = title.replace(/\s+/g, ' ').trim();

  // Title case (capitalize first letter of each word)
  title = title
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word;
      // Don't capitalize short words like 'o', 'i', 'za' etc unless they're at the start
      const lowerWord = word.toLowerCase();
      if (['o', 'i', 'u', 'za', 'na', 'od', 'do', 'sa', 's'].includes(lowerWord)) {
        return lowerWord;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  // Make sure first character is uppercase
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return title;
}

/**
 * Build R2 URL from local file path
 */
function getR2Url(
  filePath: string,
  uploadsDir: string,
  mediaUrlMap: MediaUrlMap
): string | null {
  // Get relative path from uploads dir
  const relativePath = filePath
    .replace(uploadsDir, '')
    .replace(/^[\/\\]/, '')
    .replace(/\\/g, '/');

  // Build WordPress URL format (both http and https)
  const wpUrlHttps = `https://velikibukovec.hr/wp-content/uploads/${relativePath}`;
  const wpUrlHttp = `http://velikibukovec.hr/wp-content/uploads/${relativePath}`;

  // Look up in media URL map
  if (mediaUrlMap[wpUrlHttps]) {
    return mediaUrlMap[wpUrlHttps];
  }
  if (mediaUrlMap[wpUrlHttp]) {
    return mediaUrlMap[wpUrlHttp];
  }

  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log('=== Document Import Script ===\n');

  if (dryRun) {
    console.log('[DRY RUN MODE - No changes will be made]\n');
  }

  // Load media URL map
  const mediaUrlMapPath = join(
    process.cwd(),
    '../../scripts/migration/output/media-url-map.json'
  );

  if (!existsSync(mediaUrlMapPath)) {
    console.error(`Error: media-url-map.json not found at ${mediaUrlMapPath}`);
    console.log('Run the media migration script first.');
    process.exit(1);
  }

  const mediaUrlMap: MediaUrlMap = JSON.parse(
    readFileSync(mediaUrlMapPath, 'utf-8')
  );
  console.log(`Loaded ${Object.keys(mediaUrlMap).length} URL mappings\n`);

  // Source directory - WordPress uploads
  const uploadsDir =
    '/mnt/c/VelikiBukovec_web/homedir/public_html/wp-content/uploads';

  if (!existsSync(uploadsDir)) {
    console.error(`Error: Uploads directory not found: ${uploadsDir}`);
    process.exit(1);
  }

  // Find all document files
  console.log('Scanning for documents...');
  const files = walkDirectory(uploadsDir);
  stats.total = files.length;
  console.log(`Found ${stats.total} documents\n`);

  // Initialize category counters
  const categories = ['sjednice', 'proracun', 'natjecaji', 'izvjesca', 'odluke', 'ostalo'];
  for (const cat of categories) {
    stats.byCategory[cat] = 0;
  }

  // Check for existing documents
  const existingDocs = await prisma.document.findMany({
    select: { fileUrl: true },
  });
  const existingUrls = new Set(existingDocs.map((d) => d.fileUrl));
  console.log(`Found ${existingUrls.size} existing documents in database\n`);

  // Process each file
  console.log('Importing documents...');

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const filename = basename(filePath);

    // Progress update
    if ((i + 1) % 100 === 0 || i === files.length - 1) {
      console.log(`  Progress: ${i + 1}/${stats.total}`);
    }

    try {
      // Get R2 URL
      const fileUrl = getR2Url(filePath, uploadsDir, mediaUrlMap);

      if (!fileUrl) {
        // File not found in URL map - might not have been uploaded
        stats.skipped++;
        continue;
      }

      // Skip if already exists
      if (existingUrls.has(fileUrl)) {
        stats.skipped++;
        continue;
      }

      // Get file size
      let fileSize: number | null = null;
      try {
        const fileStat = statSync(filePath);
        fileSize = fileStat.size;
      } catch {
        // Can't get file size
      }

      // Categorize
      const category = categorizeDocument(filename);
      stats.byCategory[category]++;

      // Extract year
      const year = extractYear(filePath, filename);

      // Create title
      const title = filenameToTitle(filename);

      if (dryRun) {
        // Just count
        stats.imported++;
        continue;
      }

      // Insert into database
      await prisma.document.create({
        data: {
          title,
          fileUrl,
          fileSize,
          category,
          year,
        },
      });

      stats.imported++;
    } catch (error) {
      stats.errors++;
      console.error(`  Error processing ${filename}: ${error}`);
    }
  }

  // Print summary
  console.log('\n=== Import Summary ===');
  console.log(`Total files scanned: ${stats.total}`);
  console.log(`Imported: ${stats.imported}`);
  console.log(`Skipped (no URL or existing): ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);

  console.log('\n=== Documents by Category ===');
  for (const [category, count] of Object.entries(stats.byCategory).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`  ${category}: ${count}`);
  }

  if (dryRun) {
    console.log('\n[DRY RUN] No changes were made to the database.');
  }

  // Verify final count
  if (!dryRun) {
    const finalCount = await prisma.document.count();
    console.log(`\nTotal documents in database: ${finalCount}`);

    // Count by category in database
    const categoryCounts = await prisma.document.groupBy({
      by: ['category'],
      _count: { category: true },
    });
    console.log('\n=== Database Documents by Category ===');
    for (const item of categoryCounts.sort(
      (a, b) => b._count.category - a._count.category
    )) {
      console.log(`  ${item.category}: ${item._count.category}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
