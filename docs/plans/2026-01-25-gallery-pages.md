# Sprint 2.7 - Gallery Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build public gallery listing and detail pages with lightbox photo viewing.

**Architecture:** Two pages - `/galerija` shows album grid with cover images, `/galerija/[slug]` shows photo grid with lightbox. Uses existing `galleriesRepository` for data. Lightbox uses `yet-another-react-lightbox` for swipe gestures and keyboard navigation.

**Tech Stack:** Next.js 15 App Router, yet-another-react-lightbox, Tailwind CSS, existing repository methods

---

## Task 1: Install Lightbox Dependency

**Files:**
- Modify: `packages/ui/package.json`

**Step 1: Install yet-another-react-lightbox**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm add yet-another-react-lightbox --filter @repo/ui
```

**Step 2: Verify installation**

```bash
cd /mnt/c/VelikiBukovec_web && cat packages/ui/package.json | grep lightbox
```
Expected: `"yet-another-react-lightbox": "^X.X.X"`

**Step 3: Commit**

```bash
git add packages/ui/package.json pnpm-lock.yaml
git commit -m "chore(ui): add yet-another-react-lightbox dependency"
```

---

## Task 2: Create GalleryCard Component

**Files:**
- Create: `packages/ui/src/components/gallery-card.tsx`
- Modify: `packages/ui/src/index.ts`

**Step 1: Create GalleryCard component**

```tsx
// packages/ui/src/components/gallery-card.tsx
import Link from 'next/link';

import { cn } from '../lib/utils';

export interface GalleryCardProps {
  name: string;
  slug: string;
  coverImage: string | null;
  imageCount: number;
  eventDate: Date | null;
  className?: string;
}

