# Navigation & Page Structure Redesign

> Created: 2026-01-31
> Status: ✅ IMPLEMENTED (2026-01-31)

---

## Problem Statement

The current site has several UX issues:

1. **Confusing nested tabs** - `/opcina` has 3 tabs AND child pages with more tabs
2. **Tab bar looks like cheap WP plugin** - Generic, uninspired design
3. **Huge hero photos waste space** - Most of viewport taken by image, content hidden
4. **Tab bar disappears on scroll** - Users lose navigation context
5. **No persistent wayfinding** - Users don't know where they are or what else to explore
6. **Missing pages in nav** - Župa (church) and Škola (school) not accessible
7. **Not impressive** - Looks like basic HTML/CSS, nothing that shows modern capabilities

---

## Design Decisions

### 1. Information Architecture

**From:** Nested tabs within tabs
**To:** Location-based grouping with flat hierarchy

```
/
├── /opcina                    → About municipality (single rich page)
├── /naselja                   → Landing page with village cards
│   ├── /veliki-bukovec        → Village page
│   ├── /dubovica              → Village page
│   └── /kapela                → Village page
├── /zupa                      → Church section
├── /skola                     → School section
├── /udruge                    → Organizations
├── /nacelnik                  → Mayor's page (standalone)
├── /vijece                    → Council page
├── /usluge                    → Services
├── /dokumenti                 → Documents
├── /javna-nabava              → Public procurement
├── /vijesti                   → News (dynamic)
├── /obavijesti                → Announcements (dynamic)
├── /galerija                  → Gallery (dynamic)
├── /dogadanja                 → Events (dynamic)
├── /izbori                    → Elections
└── /kontakt                   → Contact
```

### 2. Main Navigation (Mega Menu)

