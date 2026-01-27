# CONTENT-REWRITE-ROADMAP.md - Content Migration & Creation Roadmap

> AI-agent optimized roadmap for content rewriting and page creation.
> Each phase has clear gates preventing progression without completion.
> Last updated: 2026-01-27

## Current Status

**Active Phase:** Not Started
**Overall Progress:** 0/15 pages created
**Admin Panel:** http://100.120.125.83:3001/pages
**Public Site:** http://100.120.125.83/
**Source Content:** `scripts/migration/output/pages.json`

---

## Content Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  CONTENT CREATION WORKFLOW                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. PREPARATION PHASE                                           │
│     ├── Review source content from pages.json                   │
│     ├── Map images to R2 URLs via media-url-map.json            │
│     └── Verify navigation structure in navigation.ts            │
│                                                                 │
│  2. CREATION PHASE (per page)                                   │
│     ├── Draft content in TipTap JSON format                     │
│     ├── Create page via Admin Panel                             │
│     ├── Add proper slug matching navigation                     │
│     └── Publish page                                            │
│                                                                 │
│  3. VERIFICATION PHASE                                          │
│     ├── Test page loads at expected URL                         │
│     ├── Verify all images load from R2                          │
│     ├── Check internal links work                               │
│     └── Validate navigation highlights correctly                │
│                                                                 │
│  4. SIGN-OFF GATE                                               │
│     └── Page marked complete only after ALL checks pass         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Progress Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Pending |
| 🔄 | In Progress |
| ✅ | Completed |
| ⏸️ | Blocked |
| 🔀 | Can run in parallel |
| 🔗 | Has dependency |

---

## Phase 1: Priority Navigation Pages (Fixing 404s)

**Status:** Not Started | **Progress:** 0/9 | **Gate:** All navigation links work

These pages are **critical** - they appear in the main navigation and currently return 404 errors.

| # | Slug | Title | Source | Gate |
|---|------|-------|--------|------|
| 1.1 ⬜ | `organizacija/uprava` | Općinska uprava | Create new | Page loads, nav highlights |
| 1.2 ⬜ | `opcina/povijest` | Povijest Velikog Bukovca | Extract from `o-nama` | Page loads, history content complete |
| 1.3 ⬜ | `opcina/turizam` | Turizam | Create new | Page loads, attractions listed |
| 1.4 ⬜ | `dokumenti/glasnik` | Službeni glasnik | Create new | Page loads, gazette info present |
| 1.5 ⬜ | `dokumenti/proracun` | Proračun | Create new | Page loads, budget docs linked |
| 1.6 ⬜ | `rad-uprave/udruge` | Financiranje udruga | Use `udruge-i-drustva` | Page loads, funding info present |
| 1.7 ⬜ | `rad-uprave/mjestani` | Kutak za mještane | Create new | Page loads, citizen services listed |
| 1.8 ⬜ | `rad-uprave/registri` | Registri i ugovori | Create new | Page loads, registry info present |
| 1.9 ⬜ | `natjecaji` | Natječaji | Create new | Page loads, tender info present |

### 1.1: Općinska uprava (`organizacija/uprava`)

```
Source: Create new content
Target Slug: organizacija/uprava

Content Outline:
□ Introduction - Overview of municipal administration structure
□ Working hours - Radno vrijeme: pon-pet 7:00-15:00
□ Contact info - Phone, email, address
□ Staff listing - Key personnel with roles
□ Services provided - List of administrative services
□ Links to related documents

Checklist:
□ Slug matches navigation
□ Title is descriptive
□ Content in Croatian
□ Contact info is current
□ Page is published

Gate: Page loads at /organizacija/uprava, sidebar navigation works
```

### 1.2: Povijest Velikog Bukovca (`opcina/povijest`)

