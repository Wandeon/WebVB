/**
 * Gallery Import Script
 * Sprint 4.5: Import Galleries with Images
 *
 * Scans photo-gallery folder, groups images by prefix, and imports galleries.
 * Run with: cd apps/admin && npx tsx ../../scripts/migration/import-galleries.ts
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

// Image extensions to look for
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Photo gallery base path
const PHOTO_GALLERY_BASE =
  '/mnt/c/VelikiBukovec_web/homedir/public_html/wp-content/uploads/photo-gallery/photo-gallery';

// Uploads base path for URL building
const UPLOADS_BASE =
  '/mnt/c/VelikiBukovec_web/homedir/public_html/wp-content/uploads';

interface MediaUrlMap {
  [key: string]: string;
}

interface ImageFile {
  filename: string;
  fullPath: string;
  sortOrder: number;
}

interface GalleryGroup {
  prefix: string;
  name: string;
  images: ImageFile[];
}

interface Stats {
  galleriesCreated: number;
  imagesLinked: number;
  skipped: number;
  errors: number;
}

const stats: Stats = {
  galleriesCreated: 0,
  imagesLinked: 0,
  skipped: 0,
  errors: 0,
};

/**
 * Collect image files from a directory (non-recursive, skips subdirectories)
 */
function collectImages(dir: string, subPath: string = ''): ImageFile[] {
  const files: ImageFile[] = [];

  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);

    try {
      const stat = statSync(fullPath);

      if (stat.isFile()) {
        const ext = extname(entry).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          files.push({
            filename: entry,
            fullPath: subPath ? join(subPath, entry) : entry,
            sortOrder: 0, // Will be set later
          });
        }
      }
    } catch {
      // Skip files we can't access
    }
  }

  return files;
}

/**
 * Extract gallery prefix and sort order from filename
 * Examples:
 * - "dani_zlate_brzeske_1.JPG" -> { prefix: "dani_zlate_brzeske", order: 1 }
 * - "dvd-vb-90-godina-15.jpg" -> { prefix: "dvd-vb-90-godina", order: 15 }
 * - "os_veliki_bukovec_projekt_obnove_(3).JPG" -> { prefix: "os_veliki_bukovec_projekt_obnove", order: 3 }
 * - "IMG_20170420_142613.jpg" -> { prefix: "IMG_20170420", order: 142613 }
 * - "Nogomet_Bukovec-11.jpg" -> { prefix: "Nogomet_Bukovec", order: 11 }
 */
function extractPrefixAndOrder(filename: string): {
  prefix: string;
  order: number;
} | null {
  // Remove extension
  const ext = extname(filename);
  let nameWithoutExt = filename.slice(0, -ext.length);

  // Remove dimension suffixes like -1024x576 before processing
  nameWithoutExt = nameWithoutExt.replace(/-\d+x\d+$/, '');

  // Try different patterns

  // Pattern 1: name_(N) or name_(N)_ (parentheses)
  const parenMatch = nameWithoutExt.match(/^(.+?)_?\((\d+)\)_?$/);
  if (parenMatch) {
    return { prefix: parenMatch[1].replace(/_$/, ''), order: parseInt(parenMatch[2], 10) };
  }

  // Pattern 2: name_N or name-N at the end (underscore or dash before number)
  const numMatch = nameWithoutExt.match(/^(.+?)[_-](\d+)(?:-\d+)?$/);
  if (numMatch) {
    // Check if the prefix part is meaningful (at least 3 chars and not all digits)
    if (numMatch[1].length >= 3 && !/^\d+$/.test(numMatch[1])) {
      return { prefix: numMatch[1], order: parseInt(numMatch[2], 10) };
    }
  }

  // Pattern 3: Filename with just a number (like 073.jpg, 074.jpg)
  if (/^\d+$/.test(nameWithoutExt)) {
    return { prefix: 'numbered_images', order: parseInt(nameWithoutExt, 10) };
  }

  // Pattern 4: IMG_YYYYMMDD_HHMMSS type names - group by date
  const imgMatch = nameWithoutExt.match(/^(IMG_\d{8})_(\d+)$/);
  if (imgMatch) {
    return { prefix: imgMatch[1], order: parseInt(imgMatch[2], 10) };
  }

  // Pattern 5: plitvicaN format (standalone name ending with a number)
  const standaloneNumMatch = nameWithoutExt.match(/^([a-zA-Z]+)(\d+)$/);
  if (standaloneNumMatch) {
    return { prefix: standaloneNumMatch[1], order: parseInt(standaloneNumMatch[2], 10) };
  }

  // Pattern 6: dscNNNNN_hash format (DSC camera files) - group together as "photo_gallery_misc"
  // Match before general hash pattern since it's more specific
  const dscMatch = nameWithoutExt.match(/^dsc(\d+)_[a-f0-9]+$/i);
  if (dscMatch) {
    return { prefix: 'photo_gallery_misc', order: parseInt(dscMatch[1], 10) };
  }

  // Pattern 6b: naslovna with hash - group with misc
  const naslovnaMatch = nameWithoutExt.match(/^naslovna_[a-f0-9]+$/i);
  if (naslovnaMatch) {
    return { prefix: 'photo_gallery_misc', order: 1000 };
  }

  // Pattern 7: Other names ending with hash - keep as own gallery
  const hashMatch = nameWithoutExt.match(/^(.+?)_[a-f0-9]{10,}$/);
  if (hashMatch) {
    return { prefix: hashMatch[1], order: 0 };
  }

  // Pattern 8: Standalone name without number (treat as standalone group with order 0)
  if (/^[a-zA-Z_]+$/.test(nameWithoutExt) && nameWithoutExt.length >= 4) {
    return { prefix: nameWithoutExt, order: 0 };
  }

  return null;
}

