# Content Gold Standard Plan

> **For Claude:** This document is the single source of truth for rewriting all content pages to gold standard quality. On context loss, read this file first.

**Goal:** Rewrite all content pages to match the quality of `/opcina` - research-backed, specific, with utility containers and "Jeste li znali?" facts that amaze locals.

**Reference Implementation:** `/home/wandeon/WebVB/apps/web/app/opcina/page.tsx` (597 lines)

**Research Sources:**
- `/mnt/c/VelikiBukovec_web/DRVB_1.md` - Core research (27KB)
- `/mnt/c/VelikiBukovec_web/DRVB_2.pdf` - Deep historical layers (23 pages)

---

## Page Inventory

### Content Pages (Need Gold Standard Rewrite)

| Page | Route | Current Lines | Status | Priority |
|------|-------|---------------|--------|----------|
| Općina | `/opcina` | 597 | ✅ DONE | - |
| Načelnik | `/nacelnik` | 432 | ✅ DONE | P1 |
| Vijeće | `/vijece` | 562 | ✅ DONE | P1 |
| Župa | `/zupa` | 628 | ✅ DONE | P1 |
| Škola | `/skola` | 609 | ✅ DONE | P1 |
| Usluge | `/usluge` | 914 | ✅ DONE | P2 |
| Udruge | `/opcina/udruge` | 629 | ✅ DONE | P2 |
| Naselja (index) | `/opcina/naselja` | 469 | ✅ DONE | P2 |
| Veliki Bukovec | `/naselja/veliki-bukovec` | 620 | ✅ DONE | P1 |
| Dubovica | `/naselja/dubovica` | 653 | ✅ DONE | P1 |
| Kapela Podravska | `/naselja/kapela` | 550 | ✅ DONE | P1 |

### Utility Pages (Keep As-Is)

| Page | Route | Reason |
|------|-------|--------|
| Kontakt | `/kontakt` | Form, not content |
| Prijava problema | `/prijava-problema` | Form |
| Vijesti | `/vijesti/*` | Dynamic from DB |
| Obavijesti | `/obavijesti/*` | Dynamic from DB |
| Dokumenti | `/dokumenti` | Dynamic from DB |
| Događanja | `/dogadanja/*` | Dynamic from DB |
| Galerija | `/galerija/*` | Dynamic from DB |
| Izbori | `/izbori` | Utility list |
| Newsletter | `/newsletter/*` | Functional |
| Homepage | `/` | Separate design |

---

## Content Blueprints

### Blueprint A: "About Entity" Page
**Used for:** Načelnik, Vijeće, Župa, Škola

```
Structure:
1. Hero (PageLayoutV2)
   - title: Entity name
   - subtitle: One-line identity statement (specific, not generic)
   - heroImage: Relevant photo

2. Section: O [entity] / Uvod
   - 2 paragraphs: What it is, why it matters HERE (not generic)
   - Key Facts utility container (6 items)
   - "Jeste li znali?" box with surprising local fact

3. Section: Povijest / Kako je nastalo
   - Timeline if applicable (use border-l-2 pattern from /opcina)
   - Specific dates and names from research

4. Section: Danas / Djelovanje
   - Current state, activities, role
   - Concrete examples, not abstractions

5. Section: Kontakt / Više informacija
   - Links to related pages
   - Contact info if applicable

6. Footer
   - "Posljednja izmjena: [date]"
   - "Izvori: [sources]"
```

### Blueprint B: "Village Profile" Page
**Used for:** Veliki Bukovec, Dubovica, Kapela Podravska

```
Structure:
1. Hero (PageLayoutV2)
   - title: Village name
   - subtitle: Character summary (from DRVB_2 village profiles)
   - heroImage: Village landscape/landmark

2. Section: O naselju
   - Population, character, "emotional tone" from research
   - Key Facts: population, area, key landmarks
   - "Jeste li znali?" - village-specific surprise

3. Section: Povijest
   - First mention date
   - Key historical events specific to THIS village
   - Timeline entries

4. Section: Gospodarstvo
   - What people do here (specific businesses)
   - Role in municipality economy

5. Section: Znamenitosti
   - Chapel, landmarks, natural features
   - With photo placeholders

6. Section: Udruge i društva
   - DVD, sports clubs, associations
   - Links to /opcina/udruge

7. Footer with sources
```

