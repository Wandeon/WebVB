# Content Rewrite Agent Context

## Mission

Rewrite and create new pages for the Općina Veliki Bukovec website based on old WordPress content, ensuring all navigation links work and content is properly structured.

---

## Project Overview

- **Website**: Općina Veliki Bukovec (Croatian municipality)
- **Tech Stack**: Next.js 16, TipTap editor, PostgreSQL, Prisma
- **Language**: Croatian (hr-HR)
- **Admin Panel**: http://100.120.125.83:3001/
- **Public Site**: http://100.120.125.83/

---

## Content Format

Pages use **TipTap JSON** format. Example structure:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Regular text" },
        { "type": "text", "text": "Bold text", "marks": [{ "type": "bold" }] }
      ]
    },
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "Section Title" }]
    },
    {
      "type": "image",
      "attrs": {
        "src": "https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/2015/02/image.webp",
        "alt": "Description",
        "title": ""
      }
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            { "type": "paragraph", "content": [{ "type": "text", "text": "Item 1" }] }
          ]
        }
      ]
    }
  ]
}
```

**Supported node types**: paragraph, heading (levels 1-6), bulletList, orderedList, listItem, blockquote, codeBlock, image, hardBreak, horizontalRule

**Supported marks**: bold, italic, underline, strike, code, link (with href, target attrs)

---

## Image URLs

All migrated images are on Cloudflare R2:
- **Base URL**: `https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/`
- **Structure**: `/migration/YYYY/MM/filename.webp`
- **Example**: `https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/2015/02/dvorac-025.webp`

**Image mapping file**: `scripts/migration/output/media-url-map.json`

---

## Pages to Create (Priority Order)

### Priority 1: Missing Navigation Pages (cause 404s)

| New Slug | Title | Source Content |
|----------|-------|----------------|
| `organizacija/uprava` | Općinska uprava | Create new - overview of municipal administration |
| `opcina/povijest` | Povijest | Extract from `o-nama` page (has extensive history) |
| `opcina/turizam` | Turizam | Create new - tourist attractions, castle, nature |
| `dokumenti/glasnik` | Službeni glasnik | Create new - link to official gazette documents |
| `dokumenti/proracun` | Proračun | Create new - budget documents overview |
| `rad-uprave/udruge` | Financiranje udruga | Use content from `udruge-i-drustva` about funding |
| `rad-uprave/mjestani` | Kutak za mještane | Create new - citizen services info |
| `rad-uprave/registri` | Registri i ugovori | Create new - public registers |
| `natjecaji` | Natječaji | Create new - tenders/job postings |

### Priority 2: Section Landing Pages

| New Slug | Title | Content |
|----------|-------|---------|
| `organizacija` | Organizacija | Overview with links to vijeće, načelnik, JUO |
| `rad-uprave` | Rad uprave | Overview of administrative services |
| `opcina` | Općina | Overview with links to naselja, povijest, turizam |

### Priority 3: Enhance Existing Pages

Review and improve content quality for pages that exist but need better content.

---

## Source Content Reference

### Old WordPress Pages (in `scripts/migration/output/pages.json`)

Key pages with reusable content:

| Old Slug | Title | Useful For |
|----------|-------|------------|
| `o-nama` | Naselja | **HISTORY** - Contains full history of Veliki Bukovec, Drašković family, castle |
| `opcinski-nacelnik` | Općinski načelnik | Mayor info, documents, programs |
| `opcinsko-vijece` | Općinsko vijeće | Council members, meeting docs |
| `juo-opcine` | Općinska tijela | Administrative bodies overview |
| `veliki-bukovec` | Veliki Bukovec | Settlement info |
| `kapela` | Kapela Podravska | Settlement info |
| `naselja` | Dubovica | Settlement info with history |
| `udruge-i-drustva` | Udruge-društva | List of all associations |
| `zupa-svetog-franje-asiskog` | Crkva | Church info |
| `crkve-i-kapelice` | Crkve i kapelice | Religious sites |
| `komunalna-infrastruktura` | Komunalna infrastruktura | Municipal services |
| `projekti` | Projekti | Municipal projects |

### Content Extraction Example

The `o-nama` page contains this history section that should become `/opcina/povijest`:

```
POVIJEST POSJEDA I LOZE DRAŠKOVIĆ