**Header layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]     [Menu trigger]           [Search] [Kontakt btn] │
└─────────────────────────────────────────────────────────────┘
```

- **Kontakt** is a visible button, not hidden in menu
- Menu trigger opens mega menu overlay

**Mega Menu structure (3 groups + featured):**

| Naš Kraj | Uprava | Aktualno | Featured |
|----------|--------|----------|----------|
| Općina | Načelnik | Vijesti | Latest news card |
| Naselja | Vijeće | Obavijesti | Upcoming event |
| Župa | Usluge | Galerija | |
| Škola | Dokumenti | Dogadanja | |
| Udruge | Javna nabava | Izbori | |

5 items per group, balanced and scannable.

### 3. Page Layout (Desktop)

**Sidebar + Content pattern:**

```
┌──────────────────────────────────────────────────────────────┐
│  Header                                         [Kontakt]    │
├─────────────┬────────────────────────────────────────────────┤
│             │  ┌──────────────────────────────────────────┐  │
│  SECTION    │  │           Small Hero (200-250px)         │  │
│             │  │              Page Title                  │  │
│  ● Current  │  │              Subtitle                    │  │
│    ├─ Sec 1 │  └──────────────────────────────────────────┘  │
│    ├─ Sec 2 │                                                │
│    └─ Sec 3 │  Content area with:                            │
│             │  - Inline images (not background heroes)       │
│  Sibling 1  │  - Rich text                                   │
│  Sibling 2  │  - Cards, grids as needed                      │
│  Sibling 3  │                                                │
│             │                                                │
├─────────────┴────────────────────────────────────────────────┤
│  Footer                                                      │
└──────────────────────────────────────────────────────────────┘
```

**Sidebar specifications:**
- Width: 280px
- Position: Sticky (top: header height + spacing)
- Background: Subtle, matches page theme
- Always visible while scrolling content

### 4. Sidebar Behavior (Accordion Navigation)

The sidebar serves two purposes:
1. **Section navigation** - Shows where you are and siblings
2. **Page TOC** - Shows sections within current page

**Key behavior:** Page sections expand UNDER the current page, pushing siblings down.

**Example - on `/nacelnik`:**
```
UPRAVA
├── ● Načelnik           ← Active page
│      ├─ O načelniku    ← Page sections (animated in)
│      ├─ Program rada
│      ├─ Dokumenti
│      └─ Kontakt
├── Vijeće               ← Pushed down
├── Usluge
├── Dokumenti
└── Javna nabava
```

**Example - navigating to `/vijece`:**
```
UPRAVA
├── Načelnik             ← Collapses (sections slide out)
├── ● Vijeće             ← Now active
│      ├─ Članovi        ← New sections (staggered fade in)
│      ├─ Sjednice
│      └─ Odluke
├── Usluge               ← Pushed down
├── Dokumenti
└── Javna nabava
```

**Nested pages (e.g., Naselja):**

On `/naselja` (landing page):
```
NAŠ KRAJ
├── Općina
├── ● Naselja
│      ├─ Veliki Bukovec    ← Links to subpages
│      ├─ Dubovica
│      └─ Kapela Podravska
├── Župa
├── Škola
└── Udruge
```

On `/naselja/dubovica` (village subpage):
```
NAŠ KRAJ
├── Općina
├── Naselja
│   ├── Veliki Bukovec
│   ├── ● Dubovica          ← Current subpage
│   │      ├─ O selu        ← Page sections
│   │      ├─ Znamenitosti
│   │      └─ Galerija
│   └── Kapela Podravska
├── Župa
├── Škola
└── Udruge
```

### 5. Mobile Layout

**No room for sidebar. Solution: Sticky pill + Bottom sheet.**

**Default state:**
```
┌──────────────────────┐
│  Header    [≡] [K]   │
├──────────────────────┤
│                      │
│  Small Hero          │
│  Page Title          │
│                      │
│  Content scrolls...  │
│                      │
│                      │
├──────────────────────┤
│  [📍 Načelnik    ▲]  │  ← Sticky pill showing current location
└──────────────────────┘
```

**Pill specifications:**
- Position: Fixed bottom, centered
- Shows: Current page name + section indicator
- Visual: Pill shape, primary color, subtle shadow
- Tap: Opens bottom sheet

**Bottom sheet (opened):**
```
┌──────────────────────┐
│  Header              │
├──────────────────────┤
│  (dimmed content)    │
│                      │
├──────────────────────┤
│  ════════════════    │  ← Drag handle
│                      │
│  UPRAVA              │  ← Section header
│                      │
│  ● Načelnik          │  ← Same accordion behavior
│    ├─ O načelniku    │     as desktop sidebar
│    ├─ Program rada   │
│    └─ Kontakt        │
│                      │
│  Vijeće              │
│  Usluge              │
│  Dokumenti           │
│  Javna nabava        │
│                      │
└──────────────────────┘
```

**Bottom sheet behavior:**
- Drag to expand/collapse
- Tap outside to close
- Tap item to navigate (sheet closes)
- Smooth spring animations

### 6. Animation Specifications

**Goal:** Professional, polished, clearly not WordPress.

**Sidebar accordion:**
```typescript
// Expand/collapse
transition: {
  type: "spring",
  stiffness: 400,
  damping: 30
}

// Page sections - staggered reveal
staggerChildren: 0.05,
delayChildren: 0.1

// Each section item
initial: { opacity: 0, x: -10 }
animate: { opacity: 1, x: 0 }
```

**Active indicator:**
- Animated line/dot that morphs position (not instant jump)
- Uses `layoutId` for shared element transition

**Scroll spy:**
- Smooth active state transitions as user scrolls
- Subtle highlight animation on section change

**Page transitions:**
- Content fades/slides smoothly when navigating
- Not a full page reload feel
- Maintain scroll position in sidebar

**Bottom sheet (mobile):**
```typescript
// Sheet animation
transition: {
  type: "spring",
  stiffness: 300,
  damping: 30
}

// Backdrop
initial: { opacity: 0 }
animate: { opacity: 0.5 }
```

**Content reveals:**
- Sections fade in on scroll (IntersectionObserver)
- Subtle, not distracting
- Once revealed, stays visible

### 7. Homepage Changes

**Keep:** VillageHero with Ken Burns effect, cycling villages, interactive cards.

**Change:** Center village names on mobile only.

```css
@media (max-width: 768px) {
  .village-name {
    text-align: center;
    /* Adjust positioning */
  }
}
```

### 8. Small Hero Specifications

**Dimensions:**
- Height: 200-250px (not full viewport)
- Width: Contained within content area (not full bleed)

**Content:**
- Background image (subtle, not overwhelming)
- Page title (large, prominent)
- Optional subtitle/breadcrumb
- Slight gradient overlay for text readability

**Visual harmony with sidebar:**
- Hero aligns with top of sidebar
- Same top spacing as sidebar start
- Rounded corners to feel contained

---

## Component Architecture

### New Components Needed

```
components/
├── navigation/
│   ├── sidebar-nav.tsx           # Desktop accordion sidebar
│   ├── sidebar-section.tsx       # Section with expandable items
│   ├── sidebar-item.tsx          # Individual nav item
│   ├── mobile-nav-pill.tsx       # Sticky bottom pill
│   ├── mobile-nav-sheet.tsx      # Bottom sheet navigation
│   └── scroll-spy.tsx            # Hook for tracking active section
├── layout/
│   ├── page-layout-v2.tsx        # New sidebar + content layout
│   └── small-hero.tsx            # Contained hero component
└── mega-menu/
    └── mega-menu-v2.tsx          # Updated mega menu structure
