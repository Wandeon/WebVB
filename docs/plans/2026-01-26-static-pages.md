# Static Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render CMS-managed static pages at dynamic URLs with section navigation sidebar

**Architecture:** Catch-all route `[...slug]` fetches pages by slug path from database, renders with sidebar showing sibling pages. Reuses ArticleContent for HTML rendering.

**Tech Stack:** Next.js 15 App Router, Prisma, Tailwind Typography, DOMPurify

---

## Task 1: Add Repository Methods

**Files:**
- Modify: `packages/database/src/repositories/pages.ts`
- Create: `packages/database/src/repositories/pages.test.ts`

**Step 1: Write tests for new repository methods**

Create `packages/database/src/repositories/pages.test.ts`:

```typescript
import { describe, expect, it, vi } from 'vitest';

import { pagesRepository } from './pages';

vi.mock('../client', () => ({
  db: {
    page: {
      findMany: vi.fn(),
    },
  },
}));

import { db } from '../client';

describe('pagesRepository', () => {
  describe('findPublished', () => {
    it('returns all pages ordered by menuOrder', async () => {
      const mockPages = [
        { id: '1', slug: 'organizacija', title: 'Organizacija', menuOrder: 0 },
        { id: '2', slug: 'organizacija/uprava', title: 'Uprava', menuOrder: 1 },
      ];
      vi.mocked(db.page.findMany).mockResolvedValue(mockPages as never);

      const result = await pagesRepository.findPublished();

      expect(db.page.findMany).toHaveBeenCalledWith({
        select: { id: true, slug: true, title: true, menuOrder: true },
        orderBy: { menuOrder: 'asc' },
      });
      expect(result).toEqual(mockPages);
    });
  });

  describe('findSiblingsBySlug', () => {
    it('returns sibling pages for a child page', async () => {
      const mockSiblings = [
        { id: '2', slug: 'organizacija/uprava', title: 'Uprava', menuOrder: 1 },
        { id: '3', slug: 'organizacija/vijece', title: 'Vijeće', menuOrder: 2 },
      ];
      vi.mocked(db.page.findMany).mockResolvedValue(mockSiblings as never);

      const result = await pagesRepository.findSiblingsBySlug('organizacija/uprava');

      expect(db.page.findMany).toHaveBeenCalledWith({
        where: {
          slug: { startsWith: 'organizacija/' },
          NOT: { slug: { contains: '/', mode: undefined } },
        },
        select: { id: true, slug: true, title: true, menuOrder: true },
        orderBy: { menuOrder: 'asc' },
      });
      expect(result).toEqual(mockSiblings);
    });

    it('returns top-level pages for a root page', async () => {
      const mockSiblings = [
        { id: '1', slug: 'organizacija', title: 'Organizacija', menuOrder: 0 },
        { id: '4', slug: 'opcina', title: 'Općina', menuOrder: 1 },
      ];
      vi.mocked(db.page.findMany).mockResolvedValue(mockSiblings as never);

      const result = await pagesRepository.findSiblingsBySlug('organizacija');

      expect(db.page.findMany).toHaveBeenCalledWith({
        where: {
          NOT: { slug: { contains: '/' } },
        },
        select: { id: true, slug: true, title: true, menuOrder: true },
        orderBy: { menuOrder: 'asc' },
      });
      expect(result).toEqual(mockSiblings);
    });
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm --filter @repo/database test -- --run
```

Expected: FAIL with "findPublished is not a function" or similar

**Step 3: Implement repository methods**

Add to `packages/database/src/repositories/pages.ts` (after existing methods, before closing brace):

