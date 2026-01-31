# Navigation Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the new navigation system with accordion sidebar, mobile bottom sheet, and updated mega menu structure.

**Architecture:** Replace current tab-based pages with sidebar + content layout. Create reusable navigation components that show current location and enable discovery. Mobile uses bottom sheet instead of sidebar.

**Tech Stack:** Next.js 16, React, Framer Motion, TypeScript, Tailwind CSS v4

---

## Task 1: Update Navigation Data Structure

**Files:**
- Modify: `apps/web/lib/navigation.ts`

**Step 1: Define new types and navigation structure**

Replace the entire file with the new navigation structure:

```typescript
// apps/web/lib/navigation.ts

export interface PageSection {
  id: string;
  label: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  sections?: PageSection[];
  external?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  icon: string;
  items: NavItem[];
}

// Sidebar navigation sections (3 groups matching mega menu)
export const sidebarSections: NavSection[] = [
  {
    id: 'nas-kraj',
    title: 'Naš Kraj',
    icon: 'map-pin',
    items: [
      { id: 'opcina', label: 'Općina', href: '/opcina' },
      {
        id: 'naselja',
        label: 'Naselja',
        href: '/naselja',
        children: [
          { id: 'veliki-bukovec', label: 'Veliki Bukovec', href: '/naselja/veliki-bukovec' },
          { id: 'dubovica', label: 'Dubovica', href: '/naselja/dubovica' },
          { id: 'kapela', label: 'Kapela Podravska', href: '/naselja/kapela' },
        ],
      },
      { id: 'zupa', label: 'Župa', href: '/zupa' },
      { id: 'skola', label: 'Škola', href: '/skola' },
      { id: 'udruge', label: 'Udruge', href: '/udruge' },
    ],
  },
  {
    id: 'uprava',
    title: 'Uprava',
    icon: 'building',
    items: [
      { id: 'nacelnik', label: 'Načelnik', href: '/nacelnik' },
      { id: 'vijece', label: 'Vijeće', href: '/vijece' },
      { id: 'usluge', label: 'Usluge', href: '/usluge' },
      { id: 'dokumenti', label: 'Dokumenti', href: '/dokumenti' },
      { id: 'javna-nabava', label: 'Javna nabava', href: 'https://eojn.nn.hr/', external: true },
    ],
  },
  {
    id: 'aktualno',
    title: 'Aktualno',
    icon: 'newspaper',
    items: [
      { id: 'vijesti', label: 'Vijesti', href: '/vijesti' },
      { id: 'obavijesti', label: 'Obavijesti', href: '/obavijesti' },
      { id: 'galerija', label: 'Galerija', href: '/galerija' },
      { id: 'dogadanja', label: 'Događanja', href: '/dogadanja' },
      { id: 'izbori', label: 'Izbori', href: '/izbori' },
    ],
  },
];

// Helper to find which section a path belongs to
export function findSectionForPath(path: string): NavSection | null {
  for (const section of sidebarSections) {
    for (const item of section.items) {
      if (path === item.href || path.startsWith(item.href + '/')) {
        return section;
      }
      if (item.children) {
        for (const child of item.children) {
          if (path === child.href || path.startsWith(child.href + '/')) {
            return section;
          }
        }
      }
    }
  }
  return null;
}

// Helper to find active item and its parent
export function findActiveItem(path: string): { item: NavItem; parent?: NavItem } | null {
  for (const section of sidebarSections) {
    for (const item of section.items) {
      if (path === item.href) {
        return { item };
      }
      if (item.children) {
        for (const child of item.children) {
          if (path === child.href) {
            return { item: child, parent: item };
          }
        }
      }
    }
  }
  return null;
}

// Legacy exports for backward compatibility during migration
export const megaNavGroups = sidebarSections.map((section) => ({
  title: section.title,
  icon: section.icon,
  items: section.items.map((item) => ({
    title: item.label,
    href: item.href,
    external: item.external,
  })),
}));

export const mainNav = [
  { title: 'Naslovnica', href: '/' },
  ...sidebarSections.flatMap((s) =>
    s.items.map((item) => ({
      title: item.label,
      href: item.href,
    }))
  ),
];

export const footerLinks = [
  {
    title: 'Brze poveznice',
    items: [
      { title: 'Vijesti', href: '/vijesti' },
      { title: 'Obavijesti', href: '/obavijesti' },
      { title: 'Dokumenti', href: '/dokumenti' },
      { title: 'Usluge', href: '/usluge' },
      { title: 'Prijava problema', href: '/prijava-problema' },
      { title: 'Izjava o pristupačnosti', href: '/pristupacnost' },
    ],
  },
  {
    title: 'Kontakt',
    items: [
      { title: 'Općina Veliki Bukovec', href: '/kontakt' },
      { title: 'Trg svetog Franje 425', href: 'https://maps.google.com' },
      { title: '42231 Veliki Bukovec', href: '/kontakt' },
      { title: 'opcina@velikibukovec.hr', href: 'mailto:opcina@velikibukovec.hr' },
    ],
  },
];
```

