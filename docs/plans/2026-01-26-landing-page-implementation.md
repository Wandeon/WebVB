# Landing Page Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the homepage into a modern "digital town square" with image-first hero, bento quick links, two-column news/events, editorial experience section, and trust-building transparency block.

**Architecture:** Static config files for content, new UI components in packages/ui, restructured page.tsx composing all sections. No backend changes. Static export compatible.

**Tech Stack:** Next.js 16, React Server Components, Tailwind CSS, Framer Motion, existing @repo/ui patterns.

---

## Task 1: Create Config Files

**Files:**
- Create: `apps/web/lib/hero-config.ts`
- Create: `apps/web/lib/experience-items.ts`
- Create: `apps/web/lib/transparency-config.ts`

**Step 1: Create hero-config.ts**

```typescript
// apps/web/lib/hero-config.ts
export const heroConfig = {
  imageSrc: '/images/hero/veliki-bukovec-hero.jpg',
  videoSrc: '/videos/hero/veliki-bukovec-drone.webm',
  videoSrcFallback: '/videos/hero/veliki-bukovec-drone.mp4',
  headline: 'Dobro došli u Općinu Veliki Bukovec',
  subline: 'Sve informacije, događanja i usluge na jednom mjestu',
  primaryCta: {
    label: 'Prijava problema',
    href: '/prijava-problema',
  },
  secondaryCta: {
    label: 'Događanja',
    href: '/dogadanja',
  },
  trustLine: {
    hours: 'Pon-Pet 7:00-15:00',
    hoursHref: '/kontakt',
    address: 'Trg A. Starčevića 1',
    addressHref: 'https://maps.google.com/?q=Trg+A.+Starčevića+1,+Veliki+Bukovec',
  },
};
```

**Step 2: Create experience-items.ts**

```typescript
// apps/web/lib/experience-items.ts
export interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
}

export const experienceItems: ExperienceItem[] = [
  {
    id: 'znamenitosti',
    title: 'Znamenitosti',
    description: 'Crkva sv. Lovre, dvorac Drašković i povijesne građevine',
    image: '/images/experience/znamenitosti.jpg',
    imageAlt: 'Crkva sv. Lovre u Velikom Bukovcu',
    href: '/dozivi-opcinu/znamenitosti',
  },
  {
    id: 'priroda',
    title: 'Priroda',
    description: 'Rijeke Mura i Drava, Natura 2000 područja',
    image: '/images/experience/priroda.jpg',
    imageAlt: 'Rijeka Drava u blizini Velikog Bukovca',
    href: '/dozivi-opcinu/priroda',
  },
  {
    id: 'kultura',
    title: 'Kultura i tradicija',
    description: 'Lokalni običaji, manifestacije i folklor',
    image: '/images/experience/kultura.jpg',
    imageAlt: 'Tradicijska manifestacija u Velikom Bukovcu',
    href: '/dozivi-opcinu/kultura',
  },
];
```

**Step 3: Create transparency-config.ts**

```typescript
// apps/web/lib/transparency-config.ts
export const transparencyConfig = {
  mobesUrl: 'https://proracun.gov.hr/opcina-veliki-bukovec',
  documentsUrl: '/dokumenti?kategorija=proracun',
  headline: 'Proračun i transparentnost',
  description: 'Transparentno upravljamo javnim sredstvima. Na jednom mjestu možete pregledati proračun, izvješća i povezane dokumente.',
  mobesLabel: 'Proračun na MOBES-u',
  documentsLabel: 'Dokumenti',
  helperText: 'MOBES se otvara u novoj kartici.',
};
```

**Step 4: Commit**

```bash
git add apps/web/lib/hero-config.ts apps/web/lib/experience-items.ts apps/web/lib/transparency-config.ts
git commit -m "feat(landing): add config files for hero, experience, and transparency sections"
```

---

## Task 2: Create PlaceHero Component

**Files:**
- Create: `packages/ui/src/components/place-hero.tsx`
- Create: `packages/ui/src/components/place-hero.test.tsx`
- Modify: `packages/ui/src/index.ts`

**Step 1: Write the test file**