```typescript
  async findPublished(): Promise<Pick<Page, 'id' | 'slug' | 'title' | 'menuOrder'>[]> {
    return db.page.findMany({
      select: { id: true, slug: true, title: true, menuOrder: true },
      orderBy: { menuOrder: 'asc' },
    });
  },

  async findSiblingsBySlug(
    slug: string
  ): Promise<Pick<Page, 'id' | 'slug' | 'title' | 'menuOrder'>[]> {
    const isChildPage = slug.includes('/');

    if (isChildPage) {
      // Get parent prefix (e.g., "organizacija" from "organizacija/uprava")
      const parentPrefix = slug.split('/')[0];

      return db.page.findMany({
        where: {
          slug: { startsWith: `${parentPrefix}/` },
          // Only direct children (no nested paths beyond parentPrefix/)
          NOT: {
            slug: {
              contains: '/',
              // This needs refinement - we want slugs like "organizacija/uprava" but not "organizacija/uprava/sub"
            },
          },
        },
        select: { id: true, slug: true, title: true, menuOrder: true },
        orderBy: { menuOrder: 'asc' },
      });
    }

    // Root page - return all top-level pages (no slash in slug)
    return db.page.findMany({
      where: {
        NOT: { slug: { contains: '/' } },
      },
      select: { id: true, slug: true, title: true, menuOrder: true },
      orderBy: { menuOrder: 'asc' },
    });
  },
```

**Step 4: Fix the sibling logic to handle nesting properly**

Replace the `findSiblingsBySlug` method with this refined version:

```typescript
  async findSiblingsBySlug(
    slug: string
  ): Promise<Pick<Page, 'id' | 'slug' | 'title' | 'menuOrder'>[]> {
    const parts = slug.split('/');

    if (parts.length === 1) {
      // Root page - return all top-level pages (no slash in slug)
      return db.page.findMany({
        where: {
          NOT: { slug: { contains: '/' } },
        },
        select: { id: true, slug: true, title: true, menuOrder: true },
        orderBy: { menuOrder: 'asc' },
      });
    }

    // Child page - get siblings with same parent prefix
    const parentPrefix = parts.slice(0, -1).join('/');
    const allWithPrefix = await db.page.findMany({
      where: {
        slug: { startsWith: `${parentPrefix}/` },
      },
      select: { id: true, slug: true, title: true, menuOrder: true },
      orderBy: { menuOrder: 'asc' },
    });

    // Filter to only direct children (same depth as current page)
    const targetDepth = parts.length;
    return allWithPrefix.filter((p) => p.slug.split('/').length === targetDepth);
  },
```

**Step 5: Run tests to verify they pass**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm --filter @repo/database test -- --run
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/database/src/repositories/pages.ts packages/database/src/repositories/pages.test.ts
git commit -m "feat(database): add findPublished and findSiblingsBySlug to pages repository"
```

---

## Task 2: Create PageSidebar Component

**Files:**
- Create: `packages/ui/src/components/page-sidebar.tsx`
- Create: `packages/ui/src/components/page-sidebar.test.tsx`

**Step 1: Write tests**

Create `packages/ui/src/components/page-sidebar.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageSidebar } from './page-sidebar';

const mockPages = [
  { slug: 'organizacija/uprava', title: 'Općinska uprava' },
  { slug: 'organizacija/vijece', title: 'Općinsko vijeće' },
  { slug: 'organizacija/sjednice', title: 'Sjednice vijeća' },
];

