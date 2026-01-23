# MIGRATION.md - Content Migration Guide

> Step-by-step guide for migrating content from WordPress to the new system.
> Last updated: 2026-01-23

## Migration Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  MIGRATION TIMELINE                                             │
├─────────────────────────────────────────────────────────────────┤
│  Week 1: Export & Analyze                                       │
│    • Export WordPress content                                   │
│    • Export media library                                       │
│    • Create content mapping spreadsheet                         │
│                                                                 │
│  Week 2: Transform & Test                                       │
│    • Run migration scripts on test DB                           │
│    • Verify content integrity                                   │
│    • Test image migration to R2                                 │
│                                                                 │
│  Week 3: Final Migration                                        │
│    • Freeze WordPress (no new content)                          │
│    • Run final migration                                        │
│    • Verify all content                                         │
│    • Set up redirects                                           │
│                                                                 │
│  Week 4: Email Migration                                        │
│    • Migrate email accounts to Siteground                       │
│    • Update MX records                                          │
│    • Test email delivery                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: WordPress Export

### 1.1 Content Export

**In WordPress Admin:**

1. Go to **Tools → Export**
2. Select **All content**
3. Click **Download Export File**
4. Save the XML file (e.g., `wordpress-export-2026-01-23.xml`)

**What's in the export:**
- Posts (vijesti)
- Pages (static pages)
- Categories
- Tags
- Authors
- Comments (if any)

**NOT in the export:**
- Media files (images, PDFs) - separate step
- Plugins/themes
- Database directly

### 1.2 Media Export

**Option A: FTP Download (Recommended)**
```bash
# Connect via FTP/SFTP to WordPress host
# Download entire wp-content/uploads folder
# This contains all images and documents organized by year/month
```

**Option B: Plugin Export**
- Install "Export Media Library" plugin
- Export media with folder structure
- Download ZIP file

**Option C: Direct Database + Files**
- If you have cPanel access, use File Manager
- Download wp-content/uploads as ZIP

### 1.3 Document Inventory

Create a spreadsheet tracking all documents:

| Filename | Category | Year | Keep? | New Location |
|----------|----------|------|-------|--------------|
| zapisnik-2025-12.pdf | Sjednice | 2025 | Yes | documents/sjednice/2025/ |
| proracun-2024.pdf | Proračun | 2024 | Yes | documents/proracun/2024/ |

---

## Phase 2: Content Mapping

### 2.1 URL Mapping

Map old URLs to new URLs for redirects:

```
OLD                                    NEW
─────────────────────────────────────────────────────────────────
/vijesti/nova-cesta-2025/           → /vijesti/nova-cesta-2025
/?p=123                              → /vijesti/slug-from-title
/wp-content/uploads/2025/01/img.jpg → r2.velikibukovec.hr/images/...
/dokumenti/proracun-2025.pdf        → r2.velikibukovec.hr/documents/...
```

### 2.2 Category Mapping

Map WordPress categories to new system:

| WordPress Category | New Category | Notes |
|--------------------|--------------|-------|
| Uncategorized | Općinske aktualnosti | Default |
| Sport | Sport | Direct match |
| Kultura | Kultura | Direct match |
| Komunalno | Komunalne teme | Slight rename |

### 2.3 Content Cleanup Decisions

Review content and decide:

```
□ Posts older than 5 years: Archive or migrate?
□ Draft posts: Delete or migrate as drafts?
□ Test/sample posts: Delete
□ Duplicate content: Merge or delete?
□ Broken images: Fix or remove?
□ External links: Verify or remove dead links?
```

---

## Phase 3: Migration Scripts

### 3.1 Script Overview

```
migration/
├── 01-parse-wordpress-xml.ts    # Parse WP export to JSON
├── 02-download-media.ts         # Download images from WP
├── 03-process-images.ts         # Resize, convert to WebP, upload to R2
├── 04-migrate-posts.ts          # Insert posts into new DB
├── 05-migrate-pages.ts          # Insert static pages
├── 06-migrate-documents.ts      # Process PDFs, upload to R2
├── 07-generate-redirects.ts     # Create redirect map
└── utils/
    ├── wordpress-parser.ts
    ├── image-processor.ts
    └── r2-uploader.ts
```

### 3.2 Post Migration

```typescript
// Pseudo-code for post migration
interface WordPressPost {
  title: string;
  content: string;        // HTML content
  date: string;
  status: 'publish' | 'draft';
  categories: string[];
  featuredImage?: string;
}

async function migratePost(wpPost: WordPressPost) {
  // 1. Parse HTML content
  const cleanContent = sanitizeHtml(wpPost.content);

  // 2. Extract and migrate inline images
  const { content, images } = await extractImages(cleanContent);
  for (const img of images) {
    await migrateImageToR2(img);
  }

  // 3. Map category
  const category = mapCategory(wpPost.categories[0]);

  // 4. Generate slug
  const slug = generateSlug(wpPost.title);

  // 5. Insert into new database
  await db.post.create({
    data: {
      title: wpPost.title,
      slug,
      content,
      category,
      publishedAt: wpPost.status === 'publish' ? new Date(wpPost.date) : null,
      status: wpPost.status === 'publish' ? 'published' : 'draft',
    }
  });

  // 6. Record URL mapping for redirects
  recordRedirect(wpPost.permalink, `/vijesti/${slug}`);
}
```