```typescript
// packages/ui/src/components/place-hero.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PlaceHero } from './place-hero';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('PlaceHero', () => {
  const defaultProps = {
    imageSrc: '/test-image.jpg',
    headline: 'Test Headline',
    subline: 'Test Subline',
    primaryCta: { label: 'Primary', href: '/primary' },
    secondaryCta: { label: 'Secondary', href: '/secondary' },
  };

  it('renders headline and subline', () => {
    render(<PlaceHero {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Headline');
    expect(screen.getByText('Test Subline')).toBeInTheDocument();
  });

  it('renders both CTA buttons', () => {
    render(<PlaceHero {...defaultProps} />);

    expect(screen.getByRole('link', { name: 'Primary' })).toHaveAttribute('href', '/primary');
    expect(screen.getByRole('link', { name: 'Secondary' })).toHaveAttribute('href', '/secondary');
  });

  it('renders hero image', () => {
    render(<PlaceHero {...defaultProps} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test-image.jpg');
  });

  it('renders trust line when provided', () => {
    render(
      <PlaceHero
        {...defaultProps}
        trustLine={{
          hours: 'Mon-Fri 9-5',
          hoursHref: '/contact',
          address: '123 Main St',
          addressHref: 'https://maps.google.com',
        }}
      />
    );

    expect(screen.getByText('Mon-Fri 9-5')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /mnt/c/VelikiBukovec_web && pnpm test --filter=@repo/ui -- place-hero`
Expected: FAIL with "Cannot find module './place-hero'"

**Step 3: Create the PlaceHero component**

```typescript
// packages/ui/src/components/place-hero.tsx
'use client';

import { Clock, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '../lib/utils';
import { buttonVariants } from '../primitives/button';

export interface PlaceHeroProps {
  imageSrc: string;
  videoSrc?: string;
  videoSrcFallback?: string;
  videoPosterSrc?: string;
  priority?: boolean;
  headline?: string;
  subline?: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  trustLine?: {
    hours: string;
    hoursHref: string;
    address: string;
    addressHref: string;
  };
  className?: string;
}

function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

function shouldEnhanceToVideo(): boolean {
  if (typeof window === 'undefined') return false;

  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;

  if (connection?.saveData) return false;
  if (connection?.effectiveType && !['4g'].includes(connection.effectiveType)) return false;

  return true;
}

export function PlaceHero({
  imageSrc,
  videoSrc,
  videoSrcFallback,
  videoPosterSrc,
  priority = true,
  headline = 'Dobro došli u Općinu Veliki Bukovec',
  subline = 'Sve informacije, događanja i usluge na jednom mjestu',
  primaryCta,
  secondaryCta,
  trustLine,
  className,
}: PlaceHeroProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  useEffect(() => {
    if (!imageLoaded || !videoSrc || reducedMotion) return;

    const shouldEnhance = shouldEnhanceToVideo();
    if (!shouldEnhance) return;

    // Use requestIdleCallback for non-critical video enhancement
    const enhance = () => {
      setShowVideo(true);
    };

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(enhance, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    } else {
      const id = setTimeout(enhance, 100);
      return () => clearTimeout(id);
    }
  }, [imageLoaded, videoSrc, reducedMotion]);

  return (
    <section className={cn('relative h-[70vh] min-h-[500px] overflow-hidden', className)}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority={priority}
          className="object-cover"
          sizes="100vw"
          onLoad={handleImageLoad}
        />
      </div>

      {/* Video Enhancement */}
      {showVideo && videoSrc && (
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000',
            showVideo ? 'opacity-100' : 'opacity-0'
          )}
          autoPlay
          muted
          loop
          playsInline
          poster={videoPosterSrc || imageSrc}
          aria-hidden="true"
          style={{ pointerEvents: 'none' }}
        >
          {videoSrc && <source src={videoSrc} type="video/webm" />}
          {videoSrcFallback && <source src={videoSrcFallback} type="video/mp4" />}
        </video>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-transparent" />

      {/* Content */}
      <div className="container relative mx-auto flex h-full flex-col justify-end px-4 pb-12 md:pb-16">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-white md:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mt-4 text-lg text-white/90 md:text-xl">
            {subline}
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={primaryCta.href}
              className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}
            >
              {primaryCta.label}
            </Link>
            <Link
              href={secondaryCta.href}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
              )}
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>

        {/* Trust Line */}
        {trustLine && (
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-white/70">
            <a
              href={trustLine.hoursHref}
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{trustLine.hours}</span>
            </a>
            <a
              href={trustLine.addressHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{trustLine.address}</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd /mnt/c/VelikiBukovec_web && pnpm test --filter=@repo/ui -- place-hero`