### Blueprint C: "Services" Page
**Used for:** Usluge

```
Structure:
1. Hero
   - title: "Usluge građanima"
   - subtitle: "Što općina radi za vas"

2. Section per service category:
   - Komunalno
   - Financije
   - Građani
   - Udruge

Each with:
   - What it is
   - How to access
   - Contact/link
   - Required documents if applicable
```

### Blueprint D: "Associations" Page
**Used for:** Udruge

```
Structure:
1. Hero
   - title: "Udruge i društva"
   - subtitle: "Zajednica koja živi kroz volontere"

2. Section: DVD-ovi (Fire brigades)
   - DVD Veliki Bukovec (history, 1928 founding)
   - DVD Dubovica
   - DVD Kapela Podravska
   - "Jeste li znali?" about firefighter traditions

3. Section: Sportski klubovi
   - NK Bukovčan
   - NK Poljoprivrednik
   - NK Croatia Dubovica (defunct - mention why)

4. Section: Kulturne udruge
   - Women's associations
   - Church groups

5. Footer with sources
```

---

## Link Architecture

```
                    ┌─────────────┐
                    │  Homepage   │
                    │     /       │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────┐      ┌───────────┐      ┌───────────┐
   │ /opcina │      │ /nacelnik │      │  /vijece  │
   │ (DONE)  │      │           │      │           │
   └────┬────┘      └───────────┘      └───────────┘
        │
   ┌────┴────┬──────────┬──────────┐
   │         │          │          │
   ▼         ▼          ▼          ▼
┌──────┐ ┌──────┐  ┌────────┐ ┌────────┐
│/zupa │ │/skola│  │/usluge │ │/udruge │
└──────┘ └──────┘  └────────┘ └────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ /naselja │ │ /naselja │ │ /naselja │
              │ /v-buk   │ │ /dubov.  │ │ /kapela  │
              └──────────┘ └──────────┘ └──────────┘
```

### Internal Links Per Page