describe('PageSidebar', () => {
  it('renders all sibling pages as links', () => {
    render(
      <PageSidebar
        pages={mockPages}
        currentSlug="organizacija/uprava"
        sectionTitle="Organizacija"
      />
    );

    expect(screen.getByText('Općinska uprava')).toBeInTheDocument();
    expect(screen.getByText('Općinsko vijeće')).toBeInTheDocument();
    expect(screen.getByText('Sjednice vijeća')).toBeInTheDocument();
  });

  it('highlights the current page with aria-current', () => {
    render(
      <PageSidebar
        pages={mockPages}
        currentSlug="organizacija/uprava"
        sectionTitle="Organizacija"
      />
    );

    const currentLink = screen.getByRole('link', { name: 'Općinska uprava' });
    expect(currentLink).toHaveAttribute('aria-current', 'page');
  });

  it('renders section title', () => {
    render(
      <PageSidebar
        pages={mockPages}
        currentSlug="organizacija/uprava"
        sectionTitle="Organizacija"
      />
    );

    expect(screen.getByText('Organizacija')).toBeInTheDocument();
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm --filter @repo/ui test -- --run src/components/page-sidebar.test.tsx
```

Expected: FAIL with "Cannot find module"

**Step 3: Implement PageSidebar**

Create `packages/ui/src/components/page-sidebar.tsx`:

```typescript
import Link from 'next/link';

import { cn } from '../lib/utils';

export interface PageSidebarItem {
  slug: string;
  title: string;
}

export interface PageSidebarProps {
  pages: PageSidebarItem[];
  currentSlug: string;
  sectionTitle: string;
  className?: string;
}

export function PageSidebar({
  pages,
  currentSlug,
  sectionTitle,
  className,
}: PageSidebarProps) {
  return (
    <nav aria-label={`${sectionTitle} navigacija`} className={cn('', className)}>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">
        {sectionTitle}
      </h2>
      <ul className="space-y-1">
        {pages.map((page) => {
          const isActive = page.slug === currentSlug;
          return (
            <li key={page.slug}>
              <Link
                href={`/${page.slug}`}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary-100 font-medium text-primary-900'
                    : 'text-neutral-700 hover:bg-neutral-100'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {page.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

**Step 4: Run tests to verify they pass**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm --filter @repo/ui test -- --run src/components/page-sidebar.test.tsx
```

Expected: PASS

**Step 5: Export from index**

Add to `packages/ui/src/components/index.ts`:

```typescript
export { PageSidebar, type PageSidebarProps, type PageSidebarItem } from './page-sidebar';
```

**Step 6: Commit**

```bash
git add packages/ui/src/components/page-sidebar.tsx packages/ui/src/components/page-sidebar.test.tsx packages/ui/src/components/index.ts
git commit -m "feat(ui): add PageSidebar component for static page navigation"
```

---

## Task 3: Create PageAccordion Component (Mobile)

**Files:**
- Create: `packages/ui/src/components/page-accordion.tsx`
- Create: `packages/ui/src/components/page-accordion.test.tsx`

**Step 1: Write tests**

Create `packages/ui/src/components/page-accordion.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageAccordion } from './page-accordion';

const mockPages = [
  { slug: 'organizacija/uprava', title: 'Općinska uprava' },
  { slug: 'organizacija/vijece', title: 'Općinsko vijeće' },
];

describe('PageAccordion', () => {
  it('renders section title in trigger', () => {
    render(
      <PageAccordion
        pages={mockPages}
        currentSlug="organizacija/uprava"
        sectionTitle="Organizacija"
      />
    );

    expect(screen.getByRole('button', { name: /Organizacija/i })).toBeInTheDocument();
  });

  it('shows current page title in collapsed state', () => {
    render(
      <PageAccordion
        pages={mockPages}
        currentSlug="organizacija/uprava"
        sectionTitle="Organizacija"
        currentTitle="Općinska uprava"
      />
    );

    expect(screen.getByText('Općinska uprava')).toBeInTheDocument();
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm --filter @repo/ui test -- --run src/components/page-accordion.test.tsx
```

Expected: FAIL

**Step 3: Implement PageAccordion**

Create `packages/ui/src/components/page-accordion.tsx`:

```typescript
'use client';

import Link from 'next/link';

import { cn } from '../lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../primitives/accordion';

export interface PageAccordionItem {
  slug: string;
  title: string;
}

export interface PageAccordionProps {
  pages: PageAccordionItem[];
  currentSlug: string;
  sectionTitle: string;
  currentTitle?: string;
  className?: string;
}

export function PageAccordion({
  pages,
  currentSlug,
  sectionTitle,
  currentTitle,
  className,
}: PageAccordionProps) {
  return (
    <Accordion type="single" collapsible className={cn('', className)}>
      <AccordionItem value="pages" className="border-b-0">
        <AccordionTrigger className="rounded-lg bg-neutral-100 px-4 hover:bg-neutral-200 hover:no-underline">
          <div className="flex flex-col items-start text-left">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              {sectionTitle}
            </span>
            <span className="text-sm font-semibold">
              {currentTitle || pages.find((p) => p.slug === currentSlug)?.title}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <nav aria-label={`${sectionTitle} navigacija`}>
            <ul className="space-y-1">
              {pages.map((page) => {
                const isActive = page.slug === currentSlug;
                return (
                  <li key={page.slug}>
                    <Link
                      href={`/${page.slug}`}
                      className={cn(
                        'block rounded-md px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-primary-100 font-medium text-primary-900'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

**Step 4: Run tests to verify they pass**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm --filter @repo/ui test -- --run src/components/page-accordion.test.tsx
```

Expected: PASS

**Step 5: Export from index**

Add to `packages/ui/src/components/index.ts`:

```typescript
export { PageAccordion, type PageAccordionProps, type PageAccordionItem } from './page-accordion';
```

**Step 6: Commit**

```bash
git add packages/ui/src/components/page-accordion.tsx packages/ui/src/components/page-accordion.test.tsx packages/ui/src/components/index.ts
git commit -m "feat(ui): add PageAccordion component for mobile static page navigation"
```

---

## Task 4: Create Catch-All Route

**Files:**
- Create: `apps/web/app/[...slug]/page.tsx`
- Create: `apps/web/app/[...slug]/not-found.tsx`

**Step 1: Create not-found page**

Create `apps/web/app/[...slug]/not-found.tsx`:

```typescript
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="font-display text-4xl font-bold text-neutral-900">
        Stranica nije pronađena
      </h1>
      <p className="mt-4 text-neutral-600">
        Stranica koju tražite ne postoji ili je uklonjena.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Povratak na naslovnicu
      </Link>
    </div>
  );
}
```

**Step 2: Create the catch-all page**

Create `apps/web/app/[...slug]/page.tsx`:

```typescript
import { pagesRepository } from '@repo/database';
import { getPublicEnv } from '@repo/shared';
import { ArticleContent, FadeIn, PageAccordion, PageSidebar } from '@repo/ui';
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

export const revalidate = 60;

interface StaticPageProps {
  params: Promise<{ slug: string[] }>;
}

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getSectionTitle(slug: string): string {
  const sectionMap: Record<string, string> = {
    organizacija: 'Organizacija',
    'rad-uprave': 'Rad uprave',
    opcina: 'Općina',
  };
  const firstPart = slug.split('/')[0];
  return sectionMap[firstPart] || 'Stranice';
}

export async function generateMetadata({
  params,
}: StaticPageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join('/');

  const page = await pagesRepository.findBySlug(slugPath);

  if (!page) {
    return { title: 'Stranica nije pronađena' };
  }

  return {
    title: page.title,
    openGraph: {
      title: page.title,
      url: `${NEXT_PUBLIC_SITE_URL}/${slugPath}`,
    },
  };
}

export async function generateStaticParams() {
  const pages = await pagesRepository.findPublished();
  return pages.map((page) => ({
    slug: page.slug.split('/'),
  }));
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');

  const page = await pagesRepository.findBySlug(slugPath);

  if (!page) {
    notFound();
  }

  const siblings = await pagesRepository.findSiblingsBySlug(slugPath);
  const sectionTitle = getSectionTitle(slugPath);
  const hasSidebar = siblings.length > 1;

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary-50 to-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <h1 className="font-display text-3xl font-bold text-neutral-900 md:text-4xl">
              {page.title}
            </h1>
          </FadeIn>
        </div>
      </div>

      {/* Mobile accordion */}
      {hasSidebar && (
        <div className="container mx-auto px-4 py-4 md:hidden">
          <PageAccordion
            pages={siblings}
            currentSlug={slugPath}
            sectionTitle={sectionTitle}
            currentTitle={page.title}
          />
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div
          className={
            hasSidebar ? 'grid gap-8 md:grid-cols-[240px,1fr]' : 'max-w-3xl'
          }
        >
          {/* Desktop sidebar */}
          {hasSidebar && (
            <FadeIn className="hidden md:block">
              <PageSidebar
                pages={siblings}
                currentSlug={slugPath}
                sectionTitle={sectionTitle}
                className="sticky top-24"
              />
            </FadeIn>
          )}

          {/* Main content */}
          <div>
            <FadeIn>
              <ArticleContent content={page.content} />
            </FadeIn>

            {/* Last updated */}
            <FadeIn>
              <p className="mt-8 border-t border-neutral-200 pt-6 text-sm text-neutral-500">
                Zadnje ažurirano: {formatDate(page.updatedAt)}
              </p>
            </FadeIn>
          </div>
        </div>
      </div>
    </>
  );
}
```

**Step 3: Run type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm run type-check
```

Expected: PASS

**Step 4: Commit**

```bash
git add apps/web/app/[...slug]/page.tsx apps/web/app/[...slug]/not-found.tsx
git commit -m "feat(web): add catch-all route for static pages with sidebar navigation"
```

---

## Task 5: Export New Components from UI Package

**Files:**
- Modify: `packages/ui/src/index.ts`

**Step 1: Verify exports exist in components/index.ts**

Check that `PageSidebar` and `PageAccordion` are exported from `packages/ui/src/components/index.ts`.

**Step 2: Verify main index re-exports components**

The `packages/ui/src/index.ts` should already have:

```typescript
export * from './components';
```

If not, add it.

**Step 3: Run build to verify exports work**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm run type-check
```

Expected: PASS

**Step 4: Commit if changes needed**

```bash
git add packages/ui/src/index.ts
git commit -m "chore(ui): ensure new page components are exported"
```

---

## Task 6: Run Full Test Suite

**Step 1: Run all tests**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm run lint && pnpm run type-check && pnpm run test -- --run
```

Expected: All checks pass

**Step 2: Update ROADMAP and CHANGELOG**

Add to `ROADMAP.md` change log:
```
| 2026-01-26 | Sprint 2.8 completed: Static pages with catch-all route, section sidebar navigation |
```

Mark Sprint 2.8 as complete in the status table.

Add to `CHANGELOG.md` under Unreleased or create new Sprint 2.8 section:
```markdown
## Sprint 2.8 - Static Pages (Completed)

### Added
- Catch-all route at `/[...slug]` for CMS-managed static pages
- PageSidebar component for desktop section navigation (sticky)
- PageAccordion component for mobile section navigation (collapsible)
- `findPublished` and `findSiblingsBySlug` repository methods
- "Last updated" date display on static pages
- ISR with 60-second revalidation
- Gate: Navigate "Organizacija" section, sidebar highlights correctly
```

**Step 3: Commit documentation updates**

```bash
git add ROADMAP.md CHANGELOG.md
git commit -m "docs: mark Sprint 2.8 static pages as complete"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Repository methods | `pages.ts`, `pages.test.ts` |
| 2 | PageSidebar component | `page-sidebar.tsx`, `page-sidebar.test.tsx` |
| 3 | PageAccordion component | `page-accordion.tsx`, `page-accordion.test.tsx` |
| 4 | Catch-all route | `[...slug]/page.tsx`, `not-found.tsx` |
| 5 | Export components | `index.ts` |
| 6 | Final verification | `ROADMAP.md`, `CHANGELOG.md` |

**Gate:** Navigate to `/organizacija/uprava`, see content with sidebar showing other Organizacija pages, sidebar highlights current page.
