# Phase 4 Content Migration Completion Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete WordPress content migration with proper content preservation, documents, galleries, events, and URL mappings.

**Architecture:** Re-import content preserving HTML structure, import documents with categorization, create galleries from WP photo-gallery plugin data, move events to proper table, update all URLs to R2.

**Tech Stack:** TypeScript, Prisma, PostgreSQL, Cloudflare R2

---

## Current State Analysis

| Content Type | WordPress | Database | Issue |
|--------------|-----------|----------|-------|
| Posts | 326 | 327 | ⚠️ HTML stripped to plain text, images lost |
| Pages | 81 | 82 | ⚠️ Placeholder content only (~100 chars) |
| Documents | 1,368 | 0 | ❌ Not imported |
| Galleries | 14 albums, 234 images | 1 empty | ❌ Not imported |
| Events | 25 (in posts as dogadanja) | 1 | ⚠️ Wrong table |
| Media | 2,875 files | R2 ✅ | ✅ Uploaded, URL map ready |

## Pre-Conditions
- [x] WordPress XML exported: `/mnt/c/VelikiBukovec_web/opinavelikibukovec.WordPress.2026-01-26.xml`
- [x] WordPress files available: `/mnt/c/VelikiBukovec_web/homedir/public_html/`
- [x] Media uploaded to R2: 2,875 files
- [x] URL map created: `/mnt/c/VelikiBukovec_web/scripts/migration/output/media-url-map.json`
- [x] Database accessible via VPS Tailscale

---

## Task 1: Fix Post Content (Re-import with HTML preserved)

**Files:**
- Modify: `/mnt/c/VelikiBukovec_web/scripts/migration/parse-wordpress.ts`
- Create: `/mnt/c/VelikiBukovec_web/scripts/migration/reimport-posts.ts`

**Problem:** Current posts have HTML converted to plain text, losing `<img>`, `<a>` tags.

**Step 1.1: Update parser to preserve HTML in TipTap format**

The `htmlToTipTap` function needs to preserve image nodes and links, not strip them.

```typescript
// In parse-wordpress.ts, update htmlToTipTap to handle images and links
function htmlToTipTapWithImages(html: string): object {
  // Parse HTML and create proper TipTap nodes for:
  // - paragraph → { type: 'paragraph', content: [...] }
  // - img → { type: 'image', attrs: { src: '...', alt: '...' } }
  // - a → { type: 'text', marks: [{ type: 'link', attrs: { href: '...' } }], text: '...' }
}
```

**Step 1.2: Create reimport script**

```typescript
// reimport-posts.ts
// 1. Load posts.json (original parsed data with full HTML)
// 2. Load media-url-map.json
// 3. For each post:
//    a. Convert HTML to proper TipTap JSON with images
//    b. Replace WP URLs with R2 URLs in content
//    c. UPDATE existing post by slug (not create)
// 4. Report results
```

**Step 1.3: Run reimport**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin
npx tsx ../../scripts/migration/reimport-posts.ts
```

**Expected:** 326 posts updated with proper HTML content and R2 URLs

**Step 1.4: Verify**

```bash
ssh deploy@100.120.125.83 "psql ... -c \"SELECT COUNT(*) FROM posts WHERE content LIKE '%pub-920c291ea0c74945936ae9819993768a.r2.dev%';\""
```

**Step 1.5: Commit**

```bash
git add scripts/migration/
git commit -m "fix(migration): reimport posts with HTML preserved and R2 URLs"
```

---

## Task 2: Update Pages with WordPress Content

**Files:**
- Create: `/mnt/c/VelikiBukovec_web/scripts/migration/update-pages.ts`

**Problem:** 82 pages exist but have placeholder content (~100-200 chars). WordPress pages have full content.

**Step 2.1: Create update script**

```typescript
// update-pages.ts
// 1. Load pages.json
// 2. Load media-url-map.json
// 3. For each WP page:
//    a. Find matching DB page by slug
//    b. Convert HTML content to TipTap JSON
//    c. Replace WP URLs with R2 URLs
//    d. UPDATE page content (preserve other fields)
// 4. Report: matched, updated, not-found
```

**Step 2.2: Run update**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin
npx tsx ../../scripts/migration/update-pages.ts
```

**Expected:** ~81 pages updated with WordPress content

**Step 2.3: Verify**

```bash
ssh deploy@100.120.125.83 "psql ... -c \"SELECT slug, LENGTH(content) FROM pages ORDER BY LENGTH(content) DESC LIMIT 10;\""
```

Content length should now be 1000+ chars instead of ~100-200.

**Step 2.4: Commit**

