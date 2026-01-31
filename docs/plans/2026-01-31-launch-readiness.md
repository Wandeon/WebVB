# Launch Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all actionable content quality issues without requiring old WordPress data extraction.

**Architecture:** Database operations via Prisma repositories, Node.js scripts for bulk operations, rate-limited image validation.

**Tech Stack:** TypeScript, Prisma ORM, Node.js scripts, fetch for image validation

---

## Context

From `docs/content/enrichment-plan.md`:
- **947 total issues** identified in quality audit
- **2 critical** (placeholder text pages) - DELETE
- **67 high priority** (empty content, missing fields)
- **121 medium** (thin content, outdated)
- **757 re-validate** (broken images - likely false positives)

Knowledge base created: `docs/content/knowledge-base.md`

---

## Task 1: Delete Legacy Placeholder Pages

**Files:**
- Create: `scripts/cleanup/delete-placeholder-pages.ts`

**Step 1: Write the deletion script**

```typescript
// scripts/cleanup/delete-placeholder-pages.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLACEHOLDER_SLUGS = [
  'rad-uprave/financijski-dokumenti',
  'rad-uprave/sudjelovanje-gradana',
];

async function main() {
  console.log('Deleting legacy placeholder pages...');

  for (const slug of PLACEHOLDER_SLUGS) {
    const result = await prisma.page.deleteMany({
      where: { slug },
    });
    console.log(`Deleted ${result.count} page(s) with slug: ${slug}`);
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Step 2: Run the script**

```bash
cd /home/wandeon/WebVB
npx tsx scripts/cleanup/delete-placeholder-pages.ts
```

Expected: 2 pages deleted

**Step 3: Verify deletion**

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.page.findMany({ where: { slug: { contains: 'rad-uprave' } } })
  .then(p => console.log('Remaining rad-uprave pages:', p.length))
  .finally(() => prisma.$disconnect());
"
```

Expected: 0 remaining

**Step 4: Commit**

```bash
git add scripts/cleanup/delete-placeholder-pages.ts
git commit -m "chore(cleanup): delete 2 legacy placeholder pages

- rad-uprave/financijski-dokumenti
- rad-uprave/sudjelovanje-gradana

These were replaced by /usluge consolidated page."
```

---

## Task 2: Identify and Categorize Empty Content

**Files:**
- Create: `scripts/audit/list-empty-content.ts`
- Output: `docs/content/empty-content-report.md`

**Step 1: Write audit script**

```typescript
// scripts/audit/list-empty-content.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  // Pages with empty/null content
  const emptyPages = await prisma.page.findMany({
    where: {
      OR: [
        { content: null },
        { content: '' },
        { content: { lt: '50' } }, // Less than 50 chars
      ],
    },
    select: { id: true, slug: true, title: true, status: true },
  });

  // Posts with empty/null content
  const emptyPosts = await prisma.post.findMany({
    where: {
      OR: [
        { content: null },
        { content: '' },
      ],
    },
    select: { id: true, slug: true, title: true, status: true, type: true },
  });

  // Posts with missing excerpts (published only)
  const missingExcerpts = await prisma.post.findMany({
    where: {
      status: 'published',
      OR: [
        { excerpt: null },
        { excerpt: '' },
      ],
    },
    select: { id: true, slug: true, title: true, type: true },
  });

  const report = `# Empty Content Report

Generated: ${new Date().toISOString()}

## Empty Pages (${emptyPages.length})

| ID | Slug | Title | Status | Action |
|----|------|-------|--------|--------|
${emptyPages.map(p => `| ${p.id} | ${p.slug} | ${p.title} | ${p.status} | TBD |`).join('\n')}

## Empty Posts (${emptyPosts.length})

| ID | Slug | Title | Type | Status | Action |
|----|------|-------|------|--------|--------|
${emptyPosts.map(p => `| ${p.id} | ${p.slug} | ${p.title} | ${p.type} | ${p.status} | TBD |`).join('\n')}

## Missing Excerpts - Published (${missingExcerpts.length})

| ID | Slug | Title | Type |
|----|------|-------|------|
${missingExcerpts.map(p => `| ${p.id} | ${p.slug} | ${p.title} | ${p.type} |`).join('\n')}
`;

  fs.writeFileSync('docs/content/empty-content-report.md', report);
  console.log('Report written to docs/content/empty-content-report.md');
  console.log(`Found: ${emptyPages.length} empty pages, ${emptyPosts.length} empty posts, ${missingExcerpts.length} missing excerpts`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Step 2: Run audit**

```bash
npx tsx scripts/audit/list-empty-content.ts
```

**Step 3: Review report and decide actions**

Open `docs/content/empty-content-report.md` and mark each item:
- DELETE: If orphaned or superseded
- GENERATE: If content can be AI-generated from knowledge base
- SKIP: If requires human input we don't have

**Step 4: Commit**

```bash
git add scripts/audit/list-empty-content.ts docs/content/empty-content-report.md
git commit -m "chore(audit): generate empty content report for review"
```

---

## Task 3: Archive Outdated Announcements

**Files:**
- Create: `scripts/cleanup/archive-outdated.ts`

**Step 1: Write archive script**

```typescript
// scripts/cleanup/archive-outdated.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Announcements older than 6 months are considered outdated
const SIX_MONTHS_AGO = new Date();
SIX_MONTHS_AGO.setMonth(SIX_MONTHS_AGO.getMonth() - 6);

