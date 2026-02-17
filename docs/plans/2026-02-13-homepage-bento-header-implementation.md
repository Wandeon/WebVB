# Homepage Bento Grid + Header Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the homepage bento grid, smart dashboard, and header to show live waste pickup schedules, active tenders, enhanced weather, gallery previews, and Viber/WhatsApp social links.

**Architecture:** Server-side data fetching in `page.tsx` via repository methods, passed as props to client components. No new API routes — all data comes from existing DB. Weather enhancement uses Open-Meteo's free daily forecast endpoint. Social icons are inline SVGs with placeholder URLs.

**Tech Stack:** Next.js 16, Prisma (PostgreSQL), Tailwind CSS v4, Framer Motion, Open-Meteo API, lucide-react

**Design doc:** `docs/plans/2026-02-13-homepage-bento-header-redesign.md`

---

### Task 1: Database — `getNextWasteEvents()` repository method

**Files:**
- Modify: `packages/database/src/repositories/events.ts` (add method after line ~310)

**Step 1: Add the repository method**

Add after the existing `getWasteEventsForDate` method (~line 311):

```typescript
  /**
   * Get next upcoming waste collection events (for homepage card)
   * Returns up to `limit` events starting from today
   */
  async getNextWasteEvents(limit: number = 2): Promise<Event[]> {
    const today = getZagrebStartOfDay();
    const safeLimit = clampLimit(limit, 5);

    return db.event.findMany({
      where: {
        eventDate: { gte: today },
        title: { startsWith: 'Odvoz otpada:', mode: 'insensitive' },
      },
      orderBy: { eventDate: 'asc' },
      take: safeLimit,
    });
  },
```

**Step 2: Run type-check**

Run: `pnpm type-check --filter=@repo/database`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/database/src/repositories/events.ts
git commit -m "feat(database): add getNextWasteEvents repository method"
```

---

### Task 2: Database — `getActiveTenderSummary()` repository method

**Files:**
- Modify: `packages/database/src/repositories/announcements.ts` (add method after `getLatestActive`, ~line 453)

**Step 1: Add the repository method**

Add after `getLatestActive` method:

```typescript
  /**
   * Get summary of active tenders for homepage card
   * Returns count and latest title of published natječaj announcements
   */
  async getActiveTenderSummary(): Promise<{ count: number; latestTitle: string | null }> {
    const now = new Date();
    const where: Prisma.AnnouncementWhereInput = {
      category: 'natjecaj',
      publishedAt: { not: null },
      OR: [
        { validUntil: null },
        { validUntil: { gte: now } },
      ],
    };

    const [count, latest] = await Promise.all([
      db.announcement.count({ where }),
      db.announcement.findFirst({
        where,
        orderBy: { publishedAt: 'desc' },
        select: { title: true },
      }),
    ]);

    return { count, latestTitle: latest?.title ?? null };
  },
```

**Step 2: Export the return type**

Add near the top types section of the file:

```typescript
export interface TenderSummary {
  count: number;
  latestTitle: string | null;
}
```

Then change the return type to `Promise<TenderSummary>`.

**Step 3: Run type-check**

Run: `pnpm type-check --filter=@repo/database`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/database/src/repositories/announcements.ts
git commit -m "feat(database): add getActiveTenderSummary repository method"
```

---

### Task 3: Quick links — reorder and update content

**Files:**
- Modify: `apps/web/lib/quick-links.ts` (full rewrite of the array)

**Step 1: Update the quick links array**

Replace the `quickLinks` array (lines 36-89) with:

