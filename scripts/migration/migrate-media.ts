/**
 * Media Migration Script
 * Sprint 4.5: Image Migration
 *
 * Processes WordPress media files and uploads to R2.
 * Run with: cd apps/admin && npx tsx ../../scripts/migration/migrate-media.ts
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

// Load env manually
import { readFileSync as readEnvFile } from 'fs';
function loadEnv(filePath: string) {
  try {
    const content = readEnvFile(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([^#=]+)=["']?(.*)["']?$/);
      if (match && !process.env[match[1].trim()]) {
        process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch { /* ignore */ }
}
loadEnv('/mnt/c/VelikiBukovec_web/.env');
loadEnv('/mnt/c/VelikiBukovec_web/apps/admin/.env');

const prisma = new PrismaClient();

// R2 Configuration
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'velikibukovec-media';
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY || '',
    secretAccessKey: R2_SECRET_KEY || '',
  },
});

// Image processing settings
const IMAGE_VARIANTS = {
  thumb: { width: 150, height: 150 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
};

interface MigrationStats {
  total: number;
  processed: number;
  uploaded: number;
  skipped: number;
  errors: number;
}

const stats: MigrationStats = {
  total: 0,
  processed: 0,
  uploaded: 0,
  skipped: 0,
  errors: 0,
};

// URL mapping: old WordPress URL -> new R2 URL
const urlMap: Record<string, string> = {};

async function processImage(filePath: string, relativePath: string): Promise<string | null> {
  try {
    const ext = extname(filePath).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);

    if (!isImage) {
      // Non-image file (PDF, doc, etc) - upload as-is
      const buffer = readFileSync(filePath);
      const key = `migration/${relativePath}`;

      await s3Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: getMimeType(ext),
      }));

      return `${R2_PUBLIC_URL}/${key}`;
    }

    // Process image with Sharp
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Convert to WebP for better compression
    const baseName = basename(filePath, ext);
    const webpKey = `migration/${relativePath.replace(ext, '.webp')}`;

    // Create optimized version
    const webpBuffer = await image
      .webp({ quality: 85 })
      .resize(IMAGE_VARIANTS.large.width, IMAGE_VARIANTS.large.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

    await s3Client.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: webpKey,
      Body: webpBuffer,
      ContentType: 'image/webp',
    }));

    return `${R2_PUBLIC_URL}/${webpKey}`;
  } catch (error) {
    console.error(`  Error processing ${filePath}: ${error}`);
    return null;
  }
}

function getMimeType(ext: string): string {
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return types[ext] || 'application/octet-stream';
}

async function walkDirectory(dir: string, baseDir: string): Promise<string[]> {
  const files: string[] = [];

  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...await walkDirectory(fullPath, baseDir));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function updatePostUrls() {
  console.log('\nUpdating post content with new URLs...');

  const posts = await prisma.post.findMany();
  let updated = 0;

  for (const post of posts) {
    let content = post.content;
    let changed = false;

    // Replace old WordPress URLs with new R2 URLs
    for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
      if (content.includes(oldUrl)) {
        content = content.split(oldUrl).join(newUrl);
        changed = true;
      }
    }

    if (changed) {
      await prisma.post.update({
        where: { id: post.id },
        data: { content },
      });
      updated++;
    }
  }

  console.log(`Updated ${updated} posts with new image URLs`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const skipUpload = args.includes('--skip-upload');

  // Source directory - WordPress uploads
  const sourceDir = join(process.cwd(), '../../homedir/public_html/wp-content/uploads');
  const uploadsDir = sourceDir;

  console.log('=== Media Migration Script ===\n');
  console.log(`Source: ${uploadsDir}`);
  console.log(`Destination: R2 bucket '${R2_BUCKET}'`);
  console.log(`Public URL: ${R2_PUBLIC_URL}`);

  if (dryRun) {
    console.log('\n[DRY RUN MODE - No uploads will be made]\n');
  }

  if (!existsSync(uploadsDir)) {
    console.error(`\nError: Source directory not found: ${uploadsDir}`);
    console.log('Make sure WordPress uploads are copied to /homedir');
    process.exit(1);
  }

  if (!R2_PUBLIC_URL && !dryRun) {
    console.error('\nError: CLOUDFLARE_R2_PUBLIC_URL not set');
    process.exit(1);
  }

  // Find all files
  console.log('\nScanning for files...');
  const files = await walkDirectory(uploadsDir, uploadsDir);
  stats.total = files.length;
  console.log(`Found ${stats.total} files\n`);

  // Load attachments.json to build URL mapping
  const attachmentsPath = join(process.cwd(), '../../scripts/migration/output/attachments.json');
  let attachments: Array<{ id: number; url: string; filename: string }> = [];

  if (existsSync(attachmentsPath)) {
    attachments = JSON.parse(readFileSync(attachmentsPath, 'utf-8'));
    console.log(`Loaded ${attachments.length} attachment records\n`);
  }

  // Skip plugin folders and WordPress thumbnails
  const skipFolders = ['elementor', 'js_composer', 'hugeit-slider', 'grid-gallery', 'auto-install-free-ssl', 'download-manager-files'];
  const thumbnailPattern = /-\d+x\d+\.(jpg|jpeg|png|gif|webp)$/i;
  const originalFiles = files.filter(f => {
    // Skip plugin folders
    if (skipFolders.some(folder => f.includes(`/${folder}/`) || f.includes(`\\${folder}\\`))) {
      return false;
    }
    // Skip thumbnails
    if (thumbnailPattern.test(f)) {
      return false;
    }
    return true;
  });

  console.log(`Filtered to ${originalFiles.length} original files (skipped ${files.length - originalFiles.length} thumbnails)\n`);
  stats.total = originalFiles.length;

  // Process files
  console.log('Processing files...');

  for (let i = 0; i < originalFiles.length; i++) {
    const file = originalFiles[i];
    const relativePath = file.replace(uploadsDir + '/', '').replace(uploadsDir + '\\', '');

    // Progress every 100 files
    if ((i + 1) % 100 === 0) {
      console.log(`  Progress: ${i + 1}/${stats.total}`);
    }

    if (dryRun || skipUpload) {
      stats.processed++;
      continue;
    }

    try {
      const newUrl = await processImage(file, relativePath);

      if (newUrl) {
        stats.uploaded++;

        // Find matching attachment and store URL mapping
        const oldUrl = `https://velikibukovec.hr/wp-content/uploads/${relativePath}`;
        urlMap[oldUrl] = newUrl;

        // Also map without https
        urlMap[oldUrl.replace('https://', 'http://')] = newUrl;
      } else {
        stats.skipped++;
      }
    } catch (error) {
      stats.errors++;
      console.error(`  Error: ${file} - ${error}`);
    }

    stats.processed++;
  }

  // Save URL map for reference
  const { writeFileSync } = await import('fs');
  writeFileSync(
    join(process.cwd(), '../../scripts/migration/output/media-url-map.json'),
    JSON.stringify(urlMap, null, 2)
  );

  // Update database with new URLs
  if (!dryRun && !skipUpload && Object.keys(urlMap).length > 0) {
    await updatePostUrls();
  }

  console.log('\n=== Migration Summary ===');
  console.log(`Total files: ${stats.total}`);
  console.log(`Processed: ${stats.processed}`);
  console.log(`Uploaded: ${stats.uploaded}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`URL mappings: ${Object.keys(urlMap).length}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