async function main() {
  console.log(`Archiving announcements older than ${SIX_MONTHS_AGO.toISOString()}...`);

  // Archive old announcements (set status to 'archived')
  const archivedAnnouncements = await prisma.post.updateMany({
    where: {
      type: 'announcement',
      status: 'published',
      createdAt: { lt: SIX_MONTHS_AGO },
    },
    data: { status: 'archived' },
  });

  console.log(`Archived ${archivedAnnouncements.count} announcements`);

  // Archive old events (more than 30 days past)
  const THIRTY_DAYS_AGO = new Date();
  THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);

  const archivedEvents = await prisma.event.updateMany({
    where: {
      status: 'published',
      endDate: { lt: THIRTY_DAYS_AGO },
    },
    data: { status: 'archived' },
  });

  console.log(`Archived ${archivedEvents.count} events`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Step 2: Run archive**

```bash
npx tsx scripts/cleanup/archive-outdated.ts
```

**Step 3: Verify**

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
Promise.all([
  prisma.post.count({ where: { status: 'archived', type: 'announcement' } }),
  prisma.event.count({ where: { status: 'archived' } }),
]).then(([a, e]) => console.log('Archived:', a, 'announcements,', e, 'events'))
  .finally(() => prisma.$disconnect());
"
```

**Step 4: Commit**

```bash
git add scripts/cleanup/archive-outdated.ts
git commit -m "chore(cleanup): archive outdated announcements and events

- Announcements > 6 months old
- Events > 30 days past end date"
```

---

## Task 4: Re-validate Broken Images with Rate Limiting

**Files:**
- Create: `scripts/audit/validate-images.ts`
- Output: `docs/content/broken-images-report.md`

**Step 1: Write validation script with rate limiting**

```typescript
// scripts/audit/validate-images.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Rate limit: 10 requests per second to R2
const RATE_LIMIT_MS = 100;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function checkImage(url: string): Promise<{ url: string; status: number | 'error'; ok: boolean }> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return { url, status: response.status, ok: response.ok };
  } catch (error) {
    return { url, status: 'error', ok: false };
  }
}

async function main() {
  console.log('Collecting all image URLs...');

  // Get all unique image URLs from posts, pages, galleries
  const posts = await prisma.post.findMany({
    select: { featuredImage: true },
    where: { featuredImage: { not: null } },
  });

  const galleryImages = await prisma.galleryImage.findMany({
    select: { imageUrl: true, thumbnailUrl: true },
  });

  const allUrls = new Set<string>();
  posts.forEach(p => p.featuredImage && allUrls.add(p.featuredImage));
  galleryImages.forEach(g => {
    allUrls.add(g.imageUrl);
    g.thumbnailUrl && allUrls.add(g.thumbnailUrl);
  });

  console.log(`Found ${allUrls.size} unique image URLs to validate`);

  const broken: { url: string; status: number | 'error' }[] = [];
  let checked = 0;

  for (const url of allUrls) {
    const result = await checkImage(url);
    if (!result.ok) {
      broken.push({ url: result.url, status: result.status });
    }
    checked++;
    if (checked % 50 === 0) {
      console.log(`Checked ${checked}/${allUrls.size}...`);
    }
    await sleep(RATE_LIMIT_MS);
  }

  const report = `# Broken Images Report

Generated: ${new Date().toISOString()}
Total checked: ${allUrls.size}
Broken: ${broken.length}

## Broken Images

| URL | Status |
|-----|--------|
${broken.map(b => `| ${b.url} | ${b.status} |`).join('\n')}
`;

  fs.writeFileSync('docs/content/broken-images-report.md', report);
  console.log(`\nReport written. Found ${broken.length} broken images out of ${allUrls.size}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Step 2: Run validation (takes ~10 minutes for 757 images at 10/sec)**

```bash
npx tsx scripts/audit/validate-images.ts
```

**Step 3: Review report**

The original audit found 757 broken images. This re-validation with rate limiting should show the true count (expected: much fewer, as R2 rate limiting caused false positives).

**Step 4: Commit**

```bash
git add scripts/audit/validate-images.ts docs/content/broken-images-report.md
git commit -m "chore(audit): re-validate images with rate limiting

Previous audit showed 757 broken - likely R2 rate limit false positives.
This validation uses 100ms delay between requests."
```

---

## Task 5: Generate Missing Excerpts

**Files:**
- Create: `scripts/content/generate-excerpts.ts`

**Step 1: Write excerpt generation script**

```typescript
// scripts/content/generate-excerpts.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateExcerpt(content: string | null, maxLength = 160): string {
  if (!content) return '';

  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, '');

  // Take first 160 chars, break at word boundary
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 100 ? truncated.slice(0, lastSpace) + '...' : truncated + '...';
}