```bash
git add scripts/migration/update-pages.ts
git commit -m "fix(migration): update pages with WordPress content"
```

---

## Task 3: Import Documents

**Files:**
- Create: `/mnt/c/VelikiBukovec_web/scripts/migration/import-documents.ts`

**Problem:** 1,368 PDFs/docs in WordPress uploads, 0 in database.

**Step 3.1: Analyze document categories**

Documents need categorization. Check WordPress structure:
- `/uploads/YYYY/MM/` - date-based organization
- Filenames suggest categories: "proračun", "sjednice", "natječaj", etc.

**Step 3.2: Create import script**

```typescript
// import-documents.ts
// 1. Scan /homedir/public_html/wp-content/uploads for PDFs, DOCs
// 2. Skip thumbnails and plugin folders
// 3. Categorize by filename keywords:
//    - "sjednic" → 'sjednice'
//    - "proračun" → 'proracun'
//    - "natječaj" → 'natjecaji'
//    - "izvješć" → 'izvjesca'
//    - "odluk" → 'odluke'
//    - default → 'ostalo'
// 4. For each document:
//    a. Get R2 URL from media-url-map.json
//    b. Extract title from filename (clean up)
//    c. Get file size
//    d. INSERT into documents table
// 5. Report: imported count by category
```

**Step 3.3: Run import**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin
npx tsx ../../scripts/migration/import-documents.ts
```

**Expected:** ~1,368 documents imported with categories

**Step 3.4: Verify**

```bash
ssh deploy@100.120.125.83 "psql ... -c \"SELECT category, COUNT(*) FROM documents GROUP BY category ORDER BY count DESC;\""
```

**Step 3.5: Commit**

```bash
git add scripts/migration/import-documents.ts
git commit -m "feat(migration): import documents with categorization"
```

---

## Task 4: Import Galleries

**Files:**
- Create: `/mnt/c/VelikiBukovec_web/scripts/migration/import-galleries.ts`

**Problem:** 14 WP galleries with 234 images, only 1 empty gallery in DB.

**Step 4.1: Parse WordPress gallery data**

From XML, `bwg_gallery` entries have:
- `title` - gallery name
- `slug` - URL slug
- `content` - shortcode with gallery ID

The actual images are in `/wp-content/uploads/photo-gallery/`

**Step 4.2: Create import script**

```typescript
// import-galleries.ts
// 1. Parse bwg_gallery entries from XML
// 2. For each gallery:
//    a. Create gallery record (title, slug, description)
//    b. Find images in photo-gallery folder (by naming convention or folder)
//    c. Get R2 URLs for images
//    d. Create gallery_images records with position
// 3. Report: galleries created, images linked
```

**Step 4.3: Map gallery images**

The photo-gallery folder has images like:
- `dani_zlate_brzeske_1.JPG` - `dani_zlate_brzeske_11.JPG`
- `dvd_dubovica_1.jpg` - `dvd_dubovica_10.jpg`
- `veliki_bukovec_1.JPG` - `veliki_bukovec_5.JPG`

Group by prefix → gallery.

**Step 4.4: Run import**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin
npx tsx ../../scripts/migration/import-galleries.ts
```

**Expected:** ~14 galleries with ~234 images total

**Step 4.5: Verify**

```bash
ssh deploy@100.120.125.83 "psql ... -c \"SELECT g.title, COUNT(gi.id) as images FROM galleries g LEFT JOIN gallery_images gi ON g.id = gi.\\\"galleryId\\\" GROUP BY g.id ORDER BY images DESC;\""
```

**Step 4.6: Commit**

```bash
git add scripts/migration/import-galleries.ts
git commit -m "feat(migration): import galleries with images"
```

---

## Task 5: Convert Events from Posts

**Files:**
- Create: `/mnt/c/VelikiBukovec_web/scripts/migration/convert-events.ts`

**Problem:** 25 posts with category "dogadanja" should be in events table.

**Step 5.1: Analyze event data needed**

Events table requires:
- title, slug, description, content
- startDate, endDate (extract from post content or use publishedAt)
- location (extract from content if available)
- posterUrl (featuredImage)

**Step 5.2: Create conversion script**

```typescript
// convert-events.ts
// 1. Find posts with category = 'dogadanja'
// 2. For each post:
//    a. Parse content for date patterns (if any)
//    b. Create event record:
//       - title, slug from post
//       - description = excerpt
//       - content = post content
//       - startDate = publishedAt (or parsed date)
//       - posterUrl = featuredImage
//    c. DELETE post after event created
// 3. Report: events created
```