```
Source: Extract from o-nama page in pages.json (contains extensive Drašković history)
Target Slug: opcina/povijest

Content Outline:
□ Introduction - Historical significance of Veliki Bukovec
□ 16th Century Origins - Sekelj family, Bednjanski posjed
□ Drašković Era (1643+) - Ivan Drašković acquistion
□ Castle Construction (1745-1755) - Josip Kazimir Drašković
□ 19th Century - Karlo Drašković, Illyrian movement
□ 20th Century - Pavao Drašković, modernization
□ Castle Return (1990s) - Restoration to family

Images Required (from R2):
□ Grb_obitelji_Drašković_Trakošćan.jpg
□ Dvorac_Draskovic_Veliki_Bukovac_5.jpg
□ dvorac-025.jpg

Checklist:
□ Slug matches navigation
□ All history sections complete
□ Images use R2 URLs
□ No old WordPress URLs remain
□ Page is published

Gate: Full history page with images, loads at /opcina/povijest
```

### 1.3: Turizam (`opcina/turizam`)

```
Source: Create new, reference castle info from o-nama
Target Slug: opcina/turizam

Content Outline:
□ Introduction - Welcome to Veliki Bukovec
□ Dvorac Drašković - Castle as main attraction
□ Perivoj (Park) - 11 hectares, English garden style
□ Rijeka Plitvica - River flowing through area
□ Crkve i kapelice - Churches and chapels
□ Priroda - Nature and outdoor activities
□ Smještaj i ugostiteljstvo - If applicable

Images Required:
□ Castle exterior photos
□ Park/nature photos
□ Church photos (from crkve-i-kapelice if available)

Checklist:
□ Slug matches navigation
□ Tourist attractions listed
□ Images use R2 URLs
□ Page is published

Gate: Tourism page with attractions, loads at /opcina/turizam
```

### 1.4-1.9: Remaining Priority Pages

```
1.4 dokumenti/glasnik - Službeni glasnik
    Content: Links to official gazette documents, archive info
    Gate: Page explains gazette purpose, links to documents section

1.5 dokumenti/proracun - Proračun
    Content: Budget documents overview, links to budget PDFs
    Gate: Page lists budget info, links work

1.6 rad-uprave/udruge - Financiranje udruga
    Source: udruge-i-drustva page for association funding rules
    Content: Pravilnik, funding process, application info
    Gate: Funding info present, pravilnik linked

1.7 rad-uprave/mjestani - Kutak za mještane
    Content: Citizen services, forms, common procedures
    Gate: Services listed, helpful for citizens

1.8 rad-uprave/registri - Registri i ugovori
    Content: Public registers, contracts transparency
    Gate: Registry categories explained

1.9 natjecaji - Natječaji
    Content: Job postings, public tenders, procurement
    Gate: Tender process explained, archive mentioned
```

**Phase 1 Gate:** All 9 pages exist and load correctly. Main navigation has no 404 errors.

---

## Phase 2: Section Landing Pages

**Status:** Not Started | **Progress:** 0/3 | **Depends:** Phase 1 complete
**Gate:** Section pages provide navigation overview

These are parent pages that introduce each section and link to child pages.

| # | Slug | Title | Gate |
|---|------|-------|------|
| 2.1 ⬜ | `organizacija` | Organizacija | Overview with links to vijeće, načelnik, uprava, JUO |
| 2.2 ⬜ | `rad-uprave` | Rad uprave | Overview of services with links to subsections |
| 2.3 ⬜ | `opcina` | Općina | Overview with links to naselja, povijest, turizam |

### 2.1: Organizacija Landing (`organizacija`)

```
Target Slug: organizacija

Content Outline:
□ Introduction - Municipal organization overview
□ Općinsko vijeće link - Council info
□ Općinski načelnik link - Mayor info
□ Jedinstveni upravni odjel link - Administration
□ Općinska uprava link - Municipal services
□ Brief description of each

Structure:
- Card or list layout linking to subsections
- Each item with brief description
- Icon or image for visual appeal

Gate: Landing page with working links to all child pages
```

### 2.2: Rad uprave Landing (`rad-uprave`)

```
Target Slug: rad-uprave

Content Outline:
□ Introduction - Administrative services overview
□ Komunalno link - Waste, infrastructure
□ Udruge link - Association funding
□ Mjestani link - Citizen services
□ Registri link - Public registers

Gate: Landing page with working links to all child pages
```

### 2.3: Općina Landing (`opcina`)

```
Target Slug: opcina

Content Outline:
□ Introduction - About the municipality
□ O nama link - General information
□ Naselja link - Villages/settlements
□ Povijest link - History
□ Turizam link - Tourism

Gate: Landing page with working links to all child pages
```