```typescript
export const quickLinks: QuickLink[] = [
  {
    // Area 'a' - Large featured (2x2)
    title: 'Odvoz otpada',
    description: 'Raspored odvoza komunalnog otpada i upute za razvrstavanje. Provjerite sljedeći termin odvoza.',
    href: '/odvoz-otpada',
    icon: 'trash2',
    color: 'green',
    size: 'large',
  },
  {
    // Area 'b' - Wide (2x1)
    title: 'Prijava problema',
    description: 'Prijavite komunalne probleme',
    href: '/prijava-problema',
    icon: 'alertTriangle',
    color: 'green',
    size: 'small',
  },
  {
    // Area 'c' - Small (1x1)
    title: 'Dokumenti',
    description: 'Službeni dokumenti i obrasci',
    href: '/dokumenti',
    icon: 'fileSearch',
    color: 'slate',
    size: 'small',
  },
  {
    // Area 'd' - Small (1x1)
    title: 'Događanja',
    description: 'Kalendar događanja',
    href: '/dogadanja',
    icon: 'calendarDays',
    color: 'rose',
    size: 'small',
  },
  {
    // Area 'e' - Wide (2x1)
    title: 'Natječaji',
    description: 'Aktivni natječaji i javni pozivi',
    href: '/obavijesti?category=natjecaj',
    icon: 'fileText',
    color: 'gold',
    size: 'small',
  },
  {
    // Area 'f' - Wide (2x1)
    title: 'Virtualni asistent',
    description: 'Postavite pitanje o općini',
    href: '/asistent',
    icon: 'messageSquare',
    color: 'slate',
    size: 'small',
  },
];
```

**Step 2: Commit**

```bash
git add apps/web/lib/quick-links.ts
git commit -m "feat(web): reorder bento grid items per redesign"
```

---

### Task 4: QuickLinkCard — add `messageSquare` icon + dynamic content slot

**Files:**
- Modify: `packages/ui/src/components/quick-link-card.tsx`

**Step 1: Add MessageSquare import and icon mapping**

Add `MessageSquare` to the lucide-react import (line 3), and add to `iconMap` (line 25):

```typescript
import { AlertTriangle, CalendarDays, FileSearch, FileText, MessageSquare, Trash2, Users } from 'lucide-react';
```

```typescript
const iconMap: Record<string, LucideIcon> = {
  alertTriangle: AlertTriangle,
  calendarDays: CalendarDays,
  fileSearch: FileSearch,
  fileText: FileText,
  messageSquare: MessageSquare,
  trash2: Trash2,
  users: Users,
};
```

**Step 2: Add optional `children` prop for dynamic content overlay**

Add `children?: React.ReactNode` to `QuickLinkCardProps`:

```typescript
export interface QuickLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: QuickLinkIconName | LucideIcon;
  variant?: 'standard' | 'bento';
  color?: QuickLinkColorVariant;
  size?: 'small' | 'large';
  className?: string;
  /** Optional dynamic content rendered below description in bento variant */
  children?: React.ReactNode;
}
```

In the bento variant JSX, render `{children}` after the description paragraph (before the CTA). Find the description `<p>` in the bento large variant and add after it:

```tsx
{children && <div className="mt-3">{children}</div>}
```

Do the same for the bento small variant.

**Step 3: Update the QuickLinkIconName type export**

The type is derived from `iconMap` keys, so it auto-updates. Verify it includes `messageSquare`.

**Step 4: Run type-check**

Run: `pnpm type-check --filter=@repo/ui`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ui/src/components/quick-link-card.tsx
git commit -m "feat(ui): add messageSquare icon and children prop to QuickLinkCard"
```

---

### Task 5: Homepage — fetch waste + tender data, render dynamic bento cards

**Files:**
- Modify: `apps/web/app/page.tsx`

**Step 1: Add imports**

Add to the database imports (line 1-12):

```typescript
import { type TenderSummary } from '@repo/database';
```

Make sure `eventsRepository` and `announcementsRepository` are already imported (they are).

**Step 2: Add queries to `getHomepageData()`**

Add two new queries to the `Promise.all` in `getHomepageData()` (after line 60):

```typescript
async function getHomepageData() {
  if (shouldSkipDatabase()) {
    return {
      latestPosts: [] as PostWithAuthor[],
      upcomingEvents: [] as Event[],
      latestAnnouncements: [] as AnnouncementWithAuthor[],
      latestDocuments: [] as DocumentWithUploader[],
      featuredGalleries: [] as GalleryWithCount[],
      nextWasteEvents: [] as Event[],
      tenderSummary: { count: 0, latestTitle: null } as TenderSummary,
    };
  }

  const [latestPosts, upcomingEvents, latestAnnouncements, latestDocuments, featuredGalleries, nextWasteEvents, tenderSummary] = await Promise.all([
    postsRepository.getLatestPosts(3),
    eventsRepository.getUpcomingEvents(3),
    announcementsRepository.getLatestActive(4),
    documentsRepository.getLatestDocuments(4),
    galleriesRepository.getFeaturedForHomepage(12),
    eventsRepository.getNextWasteEvents(2),
    announcementsRepository.getActiveTenderSummary(),
  ]);

  return { latestPosts, upcomingEvents, latestAnnouncements, latestDocuments, featuredGalleries, nextWasteEvents, tenderSummary };
}
```

**Step 3: Create waste type helpers (inline in page.tsx or a small util)**

Add a helper function above `HomePage`:

```typescript
const WASTE_TYPE_NAMES: Record<string, string> = {
  'miješani komunalni otpad': 'MKO',
  'biootpad': 'Bio',
  'plastika': 'Plastika',
  'papir i karton': 'Papir',
  'metal': 'Metal',
  'pelene': 'Pelene',
  'staklo': 'Staklo',
};