export function GalleryCard({
  name,
  slug,
  coverImage,
  imageCount,
  eventDate,
  className,
}: GalleryCardProps) {
  const formattedDate = eventDate
    ? new Intl.DateTimeFormat('hr-HR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(eventDate))
    : null;

  return (
    <Link
      href={`/galerija/${slug}`}
      className={cn(
        'group block overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
          {name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
          <span>{imageCount} fotografija</span>
          {formattedDate && (
            <>
              <span>•</span>
              <span>{formattedDate}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
```

**Step 2: Export from index.ts**

Add to `packages/ui/src/index.ts`:
```tsx
export * from './components/gallery-card';
```

**Step 3: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && npm run lint && npm run type-check
```
Expected: Pass

**Step 4: Commit**

```bash
git add packages/ui/src/components/gallery-card.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add GalleryCard component for album display"
```

---

## Task 3: Create PhotoGrid Component with Lightbox

**Files:**
- Create: `packages/ui/src/components/photo-grid.tsx`
- Modify: `packages/ui/src/index.ts`

**Step 1: Create PhotoGrid component**

```tsx
// packages/ui/src/components/photo-grid.tsx
'use client';

import Lightbox from 'yet-another-react-lightbox';
import { useState } from 'react';

import 'yet-another-react-lightbox/styles.css';

import { cn } from '../lib/utils';

export interface PhotoGridImage {
  id: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
}

export interface PhotoGridProps {
  images: PhotoGridImage[];
  className?: string;
}

export function PhotoGrid({ images, className }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const slides = images.map((img) => ({
    src: img.imageUrl,
    alt: img.caption || '',
    title: img.caption || undefined,
  }));

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:gap-3',
          className
        )}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="group aspect-square overflow-hidden rounded-lg bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <img
              src={image.thumbnailUrl || image.imageUrl}
              alt={image.caption || ''}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
        controller={{ closeOnBackdropClick: true }}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
        }}
      />
    </>
  );
}
```

**Step 2: Export from index.ts**

Add to `packages/ui/src/index.ts`:
```tsx
export * from './components/photo-grid';
```

**Step 3: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && npm run lint && npm run type-check
```
Expected: Pass

**Step 4: Commit**

```bash
git add packages/ui/src/components/photo-grid.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add PhotoGrid component with lightbox"
```

---

## Task 4: Add Public Gallery Repository Methods

**Files:**
- Modify: `packages/database/src/repositories/galleries.ts`

**Step 1: Add findPublished method**

Add after existing methods in `packages/database/src/repositories/galleries.ts`:

```tsx
  async findPublished(options: { page?: number; limit?: number } = {}): Promise<FindAllGalleriesResult> {
    const { page = 1, limit = 12 } = options;

    const [total, galleries] = await Promise.all([
      db.gallery.count(),
      db.gallery.findMany({
        include: { _count: { select: { images: true } } },
        orderBy: { eventDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      galleries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
```

**Step 2: Run type-check**

```bash
cd /mnt/c/VelikiBukovec_web && npm run type-check
```
Expected: Pass

**Step 3: Commit**

```bash
git add packages/database/src/repositories/galleries.ts
git commit -m "feat(database): add findPublished method for public galleries"
```

---

## Task 5: Create Gallery Listing Page

**Files:**
- Create: `apps/web/app/galerija/page.tsx`

**Step 1: Create gallery listing page**

```tsx
// apps/web/app/galerija/page.tsx
import { galleriesRepository } from '@repo/database';
import { FadeIn, GalleryCard, Pagination } from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Galerija',
  description: 'Foto galerija Općine Veliki Bukovec.',
  openGraph: {
    title: 'Galerija - Općina Veliki Bukovec',
    description: 'Foto galerija Općine Veliki Bukovec.',
    type: 'website',
  },
};

interface GalleryPageProps {
  searchParams: Promise<{
    stranica?: string;
  }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const page = params.stranica ? parseInt(params.stranica, 10) : 1;

  const { galleries, pagination } = await galleriesRepository.findPublished({
    page,
    limit: 12,
  });

  return (
    <>
      {/* Back link */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Povratak na početnu
        </Link>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 pb-6">
        <FadeIn>
          <h1 className="font-display text-3xl font-bold text-neutral-900 md:text-4xl">
            Galerija
          </h1>
          <p className="mt-2 text-neutral-600">
            Foto galerija Općine Veliki Bukovec
          </p>
        </FadeIn>
      </div>

      {/* Gallery grid */}
      <div className="container mx-auto px-4 pb-12">
        {galleries.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {galleries.map((gallery, index) => (
                <FadeIn key={gallery.id} delay={index * 0.05}>
                  <GalleryCard
                    name={gallery.name}
                    slug={gallery.slug}
                    coverImage={gallery.coverImage}
                    imageCount={gallery._count.images}
                    eventDate={gallery.eventDate}
                  />
                </FadeIn>
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <FadeIn>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  className="mt-12"
                />
              </FadeIn>
            )}
          </>
        ) : (
          <FadeIn>
            <div className="rounded-lg bg-neutral-100 py-12 text-center">
              <p className="text-neutral-600">Trenutno nema dostupnih galerija.</p>
            </div>
          </FadeIn>
        )}
      </div>
    </>
  );
}
```

**Step 2: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && npm run lint && npm run type-check
```
Expected: Pass

**Step 3: Commit**

```bash
git add apps/web/app/galerija/page.tsx
git commit -m "feat(web): add gallery listing page at /galerija"
```

---

## Task 6: Create Gallery Detail Page

**Files:**
- Create: `apps/web/app/galerija/[slug]/page.tsx`

**Step 1: Create gallery detail page**

```tsx
// apps/web/app/galerija/[slug]/page.tsx
import { galleriesRepository } from '@repo/database';
import { FadeIn, PhotoGrid } from '@repo/ui';
import { ArrowLeft, Calendar, Images } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

export const revalidate = 60;

interface GalleryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: GalleryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await galleriesRepository.findBySlug(slug);

  if (!gallery) {
    return { title: 'Galerija nije pronađena' };
  }

  const description = gallery.description
    ? gallery.description.slice(0, 160)
    : `Foto galerija: ${gallery.name}`;

  return {
    title: gallery.name,
    description,
    openGraph: {
      title: `${gallery.name} - Galerija - Općina Veliki Bukovec`,
      description,
      type: 'website',
      ...(gallery.coverImage && { images: [gallery.coverImage] }),
    },
  };
}

export default async function GalleryDetailPage({
  params,
}: GalleryDetailPageProps) {
  const { slug } = await params;
  const gallery = await galleriesRepository.findBySlug(slug);

  if (!gallery) {
    notFound();
  }

  const formattedDate = gallery.eventDate
    ? new Intl.DateTimeFormat('hr-HR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(gallery.eventDate))
    : null;

  return (
    <>
      {/* Back link */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/galerija"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Povratak na galeriju
        </Link>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 pb-6">
        <FadeIn>
          <h1 className="font-display text-2xl font-bold text-neutral-900 md:text-3xl">
            {gallery.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-1">
              <Images className="h-4 w-4" />
              <span>{gallery._count.images} fotografija</span>
            </div>
            {formattedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
          {gallery.description && (
            <p className="mt-3 text-neutral-600">{gallery.description}</p>
          )}
        </FadeIn>
      </div>

      {/* Photo grid */}
      <div className="container mx-auto px-4 pb-12">
        {gallery.images.length > 0 ? (
          <FadeIn delay={0.1}>
            <PhotoGrid
              images={gallery.images.map((img) => ({
                id: img.id,
                imageUrl: img.imageUrl,
                thumbnailUrl: img.thumbnailUrl,
                caption: img.caption,
              }))}
            />
          </FadeIn>
        ) : (
          <FadeIn>
            <div className="rounded-lg bg-neutral-100 py-12 text-center">
              <p className="text-neutral-600">Ova galerija još nema fotografija.</p>
            </div>
          </FadeIn>
        )}
      </div>
    </>
  );
}
```

**Step 2: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && npm run lint && npm run type-check
```
Expected: Pass

**Step 3: Commit**

```bash
git add apps/web/app/galerija/[slug]/page.tsx
git commit -m "feat(web): add gallery detail page with photo grid and lightbox"
```

---

## Task 7: Final Verification and Documentation

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`

**Step 1: Run full verification**

```bash
cd /mnt/c/VelikiBukovec_web && npm run lint && npm run type-check
```
Expected: All pass

**Step 2: Update CHANGELOG.md**

Add new section after Sprint 2.6:

```markdown
## Sprint 2.7 - Gallery Pages (Completed)

### Added
- Public gallery listing page at `/galerija` with album grid
- Gallery detail page at `/galerija/[slug]` with photo grid
- GalleryCard component for album display with cover image and photo count
- PhotoGrid component with yet-another-react-lightbox integration
- Lightbox with swipe gestures, keyboard navigation, and touch support
- findPublished repository method for public galleries
- ISR with 60-second revalidation
- Gate: Browse galleries, open album, click photo to open lightbox, swipe through photos
```

**Step 3: Update ROADMAP.md**

- Change Active Sprint to 2.8
- Change Overall Progress to 28/71
- Mark Sprint 2.7 as ✅
- Add changelog entry

**Step 4: Commit**

```bash
git add CHANGELOG.md ROADMAP.md
git commit -m "docs: update CHANGELOG and ROADMAP for Sprint 2.7 completion"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Install lightbox dependency | package.json |
| 2 | Create GalleryCard component | gallery-card.tsx |
| 3 | Create PhotoGrid with lightbox | photo-grid.tsx |
| 4 | Add findPublished repository method | galleries.ts |
| 5 | Create gallery listing page | /galerija/page.tsx |
| 6 | Create gallery detail page | /galerija/[slug]/page.tsx |
| 7 | Final verification and docs | CHANGELOG.md, ROADMAP.md |