Expected: PASS

**Step 5: Export from index.ts**

Add to `packages/ui/src/index.ts`:
```typescript
export * from './components/place-hero';
```

**Step 6: Commit**

```bash
git add packages/ui/src/components/place-hero.tsx packages/ui/src/components/place-hero.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add PlaceHero component with progressive video enhancement"
```

---

## Task 3: Add Bento Variant to QuickLinkCard

**Files:**
- Modify: `packages/ui/src/components/quick-link-card.tsx`
- Modify: `packages/ui/src/components/quick-link-card.test.tsx`

**Step 1: Update the test file**

Add to `packages/ui/src/components/quick-link-card.test.tsx`:

```typescript
describe('QuickLinkCard bento variant', () => {
  it('renders large bento card with description', () => {
    render(
      <QuickLinkCard
        title="Test"
        description="Test description"
        href="/test"
        icon={FileText}
        variant="bento"
        size="large"
      />
    );

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders small bento card without description', () => {
    render(
      <QuickLinkCard
        title="Test"
        description="Test description"
        href="/test"
        icon={FileText}
        variant="bento"
        size="small"
      />
    );

    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /mnt/c/VelikiBukovec_web && pnpm test --filter=@repo/ui -- quick-link-card`
Expected: FAIL

**Step 3: Update QuickLinkCard component**

```typescript
// packages/ui/src/components/quick-link-card.tsx
import Link from 'next/link';

import { cn } from '../lib/utils';

import type { LucideIcon } from 'lucide-react';

export interface QuickLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  variant?: 'standard' | 'bento';
  size?: 'small' | 'large';
  className?: string;
}

export function QuickLinkCard({
  title,
  description,
  href,
  icon: Icon,
  variant = 'standard',
  size = 'large',
  className,
}: QuickLinkCardProps) {
  const isExternal = href.startsWith('http');
  const isBento = variant === 'bento';
  const isSmall = size === 'small';

  const cardClasses = cn(
    'group flex rounded-xl border bg-white transition-all',
    isBento
      ? cn(
          'flex-col p-5',
          'border-neutral-200 shadow-sm',
          'hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-md',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
        )
      : cn(
          'flex-col items-center p-6 text-center shadow-sm',
          'border-neutral-200',
          'hover:border-primary-200 hover:shadow-md'
        ),
    className
  );

  const iconClasses = cn(
    'flex items-center justify-center rounded-full transition-colors',
    isBento
      ? cn(
          'h-12 w-12 bg-primary-50 text-primary-600',
          'group-hover:bg-primary-100'
        )
      : cn(
          'mb-4 h-14 w-14 bg-primary-50 text-primary-600',
          'group-hover:bg-primary-100'
        )
  );

  const iconSize = isBento ? 'h-6 w-6' : 'h-7 w-7';

  const content = (
    <>
      <div className={iconClasses}>
        <Icon className={iconSize} />
      </div>
      <div className={isBento ? 'mt-3' : ''}>
        <h3 className={cn(
          'font-display font-semibold text-neutral-900 group-hover:text-primary-600',
          isBento && isSmall && 'text-sm'
        )}>
          {title}
        </h3>
        {(!isBento || !isSmall) && (
          <p className={cn(
            'text-neutral-600',
            isBento ? 'mt-1 line-clamp-1 text-sm' : 'mt-1 text-sm'
          )}>
            {description}
          </p>
        )}
      </div>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={cardClasses}>
      {content}
    </Link>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd /mnt/c/VelikiBukovec_web && pnpm test --filter=@repo/ui -- quick-link-card`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ui/src/components/quick-link-card.tsx packages/ui/src/components/quick-link-card.test.tsx
git commit -m "feat(ui): add bento variant and size props to QuickLinkCard"
```

---

## Task 4: Create BentoGrid Component

**Files:**
- Create: `packages/ui/src/components/bento-grid.tsx`
- Modify: `packages/ui/src/index.ts`

**Step 1: Create BentoGrid component**

```typescript
// packages/ui/src/components/bento-grid.tsx
import { cn } from '../lib/utils';

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        // Mobile: stack all, last two side by side
        'grid-cols-2',
        // Desktop: bento layout
        'lg:grid-cols-[1fr_1fr_minmax(200px,0.6fr)]',
        'lg:[grid-template-areas:"a_b_e""c_d_f"]',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface BentoGridItemProps {
  children: React.ReactNode;
  area?: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
  className?: string;
}