| Page | Links TO | Links FROM |
|------|----------|------------|
| /opcina | /nacelnik, /vijece, /usluge, /zupa, /naselja/* | Homepage, all pages |
| /nacelnik | /vijece, /opcina, /usluge | /opcina, /vijece |
| /vijece | /nacelnik, /opcina | /opcina, /nacelnik |
| /zupa | /opcina, /skola | /opcina |
| /skola | /zupa, /opcina | /opcina |
| /usluge | /kontakt, /opcina | /opcina, /nacelnik |
| /naselja/veliki-bukovec | /opcina, /zupa, /skola, /udruge | /opcina |
| /naselja/dubovica | /opcina, /udruge | /opcina |
| /naselja/kapela | /opcina, /udruge | /opcina |
| /udruge | /naselja/*, /kontakt | /opcina, /naselja/* |

---

## Photo Requirements

### /nacelnik
| Placeholder | Description | Notes |
|-------------|-------------|-------|
| `hero-nacelnik.jpg` | Mayor portrait or at desk | Professional, friendly |
| `nacelnik-vijece.jpg` | Mayor at council meeting | Shows governance |

### /vijece
| Placeholder | Description | Notes |
|-------------|-------------|-------|
| `hero-vijece.jpg` | Council chamber or group photo | Official setting |
| `vijece-sjednica.jpg` | Council in session | Action shot |

### /zupa
| Placeholder | Description | Notes |
|-------------|-------------|-------|
| `hero-crkva.jpg` | St. Francis church exterior | Full view, good light |
| `crkva-interior.jpg` | Church interior | Altar, Drašković tombs |
| `kapelica-dubovica.jpg` | Chapel of Holy Cross | Dubovica chapel |
| `kapelica-kapela.jpg` | Kapela Podravska chapel | |
| `nepomuk.jpg` | St. John Nepomuk statue 1764 | Historic monument |

### /skola
| Placeholder | Description | Notes |
|-------------|-------------|-------|
| `hero-skola.jpg` | School building exterior | |
| `skola-djeca.jpg` | Students (with permission) | Activities |
| `skola-historic.jpg` | Historic school photo if available | From archives |

### /naselja/veliki-bukovec
| Placeholder | Description | Notes |
|-------------|-------------|-------|
| `hero-vb.jpg` | Village panorama | Drone shot ideal |
| `dvorac-draskovic.jpg` | Drašković castle | Even if closed |
| `park-draskovic.jpg` | Castle park | Protected monument |
| `opcina-zgrada.jpg` | Municipal building | |

### /naselja/dubovica
| Placeholder | Description | Notes |
|-------------|-------------|-------|
| `hero-dubovica.jpg` | Village view | |
| `plitvica-dubovica.jpg` | Plitvica river through village | Key geography |
| `cvjecari-staklenici.jpg` | Flower greenhouses | Economic identity |

### /naselja/kapela
| Placeholder | Description | Notes |
|-------------|-------------|-------|
| `hero-kapela.jpg` | Village view | |
| `pilana-pecenec.jpg` | Pečenec sawmill | Major employer |
| `cvjecari-kapela.jpg` | Flower production | OPG greenhouses |

### /udruge
| Placeholder | Description | Notes |
|-------------|-------------|-------|
| `dvd-vb.jpg` | DVD Veliki Bukovec | Firefighters |
| `dvd-dubovica.jpg` | DVD Dubovica | Founded 1928 |
| `nk-bukovcan.jpg` | Football club | |
| `udruga-zena.jpg` | Women's association | |

---

## Research Content Mapping

### From DRVB_1.md (use for):
- Demographics data (population tables)
- Political history (mayors, split from Mali Bukovec)
- Economic identity (floriculture statistics)
- Settlement profiles (brief)

### From DRVB_2.pdf (use for):
- Deep historical layers (Ottoman frontier, Drašković dynasty)
- Religion as infrastructure (church history, feast days)
- Political DNA (1997 split details, HSS dominance)
- Demography & Migration (Gastarbeiter era, village decline)
- Economy Beyond Agriculture (Požgaj, Pečenec, flower families)
- Geography & Climate (rivers, floods, hail 2022)
- Village-by-Village Profiles (character, strengths, weaknesses)
- Cultural & Social Memory (traditions, fire brigades, football)
- "Things People Don't Know" (surprising facts for each page)

### Content Extraction Guide

When rewriting a page, search DRVB_2.pdf for:
```
/nacelnik → "Political DNA", "mayor", "Vrbanić", "HSS"
/vijece → "Political DNA", "council", "local politics"
/zupa → "Religion as Infrastructure", "St. Francis", "parish", "church"
/skola → "school", "education", "1830"
/veliki-bukovec → "Veliki Bukovec (Municipal Seat)" section
/dubovica → "Dubovica" section
/kapela → "Kapela Podravska" section
/udruge → "fire brigade", "DVD", "football", "NK", "women's association"
```

---

## Execution Roadmap

### Phase 1: Village Profiles (P1)
These use the most research and set up internal links.

1. `/naselja/veliki-bukovec` - Use "Veliki Bukovec (Municipal Seat)" from DRVB_2
2. `/naselja/dubovica` - Use "Dubovica" section from DRVB_2
3. `/naselja/kapela` - Use "Kapela Podravska" section from DRVB_2

### Phase 2: Institutional Pages (P1)
Core governance and community institutions.

4. `/nacelnik` - Political DNA section, current mayor info
5. `/vijece` - Council structure, political character
6. `/zupa` - Religion as Infrastructure section
7. `/skola` - Education history, 1830 founding

### Phase 3: Service & Association Pages (P2)
Complete the ecosystem.

8. `/usluge` - Already structured, needs specific content
9. `/opcina/udruge` - DVDs, sports clubs, cultural groups
10. `/opcina/naselja` - Index page linking to village profiles

---

## Quality Checklist (Per Page)

Before marking a page complete, verify:

- [ ] Opening answers "Why am I here?" in 5 seconds
- [ ] Key Facts utility container with real data
- [ ] At least one "Jeste li znali?" box with surprising fact
- [ ] Timeline or structured history (not vague prose)
- [ ] Specific names, dates, numbers (not "century ago" but "1820")
- [ ] Internal links to related pages
- [ ] Photo placeholders with clear descriptions
- [ ] Footer with "Posljednja izmjena" and sources
- [ ] No generic filler text ("bogata tradicija", "lijepi kraj")
- [ ] Croatian spelling/grammar correct

---

## How to Continue After Context Loss

1. Read this file: `docs/plans/2026-01-31-content-gold-standard.md`
2. Check status table above for next page to rewrite
3. Read reference implementation: `/apps/web/app/opcina/page.tsx`
4. Extract relevant content from DRVB_1.md and DRVB_2.pdf
5. Follow the appropriate Blueprint (A, B, C, or D)
6. Use photo placeholder pattern: `{/* TODO: Photo - [description] */}`
7. Update status table when complete
8. Build and deploy: `pnpm build --filter=@repo/web && scp -r apps/web/out/* deploy@100.120.125.83:~/apps/web-static/`

---

## Component Patterns (Copy from /opcina)

### Key Facts Container
```tsx
<div className="not-prose my-8 rounded-xl border border-primary-200 bg-primary-50/50 p-6">
  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
    <Sparkles className="h-5 w-5 text-primary-600" />
    Ključne činjenice
  </h3>
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {/* Items */}
  </div>