### 3.3 Image Migration

```typescript
async function migrateImageToR2(wpImageUrl: string) {
  // 1. Download from WordPress
  const imageBuffer = await downloadImage(wpImageUrl);

  // 2. Process with Sharp
  const variants = await processImage(imageBuffer);
  // Returns: { original, thumb, medium, large }

  // 3. Upload to R2
  const r2Keys = await uploadToR2(variants);

  // 4. Record in database
  await db.image.create({
    data: {
      originalFilename: path.basename(wpImageUrl),
      r2KeyOriginal: r2Keys.original,
      r2KeyThumb: r2Keys.thumb,
      r2KeyMedium: r2Keys.medium,
      r2KeyLarge: r2Keys.large,
    }
  });

  return r2Keys;
}
```

### 3.4 Document Migration

```typescript
async function migrateDocument(filePath: string, category: string, year: number) {
  // 1. Read PDF file
  const pdfBuffer = await fs.readFile(filePath);

  // 2. Extract text for search indexing
  const textContent = await extractPdfText(pdfBuffer);

  // 3. Upload to R2
  const r2Key = await uploadDocumentToR2(pdfBuffer, filePath);

  // 4. Generate embeddings for RAG (if AI enabled)
  const chunks = chunkText(textContent, 500);
  const embeddings = await generateEmbeddings(chunks);

  // 5. Insert into database
  await db.document.create({
    data: {
      title: extractTitleFromFilename(filePath),
      filename: path.basename(filePath),
      r2Key,
      category,
      year,
      sizeBytes: pdfBuffer.length,
    }
  });

  // 6. Insert embeddings for search
  for (let i = 0; i < chunks.length; i++) {
    await db.documentChunk.create({
      data: {
        documentId: doc.id,
        content: chunks[i],
        embedding: embeddings[i],
        position: i,
      }
    });
  }
}
```

---

## Phase 4: Redirect Setup

### 4.1 Cloudflare Redirects

For static public site on Cloudflare Pages, use `_redirects` file:

```
# _redirects file in public folder

# Old WordPress URLs to new URLs
/vijesti/stara-vijest-123  /vijesti/nova-vijest-slug  301
/?p=123  /vijesti/mapped-slug  301

# Old media URLs to R2
/wp-content/uploads/*  https://r2.velikibukovec.hr/images/:splat  301

# Catch-all for old patterns
/index.php/*  /:splat  301
```

### 4.2 Bulk Redirect Generation

```typescript
// Generate _redirects file from mapping
function generateRedirectsFile(mappings: Map<string, string>) {
  let content = '# Auto-generated redirects from WordPress migration\n\n';

  for (const [oldUrl, newUrl] of mappings) {
    content += `${oldUrl}  ${newUrl}  301\n`;
  }

  return content;
}
```

---

## Phase 5: Email Migration

### 5.1 Pre-Migration

```
□ List all email accounts to migrate:
  - info@velikibukovec.hr
  - nacelnik@velikibukovec.hr
  - (others)

□ Notify users of migration date
□ Set low TTL on MX records (300 seconds) a week before
```

### 5.2 Siteground Setup

```
1. Log into Siteground
2. Go to Email → Email Accounts
3. Create each email account
4. Note down new IMAP/SMTP settings
```

### 5.3 Migration Methods

**Option A: Manual (few accounts)**
- Export emails from old host (IMAP backup)
- Import to Siteground via webmail or email client

**Option B: Siteground Migration Tool**
- Siteground offers assisted migration
- Provide old host credentials
- They handle the transfer

### 5.4 DNS Switch

```
# Update MX records in Cloudflare DNS:
MX  @  mx1.siteground.biz  10
MX  @  mx2.siteground.biz  20

# Wait for propagation (check with MX lookup tool)
# Test by sending email to migrated accounts
```

---

## Verification Checklist

### Content Verification

```
□ All posts migrated (count matches)
□ All pages migrated
□ All documents uploaded to R2
□ All images display correctly
□ Categories mapped correctly
□ Dates preserved
□ Author attribution correct (if needed)
```

### Image Verification

```
□ Thumbnails generate correctly
□ Medium size displays in content
□ Large size displays in lightbox/gallery
□ Alt text preserved
□ No broken images (404s)
```

### Redirect Verification

```
□ Sample of old URLs redirect correctly
□ Old image URLs redirect to R2
□ No redirect loops
□ 404 page works for truly missing content
```

### Email Verification

```
□ Can send emails from each account
□ Can receive emails at each account
□ SPF/DKIM/DMARC configured
□ Emails not going to spam
```

---

## Rollback Plan

If something goes wrong:

```
1. WordPress site remains live (don't delete until verified)
2. DNS can be reverted to old host
3. Keep WordPress database backup for 30 days
4. Keep media files backup for 30 days
```

---

## Timeline Example

| Day | Task |
|-----|------|
| D-14 | Export WordPress, start content mapping |
| D-10 | Complete content mapping, review with client |
| D-7 | Run test migration on staging |
| D-5 | Fix issues from test migration |
| D-3 | Lower DNS TTL, final content freeze in WordPress |
| D-1 | Run final migration, verify |
| D-Day | Switch DNS, monitor |
| D+1 | Verify redirects, fix issues |
| D+7 | Confirm everything works, archive WordPress |
| D+30 | Delete WordPress backup (optional) |