**Step 2: Verify TypeScript compiles**

Run: `cd /home/wandeon/WebVB && pnpm type-check --filter=@repo/web`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/web/lib/navigation.ts
git commit -m "refactor(nav): update navigation data structure for sidebar

- Add NavSection, NavItem, PageSection types
- Create 3 groups: Naš Kraj, Uprava, Aktualno
- Add helper functions for path matching
- Keep legacy exports for backward compatibility"
```

---

## Task 2: Create useScrollSpy Hook

**Files:**
- Create: `apps/web/hooks/use-scroll-spy.ts`

**Step 1: Create the hook**

```typescript
// apps/web/hooks/use-scroll-spy.ts
'use client';

import { useEffect, useState } from 'react';

interface UseScrollSpyOptions {
  sectionIds: string[];
  offset?: number;
  throttleMs?: number;
}

export function useScrollSpy({ sectionIds, offset = 100, throttleMs = 100 }: UseScrollSpyOptions) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;

        const scrollPosition = window.scrollY + offset;

        // Find the section that's currently in view
        let currentSection: string | null = null;

        for (const id of sectionIds) {
          const element = document.getElementById(id);
          if (element) {
            const { top } = element.getBoundingClientRect();
            const absoluteTop = top + window.scrollY;

            if (scrollPosition >= absoluteTop) {
              currentSection = id;
            }
          }
        }

        setActiveId(currentSection);
      }, throttleMs);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [sectionIds, offset, throttleMs]);

  return activeId;
}
```

**Step 2: Create hooks index**

```typescript
// apps/web/hooks/index.ts
export { useScrollSpy } from './use-scroll-spy';
```

**Step 3: Verify TypeScript compiles**

Run: `cd /home/wandeon/WebVB && pnpm type-check --filter=@repo/web`
Expected: No errors

**Step 4: Commit**

```bash
git add apps/web/hooks/
git commit -m "feat(nav): add useScrollSpy hook for sidebar active state"
```

---

## Task 3: Create Sidebar Navigation Components

**Files:**
- Create: `apps/web/components/navigation/sidebar-nav.tsx`
- Create: `apps/web/components/navigation/sidebar-item.tsx`
- Create: `apps/web/components/navigation/index.ts`

**Step 1: Create SidebarItem component**

```typescript
// apps/web/components/navigation/sidebar-item.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import type { NavItem, PageSection } from '../../lib/navigation';

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isParentOfActive: boolean;
  activeChildId?: string;
  pageSections?: PageSection[];
  activeSectionId?: string | null;
  depth?: number;
  onNavigate?: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export function SidebarItem({
  item,
  isActive,
  isParentOfActive,
  activeChildId,
  pageSections = [],
  activeSectionId,
  depth = 0,
  onNavigate,
}: SidebarItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const hasSections = pageSections.length > 0;
  const isExpanded = isActive || isParentOfActive;

  const paddingLeft = depth === 0 ? 'pl-3' : depth === 1 ? 'pl-6' : 'pl-9';

  return (
    <div>
      {/* Main item link */}
      <Link
        href={item.href}
        onClick={onNavigate}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
        className={`
          group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all
          ${paddingLeft}
          ${isActive
            ? 'bg-primary-100 text-primary-700'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }
        `}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute left-0 h-6 w-1 rounded-r-full bg-primary-600"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}

        <span className="flex-1">{item.label}</span>

        {item.external && <ExternalLink className="h-3 w-3 text-neutral-400" />}

        {(hasChildren || (isActive && hasSections)) && (
          <ChevronRight
            className={`h-4 w-4 text-neutral-400 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        )}
      </Link>

      {/* Expanded children or sections */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
            className="overflow-hidden"
          >
            {/* Page sections (when this item is active) */}
            {isActive && hasSections && (
              <div className="ml-4 mt-1 border-l-2 border-primary-200 pl-2">
                {pageSections.map((section) => (
                  <motion.a
                    key={section.id}
                    href={`#${section.id}`}
                    variants={itemVariants}
                    onClick={onNavigate}
                    className={`
                      block rounded px-3 py-1.5 text-sm transition-colors
                      ${activeSectionId === section.id
                        ? 'bg-primary-50 font-medium text-primary-700'
                        : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
                      }
                    `}
                  >
                    {section.label}
                  </motion.a>
                ))}
              </div>
            )}

            {/* Child pages (for items like Naselja) */}
            {hasChildren && (isParentOfActive || isActive) && (
              <div className="mt-1">
                {item.children!.map((child) => (
                  <motion.div key={child.id} variants={itemVariants}>
                    <SidebarItem
                      item={child}
                      isActive={activeChildId === child.id}
                      isParentOfActive={false}
                      pageSections={activeChildId === child.id ? pageSections : []}
                      activeSectionId={activeSectionId}
                      depth={depth + 1}
                      onNavigate={onNavigate}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 2: Create SidebarNav component**

```typescript
// apps/web/components/navigation/sidebar-nav.tsx
'use client';

import { usePathname } from 'next/navigation';

import type { NavSection, PageSection } from '../../lib/navigation';
import { findActiveItem, findSectionForPath } from '../../lib/navigation';

import { SidebarItem } from './sidebar-item';

interface SidebarNavProps {
  sections: NavSection[];
  pageSections?: PageSection[];
  activeSectionId?: string | null;
  onNavigate?: () => void;
}

export function SidebarNav({
  sections,
  pageSections = [],
  activeSectionId,
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();

  // Find which section and item are active
  const activeSection = findSectionForPath(pathname);
  const activeResult = findActiveItem(pathname);

  if (!activeSection) {
    return null;
  }

  return (
    <nav className="space-y-1" aria-label="Stranica navigacija">
      {/* Section header */}
      <div className="mb-3 px-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {activeSection.title}
        </h2>
      </div>

      {/* Section items */}
      {activeSection.items.map((item) => {
        const isActive = activeResult?.item.id === item.id && !activeResult?.parent;
        const isParentOfActive = activeResult?.parent?.id === item.id;
        const activeChildId = activeResult?.parent ? activeResult.item.id : undefined;

        return (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={isActive}
            isParentOfActive={isParentOfActive}
            activeChildId={activeChildId}
            pageSections={isActive ? pageSections : []}
            activeSectionId={activeSectionId}
            onNavigate={onNavigate}
          />
        );
      })}
    </nav>
  );
}
```

**Step 3: Create index file**

```typescript
// apps/web/components/navigation/index.ts
export { SidebarNav } from './sidebar-nav';
export { SidebarItem } from './sidebar-item';
```

**Step 4: Verify TypeScript compiles**

Run: `cd /home/wandeon/WebVB && pnpm type-check --filter=@repo/web`
Expected: No errors

**Step 5: Commit**

```bash
git add apps/web/components/navigation/
git commit -m "feat(nav): add SidebarNav and SidebarItem components

- Accordion behavior with page sections expanding under active item
- Spring animations for expand/collapse
- Staggered reveal for section items
- Support for nested children (Naselja pattern)
- Active indicator with layoutId animation"
```

---

## Task 4: Create Mobile Navigation Components

**Files:**
- Create: `apps/web/components/navigation/mobile-nav-pill.tsx`
- Create: `apps/web/components/navigation/mobile-nav-sheet.tsx`
- Update: `apps/web/components/navigation/index.ts`

**Step 1: Create MobileNavPill component**

```typescript
// apps/web/components/navigation/mobile-nav-pill.tsx
'use client';

import { motion } from 'framer-motion';
import { ChevronUp, MapPin } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { findActiveItem } from '../../lib/navigation';

interface MobileNavPillProps {
  onOpen: () => void;
}

export function MobileNavPill({ onOpen }: MobileNavPillProps) {
  const pathname = usePathname();
  const activeResult = findActiveItem(pathname);

  // Don't show on homepage
  if (pathname === '/') return null;

  const label = activeResult?.item.label || 'Navigacija';

  return (
    <motion.button
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={onOpen}
      className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-primary-600/30 transition-transform active:scale-95 lg:hidden"
    >
      <MapPin className="h-4 w-4" />
      <span>{label}</span>
      <ChevronUp className="h-4 w-4" />
    </motion.button>
  );
}
```

**Step 2: Create MobileNavSheet component**

```typescript
// apps/web/components/navigation/mobile-nav-sheet.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

import type { NavSection, PageSection } from '../../lib/navigation';

import { SidebarNav } from './sidebar-nav';

interface MobileNavSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sections: NavSection[];
  pageSections?: PageSection[];
  activeSectionId?: string | null;
}

export function MobileNavSheet({
  isOpen,
  onClose,
  sections,
  pageSections = [],
  activeSectionId,
}: MobileNavSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl lg:hidden"
          >
            {/* Drag handle */}
            <div className="sticky top-0 z-10 bg-white px-4 pb-2 pt-3">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-neutral-300" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-3 rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Zatvori navigaciju"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Navigation content */}
            <div className="px-4 pb-8 pt-2">
              <SidebarNav
                sections={sections}
                pageSections={pageSections}
                activeSectionId={activeSectionId}
                onNavigate={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

**Step 3: Update index file**

```typescript
// apps/web/components/navigation/index.ts
export { SidebarNav } from './sidebar-nav';
export { SidebarItem } from './sidebar-item';
export { MobileNavPill } from './mobile-nav-pill';
export { MobileNavSheet } from './mobile-nav-sheet';
```

**Step 4: Verify TypeScript compiles**

Run: `cd /home/wandeon/WebVB && pnpm type-check --filter=@repo/web`
Expected: No errors

**Step 5: Commit**

```bash
git add apps/web/components/navigation/
git commit -m "feat(nav): add mobile navigation pill and bottom sheet

- Sticky pill at bottom shows current location
- Bottom sheet with drag handle and spring animation
- Reuses SidebarNav for consistent accordion behavior
- Body scroll lock when sheet is open
- Escape key closes sheet"
```

---

## Task 5: Create Small Hero Component

**Files:**
- Create: `apps/web/components/small-hero.tsx`

**Step 1: Create the component**

```typescript
// apps/web/components/small-hero.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface SmallHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
}

export function SmallHero({ title, subtitle, image, imageAlt }: SmallHeroProps) {
  const hasImage = !!image;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-xl ${
        hasImage ? 'h-[200px] md:h-[250px]' : 'bg-gradient-to-br from-primary-600 to-primary-700 py-10'
      }`}
    >
      {hasImage && (
        <>
          <Image
            src={image}
            alt={imageAlt || title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 800px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
        </>
      )}

      <div
        className={`relative flex h-full flex-col justify-end ${
          hasImage ? 'p-6 md:p-8' : 'px-6 md:px-8'
        }`}
      >
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-2xl font-bold text-white md:text-3xl"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-sm text-white/80 md:text-base"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </motion.section>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `cd /home/wandeon/WebVB && pnpm type-check --filter=@repo/web`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/web/components/small-hero.tsx
git commit -m "feat(ui): add SmallHero component for new page layout

- 200-250px height, contained within content area
- Optional background image with gradient overlay
- Animated title and subtitle
- Rounded corners for visual harmony with sidebar"
```

---

## Task 6: Create New Page Layout Component

**Files:**
- Create: `apps/web/components/page-layout-v2.tsx`

**Step 1: Create the layout component**

```typescript
// apps/web/components/page-layout-v2.tsx
'use client';

import { useState } from 'react';

import { useScrollSpy } from '../hooks/use-scroll-spy';
import type { PageSection } from '../lib/navigation';
import { sidebarSections } from '../lib/navigation';

import { MobileNavPill, MobileNavSheet, SidebarNav } from './navigation';
import { SmallHero } from './small-hero';

interface PageLayoutV2Props {
  title: string;
  subtitle?: string;
  heroImage?: string;
  heroImageAlt?: string;
  sections?: PageSection[];
  children: React.ReactNode;
}

export function PageLayoutV2({
  title,
  subtitle,
  heroImage,
  heroImageAlt,
  sections = [],
  children,
}: PageLayoutV2Props) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Track active section for scroll spy
  const sectionIds = sections.map((s) => s.id);
  const activeSectionId = useScrollSpy({ sectionIds, offset: 120 });

  return (
    <>
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop only */}
          <aside className="hidden w-[280px] flex-shrink-0 lg:block">
            <div className="sticky top-24">
              <SidebarNav
                sections={sidebarSections}
                pageSections={sections}
                activeSectionId={activeSectionId}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            {/* Small Hero */}
            <SmallHero
              title={title}
              subtitle={subtitle}
              image={heroImage}
              imageAlt={heroImageAlt}
            />

            {/* Content */}
            <article className="prose prose-neutral mt-8 max-w-none prose-headings:font-display prose-headings:font-semibold prose-h2:mt-10 prose-h2:scroll-mt-24 prose-h2:text-xl prose-h2:border-b prose-h2:border-neutral-200 prose-h2:pb-3 prose-h3:mt-6 prose-h3:scroll-mt-24 prose-p:text-neutral-600 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-li:text-neutral-600">
              {children}
            </article>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavPill onOpen={() => setIsSheetOpen(true)} />
      <MobileNavSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        sections={sidebarSections}
        pageSections={sections}
        activeSectionId={activeSectionId}
      />
    </>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `cd /home/wandeon/WebVB && pnpm type-check --filter=@repo/web`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/web/components/page-layout-v2.tsx
git commit -m "feat(layout): add PageLayoutV2 with sidebar navigation

- Desktop: 280px sticky sidebar + content with small hero
- Mobile: Floating pill + bottom sheet navigation
- Scroll spy integration for active section tracking
- Prose styling for content area
- scroll-mt-24 on headings for proper anchor scrolling"
```

---

## Task 7: Update Header with Kontakt Button

**Files:**
- Modify: `apps/web/components/layout/header.tsx`

**Step 1: Add Kontakt button to header**

Update the header to include a visible Kontakt button:

```typescript
// apps/web/components/layout/header.tsx
'use client';

import { APP_NAME } from '@repo/shared';
import { SearchModal, SearchTrigger, useSearchShortcut } from '@repo/ui';
import { Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import { AccessibilityWidget } from './accessibility-widget';
import { LanguageSwitcher, OfficeStatusBadge, SocialIcons, WeatherBadge } from './header-widgets';
import { MegaMenu } from './mega-menu';
import { MobileMenu } from './mobile-menu';

import { megaNavGroups } from '../../lib/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface SiteHeaderProps {
  latestPost?: {
    title: string;
    slug: string;
    category?: string | undefined;
    publishedAt?: Date | null | undefined;
  } | null | undefined;
  upcomingEvent?: {
    title: string;
    id: string;
    eventDate: Date;
  } | null | undefined;
}

export function SiteHeader({ latestPost, upcomingEvent }: SiteHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleOpenSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  // Enable Cmd+K / Ctrl+K shortcut
  useSearchShortcut(handleOpenSearch);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/85 shadow-sm backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center px-4">
          {/* Left: Mobile menu (mobile) or Logo (desktop) */}
          <div className="flex items-center gap-2 lg:flex-none">
            <MobileMenu
              groups={megaNavGroups}
              logo={
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/logo.png"
                    alt="Grb Općine Veliki Bukovec"
                    width={32}
                    height={40}
                    className="h-10 w-auto"
                  />
                  <span className="text-lg font-bold text-primary-700">{APP_NAME}</span>
                </div>
              }
            />
            {/* Desktop logo */}
            <Link href="/" className="hidden items-center gap-2 lg:flex">
              <Image
                src="/images/logo.png"
                alt="Grb Općine Veliki Bukovec"
                width={32}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <span className="font-display text-lg font-bold uppercase tracking-tight text-primary-700">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Center: Logo on mobile, Live widgets on desktop */}
          <div className="flex flex-1 items-center justify-center">
            {/* Mobile centered logo */}
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <Image
                src="/images/logo.png"
                alt="Grb Općine Veliki Bukovec"
                width={32}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <span className="font-display text-base font-bold uppercase tracking-tight text-primary-700">
                Veliki Bukovec
              </span>
            </Link>
            {/* Desktop live widgets */}
            <div className="hidden items-center gap-3 lg:flex">
              <OfficeStatusBadge />
              <WeatherBadge />
            </div>
          </div>

          {/* Right: Search, Kontakt, and Menu */}
          <div className="flex items-center gap-2 lg:gap-3">
            <SocialIcons />
            <LanguageSwitcher />
            <AccessibilityWidget />
            <SearchTrigger onOpen={handleOpenSearch} />

            {/* Kontakt button - visible on desktop */}
            <Link
              href="/kontakt"
              className="hidden items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 lg:flex"
            >
              <Mail className="h-4 w-4" />
              Kontakt
            </Link>

            {/* Desktop Mega Menu */}
            <div className="hidden lg:block">
              <MegaMenu
                groups={megaNavGroups}
                latestPost={latestPost}
                upcomingEvent={upcomingEvent}
              />
            </div>
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={handleCloseSearch} apiUrl={API_URL} />
    </>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `cd /home/wandeon/WebVB && pnpm type-check --filter=@repo/web`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/web/components/layout/header.tsx
git commit -m "feat(header): add visible Kontakt button

- Primary colored button with mail icon
- Visible on desktop, hidden on mobile (accessible via menu)
- Positioned next to search trigger"
```

---

## Task 8: Create Načelnik Page (Example Migration)

**Files:**
- Create: `apps/web/app/nacelnik/page.tsx`

**Step 1: Create the page**

```typescript
// apps/web/app/nacelnik/page.tsx
import type { Metadata } from 'next';

import { PageLayoutV2 } from '../../components/page-layout-v2';
import type { PageSection } from '../../lib/navigation';

export const metadata: Metadata = {
  title: 'Načelnik | Općina Veliki Bukovec',
  description: 'Ivan Modrić - Općinski načelnik Općine Veliki Bukovec',
};

const pageSections: PageSection[] = [
  { id: 'o-nacelniku', label: 'O načelniku' },
  { id: 'program-rada', label: 'Program rada' },
  { id: 'dokumenti', label: 'Dokumenti' },
  { id: 'kontakt', label: 'Kontakt' },
];

export default function NacelnikPage() {
  return (
    <PageLayoutV2
      title="Ivan Modrić"
      subtitle="Općinski načelnik"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      <section id="o-nacelniku">
        <h2>O načelniku</h2>
        <div className="not-prose mb-6 flex flex-col gap-6 sm:flex-row">
          <div className="h-48 w-40 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-200">
            {/* Photo placeholder - add actual image */}
            <div className="flex h-full items-center justify-center text-neutral-400">
              Fotografija
            </div>
          </div>
          <div>
            <p className="text-lg text-neutral-700">
              <strong>Ivan Modrić</strong> je općinski načelnik Općine Veliki Bukovec.
              Rođen je 17. travnja 2000. godine u Varaždinu, a trenutno živi u Velikom Bukovcu.
            </p>
            <p className="mt-3 text-neutral-600">
              Osnovnu školu završio je u Velikom Bukovcu, a srednju školu u Varaždinu
              (strojarska i prometna škola). Po struci je strojarski/računalni tehničar.
            </p>
          </div>
        </div>
        <p>
          Opisuje se kao radišan, pošten i odgovoran mladi čovjek, uvijek spreman pomoći
          i uključiti se u život zajednice. Njegove vrijednosti temelje se na poštenju,
          radu i solidarnosti zajednice kao temelju za uspjeh općine.
        </p>
      </section>

      <section id="program-rada">
        <h2>Program rada</h2>
        <p>
          Program rada načelnika za mandatno razdoblje 2025.-2029. uključuje:
        </p>
        <ul>
          <li>Unapređenje komunalne infrastrukture</li>
          <li>Poticanje lokalnog gospodarstva</li>
          <li>Poboljšanje kvalitete života građana</li>
          <li>Transparentnost u radu uprave</li>
        </ul>
        <p>
          Detaljni programi i izvješća o radu dostupni su u sekciji dokumenata.
        </p>
      </section>

      <section id="dokumenti">
        <h2>Dokumenti</h2>
        <div className="not-prose grid gap-4 sm:grid-cols-2">
          <a
            href="#"
            className="rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="font-medium text-neutral-900">Izjava o imovinskom stanju</div>
            <div className="mt-1 text-sm text-neutral-500">PDF dokument</div>
          </a>
          <a
            href="#"
            className="rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="font-medium text-neutral-900">Program rada 2025-2029</div>
            <div className="mt-1 text-sm text-neutral-500">PDF dokument</div>
          </a>
          <a
            href="#"
            className="rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="font-medium text-neutral-900">Godišnji plan rada</div>
            <div className="mt-1 text-sm text-neutral-500">PDF dokument</div>
          </a>
          <a
            href="#"
            className="rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="font-medium text-neutral-900">Izvješće o radu</div>
            <div className="mt-1 text-sm text-neutral-500">PDF dokument</div>
          </a>
        </div>
      </section>

      <section id="kontakt">
        <h2>Kontakt</h2>
        <div className="not-prose rounded-xl bg-primary-50 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-primary-700">Ured načelnika</div>
              <div className="mt-1 text-neutral-700">Općina Veliki Bukovec</div>
              <div className="text-neutral-600">Trg svetog Franje 425</div>
              <div className="text-neutral-600">42231 Veliki Bukovec</div>
            </div>
            <div>
              <div className="text-sm font-medium text-primary-700">Radno vrijeme</div>
              <div className="mt-1 text-neutral-700">Ponedjeljak - Petak</div>
              <div className="text-neutral-600">07:00 - 15:00</div>
              <div className="mt-3">
                <div className="text-sm font-medium text-primary-700">Telefon</div>
                <div className="text-neutral-700">042/840-040</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayoutV2>
  );
}
```

**Step 2: Verify the page builds**

Run: `cd /home/wandeon/WebVB && pnpm build --filter=@repo/web`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add apps/web/app/nacelnik/
git commit -m "feat(pages): add Načelnik page with new layout

- Uses PageLayoutV2 with sidebar navigation
- Page sections for scroll spy
- Content from old WP site (Ivan Modrić)
- Document links and contact info"
```

---

## Task 9: Fix Homepage Village Names on Mobile

**Files:**
- Modify: `apps/web/components/village-hero.tsx`

**Step 1: Find and update the village name styling**

Add centered text on mobile. Look for the village name text element and add responsive centering:

```typescript
// In the VillageHero component, find the village card/name section and update:
// Add 'text-center lg:text-left' to the village name container
```

Run: `grep -n "village" apps/web/components/village-hero.tsx | head -20`

Then update the specific section. The exact location will depend on the current code structure.

**Step 2: Verify the change**

Run: `cd /home/wandeon/WebVB && pnpm build --filter=@repo/web`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add apps/web/components/village-hero.tsx
git commit -m "fix(hero): center village names on mobile

- Add text-center on mobile, text-left on desktop
- Improves readability on smaller screens"
```

---

## Task 10: Create Naselja Landing Page

**Files:**
- Create: `apps/web/app/naselja/page.tsx`
- Create: `apps/web/app/naselja/layout.tsx`

**Step 1: Create layout**

```typescript
// apps/web/app/naselja/layout.tsx
export default function NaseljaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

**Step 2: Create landing page**

```typescript
// apps/web/app/naselja/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { PageLayoutV2 } from '../../components/page-layout-v2';

export const metadata: Metadata = {
  title: 'Naselja | Općina Veliki Bukovec',
  description: 'Upoznajte naselja Općine Veliki Bukovec: Veliki Bukovec, Dubovica i Kapela Podravska',
};

const villages = [
  {
    id: 'veliki-bukovec',
    name: 'Veliki Bukovec',
    description: 'Administrativno središte općine s bogatom poviješću i tradicijom cvjećarstva.',
    image: '/images/hero/veliki-bukovec-hero-1.jpg',
    href: '/naselja/veliki-bukovec',
  },
  {
    id: 'dubovica',
    name: 'Dubovica',
    description: 'Mirno selo poznato po kapeli Uzvišenja svetog Križa i poljoprivrednoj tradiciji.',
    image: '/images/hero/veliki-bukovec-hero-3.jpg',
    href: '/naselja/dubovica',
  },
  {
    id: 'kapela',
    name: 'Kapela Podravska',
    description: 'Naselje uz rijeku Bednju s dugom poviješću i aktivnom zajednicom.',
    image: '/images/hero/veliki-bukovec-hero-2.jpg',
    href: '/naselja/kapela',
  },
];

export default function NaseljaPage() {
  return (
    <PageLayoutV2
      title="Naselja"
      subtitle="Tri naselja, jedna zajednica"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
    >
      <p className="lead">
        Općina Veliki Bukovec obuhvaća tri naselja koja zajedno čine jedinstvenu
        podravsku zajednicu s bogatom tradicijom i živom sadašnjošću.
      </p>

      <div className="not-prose mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {villages.map((village) => (
          <Link
            key={village.id}
            href={village.href}
            className="group overflow-hidden rounded-xl border border-neutral-200 transition-all hover:border-primary-300 hover:shadow-lg"
          >
            <div className="relative h-48 overflow-hidden">
              <Image
                src={village.image}
                alt={village.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-bold text-white">{village.name}</h3>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-neutral-600">{village.description}</p>
              <span className="mt-3 inline-flex items-center text-sm font-medium text-primary-600">
                Saznaj više →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </PageLayoutV2>
  );
}
```

**Step 3: Verify the page builds**

Run: `cd /home/wandeon/WebVB && pnpm build --filter=@repo/web`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add apps/web/app/naselja/
git commit -m "feat(pages): add Naselja landing page

- Village cards with images and descriptions
- Links to individual village subpages
- Uses PageLayoutV2 with sidebar navigation"
```

---

## Task 11: Create Village Subpages

**Files:**
- Create: `apps/web/app/naselja/veliki-bukovec/page.tsx`
- Create: `apps/web/app/naselja/dubovica/page.tsx`
- Create: `apps/web/app/naselja/kapela/page.tsx`

**Step 1: Create Veliki Bukovec page**

```typescript
// apps/web/app/naselja/veliki-bukovec/page.tsx
import type { Metadata } from 'next';

import { PageLayoutV2 } from '../../../components/page-layout-v2';
import type { PageSection } from '../../../lib/navigation';

export const metadata: Metadata = {
  title: 'Veliki Bukovec | Općina Veliki Bukovec',
  description: 'Veliki Bukovec - administrativno središte općine s bogatom poviješću i tradicijom cvjećarstva',
};

const pageSections: PageSection[] = [
  { id: 'o-selu', label: 'O selu' },
  { id: 'znamenitosti', label: 'Znamenitosti' },
  { id: 'galerija', label: 'Galerija' },
];

export default function VelikiBukovecPage() {
  return (
    <PageLayoutV2
      title="Veliki Bukovec"
      subtitle="Administrativno središte općine"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      <section id="o-selu">
        <h2>O selu</h2>
        <p>
          Veliki Bukovec je administrativno središte istoimene općine u Varaždinskoj županiji.
          Smješten u srcu Podravine, selo je poznato po dugoj tradiciji cvjećarstva koja seže
          više od stoljeća unazad.
        </p>
        <p>
          Stanovništvo se tradicionalno bavi poljoprivredom, posebice uzgojem cvijeća i povrća.
          Cvjećari Velikog Bukovca opskrbljuju tržnice diljem Hrvatske prekrasnim cvijećem
          i presadicama.
        </p>
      </section>

      <section id="znamenitosti">
        <h2>Znamenitosti</h2>
        <h3>Dvorac Drašković</h3>
        <p>
          Barokno-klasicistički dvorac izgrađen između 1745. i 1755. godine.
          Predstavlja arhitektonski biser regije i svjedočanstvo bogate povijesti.
        </p>
        <h3>Crkva sv. Franje Asiškog</h3>
        <p>
          Župna crkva posvećena sv. Franji Asiškom, duhovno središte zajednice.
        </p>
      </section>

      <section id="galerija">
        <h2>Galerija</h2>
        <p>Fotografije sela i okolice uskoro...</p>
      </section>
    </PageLayoutV2>
  );
}
```

**Step 2: Create Dubovica page**

```typescript
// apps/web/app/naselja/dubovica/page.tsx
import type { Metadata } from 'next';

import { PageLayoutV2 } from '../../../components/page-layout-v2';
import type { PageSection } from '../../../lib/navigation';

export const metadata: Metadata = {
  title: 'Dubovica | Općina Veliki Bukovec',
  description: 'Dubovica - mirno selo poznato po kapeli Uzvišenja svetog Križa',
};

const pageSections: PageSection[] = [
  { id: 'o-selu', label: 'O selu' },
  { id: 'znamenitosti', label: 'Znamenitosti' },
  { id: 'galerija', label: 'Galerija' },
];

export default function DubovicaPage() {
  return (
    <PageLayoutV2
      title="Dubovica"
      subtitle="Mirno podravsko selo"
      heroImage="/images/hero/veliki-bukovec-hero-3.jpg"
      sections={pageSections}
    >
      <section id="o-selu">
        <h2>O selu</h2>
        <p>
          Dubovica je mirno selo u sastavu Općine Veliki Bukovec. Poznato je po
          poljoprivrednoj tradiciji i živoj seoskoj zajednici.
        </p>
      </section>

      <section id="znamenitosti">
        <h2>Znamenitosti</h2>
        <h3>Kapela Uzvišenja sv. Križa</h3>
        <p>
          Kapela izgrađena 1974. godine na mjestu koje je nekada bilo "šikara i močvara".
          Gradnju je vodio preč. Ivan Lončar uz pomoć mještana koji su vlastitim rukama
          i sredstvima podigli ovo svetište.
        </p>
      </section>

      <section id="galerija">
        <h2>Galerija</h2>
        <p>Fotografije sela i okolice uskoro...</p>
      </section>
    </PageLayoutV2>
  );
}
```

**Step 3: Create Kapela page**

```typescript
// apps/web/app/naselja/kapela/page.tsx
import type { Metadata } from 'next';

import { PageLayoutV2 } from '../../../components/page-layout-v2';
import type { PageSection } from '../../../lib/navigation';

export const metadata: Metadata = {
  title: 'Kapela Podravska | Općina Veliki Bukovec',
  description: 'Kapela Podravska - naselje uz rijeku Bednju s dugom poviješću',
};

const pageSections: PageSection[] = [
  { id: 'o-selu', label: 'O selu' },
  { id: 'znamenitosti', label: 'Znamenitosti' },
  { id: 'galerija', label: 'Galerija' },
];

export default function KapelaPage() {
  return (
    <PageLayoutV2
      title="Kapela Podravska"
      subtitle="Uz rijeku Bednju"
      heroImage="/images/hero/veliki-bukovec-hero-2.jpg"
      sections={pageSections}
    >
      <section id="o-selu">
        <h2>O selu</h2>
        <p>
          Kapela Podravska je naselje smješteno uz rijeku Bednju. Poznato je po
          bogatoj povijesti i aktivnoj zajednici koja čuva tradiciju kraja.
        </p>
        <p>
          Tijekom poplava koje su pogodile regiju, mještani Kapele Podravske
          pokazali su iznimnu solidarnost i sposobnost samoorganizacije u
          zaštiti svojih domova.
        </p>
      </section>

      <section id="znamenitosti">
        <h2>Znamenitosti</h2>
        <p>Znamenitosti i kulturna baština sela...</p>
      </section>

      <section id="galerija">
        <h2>Galerija</h2>
        <p>Fotografije sela i okolice uskoro...</p>
      </section>
    </PageLayoutV2>
  );
}
```

**Step 4: Verify pages build**

Run: `cd /home/wandeon/WebVB && pnpm build --filter=@repo/web`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add apps/web/app/naselja/
git commit -m "feat(pages): add village subpages

- Veliki Bukovec with castle and church info
- Dubovica with chapel history
- Kapela Podravska with river and flood history
- All use PageLayoutV2 with scroll spy sections"
```

---

## Summary of Tasks

| Task | Description | Files | Priority |
|------|-------------|-------|----------|
| 1 | Update navigation data structure | `lib/navigation.ts` | Critical |
| 2 | Create useScrollSpy hook | `hooks/use-scroll-spy.ts` | Critical |
| 3 | Create sidebar components | `components/navigation/*` | Critical |
| 4 | Create mobile nav components | `components/navigation/*` | Critical |
| 5 | Create SmallHero component | `components/small-hero.tsx` | Critical |
| 6 | Create PageLayoutV2 | `components/page-layout-v2.tsx` | Critical |
| 7 | Update header with Kontakt | `components/layout/header.tsx` | High |
| 8 | Create Načelnik page | `app/nacelnik/page.tsx` | High |
| 9 | Fix homepage mobile | `components/village-hero.tsx` | Medium |
| 10 | Create Naselja landing | `app/naselja/page.tsx` | High |
| 11 | Create village subpages | `app/naselja/*/page.tsx` | High |

---

## Future Tasks (Not in This Plan)

These will be separate implementation plans:

1. **Update Mega Menu** - Restructure to match new 3-group layout
2. **Create Vijeće page** - Council members and decisions
3. **Create Župa page** - Church information
4. **Create Škola page** - School information
5. **Migrate /opcina** - Convert from tabs to single rich page
6. **Migrate /usluge** - Convert from tabs to new layout
7. **Update remaining pages** - Apply new layout to all pages
8. **Animation polish** - Refine all animations
9. **Accessibility audit** - Full a11y review

---

*Plan complete. Ready for execution.*