</div>
```

### "Jeste li znali?" Box
```tsx
<div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
  <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
  <p className="mt-1 text-sm text-amber-700">
    [Surprising fact here]
  </p>
</div>
```

### Timeline Entry
```tsx
<div className="relative border-l-2 border-primary-200 pl-6">
  <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
  <div className="text-sm font-medium text-primary-600">[Year]</div>
  <h4 className="mt-1 font-semibold text-neutral-900">[Event title]</h4>
  <p className="mt-2 text-sm text-neutral-600">[Description]</p>
</div>
```

### Page Footer
```tsx
<footer className="not-prose mt-12 border-t border-neutral-100 pt-6">
  <p className="text-xs text-neutral-400">
    Posljednja izmjena: [date] • Izvori: [sources]
  </p>
</footer>
```

---

## Completion Summary

**Status:** ✅ ALL PAGES COMPLETE (2026-01-31)

### Execution Results

| Phase | Pages | Status |
|-------|-------|--------|
| Phase 1: Village Profiles | veliki-bukovec, dubovica, kapela | ✅ Complete |
| Phase 2: Institutional | nacelnik, vijece, zupa, skola | ✅ Complete |
| Phase 3: Services | usluge, udruge, naselja index | ✅ Complete |

### Content Growth

| Page | Before | After | Growth |
|------|--------|-------|--------|
| /nacelnik | 131 | 432 | 3.3x |
| /vijece | 196 | 562 | 2.9x |
| /zupa | 121 | 628 | 5.2x |
| /skola | 201 | 609 | 3.0x |
| /usluge | 334 | 914 | 2.7x |
| /opcina/udruge | 345 | 629 | 1.8x |
| /opcina/naselja | redirect | 469 | new |
| /naselja/veliki-bukovec | 58 | 620 | 10.7x |
| /naselja/dubovica | 53 | 653 | 12.3x |
| /naselja/kapela | 58 | 550 | 9.5x |
| **TOTAL** | **1,497** | **6,066** | **4.1x** |

### Quality Verified
- ✅ All pages have Key Facts utility containers
- ✅ All pages have "Jeste li znali?" boxes with surprising local facts
- ✅ All pages have research-backed content from DRVB_1.md and DRVB_2.pdf
- ✅ All pages have timeline/history sections with specific dates
- ✅ All pages have internal links
- ✅ All pages have footers with sources
- ✅ All pages pass TypeScript and lint checks
- ✅ Photo placeholders documented as TODO comments

### Deployed
- Build: `pnpm build --filter=@repo/web` ✅
- Deploy: `scp -r apps/web/out/* deploy@100.120.125.83:~/apps/web-static/` ✅

---

*Created: 2026-01-31*
*Completed: 2026-01-31*
*Reference: /opcina gold standard implementation*
