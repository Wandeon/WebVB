# Homepage Bento Grid + Header Redesign

**Date:** 2026-02-13
**Status:** Design approved, pending implementation

## Summary

Upgrade the homepage bento grid, smart dashboard, and header to increase daily usefulness for residents. Four changes:

1. Swap bento grid content (waste pickup prominent, tenders live, assistant replaces funding)
2. Enhance weather widget (daily high/low + tomorrow forecast + DHMZ link)
3. Replace AI assistant widget with latest 2 galleries in smart dashboard
4. Add Viber + WhatsApp group links to header (desktop + mobile)

---

## 1. Bento Grid

### Layout (unchanged grid, new content)

```
Desktop (4 cols):
┌──────────┬──────────┬──────────┬──────────┐
│  a: Odvoz otpada     │  b: Prijava problema │
│  (2x2, green)        ├──────────┬──────────┤
│  Next pickup shown   │c: Dok.   │d: Događ. │
├──────────┬──────────┼──────────┼──────────┤
│  e: Natječaji        │  f: Virt. asistent   │
│  (2x1, gold)         │  (2x1, slate/glass)  │
└──────────┴──────────┴──────────┴──────────┘
```

### Position a (2x2) — Odvoz otpada

- **Color:** green (emerald-600/800) — matches current 2x2 anchor card
- **Icon:** `Trash2`
- **Content:** Next upcoming waste event from calendar
- **Format:** `{waste_type} • {day_name}, {day}.{month}.` — e.g. "MKO • pon, 17.2."
  - If event has time: append ` u {HH:mm}`
  - Multiple events same day: show first upcoming, indicate count: "MKO + 1 više • pon, 17.2."
- **Data source:** New `eventsRepository.getNextWasteEvent()` method
  - Query: `title CONTAINS 'odvoz otpada'`, `eventDate >= today`, `ORDER BY eventDate ASC`, `LIMIT 2` (to detect same-day multiples)
- **Waste type extraction:** Parse from title pattern `"Odvoz otpada: {type}"` → map to short label (MKO, Bio, Plastika, Papir, Metal, Pelene, Staklo) — reuse mapping from `waste-schedule.tsx`
- **Empty state:** "Trenutno nema nadolazećih termina u kalendaru." + button "Pogledajte raspored" → `/odvoz-otpada`
- **Click target:** `/odvoz-otpada`

### Position b (2x1) — Prijava problema

- **Color:** green (same as before, but small card variant)
- **Icon:** `AlertTriangle`
- **Description:** "Prijavite komunalne probleme"
- **Click target:** `/prijava-problema`

### Position c (1x1) — Dokumenti (unchanged)

### Position d (1x1) — Događanja (unchanged)

### Position e (2x1) — Natječaji (enhanced)

- **Color:** gold (amber-500/700)
- **Icon:** `FileText`
- **Content:** Count of active tenders + latest title
  - e.g. "3 aktivna natječaja" + "Natječaj za zakup poslovnog prostora"
  - If 0 active: "Pregledajte natječaje i oglase"
- **Data source:** New `announcementsRepository.getActiveTenderSummary()` method
  - Filter: `category = 'natjecaj'`, `status = 'published'`, not expired (validity check)
  - Returns: `{ count: number; latestTitle: string | null }`
- **Click target:** `/obavijesti?category=natjecaj` (filtered announcements view)
  - Note: current quick link points to `/natjecaji` which is a dead route. Fix to `/obavijesti?category=natjecaj`

### Position f (2x1) — Virtualni asistent

- **Color:** slate/glass (slate-600/800) — distinct from sky to avoid two identical blues
- **Icon:** `MessageSquare` or `Bot`
- **Description:** "Postavite pitanje o općini"
- **Status badge:** "Uskoro" if not live, or "Online" when available
- **Click target:** `/asistent`

### Assistant entry points (for consistency)

The virtual assistant is accessible from exactly two places:
1. Bento grid card (position f) — primary discovery
2. `/asistent` route — direct access

It is intentionally NOT in the smart dashboard (which now shows galleries instead).

---

## 2. Smart Dashboard — Weather Enhancement

### Current state

Shows: current temperature + weather icon + "Veliki Bukovec" label.

### New state

```
┌─────────────────────────┐
│  ☀️  18°C               │
│  ↑ 22° ↓ 11°           │  ← today high/low
│                         │
│  Sutra: 🌧 ↑ 15° ↓ 8° │  ← tomorrow forecast
│                         │
│  Detaljna prognoza →    │  ← external link
└─────────────────────────┘
```