/**
 * Group images by their prefix
 */
function groupImagesByPrefix(images: ImageFile[]): Map<string, ImageFile[]> {
  const groups = new Map<string, ImageFile[]>();

  for (const image of images) {
    const result = extractPrefixAndOrder(image.filename);

    if (result) {
      image.sortOrder = result.order;
      const prefix = result.prefix;

      if (!groups.has(prefix)) {
        groups.set(prefix, []);
      }
      groups.get(prefix)!.push(image);
    } else {
      // Images that don't match any pattern go to 'uncategorized'
      image.sortOrder = 0;
      if (!groups.has('uncategorized')) {
        groups.set('uncategorized', []);
      }
      groups.get('uncategorized')!.push(image);
    }
  }

  // Sort images within each group by sort order
  for (const [, imageList] of groups) {
    imageList.sort((a, b) => a.sortOrder - b.sortOrder);
    // Re-assign sequential sort orders
    imageList.forEach((img, idx) => {
      img.sortOrder = idx;
    });
  }

  return groups;
}

/**
 * Convert prefix to readable gallery name
 * "dani_zlate_brzeske" -> "Dani Zlate Brzeske"
 * "dvd-vb-90-godina" -> "DVD VB 90 Godina"
 */
function prefixToName(prefix: string): string {
  // Replace underscores and dashes with spaces
  let name = prefix.replace(/[_-]/g, ' ');

  // Title case
  name = name
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word;
      // Keep acronyms uppercase (like DVD, VB, IMG)
      if (word.length <= 3 && /^[A-Z0-9]+$/i.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  return name;
}

/**
 * Generate slug from name
 */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Build R2 URL from local file path
 */
function getR2Url(
  relativePath: string,
  mediaUrlMap: MediaUrlMap
): { imageUrl: string; thumbnailUrl: string | null } | null {
  // Try multiple URL variations
  const urlVariations = [
    relativePath,
    // Remove dimension suffix like -1024x576
    relativePath.replace(/-\d+x\d+(\.[^.]+)$/, '$1'),
  ];

  let imageUrl: string | null = null;

  for (const path of urlVariations) {
    // Build WordPress URL format (both http and https)
    const wpUrlHttps = `https://velikibukovec.hr/wp-content/uploads/photo-gallery/photo-gallery/${path}`;
    const wpUrlHttp = `http://velikibukovec.hr/wp-content/uploads/photo-gallery/photo-gallery/${path}`;

    // Look up in media URL map
    if (mediaUrlMap[wpUrlHttps]) {
      imageUrl = mediaUrlMap[wpUrlHttps];
      break;
    } else if (mediaUrlMap[wpUrlHttp]) {
      imageUrl = mediaUrlMap[wpUrlHttp];
      break;
    }
  }

  if (!imageUrl) {
    return null;
  }

  // Try to find thumbnail version
  let thumbnailUrl: string | null = null;
  for (const path of urlVariations) {
    const thumbPath = `thumb/${path}`;
    const thumbUrlHttps = `https://velikibukovec.hr/wp-content/uploads/photo-gallery/photo-gallery/${thumbPath}`;
    const thumbUrlHttp = `http://velikibukovec.hr/wp-content/uploads/photo-gallery/photo-gallery/${thumbPath}`;

    if (mediaUrlMap[thumbUrlHttps]) {
      thumbnailUrl = mediaUrlMap[thumbUrlHttps];
      break;
    } else if (mediaUrlMap[thumbUrlHttp]) {
      thumbnailUrl = mediaUrlMap[thumbUrlHttp];
      break;
    }
  }

  return { imageUrl, thumbnailUrl };
}

/**
 * Build R2 URL for imported_from_media_libray folder
 */
function getR2UrlForImported(
  relativePath: string,
  mediaUrlMap: MediaUrlMap
): { imageUrl: string; thumbnailUrl: string | null } | null {
  // Build WordPress URL format
  const wpUrlHttps = `https://velikibukovec.hr/wp-content/uploads/photo-gallery/photo-gallery/imported_from_media_libray/${relativePath}`;
  const wpUrlHttp = `http://velikibukovec.hr/wp-content/uploads/photo-gallery/photo-gallery/imported_from_media_libray/${relativePath}`;

  // Look up in media URL map
  let imageUrl: string | null = null;
  if (mediaUrlMap[wpUrlHttps]) {
    imageUrl = mediaUrlMap[wpUrlHttps];
  } else if (mediaUrlMap[wpUrlHttp]) {
    imageUrl = mediaUrlMap[wpUrlHttp];
  }

  if (!imageUrl) {
    return null;
  }

  // Try to find thumbnail version in thumb subfolder
  const thumbPath = `thumb/${relativePath}`;
  const thumbUrlHttps = `https://velikibukovec.hr/wp-content/uploads/photo-gallery/photo-gallery/imported_from_media_libray/${thumbPath}`;
  const thumbUrlHttp = `http://velikibukovec.hr/wp-content/uploads/photo-gallery/photo-gallery/imported_from_media_libray/${thumbPath}`;

  let thumbnailUrl: string | null = null;
  if (mediaUrlMap[thumbUrlHttps]) {
    thumbnailUrl = mediaUrlMap[thumbUrlHttps];
  } else if (mediaUrlMap[thumbUrlHttp]) {
    thumbnailUrl = mediaUrlMap[thumbUrlHttp];
  }

  return { imageUrl, thumbnailUrl };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log('=== Gallery Import Script ===\n');

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

  // Check source directories
  if (!existsSync(PHOTO_GALLERY_BASE)) {
    console.error(`Error: Photo gallery directory not found: ${PHOTO_GALLERY_BASE}`);
    process.exit(1);
  }

  // Get existing gallery slugs to avoid duplicates
  const existingGalleries = await prisma.gallery.findMany({
    select: { slug: true },
  });
  const existingSlugs = new Set(existingGalleries.map((g) => g.slug));
  console.log(`Found ${existingSlugs.size} existing galleries in database\n`);

  // Collect images from main folder
  console.log('Scanning photo-gallery folder...');
  const mainImages = collectImages(PHOTO_GALLERY_BASE);
  console.log(`Found ${mainImages.length} images in main folder`);

  // Collect images from imported_from_media_libray folder
  const importedDir = join(PHOTO_GALLERY_BASE, 'imported_from_media_libray');
  const importedImages = collectImages(importedDir);
  console.log(`Found ${importedImages.length} images in imported_from_media_libray folder\n`);

  // Group images by prefix
  console.log('Grouping images by gallery prefix...');
  const mainGroups = groupImagesByPrefix(mainImages);
  const importedGroups = groupImagesByPrefix(importedImages);

  console.log(`\nMain folder galleries (${mainGroups.size}):`);
  for (const [prefix, images] of mainGroups) {
    console.log(`  - ${prefix}: ${images.length} images`);
  }

  console.log(`\nImported folder galleries (${importedGroups.size}):`);
  for (const [prefix, images] of importedGroups) {
    console.log(`  - ${prefix}: ${images.length} images`);
  }

  // Process main folder galleries
  console.log('\n--- Processing Main Folder Galleries ---');
  for (const [prefix, images] of mainGroups) {
    await processGalleryGroup(prefix, images, false, mediaUrlMap, existingSlugs, dryRun);
  }

  // Process imported folder galleries
  console.log('\n--- Processing Imported Folder Galleries ---');
  for (const [prefix, images] of importedGroups) {
    await processGalleryGroup(prefix, images, true, mediaUrlMap, existingSlugs, dryRun);
  }

  // Print summary
  console.log('\n=== Import Summary ===');
  console.log(`Galleries created: ${stats.galleriesCreated}`);
  console.log(`Images linked: ${stats.imagesLinked}`);
  console.log(`Skipped (already exists or no R2 URL): ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);

  if (dryRun) {
    console.log('\n[DRY RUN] No changes were made to the database.');
  }

  // Verify final counts
  if (!dryRun) {
    const finalGalleryCount = await prisma.gallery.count();
    const finalImageCount = await prisma.galleryImage.count();
    console.log(`\nTotal galleries in database: ${finalGalleryCount}`);
    console.log(`Total gallery images in database: ${finalImageCount}`);

    // List galleries with image counts
    const galleriesWithCounts = await prisma.gallery.findMany({
      include: {
        _count: {
          select: { images: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    console.log('\n=== Galleries by Name ===');
    for (const g of galleriesWithCounts) {
      console.log(`  ${g.name}: ${g._count.images} images`);
    }
  }

  await prisma.$disconnect();
}

async function processGalleryGroup(
  prefix: string,
  images: ImageFile[],
  isImported: boolean,
  mediaUrlMap: MediaUrlMap,
  existingSlugs: Set<string>,
  dryRun: boolean
): Promise<void> {
  // Skip uncategorized group if it only has a few random images
  if (prefix === 'uncategorized' && images.length < 3) {
    console.log(`  Skipping uncategorized (only ${images.length} images)`);
    stats.skipped += images.length;
    return;
  }

  const name = prefixToName(prefix);
  let slug = nameToSlug(name);

  // Ensure unique slug
  let slugSuffix = 1;
  let originalSlug = slug;
  while (existingSlugs.has(slug)) {
    slug = `${originalSlug}-${slugSuffix++}`;
  }

  console.log(`\nProcessing: ${name} (${images.length} images)`);

  // Collect images with valid R2 URLs
  const validImages: Array<{
    imageUrl: string;
    thumbnailUrl: string | null;
    sortOrder: number;
    filename: string;
  }> = [];

  for (const image of images) {
    const r2Result = isImported
      ? getR2UrlForImported(image.filename, mediaUrlMap)
      : getR2Url(image.fullPath, mediaUrlMap);

    if (r2Result) {
      validImages.push({
        imageUrl: r2Result.imageUrl,
        thumbnailUrl: r2Result.thumbnailUrl,
        sortOrder: image.sortOrder,
        filename: image.filename,
      });
    } else {
      console.log(`    Skipped ${image.filename} (no R2 URL)`);
      stats.skipped++;
    }
  }

  if (validImages.length === 0) {
    console.log(`  No valid images for ${name}, skipping gallery creation`);
    return;
  }

  if (dryRun) {
    console.log(`  Would create gallery "${name}" with ${validImages.length} images`);
    stats.galleriesCreated++;
    stats.imagesLinked += validImages.length;
    existingSlugs.add(slug);
    return;
  }

  try {
    // Create gallery with images in a transaction
    const gallery = await prisma.gallery.create({
      data: {
        name,
        slug,
        coverImage: validImages[0]?.imageUrl || null,
        images: {
          create: validImages.map((img) => ({
            imageUrl: img.imageUrl,
            thumbnailUrl: img.thumbnailUrl,
            sortOrder: img.sortOrder,
          })),
        },
      },
    });

    console.log(`  Created gallery: ${gallery.name} (${validImages.length} images)`);
    stats.galleriesCreated++;
    stats.imagesLinked += validImages.length;
    existingSlugs.add(slug);
  } catch (error) {
    console.error(`  Error creating gallery ${name}: ${error}`);
    stats.errors++;
  }
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
