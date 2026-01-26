# Landing Page Redesign - Veliki Bukovec

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the homepage feel like a modern, premium municipal "digital town square" while keeping it fast, accessible, and static-export safe.

**Architecture:** Image-first hero with progressive video enhancement, bento-style quick links grid, two-column news/events strip, editorial "experience" section, and trust-building transparency block.

**Tech Stack:** Next.js 16, React Server Components, existing UI component library, Tailwind CSS, static export compatible.

---

## Non-Goals

- No new backend features
- No custom dashboards
- No dynamic personalization that can break static export

---

## Page Structure

### 1. Header

Existing header remains. Minor tweak only:
- Make `SearchTrigger` more visually prominent (still calm, not shouty)

### 2. Hero — `PlaceHero`

**Purpose:** Emotional "wow" plus immediate utility.

**Behavior:**
- Poster image renders immediately
- After `img.decode()` and `requestIdleCallback`, enhance to video only if:
  - `prefers-reduced-motion` is not set
  - `connection.effectiveType` is not slow (2g/3g)
  - `navigator.connection?.saveData` is not enabled
- Video fades in via CSS opacity only (no layout shift)
- Video has `pointer-events: none` and `aria-hidden="true"`
- Reduced motion = no hero entrance animations at all

**Media:**
- HQ WebM for fast connections (4g)
- LQ MP4 fallback
- Optional `videoPosterSrc` supported
- 6-8 second loop, muted, `playsInline`

**Layout:**
- Bottom-up gradient overlay for legibility (no full darkening)
- Headline, subline, two CTAs
- Trust line at bottom: address links to Google Maps, hours link to `/kontakt`

**Props:**
```typescript
interface PlaceHeroProps {
  imageSrc: string;
  videoSrc?: string;
  videoPosterSrc?: string;
  priority?: boolean;
  headline?: string;
  subline?: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  trustLine?: string;
}
```

**Config:** `lib/hero-config.ts` holds paths and copy (not hardcoded in JSX).

---

### 3. Bento Quick Links

**Purpose:** Instant task access, premium layout.

**Layout:**
- Desktop: CSS Grid with `grid-template-areas`, 4 large tiles + 2 small stacked tiles
- Mobile: Stack the 4 essentials first, then 2 small side by side

```
Desktop:
┌─────────────────┬─────────────────┬──────────┐
│  Prijava        │  Odvoz          │ Natječaji│
│  problema       │  otpada         │  (small) │
│  (large)        │  (large)        ├──────────┤
├─────────────────┼─────────────────┤ Udruge   │
│  Dokumenti      │  Događanja      │  (small) │
│  (large)        │  (large)        │          │
└─────────────────┴─────────────────┴──────────┘
```

**Card Rules:**
- Large: icon + title + `line-clamp-1` description
- Small: icon + title only
- Equal height large tiles (consistent visuals)
- Hover: `border-neutral-300` + subtle lift (`translate-y-[-2px]`) + shadow
- Focus: `focus-visible:ring-2 ring-primary-500`

**Implementation:**
- Reuse `QuickLinkCard` with `variant: 'bento' | 'standard'`
- Same data from `quick-links.ts`, ordered by priority

---

### 4. News + Events Strip

**Purpose:** Make the site feel alive without clutter.

**Layout:**
- Desktop: 60/40 split, events column `minmax(320px, 380px)`
- News: 2x2 `PostCard` grid, equal heights, consistent image aspect ratio
- Events: 3 compact `EventCard`s with date as strongest visual anchor
- Background: `bg-neutral-100`

**Mobile:**
- News: horizontal scroll snap, ~85vw card width, right-edge fade hint
- Events: vertical stack
- Section header link drops below title

**Data:**
- `postsRepository.getLatestPosts(4)` — exists
- `eventsRepository.getUpcomingEvents(3)` — exists

**Empty States:**
- News: message + link to `/vijesti`
- Events: message + link to `/dogadanja`

---

### 5. Doživi Općinu

**Purpose:** Shareable editorial layer, place identity.

**Data:** Static file `lib/experience-items.ts`
```typescript
interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
}
```