function extractWasteType(title: string): string {
  const match = title.match(/^Odvoz otpada:\s*(.+)$/i);
  if (!match) return 'Otpad';
  const raw = match[1]!.toLowerCase().trim();
  return WASTE_TYPE_NAMES[raw] ?? raw;
}

function formatWastePickup(events: Event[]): string | null {
  if (events.length === 0) return null;
  const first = events[0]!;
  const date = new Date(first.eventDate);
  const dayName = date.toLocaleDateString('hr-HR', { weekday: 'short' });
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const typeName = extractWasteType(first.title);

  // Check if multiple events on same day
  const sameDay = events.filter(e => {
    const d = new Date(e.eventDate);
    return d.toDateString() === date.toDateString();
  });

  if (sameDay.length > 1) {
    return `${typeName} + ${sameDay.length - 1} više • ${dayName}, ${day}.${month}.`;
  }
  return `${typeName} • ${dayName}, ${day}.${month}.`;
}
```

**Step 4: Update bento grid rendering to pass dynamic content**

Replace the bento grid section (lines 145-162) with logic that injects children for positions a (waste) and e (tenders):

```tsx
<BentoGrid>
  {quickLinks.slice(0, 6).map((link, index) => {
    const area = gridAreas[index] as 'a' | 'b' | 'c' | 'd' | 'e' | 'f';

    // Dynamic content for waste card (position a)
    let dynamicContent: React.ReactNode = null;
    if (area === 'a') {
      const wasteText = formatWastePickup(nextWasteEvents);
      dynamicContent = wasteText ? (
        <p className="text-sm font-semibold text-white/90">
          Sljedeći odvoz: {wasteText}
        </p>
      ) : (
        <p className="text-sm text-white/70">
          Trenutno nema nadolazećih termina u kalendaru.
        </p>
      );
    }

    // Dynamic content for tenders card (position e)
    if (area === 'e') {
      dynamicContent = tenderSummary.count > 0 ? (
        <div className="text-xs text-white/80">
          <span className="font-bold text-white">{tenderSummary.count}</span>{' '}
          {tenderSummary.count === 1 ? 'aktivan natječaj' : 'aktivna natječaja'}
          {tenderSummary.latestTitle && (
            <p className="mt-1 truncate">{tenderSummary.latestTitle}</p>
          )}
        </div>
      ) : null;
    }

    return (
      <BentoGridItem key={link.href} area={area}>
        <FadeIn delay={index * 0.05} className="h-full flex-1">
          <QuickLinkCard
            title={link.title}
            description={link.description}
            href={link.href}
            icon={link.icon}
            variant="bento"
            color={link.color}
            size={link.size}
            className="h-full"
          >
            {dynamicContent}
          </QuickLinkCard>
        </FadeIn>
      </BentoGridItem>
    );
  })}
</BentoGrid>
```

**Step 5: Run type-check**

Run: `pnpm type-check --filter=@repo/web`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/web/app/page.tsx
git commit -m "feat(web): render dynamic waste + tender data in bento grid"
```

---

### Task 6: Smart Dashboard — enhance weather widget

**Files:**
- Modify: `apps/web/components/smart-dashboard.tsx`

**Step 1: Update the weather fetch URL and state shape**

Change the `WeatherWidget` component. Update the state type and API call:

```typescript
interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  todayHigh: number | null;
  todayLow: number | null;
  tomorrowCondition: 'sunny' | 'cloudy' | 'rainy' | null;
  tomorrowHigh: number | null;
  tomorrowLow: number | null;
}

function weatherCodeToCondition(code: number): 'sunny' | 'cloudy' | 'rainy' {
  if (code >= 61 && code <= 67) return 'rainy';
  if ((code >= 1 && code <= 3) || (code >= 45 && code <= 48)) return 'cloudy';
  return 'sunny';
}

function conditionIcon(condition: 'sunny' | 'cloudy' | 'rainy') {
  if (condition === 'rainy') return CloudRain;
  if (condition === 'cloudy') return CloudSun;
  return Sun;
}
```

Update the API URL to include daily forecasts:

```typescript
const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=46.35&longitude=16.75&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=2&timezone=Europe/Zagreb';
```

Parse the response to extract daily data:

```typescript
const dailyMax = data.daily?.temperature_2m_max as number[] | undefined;
const dailyMin = data.daily?.temperature_2m_min as number[] | undefined;
const dailyCodes = data.daily?.weather_code as number[] | undefined;

setWeather({
  temp: Math.round(data.current?.temperature_2m ?? 0),
  condition: weatherCodeToCondition(data.current?.weather_code ?? 0),
  todayHigh: dailyMax?.[0] != null ? Math.round(dailyMax[0]) : null,
  todayLow: dailyMin?.[0] != null ? Math.round(dailyMin[0]) : null,
  tomorrowCondition: dailyCodes?.[1] != null ? weatherCodeToCondition(dailyCodes[1]) : null,
  tomorrowHigh: dailyMax?.[1] != null ? Math.round(dailyMax[1]) : null,
  tomorrowLow: dailyMin?.[1] != null ? Math.round(dailyMin[1]) : null,
});
```

**Step 2: Update weather JSX to show high/low and tomorrow**

After the current temp display, add:

```tsx
{/* Today high/low */}
{weather.todayHigh != null && weather.todayLow != null && (
  <div className="text-xs text-sky-600">
    ↑ {weather.todayHigh}° ↓ {weather.todayLow}°
  </div>
)}

{/* Tomorrow forecast */}
{weather.tomorrowCondition && weather.tomorrowHigh != null && (
  <div className="mt-2 flex items-center gap-2 text-xs text-sky-600">
    <span>Sutra:</span>
    <TomorrowIcon className="h-3.5 w-3.5" />
    <span>↑ {weather.tomorrowHigh}° ↓ {weather.tomorrowLow}°</span>
  </div>
)}

{/* DHMZ link */}
<a
  href="https://meteo.hr/prognoze.php?section=prognoze&param=n_maprog"
  target="_blank"
  rel="noopener noreferrer"
  className="mt-2 inline-flex items-center gap-1 text-xs text-sky-500 hover:text-sky-700"
>
  Detaljna prognoza
  <ExternalLink className="h-3 w-3" />
</a>
```

Where `TomorrowIcon = conditionIcon(weather.tomorrowCondition)`.

**Step 3: Commit**

```bash
git add apps/web/components/smart-dashboard.tsx
git commit -m "feat(web): enhance weather with daily high/low and tomorrow forecast"
```

---

### Task 7: Smart Dashboard — replace AI widget with gallery previews

**Files:**
- Modify: `apps/web/components/smart-dashboard.tsx`
- Modify: `apps/web/app/page.tsx` (pass galleries prop)

**Step 1: Add galleries prop to SmartDashboard**

The `SmartDashboard` component needs to accept galleries. Add a prop:

```typescript
interface SmartDashboardProps {
  galleries?: Array<{ name: string; slug: string; coverImage: string | null; imageCount: number }>;
}

export function SmartDashboard({ galleries }: SmartDashboardProps) {
```

**Step 2: Replace the AI assistant widget section**

Remove the AI assistant `<button>` block (~lines 162-186). Replace with:

```tsx
{/* Latest Galleries */}
{galleries && galleries.length > 0 && (
  <div className="flex-1 rounded-2xl bg-white/60 p-4 backdrop-blur-sm">
    <h3 className="mb-3 text-sm font-semibold text-sky-900">Galerija</h3>
    <div className="space-y-3">
      {galleries.slice(0, 2).map((gallery) => (
        <Link
          key={gallery.slug}
          href={`/galerija/${gallery.slug}`}
          className="group flex items-center gap-3"
        >
          <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-200">
            {gallery.coverImage ? (
              <Image
                src={gallery.coverImage}
                alt={gallery.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-4 w-4 text-neutral-400" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sky-900 group-hover:text-primary-600">
              {gallery.name}
            </p>
            <p className="text-xs text-sky-600">{gallery.imageCount} fotografija</p>
          </div>
        </Link>
      ))}
    </div>
    <Link
      href="/galerija"
      className="mt-3 inline-flex items-center gap-1 text-xs text-sky-500 hover:text-sky-700"
    >
      Sve galerije
      <ArrowRight className="h-3 w-3" />
    </Link>
  </div>
)}
```

Add necessary imports: `Link` from `next/link`, `Image` from `next/image`, `ImageIcon` and `ArrowRight` from `lucide-react`.

**Step 3: Pass gallery data from page.tsx**

In `apps/web/app/page.tsx`, update the `<SmartDashboard />` call to pass galleries:

```tsx
<SmartDashboard
  galleries={featuredGalleries.slice(0, 2).map(g => ({
    name: g.name,
    slug: g.slug,
    coverImage: g.coverImage,
    imageCount: g._count.images,
  }))}
/>
```

**Step 4: Run type-check**

Run: `pnpm type-check --filter=@repo/web`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/components/smart-dashboard.tsx apps/web/app/page.tsx
git commit -m "feat(web): replace AI widget with gallery previews in dashboard"
```

---

### Task 8: Header — add Viber + WhatsApp social links

**Files:**
- Modify: `apps/web/components/layout/header-widgets.tsx` (SocialIcons component, lines 97-124)
- Modify: `apps/web/components/layout/mobile-menu.tsx` (social section, lines 160-217)

**Step 1: Add Viber + WhatsApp to desktop SocialIcons**

In `header-widgets.tsx`, add two more links to the `SocialIcons` component after the Instagram link (line 121):

```tsx
      {/* Viber */}
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-purple-50 hover:text-purple-600"
        aria-label="Pridružite se Viber grupi"
        title="Viber grupa (uskoro)"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.4 0C9.473.028 5.34.396 3.18 2.394.727 4.663.153 8.076.015 12.286c-.138 4.21-.313 12.102 7.478 14.094h.006l-.005 3.22s-.05.78.486 1.167c.647.467 1.03.383 3.348-2.125 2.319-2.508 4.487-5.478 4.487-5.478s4.78.397 6.632-.536c1.85-.933 3.224-3.085 3.497-7.376.283-4.44-.534-9.198-3.504-11.78C19.873.712 15.403.046 11.4 0zm.504 2.2c3.467.04 7.333.63 9.4 2.6 2.424 2.108 3.094 6.287 2.856 10.086-.228 3.59-1.238 5.225-2.584 5.904-1.345.68-5.253.32-5.253.32l-3.08 3.56c-.445.513-.827.43-.827-.22V21c-6.22-1.32-5.99-7.227-5.882-10.567.107-3.34.434-6.19 2.5-8.08 1.33-1.216 3.967-1.95 6.088-2.07-.406-.008-.818-.005-1.218.016zm-.42 3.58c-.16 0-.32.068-.458.21-.32.332-.768.87-.924 1.144-.312.548-.22 1.204.072 1.808.585 1.212 1.346 2.24 2.374 3.27a13.706 13.706 0 003.242 2.48c.602.326 1.31.448 1.848.158.268-.145.816-.584 1.158-.91.342-.325.192-.768-.168-.96-.36-.192-1.67-.908-2.028-1.06-.36-.15-.652-.024-.892.25-.24.274-.706.826-.866.998-.16.172-.42.2-.66.078a8.67 8.67 0 01-2.076-1.292 8.014 8.014 0 01-1.496-1.822c-.138-.24-.012-.446.116-.59.116-.128.276-.336.414-.504.138-.168.24-.288.312-.468.07-.18-.018-.372-.096-.516-.078-.144-.658-1.62-.924-2.234-.132-.306-.378-.37-.578-.38a4.167 4.167 0 00-.368-.02zm3.186 1.004c.186 0 .338.15.348.34.02.384.058 1.038.468 1.7.41.66 1.103.97 1.478 1.012.188.022.356-.13.36-.318.007-.188-.146-.348-.334-.37-.254-.028-.718-.25-.998-.702-.28-.452-.32-.918-.338-1.232a.35.35 0 00-.37-.33.35.35 0 00-.614-.1zm-1.07-.44a.35.35 0 00-.326.37c.04.75.3 1.946 1.08 2.84.78.896 1.946 1.346 2.686 1.498.188.04.37-.082.41-.27a.353.353 0 00-.27-.41c-.61-.126-1.565-.49-2.19-1.208-.625-.72-.854-1.72-.89-2.4a.35.35 0 00-.37-.326zm-1.2-.56a.35.35 0 00-.336.36c.048 1.24.516 2.996 1.62 4.16 1.102 1.164 2.83 1.75 4.066 1.88a.35.35 0 00.376-.32.35.35 0 00-.32-.376c-1.09-.116-2.598-.62-3.534-1.608-.935-.987-1.37-2.544-1.412-3.66a.35.35 0 00-.36-.336z" />
        </svg>
      </a>
      {/* WhatsApp */}
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-green-50 hover:text-green-600"
        aria-label="Pridružite se WhatsApp grupi"
        title="WhatsApp grupa (uskoro)"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