Posjed Veliki Bukovec nastao je u 16. stoljeću iz bednjanskog vlastelinstva...
[extensive history about the Drašković family, castle construction 1745-1755, etc.]

DVORAC DRAŠKOVIĆ
Dvorac Drašković izgrađen je u razdoblju od 1745. - 1755. godine...

PERIVOJ
Perivoj površine 11 hektara počeo se uređivati nakon izgradnje dvorca...
```

---

## URL Structure

### Navigation expects these paths:

```
/                           # Homepage
/organizacija               # Section landing (TO CREATE)
/organizacija/uprava        # TO CREATE
/organizacija/vijece        # ✓ Exists
/organizacija/sjednice      # ✓ Exists
/organizacija/juo           # ✓ Exists
/rad-uprave                 # Section landing (TO CREATE)
/rad-uprave/komunalno       # ✓ Exists
/rad-uprave/udruge          # TO CREATE
/rad-uprave/mjestani        # TO CREATE
/rad-uprave/registri        # TO CREATE
/vijesti                    # ✓ Dynamic
/vijesti/kategorija/*       # ✓ Category filters
/dokumenti                  # ✓ Dynamic
/dokumenti/glasnik          # TO CREATE
/dokumenti/proracun         # TO CREATE
/dokumenti/prostorni-planovi # ✓ Exists
/opcina                     # Section landing (TO CREATE)
/opcina/o-nama              # ✓ Exists
/opcina/turizam             # TO CREATE
/opcina/povijest            # TO CREATE
/kontakt                    # ✓ Exists
/prijava-problema           # ✓ Exists
/natjecaji                  # TO CREATE (footer link)
```

---

## Writing Guidelines

### Tone & Style
- **Formal but accessible** Croatian
- **Clear and concise** - government website style
- **Informative** - focus on practical information for citizens
- **No marketing fluff** - straightforward facts

### Structure
- Start with a brief introduction (1-2 sentences)
- Use headings (h2, h3) to organize content
- Use bullet lists for services, contacts, requirements
- Include relevant images where available
- End with contact info or next steps where appropriate

### SEO
- Title should be descriptive (will become page title)
- First paragraph should summarize the page content
- Use natural Croatian keywords

---

## How to Create/Edit Pages

### Via Admin Panel (Recommended)
1. Go to http://100.120.125.83:3001/pages
2. Click "Nova stranica" (New page)
3. Enter title and slug
4. Use the TipTap editor for content
5. Save and publish

### Via Database (For bulk operations)
Pages are stored in the `Page` table with fields:
- `id` (UUID)
- `title` (string)
- `slug` (string) - must match URL path without leading slash
- `content` (string) - TipTap JSON
- `isPublished` (boolean)
- `createdAt`, `updatedAt` (timestamps)

---

## Files to Reference

| File | Purpose |
|------|---------|
| `scripts/migration/output/pages.json` | All old WordPress page content |
| `scripts/migration/output/media-url-map.json` | Old URL → New R2 URL mapping |
| `docs/page-url-audit.md` | Complete URL audit with missing pages |
| `apps/web/lib/navigation.ts` | Navigation structure |
| `Grb Veliki Bukovec.png` | Municipality coat of arms |

---

## Example: Creating the Povijest Page

**Slug**: `opcina/povijest`
**Title**: Povijest Velikog Bukovca

**Content outline**:
1. Introduction - Brief overview of historical significance
2. 16th Century - Origins, Sekelj family
3. Drašković Era (1643+) - Ivan Drašković, estate formation
4. Castle Construction (1745-1755) - Josip Kazimir Drašković
5. 19th Century - Karlo Drašković, Illyrian movement connection
6. 20th Century - Pavao Drašković, modernization, WWII
7. Return of Castle - 1990s restoration to Drašković family
8. Images - Castle photos, coat of arms, historical images

**Source**: Extract and reorganize from `o-nama` page in pages.json

---

## Checklist for Each New Page

- [ ] Slug matches expected URL in navigation
- [ ] Title is clear and descriptive
- [ ] Content is in Croatian
- [ ] Images use R2 URLs (not old WordPress URLs)
- [ ] Links to other pages use correct new slugs
- [ ] No broken external links
- [ ] Contact info is current
- [ ] Page is published (isPublished: true)