**Step 5.3: Run conversion**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin
npx tsx ../../scripts/migration/convert-events.ts
```

**Expected:** 25 events created, 25 posts deleted

**Step 5.4: Verify**

```bash
ssh deploy@100.120.125.83 "psql ... -c \"SELECT COUNT(*) FROM events;\"" # Should be 26 (25 + 1 seed)
ssh deploy@100.120.125.83 "psql ... -c \"SELECT COUNT(*) FROM posts WHERE category = 'dogadanja';\"" # Should be 0
```

**Step 5.5: Commit**

```bash
git add scripts/migration/convert-events.ts
git commit -m "feat(migration): convert dogadanja posts to events"
```

---

## Task 6: Link Featured Images

**Files:**
- Already exists: `/mnt/c/VelikiBukovec_web/scripts/migration/link-featured-images.ts`

**Step 6.1: Run existing script**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin
npx tsx ../../scripts/migration/link-featured-images.ts
```

**Step 6.2: Verify**

```bash
ssh deploy@100.120.125.83 "psql ... -c \"SELECT COUNT(*) FROM posts WHERE \\\"featuredImage\\\" IS NOT NULL;\""
```

**Step 6.3: Commit if changes needed**

---

## Task 7: Create URL Redirects

**Files:**
- Create: `/mnt/c/VelikiBukovec_web/apps/web/public/_redirects`

**Problem:** Old WordPress URLs need to redirect to new URLs.

**Step 7.1: Generate redirects file**

Use `url-map.json` to create Cloudflare Pages redirects:

```
# Old WordPress URLs -> New URLs
/opcina-sufinancira-kupnju-udzbenika /vijesti/opcina-sufinancira-kupnju-udzbenika 301
/dan-opcine-veliki-bukovec /vijesti/dan-opcine-veliki-bukovec 301
...
```

**Step 7.2: Create redirect generator script**

```typescript
// generate-redirects.ts
// 1. Load url-map.json
// 2. Generate _redirects file format
// 3. Write to apps/web/public/_redirects
```

**Step 7.3: Commit**

```bash
git add apps/web/public/_redirects scripts/migration/generate-redirects.ts
git commit -m "feat(migration): add URL redirects for old WordPress URLs"
```

---

## Task 8: Final Verification

**Step 8.1: Run verification queries**

```bash
# Posts with R2 images
ssh deploy@100.120.125.83 "psql ... -c \"SELECT COUNT(*) FROM posts WHERE content LIKE '%r2.dev%';\""

# Pages with content
ssh deploy@100.120.125.83 "psql ... -c \"SELECT COUNT(*) FROM pages WHERE LENGTH(content) > 500;\""

# Documents
ssh deploy@100.120.125.83 "psql ... -c \"SELECT COUNT(*) FROM documents;\""

# Galleries and images
ssh deploy@100.120.125.83 "psql ... -c \"SELECT COUNT(*) FROM galleries;\""
ssh deploy@100.120.125.83 "psql ... -c \"SELECT COUNT(*) FROM gallery_images;\""

# Events
ssh deploy@100.120.125.83 "psql ... -c \"SELECT COUNT(*) FROM events;\""
```

**Step 8.2: Test on dev server**

```bash
cd /mnt/c/VelikiBukovec_web
pnpm --filter @repo/admin dev
# Navigate to http://localhost:3001 and verify:
# - Posts show images
# - Documents list works
# - Galleries show images
# - Events calendar shows events
```

**Step 8.3: Update ROADMAP.md**

Mark completed sprints:
- 4.1 ✅ WordPress export
- 4.2 ✅ Content mapping
- 4.3 ✅ Migration scripts
- 4.4 ✅ Test migration
- 4.5 ✅ Image migration
- 4.6 ✅ Final migration
- 4.7 ✅ Redirects setup

**Step 8.4: Final commit**

```bash
git add ROADMAP.md
git commit -m "docs: mark Phase 4 Content Migration complete"
```

---

## Execution Order

1. Task 1: Fix Post Content (most critical - images broken)
2. Task 6: Link Featured Images (depends on Task 1)
3. Task 2: Update Pages
4. Task 3: Import Documents
5. Task 4: Import Galleries
6. Task 5: Convert Events
7. Task 7: Create Redirects
8. Task 8: Final Verification

## Rollback Plan

If issues occur:
```sql
-- Reset posts to re-import
DELETE FROM posts WHERE id != 'seed-post-id';

-- Reset documents
DELETE FROM documents;

-- Reset galleries
DELETE FROM gallery_images;
DELETE FROM galleries WHERE id != 'seed-gallery-id';

-- Reset events
DELETE FROM events WHERE id != 'seed-event-id';
```

Then re-run migration scripts.
