# FEATURES.md - Product Specification

> Complete feature specification for the Veliki Bukovec municipality website.
> Last updated: 2026-01-23

## Table of Contents

1. [Public Site Structure](#public-site-structure)
2. [Admin Panel](#admin-panel)
3. [Search Experience](#search-experience)
4. [Newsletter System](#newsletter-system)
5. [Image Storage](#image-storage)
6. [AI Features](#ai-features)
7. [External Integrations](#external-integrations)

---

## Public Site Structure

**Language:** Croatian only (no i18n needed)

### Full Site Menu (from client)

```
NASLOVNICA (Homepage)
├── Istaknute vijesti (Featured news)
├── Brze poveznice (Quick links): Natječaji, Prijava problema, Odvoz otpada, Vijesti
├── Fotografije naselja
├── Tjedni raspored odvoza otpada
├── Aktualni natječaji
├── Prijava problema (anonymous option)
└── Najave događanja (Event announcements)

1. ORGANIZACIJA
├── Općinska uprava
│   └── Načelnik (description, duties)
├── Općinsko vijeće
│   ├── Sastav vijeća
│   ├── Predsjednik vijeća
│   └── Vijećnici po mandatima (archive)
├── Sjednice Općinskog vijeća
│   ├── Description, participation info
│   ├── Statut i poslovnik
│   └── Odbori i komisije
└── Jedinstveni upravni odjel
    └── Djelokrug, zaposlenici, kontakti

2. RAD UPRAVE
├── Javna nabava (→ external e-nabava link)
├── Natječaji (→ external e-nabava link)
├── Komunalno gospodarstvo
│   ├── Održavanje groblja
│   ├── Gospodarenje otpadom
│   ├── Zimska služba
│   ├── Javna rasvjeta
│   ├── Dimnjačarske usluge
│   ├── Komunalne djelatnosti
│   ├── Komunalni redar
│   ├── Komunalni red
│   ├── Komunalna infrastruktura
│   ├── Komunalna naknada
│   └── Komunalni doprinos
├── Financiranje udruga i pomoći
├── Društvena odgovornost (sponzorstva/donacije)
├── Kutak za mještane
│   ├── Potpore za novorođenčad
│   ├── Potpore mladim obiteljima
│   ├── Potpore umirovljenicima
│   ├── Srednjoškolci i studenti
│   ├── Predškolski odgoj
│   ├── Potpore poljoprivrednicima
│   └── Socijalne potpore
└── Registri, baze podataka i ugovori
    ├── Registar imovine
    ├── Nerazvrstane ceste
    ├── Ugovori (by year)
    ├── Registar ugovora javna nabava
    ├── Registar ugovora jednostavna nabava
    └── Evidencija komunalne infrastrukture

3. VIJESTI (News - categorized)
├── Općinske aktualnosti
├── Gospodarstvo
├── Sport
├── Komunalne teme
├── Kultura
├── Obrazovanje
├── Ostalo
└── Arhiva vijesti

4. DOKUMENTI
├── Sjednice Općinskog vijeća (odluke, pozivi, zapisnici)
├── Lokalni izbori
├── Planovi (prostorni, razvoj)
├── Pravo na pristup informacijama
├── Obrasci
├── Strateški dokumenti
├── Savjetovanje s javnošću (→ external e-savjetovanja link)
├── Zakoni i propisi
├── Odluke načelnika
├── Korištenje društvenih domova
└── Proračun
    ├── Proračun (donošenje, izmjene, by year)
    ├── Transparentnost proračuna (→ external MOBES link)
    ├── Sudjelovanje mještana
    └── Financijski izvještaji

5. PREDŠKOLSKI ODGOJ I OBRAZOVANJE
├── Osnovna škola Veliki Bukovec
└── Dječji vrtić Krijesnica Veliki Bukovec

6. DOŽIVI OPĆINU
├── Mjesto dobrih i radišnih ljudi (history, description)
├── Rekreacija i odmor (nature, Natura 2000, Mura-Drava)
├── Znamenitosti i kulturna baština
│   ├── Crkva sv. Franje Asiškog
│   ├── Dvorac Drašković
│   ├── Pil sv. Ivana Nepomuka
│   ├── Kuća Poculica
│   ├── Crkvica Kapela Podravska
│   └── Crkvica Dubovica
├── Smještaj i gastro
│   └── Eko-etno selo sv. Franje Asiškog
└── Poslovni subjekti (list with locations)

7. INFO
├── Naselja
│   ├── Veliki Bukovec
│   ├── Dubovica
│   └── Kapela Podravska
├── Ustanove i usluge
│   ├── Općina
│   ├── Trgovine
│   ├── Poljoprivredna apoteka
│   ├── Groblje
│   ├── Pošta
│   ├── Ugostiteljski objekti
│   └── Sportski tereni (NK Bukovčan, NK Poljoprivrednik, etc.)
├── Udruge (10+ associations listed)
├── Župa Veliki Bukovec
├── Foto galerija (by albums)
├── Pitaj načelnika (email form)
└── Prijava problema (tracked in admin)

8. KONTAKT
├── Kontakti općine
├── Radno vrijeme
└── Lokacija i karta
```

### External Links (No Integration)

| Feature | Destination | Notes |
|---------|-------------|-------|
| Javna nabava (Tenders) | e-nabava portal | External government system |
| Savjetovanja s javnošću | e-savjetovanja portal | External government system |
| Transparentnost proračuna | MOBES | External budget transparency |

### Special Features

| Feature | Implementation |
|---------|---------------|
| Problem reporting | Form → stored in admin + email notification |
| Contact form | Form → stored in admin + email notification |
| Ask the mayor | Simple email form (no tracking) |
| Waste schedule | Static predefined table |
| Photo gallery | Album-based organization |

---

## Admin Panel

### Admin Screens

| Screen | Features |
|--------|----------|
| Dashboard | Stats cards, charts, recent activity, quick actions, top pages |
| Posts | List, create, edit, delete, AI generation, Facebook posting |
| Documents | Upload, categorize, organize by year |
| Events | Calendar view, month navigation, CRUD |
| Gallery | Album management, drag-drop upload, bulk operations |
| Contact Inbox | View messages, status tracking |
| Problem Reports | View reports, status workflow |
| Settings | User profile, site basics |
| Users | User management (admin/super admin only) |

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD                                                │
├─────────────────────────────────────────────────────────────────┤
│  STATS CARDS                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Visitors │ │ Posts    │ │ Documents│ │ Unread   │          │
│  │ Today    │ │ This Mo. │ │ Total    │ │ Messages │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  CHARTS                                                         │
│  ┌───────────────────────┐  ┌───────────────────────┐          │
│  │ Visitors (7d/30d)     │  │ Content by Category   │          │
│  │ [Line chart]          │  │ [Pie/Bar chart]       │          │
│  └───────────────────────┘  └───────────────────────┘          │
│                                                                 │
│  RECENT ACTIVITY                                                │
│  • Post "XYZ" published by Staff 1         (2h ago)             │
│  • Document uploaded by Admin              (yesterday)          │
│  • New contact message received            (yesterday)          │
│                                                                 │
│  QUICK ACTIONS                                                  │
│  [+ Nova objava] [+ Dodaj dokument] [Pregled poruka]           │
│                                                                 │
│  TOP PAGES (from Cloudflare Analytics)                          │
│  1. /vijesti/nova-cesta - 234 views                            │
│  2. /kontakt - 156 views                                        │
│  3. /dokumenti/proracun-2026 - 89 views                        │
└─────────────────────────────────────────────────────────────────┘
```

### Settings Page

```
┌─────────────────────────────────────────────────────────────────┐
│  SETTINGS                                                       │
├─────────────────────────────────────────────────────────────────┤
│  USER PROFILE                                                   │
│  • Change password                                              │
│  • Setup/manage 2FA                                             │
│  • Manage passkeys                                              │
│  • View active sessions                                         │
│  • Revoke sessions                                              │
│                                                                 │
│  SITE BASICS (Admin/Super Admin only)                           │
│  • Site name                                                    │
│  • Contact information (address, phone, email)                  │
│  • Working hours                                                │
│  • Social media links (Facebook, etc.)                          │
│  • Footer text                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Content Types

| Content Type | Fields | Notes |
|--------------|--------|-------|
| **Vijesti (News)** | title, content (rich), images[], category, date, featured? | AI-assisted creation |
| **Dokumenti (Documents)** | title, file (PDF), category, date, year | Many categories |
| **Događanja (Events)** | title, description, date, time, location, poster image | Calendar view |
| **Galerija (Gallery)** | album name, description, images[] | Album-based, drag-drop |
| **Prijave problema** | type, location, description, images[], status | Tracked in admin |
| **Kontakt poruke** | name, email, subject, message, status | Admin inbox |
| **Newsletter pretplatnici** | email, confirmed, date | List + manual send |
| **Stranice (Static pages)** | title, content (rich), images[] | For landmarks, associations, etc. |

### News Categories

- Općinske aktualnosti
- Gospodarstvo
- Sport
- Komunalne teme
- Kultura
- Obrazovanje
- Ostalo

### Document Categories

- Sjednice Općinskog vijeća
- Lokalni izbori
- Planovi
- Pravo na pristup informacijama
- Obrasci
- Strateški dokumenti
- Zakoni i propisi
- Odluke načelnika
- Korištenje društvenih domova
- Proračun (subcategories: main, transparency, participation, reports)

---

## Search Experience

**Goal:** Premium "Stripe-like" search that makes users say "wow"

### Requirements

```
┌─────────────────────────────────────────────────────────────────┐
│  SEARCH UX REQUIREMENTS                                         │
├─────────────────────────────────────────────────────────────────┤
│  INSTANT                                                        │
│  • Results appear as user types (debounced 150ms)               │
│  • No page reload, no loading spinner for initial results       │
│  • Keyboard navigation (↑↓ to select, Enter to go)              │
│  • Escape to close                                              │
│                                                                 │
│  BEAUTIFUL                                                      │
│  • Full-screen modal/overlay on trigger                         │
│  • Smooth open/close animations (Framer Motion)                 │
│  • Results categorized (Vijesti, Dokumenti, Stranice, Događaji) │
│  • Highlighted matching text in results                         │
│  • Rich result cards (not just text links)                      │
│  • Recent searches remembered                                   │
│                                                                 │
│  SMART (AI-powered)                                             │
│  • Semantic search using embeddings (same as chatbot)           │
│  • Understands synonyms ("vijest" = "novost" = "članak")        │
│  • Suggests related content                                     │
│  • "Did you mean...?" for typos                                 │
│  • Works with Croatian language properly                        │
└─────────────────────────────────────────────────────────────────┘
```

### Search Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  HYBRID SEARCH                                                  │
├─────────────────────────────────────────────────────────────────┤
│  1. Keyword search (PostgreSQL full-text)                       │
│     → Fast, exact matches                                       │
│     → Croatian language stemming                                │
│                                                                 │
│  2. Semantic search (pgvector embeddings)                       │
│     → Finds conceptually similar content                        │
│     → Same embeddings used for chatbot                          │
│                                                                 │
│  3. Hybrid ranking                                              │
│     → Combine both scores                                       │
│     → Boost exact matches                                       │
│     → Recent content ranks higher                               │
└─────────────────────────────────────────────────────────────────┘
```

### Search UI Mockup

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Pretraži stranicu...                              [⌘K]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [User types: "javna nabava"]                                   │
│                                                                 │
│  VIJESTI                                                        │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 📰 Obavijest o javnoj nabavi za 2026.         ↵ Enter    │ │
│  │    "...postupak javne nabave za nabavu..."   23.01.2026   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  DOKUMENTI                                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 📄 Plan nabave 2026.pdf                                   │ │
│  │    Javna nabava > Planovi                    15.01.2026   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ────────────────────────────────────────────────────────────── │
│  Pritisni ↵ za otvaranje  •  ↑↓ za navigaciju  •  ESC za izlaz │
└─────────────────────────────────────────────────────────────────┘
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `⌘K` / `Ctrl+K` | Open search (global) |
| `↑` `↓` | Navigate results |
| `Enter` | Open selected result |
| `ESC` | Close search |
| `Tab` | Switch between result categories |

---

## Newsletter System

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  NEWSLETTER SYSTEM                                              │
├─────────────────────────────────────────────────────────────────┤
│  SUBSCRIPTION                                                   │
│  • Email signup widget on public site (footer, dedicated page)  │
│  • Double opt-in (confirmation email)                           │
│  • GDPR-compliant consent                                       │
│  • Unsubscribe link in every email                              │
│                                                                 │
│  CONTENT                                                        │
│  • Automated weekly digest (every Monday 8:00)                  │
│  • Includes: New posts from past 7 days                         │
│  • Includes: Upcoming events                                    │
│  • Includes: New important documents (if any)                   │
│  • Skip if no new content (don't send empty newsletters)        │
│                                                                 │
│  ADMIN                                                          │
│  • View subscriber list (count, recent signups)                 │
│  • Manual newsletter trigger (for important announcements)      │
│  • Preview before sending                                       │
│  • Basic stats (sent, opened - if email provider supports)      │
│                                                                 │
│  TECHNICAL                                                      │
│  • Send via @velikibukovec.hr SMTP                              │
│  • HTML email template (responsive, Croatian)                   │
│  • Plain text fallback                                          │
│  • Cron job for weekly send                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Email Template

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]  OPĆINA VELIKI BUKOVEC                                  │
│          Tjedni pregled                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📰 VIJESTI OVOG TJEDNA                                         │
│  ─────────────────────────                                      │
│  • [Link] Naslov vijesti 1                          23.01.      │
│  • [Link] Naslov vijesti 2                          22.01.      │
│  • [Link] Naslov vijesti 3                          20.01.      │
│                                                                 │
│  📅 NADOLAZEĆI DOGAĐAJI                                         │
│  ─────────────────────────                                      │
│  • 28.01. - Sjednica Općinskog vijeća                           │
│  • 02.02. - Kulturna večer u DVD-u                              │
│                                                                 │
│  📄 NOVI DOKUMENTI                                              │
│  ─────────────────────────                                      │
│  • [Link] Zapisnik sjednice 15.01.2026                          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Općina Veliki Bukovec | velikibukovec.hr                       │
│  [Odjava iz newslettera]                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Image Storage

### Cloudflare R2 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  IMAGE UPLOAD & STORAGE FLOW                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Admin Upload                                                   │
│  ┌─────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │ Browser │ -> │ Admin API (VPS) │ -> │ Sharp Process   │     │
│  │ (file)  │    │ Receives upload │    │ on VPS          │     │
│  └─────────┘    └─────────────────┘    └─────────────────┘     │
│                                              │                  │
│                                              ▼                  │
│                                    ┌─────────────────────────┐ │
│                                    │ Cloudflare R2 Bucket    │ │
│                                    │ /images/                │ │
│                                    │   ├── original/         │ │
│                                    │   ├── thumb/ (150px)    │ │
│                                    │   ├── medium/ (600px)   │ │
│                                    │   └── large/ (1200px)   │ │
│                                    └─────────────────────────┘ │
│                                              │                  │
│  Public Site                                 ▼                  │
│  ┌─────────────────┐    ┌─────────────────────────┐            │
│  │ Cloudflare CDN  │ <- │ R2 Public URL           │            │
│  │ (edge cache)    │    │ r2.velikibukovec.hr/*   │            │
│  └─────────────────┘    └─────────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Image Processing Pipeline

```typescript
// On upload to admin:
1. Receive file from browser (max 10MB)
2. Validate: JPEG, PNG, WebP, GIF only
3. Sharp processing on VPS:
   - Strip EXIF/metadata (privacy)
   - Convert to WebP (smaller files)
   - Generate variants:
     • thumb:  150px wide (lists, previews)
     • medium: 600px wide (content)
     • large:  1200px wide (gallery, hero)
     • original: preserved for download
4. Upload all variants to R2
5. Store R2 URLs in database
```

### Database Image References

```sql
-- Images table stores all variants
image (
  id UUID,
  original_filename VARCHAR,
  mime_type VARCHAR,
  size_bytes INTEGER,
  r2_key_original VARCHAR,  -- images/original/uuid.webp
  r2_key_thumb VARCHAR,     -- images/thumb/uuid.webp
  r2_key_medium VARCHAR,    -- images/medium/uuid.webp
  r2_key_large VARCHAR,     -- images/large/uuid.webp
  alt_text VARCHAR,
  created_at TIMESTAMP
)

-- Posts reference images via junction table
post_image (
  post_id UUID,
  image_id UUID,
  position INTEGER,  -- for ordering
  is_featured BOOLEAN DEFAULT false
)
```

### Public Site Image Loading

```typescript
// Custom R2 image loader for Next.js static export
// (default next/image optimizer not available in static export)

const r2Loader = ({ src, width }) => {
  // Map requested width to R2 variant
  if (width <= 150) return `${R2_URL}/thumb/${src}`;
  if (width <= 600) return `${R2_URL}/medium/${src}`;
  return `${R2_URL}/large/${src}`;
};

// Usage in components
<Image
  loader={r2Loader}
  src="abc123.webp"
  width={600}
  height={400}
  alt="Description"
/>
```

### R2 Bucket Structure

```
velikibukovec-media/
├── images/
│   ├── original/
│   │   └── {uuid}.webp
│   ├── thumb/
│   │   └── {uuid}.webp
│   ├── medium/
│   │   └── {uuid}.webp
│   └── large/
│       └── {uuid}.webp
├── documents/
│   └── {uuid}.pdf
└── gallery/
    ├── {album-slug}/
    │   └── {uuid}.webp
    └── ...
```

### Cost Structure

| Usage | Cost |
|-------|------|
| Storage | $0.015/GB/month |
| Class A ops (writes) | $4.50/million |
| Class B ops (reads) | $0.36/million |
| Egress | **FREE** (zero egress fees) |

Estimated monthly: ~€2-5 for municipality-scale usage.

---

## AI Features

### LLM Provider & Queue System

```
┌─────────────────────────────────────────────────────────────────┐
│  OLLAMA CLOUD INTEGRATION                                       │
├─────────────────────────────────────────────────────────────────┤
│  Provider: Ollama Cloud (Pro/Max plan)                          │
│  Model: Llama 3.1 70B                                           │
│  Local embeddings: Ollama on VPS (nomic-embed-text)             │
│                                                                 │
│  RATE LIMIT HANDLING: Queue + Retry                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  1. User initiates AI generation                          │ │
│  │  2. Request added to ai_queue table (status: pending)     │ │
│  │  3. Worker picks up request                               │ │
│  │  4. If rate limited → back off, retry later (max 3)       │ │
│  │  5. If success → store result, notify user                │ │
│  │  6. User sees: "Your content is being generated..."       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Queue Status UI:                                               │
│  • Pending: "Generating your content..." (spinner)              │
│  • Processing: "AI is writing..." (progress indicator)          │
│  • Completed: Content appears in editor for review              │
│  • Failed: "Generation failed. Try again?" (retry button)       │
└─────────────────────────────────────────────────────────────────┘
```

### Content Generation Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: INPUT (Mobile-friendly)                                │
│  ┌──────────────┐  ┌─────────────────────────────────┐         │
│  │ 📷 Photo(s)   │  │ ✏️ Short notes/tips              │         │
│  │ 1 or more    │  │ (can use phone dictation)       │         │
│  └──────────────┘  └─────────────────────────────────┘         │
│                                                                 │
│  → Request queued in ai_queue table                             │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: RESEARCH (Automatic)                                   │
│  AI searches Google for context about the topic                 │
│  → Finds relevant recent news                                   │
│  → Understands current context                                  │
│  → Avoids outdated information                                  │
│                                                                 │
│  → If rate limited: retry in 30s (up to 3 attempts)             │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: DRAFT (LLM generates)                                  │
│  Llama 3.1 70B creates article in formal Croatian               │
│  → Proper structure (title, intro, body, conclusion)            │
│  → Uses municipality voice/tone                                 │
│  → Includes relevant local context                              │
│                                                                 │
│  → If rate limited: retry in 30s (up to 3 attempts)             │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: SELF-REVIEW (Anti-slop check)                          │
│  AI reviews its own output for:                                 │
│  → Generic phrases ("in today's world", "exciting news")        │
│  → Factual accuracy                                             │
│  → Appropriate tone for municipality                            │
│  → Proper Croatian grammar                                      │
│  If issues found → regenerate specific parts                    │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: HUMAN REVIEW (ALWAYS REQUIRED)                         │
│  Staff member reviews and can:                                  │
│  → Edit any part in rich text editor                            │
│  → Request regeneration of sections                             │
│  → Add/remove images                                            │
│  → Approve and publish                                          │
│  → Optional: Post to Facebook                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Chatbot (RAG)

```
┌─────────────────────────────────────────────────────────────────┐
│  KNOWLEDGE SOURCES                                              │
├─────────────────────────────────────────────────────────────────┤
│  1. All site content (pages, news, info)                        │
│  2. Documents folder (PDFs uploaded by staff)                   │
│     → Automatically processed when added                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  DOCUMENT PROCESSING PIPELINE                                   │
├─────────────────────────────────────────────────────────────────┤
│  1. PDF uploaded to documents folder                            │
│  2. Extract text from PDF                                       │
│  3. Chunk into smaller pieces (~500 tokens each)                │
│  4. Generate embeddings (vector representation)                 │
│  5. Store in PostgreSQL + pgvector                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  QUERY FLOW (citizen asks question)                             │
├─────────────────────────────────────────────────────────────────┤
│  1. User asks: "Kada je radno vrijeme općine?"                  │
│  2. Generate embedding for question                             │
│  3. Search vector DB for similar content chunks                 │
│  4. Pass relevant chunks + question to LLM                      │
│  5. LLM generates answer based on actual content                │
│  6. Return answer with source reference                         │
└─────────────────────────────────────────────────────────────────┘
```

**Chatbot Capabilities:**
- Office hours, contacts, locations
- Document contents (can answer "what does decision X say?")
- Procedures (how to apply for X)
- General municipal info
- Links to relevant pages/documents

---

## External Integrations

### Facebook

- Post to municipality Facebook page when publishing news
- Preview before posting
- Optional (checkbox in publish flow)
- Requires: Facebook App setup, Page token

### Email (SMTP)

- Send via @velikibukovec.hr
- Used for: Contact form confirmations, newsletter, password reset
- Requires: SMTP credentials

### Cloudflare Analytics

- Visitor statistics displayed in admin dashboard
- Top pages
- Geographic data (if available)
- No separate analytics setup needed

### Google Search API

- Used by AI for content research
- Finds relevant context before generating articles
- Requires: Google Search API key, Custom Search Engine ID