- **API:** Open-Meteo `forecast` endpoint with `daily=temperature_2m_max,temperature_2m_min,weathercode&forecast_days=2`
- **Shared helper:** Extract `weatherCodeToCondition(code)` into a reusable function (currently inline in smart-dashboard.tsx). Returns `'sunny' | 'cloudy' | 'rainy'` with icon mapping.
- **Tomorrow display:** Icon + "↑ {max}° ↓ {min}°"
- **External link:** `https://meteo.hr/prognoze.php?section=prognoze&param=n_maprog`
  - Opens in new tab with `target="_blank"` + `rel="noopener noreferrer"`
  - Shown with `ExternalLink` icon from lucide
- **Error handling:** If API fails, show current fallback (5°C cloudy). If daily arrays missing, hide high/low and tomorrow row gracefully.

---

## 3. Smart Dashboard — Galleries Replace AI Widget

### Current state

AI Assistant mini widget with "Uskoro" badge and gradient button.

### New state

Two compact gallery cards showing:
- Cover image thumbnail (rounded, aspect 16:9, ~120px wide)
- Gallery name (truncated to 1 line)
- Photo count badge

Data: First 2 from `galleriesRepository.getFeaturedForHomepage()` (already fetched on homepage).

Footer link: "Sve galerije →" → `/galerija`

Styling: Match dashboard card aesthetic (rounded-xl, bg-white/60 backdrop-blur).

---

## 4. Header — Social Buttons (Viber + WhatsApp)

### Desktop (md+)

Current: `[Facebook] [Instagram]` as icon circles.
New: `[Facebook] [Instagram] [Viber] [WhatsApp]` — same icon circle pattern.

- Viber: purple hover (`hover:bg-purple-50 hover:text-purple-600`)
- WhatsApp: green hover (`hover:bg-green-50 hover:text-green-600`)
- URLs: Placeholder constants in config, to be filled later
  - `VIBER_GROUP_URL = '#'`
  - `WHATSAPP_GROUP_URL = '#'`
- Each button has `aria-label` (e.g. "Pridružite se Viber grupi")

### Mobile (hamburger menu)

Replace individual social icons with a single expandable "Društvene mreže" button.

- Default: collapsed, shows icon (e.g. `Share2`) + "Društvene mreže" label
- On tap: expands to show a row of 4 icons (Facebook, Instagram, Viber, WhatsApp)
- Touch targets: minimum 44x44px
- Respects `prefers-reduced-motion`
- Full-width row when expanded

### Icon source

Lucide doesn't have Viber/WhatsApp brand icons. Options:
- Inline SVG paths for Viber + WhatsApp logos (small, ~200 bytes each)
- Store in a `social-icons.tsx` component alongside existing Facebook/Instagram SVGs

---

## Files to modify

| # | File | Change |
|---|------|--------|
| 1 | `apps/web/lib/quick-links.ts` | Reorder items, update content/links/colors |
| 2 | `apps/web/app/page.tsx` | Add waste + tender queries to `getHomepageData()`, pass to bento |
| 3 | `apps/web/components/smart-dashboard.tsx` | Enhance weather, replace AI widget with galleries |
| 4 | `apps/web/components/layout/header.tsx` | Add Viber/WhatsApp, mobile social dropdown |
| 5 | `packages/database/src/repositories/events.ts` | Add `getNextWasteEvent()` |
| 6 | `packages/database/src/repositories/announcements.ts` | Add `getActiveTenderSummary()` |
| 7 | `packages/ui/src/components/quick-link-card.tsx` | Add new icon mappings if needed, support dynamic content slot |

### New files

| # | File | Purpose |
|---|------|---------|
| 8 | `apps/web/components/social-icons.tsx` | Viber + WhatsApp SVG icon components |

---

## Edge cases

- **No waste events in calendar:** Empty state with explanation text + link
- **Multiple waste events same day:** Show first, indicate "+N više"
- **No active tenders:** Generic "Pregledajte natječaje" text
- **Weather API down:** Graceful fallback, hide enhanced sections
- **Gallery data missing:** Hide gallery cards, show nothing (dashboard still works)
- **Placeholder social URLs:** Buttons render but link to `#`, tooltip says "Uskoro dostupno"