export function BentoGridItem({ children, area, className }: BentoGridItemProps) {
  return (
    <div
      className={cn(
        // Mobile: first 4 items span full width, last 2 are half
        '[&:nth-child(-n+4)]:col-span-2',
        '[&:nth-child(n+5)]:col-span-1',
        // Desktop: use grid areas
        area && `lg:[grid-area:${area}]`,
        className
      )}
      style={area ? { gridArea: area } : undefined}
    >
      {children}
    </div>
  );
}
```

**Step 2: Export from index.ts**

Add to `packages/ui/src/index.ts`:
```typescript
export * from './components/bento-grid';
```

**Step 3: Commit**

```bash
git add packages/ui/src/components/bento-grid.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add BentoGrid layout component"
```

---

## Task 5: Create ExperienceCard Component

**Files:**
- Create: `packages/ui/src/components/experience-card.tsx`
- Create: `packages/ui/src/components/experience-card.test.tsx`
- Modify: `packages/ui/src/index.ts`

**Step 1: Write the test file**

```typescript
// packages/ui/src/components/experience-card.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ExperienceCard } from './experience-card';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

describe('ExperienceCard', () => {
  const defaultProps = {
    title: 'Test Title',
    description: 'Test description',
    image: '/test.jpg',
    imageAlt: 'Test alt',
    href: '/test',
  };

  it('renders title and description', () => {
    render(<ExperienceCard {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders image with alt text', () => {
    render(<ExperienceCard {...defaultProps} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Test alt');
  });

  it('links to href', () => {
    render(<ExperienceCard {...defaultProps} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /mnt/c/VelikiBukovec_web && pnpm test --filter=@repo/ui -- experience-card`
Expected: FAIL

**Step 3: Create the component**

```typescript
// packages/ui/src/components/experience-card.tsx
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '../lib/utils';

export interface ExperienceCardProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  className?: string;
}

export function ExperienceCard({
  title,
  description,
  image,
  imageAlt,
  href,
  className,
}: ExperienceCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all',
        'hover:-translate-y-1 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
            {title}
          </h3>
          <ArrowRight
            className="mt-1 h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-600"
            aria-hidden="true"
          />
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
          {description}
        </p>
      </div>
    </Link>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd /mnt/c/VelikiBukovec_web && pnpm test --filter=@repo/ui -- experience-card`
Expected: PASS

**Step 5: Export from index.ts**

Add to `packages/ui/src/index.ts`:
```typescript
export * from './components/experience-card';
```

**Step 6: Commit**

```bash
git add packages/ui/src/components/experience-card.tsx packages/ui/src/components/experience-card.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add ExperienceCard component for editorial sections"
```

---

## Task 6: Create NewsletterSection Component

**Files:**
- Create: `packages/ui/src/components/newsletter-section.tsx`
- Modify: `packages/ui/src/index.ts`

**Step 1: Create the component**

```typescript
// packages/ui/src/components/newsletter-section.tsx
'use client';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';

import { useState } from 'react';

export interface NewsletterSectionProps {
  onSubmit?: (email: string) => Promise<void>;
  className?: string;
}

export function NewsletterSection({ onSubmit, className }: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    if (!onSubmit) {
      setStatus('success');
      setMessage('Hvala na prijavi! Uskoro ćemo vas kontaktirati.');
      setEmail('');
      return;
    }

    setStatus('loading');
    try {
      await onSubmit(email);
      setStatus('success');
      setMessage('Hvala na prijavi! Provjerite svoj email za potvrdu.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Došlo je do greške. Molimo pokušajte ponovno.');
    }
  }

  return (
    <section className={cn('bg-primary-700 py-16', className)}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-2xl font-semibold text-white">
            Ostanite informirani
          </h2>
          <p className="mt-2 text-primary-100">
            Primajte tjedni pregled najvažnijih vijesti, događanja i dokumenata izravno na email.
          </p>

          {status === 'success' ? (
            <p className="mt-6 font-medium text-white" role="status">
              {message}
            </p>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="mt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email adresa
                </label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="Vaša email adresa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === 'loading'}
                  className="flex-1 bg-white"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={status === 'loading'}
                  className="bg-white text-primary-700 hover:bg-primary-50"
                >
                  {status === 'loading' ? 'Šaljem...' : 'Prijava'}
                </Button>
              </div>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-3 text-sm text-red-200" role="alert">
              {message}
            </p>
          )}

          <p className="mt-4 text-sm text-primary-200">
            Bez spama. Odjava u svakom trenutku.
          </p>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Export from index.ts**

Add to `packages/ui/src/index.ts`:
```typescript
export * from './components/newsletter-section';
```

**Step 3: Commit**

```bash
git add packages/ui/src/components/newsletter-section.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add NewsletterSection component with standalone layout"
```

---

## Task 7: Update Quick Links Data

**Files:**
- Modify: `apps/web/lib/quick-links.ts`

**Step 1: Update quick-links.ts with priority order**

```typescript
// apps/web/lib/quick-links.ts
import {
  AlertTriangle,
  CalendarDays,
  FileSearch,
  FileText,
  Trash2,
  Users,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  size: 'large' | 'small';
}

// Ordered by priority for bento grid layout
export const quickLinks: QuickLink[] = [
  {
    title: 'Prijava problema',
    description: 'Prijavite komunalni problem',
    href: '/prijava-problema',
    icon: AlertTriangle,
    size: 'large',
  },
  {
    title: 'Odvoz otpada',
    description: 'Raspored odvoza otpada',
    href: '/odvoz-otpada',
    icon: Trash2,
    size: 'large',
  },
  {
    title: 'Dokumenti',
    description: 'Službeni dokumenti i obrasci',
    href: '/dokumenti',
    icon: FileSearch,
    size: 'large',
  },
  {
    title: 'Događanja',
    description: 'Kalendar događanja',
    href: '/dogadanja',
    icon: CalendarDays,
    size: 'large',
  },
  {
    title: 'Natječaji',
    description: 'Aktivni natječaji',
    href: '/natjecaji',
    icon: FileText,
    size: 'small',
  },
  {
    title: 'Udruge',
    description: 'Udruge u općini',
    href: '/rad-uprave/udruge',
    icon: Users,
    size: 'small',
  },
];
```

**Step 2: Commit**

```bash
git add apps/web/lib/quick-links.ts
git commit -m "feat(landing): update quick-links with size priority for bento grid"
```

---

## Task 8: Restructure Homepage

**Files:**
- Modify: `apps/web/app/page.tsx`

**Step 1: Rewrite page.tsx with new structure**

```typescript
// apps/web/app/page.tsx
import {
  eventsRepository,
  postsRepository,
  type Event,
  type PostWithAuthor,
} from '@repo/database';
import { createOrganizationJsonLd, getPublicEnv } from '@repo/shared';
import {
  BentoGrid,
  BentoGridItem,
  EventCard,
  ExperienceCard,
  FadeIn,
  NewsletterSection,
  PlaceHero,
  PostCard,
  QuickLinkCard,
  SectionHeader,
} from '@repo/ui';
import { BarChart3, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { siteConfig } from './metadata';
import { experienceItems } from '../lib/experience-items';
import { heroConfig } from '../lib/hero-config';
import { quickLinks } from '../lib/quick-links';
import { transparencyConfig } from '../lib/transparency-config';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

async function getHomepageData() {
  const [latestPosts, upcomingEvents] = await Promise.all([
    postsRepository.getLatestPosts(4),
    eventsRepository.getUpcomingEvents(3),
  ]);

  return { latestPosts, upcomingEvents };
}

export default async function HomePage() {
  const { latestPosts, upcomingEvents } = await getHomepageData();
  const organizationStructuredData = createOrganizationJsonLd({
    name: siteConfig.name,
    url: NEXT_PUBLIC_SITE_URL,
    logo: siteConfig.logo,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.contactPoint.telephone,
      email: siteConfig.contactPoint.email,
      contactType: siteConfig.contactPoint.contactType,
    },
  });

  const gridAreas = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(organizationStructuredData)}</script>

      {/* Hero Section */}
      <PlaceHero
        imageSrc={heroConfig.imageSrc}
        videoSrc={heroConfig.videoSrc}
        videoSrcFallback={heroConfig.videoSrcFallback}
        headline={heroConfig.headline}
        subline={heroConfig.subline}
        primaryCta={heroConfig.primaryCta}
        secondaryCta={heroConfig.secondaryCta}
        trustLine={heroConfig.trustLine}
      />

      {/* Bento Quick Links */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <SectionHeader
              title="Brze poveznice"
              description="Pristupite najčešće korištenim uslugama"
            />
          </FadeIn>
          <BentoGrid className="mt-6">
            {quickLinks.map((link, index) => (
              <BentoGridItem key={link.href} area={gridAreas[index]}>
                <FadeIn delay={index * 0.05}>
                  <QuickLinkCard
                    title={link.title}
                    description={link.description}
                    href={link.href}
                    icon={link.icon}
                    variant="bento"
                    size={link.size}
                    className="h-full"
                  />
                </FadeIn>
              </BentoGridItem>
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* News + Events Strip */}
      <section className="bg-neutral-100 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,380px)]">
            {/* News Column */}
            <div>
              <FadeIn>
                <SectionHeader
                  title="Najnovije vijesti"
                  linkText="Sve vijesti"
                  linkHref="/vijesti"
                />
              </FadeIn>
              {latestPosts.length > 0 ? (
                <>
                  {/* Desktop: 2x2 grid */}
                  <div className="mt-6 hidden gap-4 sm:grid sm:grid-cols-2">
                    {latestPosts.map((post: PostWithAuthor, index: number) => (
                      <FadeIn key={post.id} delay={index * 0.05}>
                        <PostCard
                          title={post.title}
                          excerpt={post.excerpt}
                          slug={post.slug}
                          category={post.category}
                          featuredImage={post.featuredImage}
                          publishedAt={post.publishedAt}
                          className="h-full"
                        />
                      </FadeIn>
                    ))}
                  </div>
                  {/* Mobile: horizontal scroll */}
                  <div className="relative mt-6 sm:hidden">
                    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {latestPosts.map((post: PostWithAuthor) => (
                        <div
                          key={post.id}
                          className="w-[85vw] flex-shrink-0 snap-start"
                        >
                          <PostCard
                            title={post.title}
                            excerpt={post.excerpt}
                            slug={post.slug}
                            category={post.category}
                            featuredImage={post.featuredImage}
                            publishedAt={post.publishedAt}
                          />
                        </div>
                      ))}
                    </div>
                    {/* Fade hint */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-neutral-100" />
                  </div>
                </>
              ) : (
                <FadeIn>
                  <p className="mt-6 text-neutral-600">
                    Trenutno nema objavljenih vijesti.{' '}
                    <Link href="/vijesti" className="text-primary-600 hover:underline">
                      Pogledajte arhivu
                    </Link>
                  </p>
                </FadeIn>
              )}
            </div>

            {/* Events Column */}
            <div>
              <FadeIn>
                <SectionHeader
                  title="Nadolazeća događanja"
                  linkText="Kalendar"
                  linkHref="/dogadanja"
                />
              </FadeIn>
              {upcomingEvents.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {upcomingEvents.map((event: Event, index: number) => (
                    <FadeIn key={event.id} delay={index * 0.05} direction="left">
                      <EventCard
                        id={event.id}
                        title={event.title}
                        description={event.description}
                        eventDate={event.eventDate}
                        eventTime={event.eventTime}
                        location={event.location}
                        posterImage={event.posterImage}
                      />
                    </FadeIn>
                  ))}
                </div>
              ) : (
                <FadeIn>
                  <p className="mt-6 text-neutral-600">
                    Nema nadolazećih događanja.{' '}
                    <Link href="/dogadanja" className="text-primary-600 hover:underline">
                      Pogledajte kalendar
                    </Link>
                  </p>
                </FadeIn>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Doživi Općinu */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <SectionHeader
              title="Doživi općinu"
              description="Otkrijte ljepote i tradiciju Velikog Bukovca"
            />
          </FadeIn>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experienceItems.map((item, index) => (
              <FadeIn key={item.id} delay={index * 0.1}>
                <ExperienceCard
                  title={item.title}
                  description={item.description}
                  image={item.image}
                  imageAlt={item.imageAlt}
                  href={item.href}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="bg-neutral-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white/70 p-8 text-center backdrop-blur md:p-12">
              <BarChart3 className="mx-auto h-10 w-10 text-primary-600" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl font-semibold text-neutral-900">
                {transparencyConfig.headline}
              </h2>
              <p className="mt-3 text-neutral-600">
                {transparencyConfig.description}
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <a
                  href={transparencyConfig.mobesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {transparencyConfig.mobesLabel}
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href={transparencyConfig.documentsUrl}
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {transparencyConfig.documentsLabel}
                </Link>
              </div>
              <p className="mt-4 text-sm text-neutral-500">
                {transparencyConfig.helperText}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />
    </>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/app/page.tsx
git commit -m "feat(landing): restructure homepage with new section layout"
```

---

## Task 9: Create Stub Pages for Doživi Općinu

**Files:**
- Create: `apps/web/app/dozivi-opcinu/layout.tsx`
- Create: `apps/web/app/dozivi-opcinu/znamenitosti/page.tsx`
- Create: `apps/web/app/dozivi-opcinu/priroda/page.tsx`
- Create: `apps/web/app/dozivi-opcinu/kultura/page.tsx`

**Step 1: Create layout**

```typescript
// apps/web/app/dozivi-opcinu/layout.tsx
export default function DoziviOpcinuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

**Step 2: Create znamenitosti page**

```typescript
// apps/web/app/dozivi-opcinu/znamenitosti/page.tsx
import { FadeIn, SectionHeader } from '@repo/ui';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Znamenitosti | Doživi općinu | Općina Veliki Bukovec',
  description: 'Otkrijte povijesne znamenitosti Velikog Bukovca - crkvu sv. Lovre, dvorac Drašković i druge kulturne dragocjenosti.',
};

export default function ZnamenitostiPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <Image
          src="/images/experience/znamenitosti.jpg"
          alt="Crkva sv. Lovre u Velikom Bukovcu"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 to-transparent" />
        <div className="container relative mx-auto flex h-full items-end px-4 pb-8">
          <FadeIn>
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
              Znamenitosti
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="prose prose-neutral mx-auto max-w-3xl">
            <FadeIn>
              <p className="lead">
                Veliki Bukovec bogat je kulturnom i povijesnom baštinom koja svjedoči
                o dugoj tradiciji ovoga kraja.
              </p>

              <h2>Crkva sv. Lovre</h2>
              <p>
                Župna crkva sv. Lovre dominantna je građevina u središtu mjesta.
                Izgrađena u baroknom stilu, crkva predstavlja važno kulturno i
                duhovno središte zajednice.
              </p>

              <h2>Dvorac Drašković</h2>
              <p>
                Povijesni dvorac obitelji Drašković svjedoči o bogatoj aristokratskoj
                prošlosti ovoga kraja. Dvorac i okolni park čine važan dio kulturne
                baštine općine.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
```

**Step 3: Create priroda page**

```typescript
// apps/web/app/dozivi-opcinu/priroda/page.tsx
import { FadeIn } from '@repo/ui';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Priroda | Doživi općinu | Općina Veliki Bukovec',
  description: 'Istražite prirodne ljepote Velikog Bukovca - rijeke Mura i Drava, Natura 2000 područja i očuvane ekosustave.',
};

export default function PrirodaPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <Image
          src="/images/experience/priroda.jpg"
          alt="Rijeka Drava u blizini Velikog Bukovca"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 to-transparent" />
        <div className="container relative mx-auto flex h-full items-end px-4 pb-8">
          <FadeIn>
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
              Priroda
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="prose prose-neutral mx-auto max-w-3xl">
            <FadeIn>
              <p className="lead">
                Općina Veliki Bukovec smještena je u iznimno vrijednom prirodnom
                okruženju, na području međurječja Mure i Drave.
              </p>

              <h2>Rijeke Mura i Drava</h2>
              <p>
                Područje općine obilježavaju dvije velike rijeke - Mura i Drava.
                Ove rijeke stvaraju jedinstvene poplavne šume i močvarna staništa
                bogata biodiverzitetom.
              </p>

              <h2>Natura 2000</h2>
              <p>
                Značajan dio područja općine uključen je u europsku ekološku mrežu
                Natura 2000, što svjedoči o iznimnoj vrijednosti ovdašnjih prirodnih
                staništa i vrsta.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
```

**Step 4: Create kultura page**

```typescript
// apps/web/app/dozivi-opcinu/kultura/page.tsx
import { FadeIn } from '@repo/ui';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kultura i tradicija | Doživi općinu | Općina Veliki Bukovec',
  description: 'Upoznajte kulturu i tradiciju Velikog Bukovca - lokalne običaje, manifestacije i bogato folklorno nasljeđe.',
};

export default function KulturaPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <Image
          src="/images/experience/kultura.jpg"
          alt="Tradicijska manifestacija u Velikom Bukovcu"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 to-transparent" />
        <div className="container relative mx-auto flex h-full items-end px-4 pb-8">
          <FadeIn>
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
              Kultura i tradicija
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="prose prose-neutral mx-auto max-w-3xl">
            <FadeIn>
              <p className="lead">
                Veliki Bukovec njeguje bogatu kulturnu tradiciju koja se prenosi
                s generacije na generaciju.
              </p>

              <h2>Folklor i običaji</h2>
              <p>
                Lokalna folklorna društva čuvaju tradicijske nošnje, pjesme i
                plesove ovoga kraja. Međimurski folklor prepoznatljiv je po
                živopisnim nošnjama i karakterističnim melodijama.
              </p>

              <h2>Manifestacije</h2>
              <p>
                Tijekom godine održavaju se brojne kulturne manifestacije koje
                okupljaju mještane i posjetitelje. Od tradicionalnih sajmova do
                suvremenih kulturnih događanja.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
```

**Step 5: Commit**

```bash
git add apps/web/app/dozivi-opcinu/
git commit -m "feat(landing): add stub pages for Doživi općinu section"
```

---

## Task 10: Add Placeholder Images

**Files:**
- Create: `apps/web/public/images/hero/.gitkeep`
- Create: `apps/web/public/images/experience/.gitkeep`
- Create: `apps/web/public/videos/hero/.gitkeep`

**Step 1: Create directories and placeholder files**

```bash
mkdir -p apps/web/public/images/hero
mkdir -p apps/web/public/images/experience
mkdir -p apps/web/public/videos/hero
touch apps/web/public/images/hero/.gitkeep
touch apps/web/public/images/experience/.gitkeep
touch apps/web/public/videos/hero/.gitkeep
```

**Step 2: Create a README for media requirements**

```markdown
<!-- apps/web/public/images/README.md -->
# Media Assets

## Required Images

### Hero
- `hero/veliki-bukovec-hero.jpg` - Main hero image (1920x1080 minimum, landscape)

### Experience Section
- `experience/znamenitosti.jpg` - Landmarks (800x600 minimum, 4:3 aspect)
- `experience/priroda.jpg` - Nature (800x600 minimum, 4:3 aspect)
- `experience/kultura.jpg` - Culture (800x600 minimum, 4:3 aspect)

## Required Videos

### Hero
- `videos/hero/veliki-bukovec-drone.webm` - HQ WebM (1920x1080, 6-8s loop, <3MB)
- `videos/hero/veliki-bukovec-drone.mp4` - LQ MP4 fallback (1280x720, 6-8s loop, <2MB)

## Optimization Guidelines

- Images: Use WebP where possible, JPEG for photos
- Videos: Compress with HandBrake or FFmpeg
- All media should be optimized for web delivery
```

**Step 3: Commit**

```bash
git add apps/web/public/images/ apps/web/public/videos/
git commit -m "chore: add placeholder directories and media requirements README"
```

---

## Task 11: Add scrollbar-hide Utility

**Files:**
- Modify: `apps/web/app/globals.css`

**Step 1: Add scrollbar-hide utility class**

Add to `apps/web/app/globals.css`:

```css
/* Utility: hide scrollbar but allow scrolling */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

**Step 2: Commit**

```bash
git add apps/web/app/globals.css
git commit -m "feat(css): add scrollbar-hide utility for horizontal scroll sections"
```

---

## Task 12: Final Testing and Type Check

**Step 1: Run type check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm type-check
```
Expected: PASS with no errors

**Step 2: Run tests**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm test
```
Expected: All tests pass

**Step 3: Run build**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm build
```
Expected: Build succeeds

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve any type or build issues"
```

---

## Acceptance Checklist

- [ ] Static export builds successfully
- [ ] Hero shows image instantly, video enhances on fast connections
- [ ] Reduced motion disables all animations
- [ ] Bento grid displays correctly on mobile and desktop
- [ ] News scroll has fade hint on mobile
- [ ] All links work (Maps, contact, MOBES, documents)
- [ ] Keyboard navigation works with visible focus rings
- [ ] No TypeScript errors
- [ ] All tests pass