```

### Data Structure

```typescript
// Navigation structure for sidebar
interface NavSection {
  id: string;
  title: string;           // "UPRAVA", "NAŠ KRAJ", "AKTUALNO"
  items: NavItem[];
}

interface NavItem {
  id: string;
  label: string;           // "Načelnik"
  href: string;            // "/nacelnik"
  children?: NavItem[];    // Subpages (for Naselja)
  sections?: PageSection[]; // TOC sections (defined per page)
}

interface PageSection {
  id: string;              // HTML id for scroll target
  label: string;           // "O načelniku"
}
```

### Page Configuration

Each page defines its sections for the sidebar:

```typescript
// In /nacelnik/page.tsx
const pageSections: PageSection[] = [
  { id: "o-nacelniku", label: "O načelniku" },
  { id: "program-rada", label: "Program rada" },
  { id: "dokumenti", label: "Dokumenti" },
  { id: "kontakt", label: "Kontakt" },
];
```

---

## Migration Plan

### Phase 1: Core Infrastructure
1. Create new sidebar components
2. Create new page layout component
3. Implement scroll spy hook
4. Create mobile bottom sheet

### Phase 2: Navigation Update
1. Update mega menu structure (3 groups)
2. Add Kontakt to header
3. Update navigation data file

### Phase 3: Page Migration
1. `/nacelnik` - New standalone page
2. `/vijece` - New standalone page
3. `/opcina` - Convert from tabs to single page
4. `/naselja` - Landing page + 3 village subpages
5. `/zupa` - New page
6. `/skola` - New page
7. Update remaining pages to new layout

### Phase 4: Polish
1. Animation refinement
2. Mobile testing
3. Performance optimization
4. Accessibility audit

---

## Content Requirements

Pages that need content written (from DRVB research docs):

| Page | Content Source | Priority |
|------|---------------|----------|
| /nacelnik | Old WP site + current info | High |
| /vijece | Old WP site | High |
| /opcina | DRVB_1.md Section I, II | High |
| /naselja (landing) | DRVB_1.md Section I | High |
| /veliki-bukovec | DRVB_1.md Section I, VII | High |
| /dubovica | DRVB_1.md Section II.3, IV.2 | High |
| /kapela | DRVB_1.md Section II.2 | High |
| /zupa | DRVB_1.md Section IV | Medium |
| /skola | Research needed | Medium |
| /udruge | DRVB_1.md Section V, VI | Medium |

---

## Success Criteria

- [ ] Users always know where they are (sidebar visible)
- [ ] Users can easily discover related content (siblings visible)
- [ ] No confusing nested tabs
- [ ] All pages accessible within 2 clicks from homepage
- [ ] Mobile navigation feels app-like (bottom sheet)
- [ ] Animations are smooth, professional, impressive
- [ ] Župa and Škola are in navigation
- [ ] Kontakt is always one click away
- [ ] Page content visible without excessive scrolling
- [ ] Passes "not WordPress" test - visitors notice the quality

---

## Technical Notes

### Dependencies
- Framer Motion (already installed) - animations
- Vaul or custom - bottom sheet
- IntersectionObserver - scroll spy

### Performance Considerations
- Sidebar should not cause layout shifts
- Bottom sheet should lazy load
- Animations should respect `prefers-reduced-motion`

### Accessibility
- Sidebar navigation must be keyboard accessible
- Bottom sheet needs focus trap
- Current page clearly indicated (not just color)
- Skip links for sidebar navigation

---

*Design approved for implementation. Next step: Create implementation plan with superpowers:writing-plans.*