```

**Step 2: Add Viber + WhatsApp to mobile menu**

In `mobile-menu.tsx`, add two more social icons after the Instagram link (after line 217), using the same inline style pattern:

```tsx
              {/* Viber */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#7360f2',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
                aria-label="Viber grupa"
              >
                <svg style={{ width: 18, height: 18 }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.4 0C9.473.028 5.34.396 3.18 2.394..." />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#25d366',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
                aria-label="WhatsApp grupa"
              >
                <svg style={{ width: 18, height: 18 }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149..." />
                </svg>
              </a>
```

Use the full SVG paths from Step 1 above.

**Step 3: Run type-check**

Run: `pnpm type-check --filter=@repo/web`
Expected: PASS

**Step 4: Commit**

```bash
git add apps/web/components/layout/header-widgets.tsx apps/web/components/layout/mobile-menu.tsx
git commit -m "feat(web): add Viber and WhatsApp social links to header"
```

---

### Task 9: Also update header-widgets WeatherBadge to use shared helper

**Files:**
- Modify: `apps/web/components/layout/header-widgets.tsx`

**Step 1: Extract weatherCodeToCondition**

The same `weatherCodeToCondition` function is now used in both `smart-dashboard.tsx` and `header-widgets.tsx`. To stay DRY, either:
- Create a tiny shared utility `apps/web/lib/weather.ts` with the helper
- Or inline it in both places (acceptable for a 5-line function)

If extracting: create `apps/web/lib/weather.ts`:

```typescript
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy';

export function weatherCodeToCondition(code: number): WeatherCondition {
  if (code >= 61 && code <= 67) return 'rainy';
  if ((code >= 1 && code <= 3) || (code >= 45 && code <= 48)) return 'cloudy';
  return 'sunny';
}
```

Then import in both files. This is optional — skip if it feels over-engineered for a 5-line function.

**Step 2: Commit (if extracted)**

```bash
git add apps/web/lib/weather.ts apps/web/components/smart-dashboard.tsx apps/web/components/layout/header-widgets.tsx
git commit -m "refactor(web): extract shared weatherCodeToCondition helper"
```

---

### Task 10: Final build + type-check verification

**Step 1: Full type-check**

Run: `pnpm type-check`
Expected: All 5 packages pass

**Step 2: Build web app**

Run: `pnpm build --filter=@repo/web`
Expected: Static export succeeds with all pages

**Step 3: Commit any remaining fixes**

If type errors or build issues found, fix and commit.

---

## Task dependency order

```
Task 1 (waste repo) ──┐
Task 2 (tender repo) ──┼── Task 3 (quick-links) ── Task 4 (QuickLinkCard) ── Task 5 (page.tsx bento)
                       │
Task 6 (weather) ──────┤
Task 7 (galleries) ────┤
Task 8 (social links) ─┘
Task 9 (optional DRY) ─── Task 10 (build verify)
```

Tasks 1-4 and 6-8 can be parallelized. Task 5 depends on 1-4. Task 10 is last.