**Phase 2 Gate:** Section landing pages exist and link to all child pages.

---

## Phase 3: Content Quality Review

**Status:** Not Started | **Progress:** 0/3 | **Depends:** Phase 2 complete
**Gate:** All pages reviewed for quality and consistency

| # | Task | Gate |
|---|------|------|
| 3.1 ⬜ | Verify all internal links | No broken internal links |
| 3.2 ⬜ | Verify all images load | All images from R2, no 404s |
| 3.3 ⬜ | Consistency check | Croatian language, formal tone, no placeholders |

### 3.1: Link Verification

```
Checklist:
□ Check all internal links in created pages
□ Verify links match actual slugs
□ Test sidebar navigation on each page
□ Confirm breadcrumbs work correctly

Gate: Zero broken internal links
```

### 3.2: Image Verification

```
Checklist:
□ All images use R2 base URL: https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/
□ No old WordPress URLs (velikibukovec.hr/wp-content/)
□ All images load without 404
□ Alt text is descriptive

Gate: All images load from R2
```

### 3.3: Content Consistency

```
Checklist:
□ Croatian language throughout
□ Formal government tone
□ No placeholder text
□ Contact info is current
□ Working hours are accurate
□ No broken external links

Gate: Content review complete
```

**Phase 3 Gate:** All content is verified, no broken links or missing images.

---

## How to Use This Roadmap

### For AI Agents (Claude)

1. Check current phase status at top
2. Read page requirements from the relevant section
3. Create content following the checklist
4. Run the gate checks
5. Mark item complete (✅) only after ALL gates pass
6. Update "Overall Progress" counter

### For Humans

1. Review drafted content before publishing
2. Verify Croatian grammar and terminology
3. Approve page design and layout
4. Mark phase complete when all gates pass

### Creating a Page

1. **Open Admin Panel**: http://100.120.125.83:3001/pages
2. **Click "Nova stranica"** (New page)
3. **Enter:**
   - Title: Croatian, descriptive
   - Slug: Must match URL in navigation exactly
4. **Use TipTap editor** for content:
   - Use headings (H2, H3) for structure
   - Use bullet lists for services/contacts
   - Add images using R2 URLs
5. **Save and Publish**
6. **Verify** page loads at expected URL

---

## TipTap JSON Reference

For programmatic page creation, use this format:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "Naslov sekcije" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Tekst paragrafa sa " },
        { "type": "text", "text": "boldanim", "marks": [{ "type": "bold" }] },
        { "type": "text", "text": " tekstom." }
      ]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            { "type": "paragraph", "content": [{ "type": "text", "text": "Stavka 1" }] }
          ]
        }
      ]
    },
    {
      "type": "image",
      "attrs": {
        "src": "https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/2015/02/dvorac-025.webp",
        "alt": "Dvorac Drašković",
        "title": ""
      }
    }
  ]
}
```

---

## Source Content Reference

Key pages from `scripts/migration/output/pages.json`:

| Old Slug | Content For |
|----------|-------------|
| `o-nama` | **HISTORY** - Full Drašković history, castle, park |
| `opcinski-nacelnik` | Mayor info, programs |
| `opcinsko-vijece` | Council members, documents |
| `juo-opcine` | Administrative bodies overview |
| `udruge-i-drustva` | Associations list, funding pravilnik |
| `kontakt` | Contact info (use for verification) |

---

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/migration/output/pages.json` | WordPress page content |
| `scripts/migration/output/media-url-map.json` | Old URL → R2 URL mapping |
| `apps/web/lib/navigation.ts` | Navigation structure (slugs must match) |
| `docs/page-url-audit.md` | Full URL audit |
| `docs/content-rewrite-agent-context.md` | Agent briefing document |

---

## Completion Checklist

- [ ] **Phase 1**: All 9 priority pages created (/9)
- [ ] **Phase 2**: All 3 section landing pages created (/3)
- [ ] **Phase 3**: Content quality review complete (/3)
- [ ] **Final Gate**: Full navigation works, no 404 errors

---

## Changelog

### 2026-01-27
- Initial roadmap created
- Defined 3 phases with gates
- Documented 15 pages to create/enhance