**Items:**
1. Znamenitosti — `/dozivi-opcinu/znamenitosti`
2. Priroda — `/dozivi-opcinu/priroda`
3. Kultura i tradicija — `/dozivi-opcinu/kultura`

**Component:** New `ExperienceCard`
- Image (4:3), title, description, subtle corner "→"
- Full card clickable
- Hover: image scale 1.02 + gentle card lift
- Next/Image with `fill`, `sizes`, `placeholder="blur"`

**Mobile:** Vertical stack for 3 items (no scroll snap needed).

**Placeholder Pages:** Simple hero + short intro + gallery stub.

---

### 6. Transparentnost

**Purpose:** Credibility signal, zero maintenance trap.

**Design:**
- Section: `bg-neutral-50`
- Card: `rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur`
- Icon: decorative, `aria-hidden="true"`
- Headline: display font, municipal tone

**Copy:**
```
Proračun i transparentnost

Transparentno upravljamo javnim sredstvima. Na jednom mjestu
možete pregledati proračun, izvješća i povezane dokumente.
```

**Actions:**
- Primary: "Proračun na MOBES-u" → external, new tab, `rel="noopener noreferrer"`, `ExternalLink` icon
- Secondary outline: "Dokumenti" → `/dokumenti?kategorija=proracun`

**Helper line:** "MOBES se otvara u novoj kartici."

**Config:** MOBES URL in `lib/transparency-config.ts`, not hardcoded.

---

### 7. Newsletter

**Purpose:** Optional commitment, calm, official.

**Design:**
- Background: `bg-primary-700`
- Headline: "Ostanite informirani"
- Body: "Primajte tjedni pregled najvažnijih vijesti, događanja i dokumenata izravno na email."
- Form: inline on desktop, stacked on mobile
- Input: white background, visible focus ring
- Trust line: "Bez spama. Odjava u svakom trenutku."

**Implementation:**
- Keep `NewsletterSignup` as form logic
- New `NewsletterSection` wrapper handles layout and copy

---

### 8. Footer

No changes. Existing footer works.

---

## Component & File Changes

### New Components
1. `PlaceHero` — packages/ui/src/components/place-hero.tsx
2. `ExperienceCard` — packages/ui/src/components/experience-card.tsx
3. `NewsletterSection` — packages/ui/src/components/newsletter-section.tsx

### Modified Components
1. `QuickLinkCard` — add `variant: 'bento' | 'standard'`, bento styling
2. `NewsletterSignup` — variant support if needed for styling

### New Data/Config Files
1. `apps/web/lib/experience-items.ts`
2. `apps/web/lib/hero-config.ts`
3. `apps/web/lib/transparency-config.ts`

### Modified Pages
- `apps/web/app/page.tsx` — complete restructure

### New Pages (stubs)
- `apps/web/app/dozivi-opcinu/znamenitosti/page.tsx`
- `apps/web/app/dozivi-opcinu/priroda/page.tsx`
- `apps/web/app/dozivi-opcinu/kultura/page.tsx`

---

## Acceptance Checklist

- [ ] Static export builds with no runtime data dependencies in server components
- [ ] Hero shows image instantly, video enhancement is optional and never blocks interaction
- [ ] Reduced motion produces calm, instant render (no stagger, no animations)
- [ ] Keyboard navigation is clean, focus rings visible on all tiles and buttons
- [ ] Mobile experience is smooth: bento stacks correctly, news swipe hint works
- [ ] Lighthouse stays excellent: hero media optimized, no layout shift
- [ ] All links work: Maps, contact, MOBES, document filters
- [ ] Empty states have helpful links, not dead ends

---

## Implementation Order

1. `PlaceHero` component + `hero-config.ts`
2. Bento layout (`QuickLinkCard` variant)
3. Restructure `page.tsx` with hero + bento
4. News + Events strip layout
5. `ExperienceCard` + `experience-items.ts` + stub pages
6. Transparentnost section + `transparency-config.ts`
7. `NewsletterSection` wrapper
8. Final polish and testing