async function main() {
  // Find published posts with missing excerpts but content exists
  const posts = await prisma.post.findMany({
    where: {
      status: 'published',
      content: { not: null },
      OR: [
        { excerpt: null },
        { excerpt: '' },
      ],
    },
    select: { id: true, slug: true, title: true, content: true },
  });

  console.log(`Found ${posts.length} posts needing excerpts`);

  let updated = 0;
  for (const post of posts) {
    const excerpt = generateExcerpt(post.content);
    if (excerpt) {
      await prisma.post.update({
        where: { id: post.id },
        data: { excerpt },
      });
      console.log(`Updated: ${post.slug}`);
      updated++;
    }
  }

  console.log(`Generated ${updated} excerpts`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Step 2: Run excerpt generation**

```bash
npx tsx scripts/content/generate-excerpts.ts
```

**Step 3: Verify**

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.post.count({
  where: { status: 'published', OR: [{ excerpt: null }, { excerpt: '' }] }
}).then(c => console.log('Posts still missing excerpts:', c))
  .finally(() => prisma.$disconnect());
"
```

Expected: 0 (or only those without content)

**Step 4: Commit**

```bash
git add scripts/content/generate-excerpts.ts
git commit -m "chore(content): auto-generate missing excerpts from content

Extracts first 160 chars, breaks at word boundary"
```

---

## Task 6: Delete Orphaned Empty Content

**Files:**
- Modify: `scripts/cleanup/delete-orphaned-empty.ts`

**Step 1: Write deletion script (only after reviewing Task 2 report)**

```typescript
// scripts/cleanup/delete-orphaned-empty.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add slugs from Task 2 report that are confirmed orphaned
const ORPHANED_PAGE_SLUGS: string[] = [
  // Fill from empty-content-report.md review
];

const ORPHANED_POST_IDS: string[] = [
  // Fill from empty-content-report.md review
];

async function main() {
  if (ORPHANED_PAGE_SLUGS.length > 0) {
    const deletedPages = await prisma.page.deleteMany({
      where: { slug: { in: ORPHANED_PAGE_SLUGS } },
    });
    console.log(`Deleted ${deletedPages.count} orphaned pages`);
  }

  if (ORPHANED_POST_IDS.length > 0) {
    const deletedPosts = await prisma.post.deleteMany({
      where: { id: { in: ORPHANED_POST_IDS } },
    });
    console.log(`Deleted ${deletedPosts.count} orphaned posts`);
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Step 2: Review Task 2 report and populate arrays**

From `docs/content/empty-content-report.md`, identify items marked DELETE.

**Step 3: Run deletion**

```bash
npx tsx scripts/cleanup/delete-orphaned-empty.ts
```

**Step 4: Commit**

```bash
git add scripts/cleanup/delete-orphaned-empty.ts
git commit -m "chore(cleanup): delete orphaned empty pages and posts

Based on manual review of empty-content-report.md"
```

---

## Task 7: Final Audit and Summary

**Step 1: Re-run quality audit**

```bash
# Re-run the original audit script to get updated counts
npx tsx scripts/audit/quality-audit.ts
```

**Step 2: Update enrichment plan with results**

Document final state in `docs/content/enrichment-plan.md`:
- Total issues remaining
- What was fixed
- What requires human attention

**Step 3: Commit all documentation**

```bash
git add docs/content/
git commit -m "docs: update content quality documentation after cleanup

- Knowledge base created from DRVB research
- Placeholder pages deleted
- Outdated content archived
- Broken images re-validated
- Missing excerpts generated"
```

---

## Verification Checklist

- [ ] 2 placeholder pages deleted
- [ ] Empty content report generated
- [ ] Outdated announcements archived
- [ ] Old events archived
- [ ] Broken images re-validated with accurate count
- [ ] Missing excerpts generated
- [ ] Orphaned content deleted (after review)
- [ ] Final audit shows improvement
- [ ] Knowledge base available for content generation

---

## Next Steps (Human Required)

1. **Content Generation**: Use `docs/content/knowledge-base.md` with AI to generate content for thin pages (villages, institutions)
2. **Manual Review**: Some empty pages may need human-written content
3. **Image Fixes**: If truly broken images found, source replacements
4. **Static Build**: After content fixes, rebuild and deploy web app
