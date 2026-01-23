# WebVB Project - Decision Log

## Project Overview
**Client:** Općina Veliki Bukovec (Croatian municipality)
**Goal:** Digital transformation - modern website with AI features, headless CMS, email migration
**Contract Value:** €5,250 (incl. PDV)
**Deadline:** 60 days from contract signing
**Importance:** Showcase project - must be flawless

---

## Discussion Log

### Session 1 - 2026-01-23

#### Topic 1: Hosting Architecture

**Discussed:**
- Initial idea: Small VPS + Siteground for static site + Next.js/React
- Concern raised: Siteground is shared hosting, not optimal for Next.js
- Alternatives suggested: Vercel, Cloudflare Pages, Netlify

**Decided:**
- Keep Siteground (already paid for)
- Front with Cloudflare CDN for caching and performance
- Static export from Next.js

**Why:**
- Cost-effective (no additional hosting costs)
- Cloudflare caching means origin (Siteground) rarely hit
- For a mostly-static municipal site, this is sufficient
- 95%+ requests served from Cloudflare edge

---

#### Topic 2: API Routes Limitation

**Discussed:**
- Static Next.js export loses API routes capability
- User concerned about not having APIs on the site

**Decided:**
- Use Cloudflare Workers for API routes instead of Next.js API routes

**Why:**
- Already using Cloudflare (no extra vendor)
- APIs run at the edge (faster than origin-based APIs)
- Serverless - no server management overhead
- Protects sensitive API keys (AI services)
- Free tier: 100k requests/day
- Same domain routing, no CORS issues
- Cleaner separation of concerns

**API responsibilities (Cloudflare Workers):**
- Contact form submissions
- Chatbot proxy (hides OpenAI/Anthropic keys)
- WordPress content fetching (with caching)
- Facebook posting triggers

---

#### Topic 4: WordPress vs Custom CMS

**Discussed:**
- Original plan was headless WordPress for CMS
- Client profile: older staff, not tech-savvy, "afraid of tech"
- WordPress admin panel is too complex even in headless mode
- Need maximum simplicity and minimal friction UX

**Decided:**
- **DROP WordPress entirely**
- Build custom admin panel tailored to exact needs
- Single tech stack: JavaScript/TypeScript everywhere

**Why:**
- WordPress has 70+ database tables, we need ~5
- WordPress UI designed for developers, not municipal office workers
- Complete control over UX for non-tech users
- No PHP = simpler stack (Node.js only on VPS)
- AI integration is seamless (same ecosystem)
- Showcase project benefit: proves we can architect from scratch
- Lighter, faster, more secure (smaller attack surface)

**UX principles established:**
- Big buttons, clear Croatian labels
- No jargon, no settings pages
- Confirmation before actions
- Undo capability
- Friendly messages, no scary red errors
- AI does heavy lifting (expand text, suggest Facebook version)

**What we need to build:**
- Auth system (NextAuth.js)
- Posts/News CRUD
- Document uploads
- Events calendar
- Simple statistics
- AI content assistance

---

#### Topic 3: VPS Provider & AI Services

**Discussed:**
- VPS provider selection
- AI service for chatbot and content generation

**Decided:**
- VPS: Netcup (German provider)
- AI: Ollama Cloud at €20/month

**Why:**
- Netcup: Good price/performance ratio, EU-based (GDPR friendly for Croatian municipality), reliable
- Ollama Cloud:
  - Predictable monthly cost (€20 flat)
  - No need to self-host GPU infrastructure
  - Access to open-source models (Llama, Mistral, etc.)
  - API-based = simpler integration via Cloudflare Workers
  - Can switch models without infrastructure changes

**DECIDED - AI Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│  LLM CALLS (content generation, chatbot responses)              │
│  → Ollama Cloud (€20/mo)                                        │
│  → Model: Llama 3.1 70B                                         │
│  → Why cloud: 70B too large for VPS, needs GPU                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  EMBEDDINGS (RAG vector search)                                 │
│  → Local Ollama on VPS                                          │
│  → Model: nomic-embed-text or mxbai-embed-large                 │
│  → Why local: frequent calls, small model fits in 8GB RAM       │
│  → Saves API costs for high-volume embedding operations         │
└─────────────────────────────────────────────────────────────────┘
```

**Cost structure:**
| Service | Monthly Cost |
|---------|--------------|
| Siteground | Already paid |
| Cloudflare (CDN, DNS, Analytics) | Free tier |
| Cloudflare Workers | Free tier (100k req/day) |
| Cloudflare R2 (backups) | ~€5-10 estimated |
| Netcup VPS 1000 G12 | ~€8 |
| Ollama Cloud | €20 |
| **Total recurring** | **~€33-38/month** |

---

## Current Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                          CLOUDFLARE                                │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐     │
│  │   Workers   │    │     CDN      │    │       CDN         │     │
│  │   (APIs)    │    │ Public Site  │    │   Admin Panel     │     │
│  │   /api/*    │    │velikibukovec │    │ admin.velikibuk.. │     │
│  └──────┬──────┘    └──────┬───────┘    └─────────┬─────────┘     │
│         │                  │                      │               │
│  ┌──────┴──────┐           │                      │               │
│  │  Analytics  │           │                      │               │
│  │     API     │           │                      │               │
│  └─────────────┘           │                      │               │
└─────────│──────────────────│──────────────────────│───────────────┘
          │                  │                      │
          │                  ▼                      │
          │         ┌──────────────┐                │
          │         │  Siteground  │                │
          │         │ (Static site)│                │
          │         └──────────────┘                │
          │                                         │
          └────────────────────┬────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        NETCUP VPS 1000 G12                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ PostgreSQL  │  │   Node.js   │  │    Ollama (local)       │  │
│  │ + pgvector  │  │  Admin App  │  │  Embeddings only        │  │
│  │             │  │  Next.js    │  │  (nomic-embed-text)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │ Ollama Cloud │ │   Facebook   │ │ Cloudflare   │
     │ Llama 3.1 70B│ │  Graph API   │ │     R2       │
     │  (€20/mo)    │ │              │ │  (Backups)   │
     └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Open Questions - RESOLVED
- [x] VPS budget and specs? → Netcup VPS 1000 G12
- [x] Which AI provider? → Ollama Cloud (€20/mo)
- [x] Self-hosted AI or API-based? → API-based
- [x] WordPress or custom? → Custom CMS (dropped WordPress)

---

## Tech Stack (Current)
| Component | Technology | Status |
|-----------|------------|--------|
| Public Site | Next.js + React (static export) | Decided |
| Admin Panel | Next.js (SSR) on VPS | Decided |
| Static Hosting | Siteground + Cloudflare CDN | Decided |
| APIs | Cloudflare Workers | Decided |
| Database | PostgreSQL + pgvector (for RAG) | Decided |
| ORM | Prisma | Decided |
| Auth | NextAuth.js | Decided |
| Rich Text Editor | TipTap | Decided |
| Styling | Tailwind CSS | Decided |
| UI Components | shadcn/ui (Radix-based) | Decided |
| Animations | Framer Motion | Decided |
| State Management | React Query + Context | Decided |
| VPS | Netcup VPS 1000 G12 | Decided |
| AI Services | Ollama Cloud (€20/month) | Decided |
| LLM Model | Llama 3.1 70B (via Ollama Cloud) | Decided |
| Embeddings | Local Ollama on VPS (self-hosted) | Decided |
| Email sending | @velikibukovec.hr SMTP | Decided |
| File Storage | VPS initially, plan for R2 migration | Decided |
| Analytics | Cloudflare Analytics → Admin UI | Decided |
| Backups | Daily to Cloudflare R2, 3 month retention | Decided |
| Facebook | Graph API (you handle auth) | Decided |
| SSL | Cloudflare (both domains proxied) | Decided |

---

## GAPS TO DEFINE (Before Development)

### 1. Authentication & Users
- [x] How many admin users? → 3 roles defined
- [x] Password reset flow needed? → Yes, email-based
- [x] Session duration? → 30 days with "Remember me", 24h without
- [x] Role separation? → Yes, 3 tiers
- [x] Auth methods → Industry standard (see below)

**DECIDED - Authentication System (Industry Standard):**
```
┌─────────────────────────────────────────────────────────────────┐
│  AUTHENTICATION METHODS                                         │
├─────────────────────────────────────────────────────────────────┤
│  1. Email + Password (traditional)                              │
│     • Strong password requirements (min 12 chars, complexity)   │
│     • Secure password hashing (bcrypt/argon2)                   │
│                                                                 │
│  2. Google OAuth (Gmail login)                                  │
│     • One-click login for convenience                           │
│     • Only whitelisted emails can register                      │
│                                                                 │
│  3. Passkeys (WebAuthn)                                         │
│     • Modern passwordless authentication                        │
│     • Supports hardware keys (YubiKey, etc.)                    │
│     • Supports platform authenticators (Touch ID, Face ID)      │
│                                                                 │
│  4. Biometric (via Passkeys)                                    │
│     • Fingerprint (Touch ID)                                    │
│     • Face recognition (Face ID, Windows Hello)                 │
│     • Device-native biometric prompts                           │
│                                                                 │
│  5. Two-Factor Authentication (2FA)                             │
│     • TOTP apps (Google Authenticator, Authy)                   │
│     • Required for Super Admin                                  │
│     • Optional but encouraged for Admin/Staff                   │
│                                                                 │
│  6. Password Reset                                              │
│     • Email-based secure reset link                             │
│     • Time-limited tokens (1 hour expiry)                       │
│     • Rate limited (max 3 requests per hour)                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SESSION MANAGEMENT                                             │
├─────────────────────────────────────────────────────────────────┤
│  • Default session: 24 hours                                    │
│  • "Remember me" session: 30 days                               │
│  • Refresh tokens: Auto-refresh if active                       │
│  • Session invalidation on password change                      │
│  • Concurrent session limit: 5 devices per user                 │
│  • Session revocation from settings page                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  USER MANAGEMENT (Admin & Super Admin)                          │
├─────────────────────────────────────────────────────────────────┤
│  Super Admin can:                                               │
│  • Create/edit/delete ALL users                                 │
│  • Assign any role                                              │
│  • Force password reset                                         │
│  • View all sessions, revoke any session                        │
│  • View audit logs                                              │
│                                                                 │
│  Admin can:                                                     │
│  • Create/edit Staff users only                                 │
│  • Cannot create other Admins                                   │
│  • Cannot modify Super Admin                                    │
│  • View own sessions only                                       │
│                                                                 │
│  Staff can:                                                     │
│  • Edit own profile only                                        │
│  • Manage own sessions                                          │
│  • Cannot manage other users                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Tech Implementation:**
- NextAuth.js with multiple providers
- @simplewebauthn/server for Passkeys/WebAuthn
- Google OAuth provider
- Credentials provider with bcrypt
- TOTP via otplib for 2FA

**DECIDED - User Roles:**
| Role | Who | Permissions |
|------|-----|-------------|
| Super Admin | Developer (you) | Full system access, settings, user management, logs, everything |
| Admin | Načelnik (mayor) | Full content management, CAN DELETE posts/docs, manage Staff users |
| Staff | Staff members | Create/edit posts, add documents, authorize/publish posts, CANNOT delete |

**Content authorization:** Staff can publish directly (no admin approval bottleneck)

### 2. Public Site Structure
- [x] Full structure received from client - see below
- [x] Settlements: 3 (Veliki Bukovec, Dubovica, Kapela Podravska)
- [x] Gallery: Album-based (custom albums, manual organization)
- [x] Multi-language: Croatian only (no translation system)

**DECIDED - Full Site Structure (from client):**

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
├── Javna nabava (procurement + forms)
├── Natječaji (open/closed tenders)
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
├── Savjetovanje s javnošću (u tijeku / završena)
├── Zakoni i propisi
├── Odluke načelnika
├── Korištenje društvenih domova
└── Proračun
    ├── Proračun (donošenje, izmjene, by year)
    ├── Transparentnost proračuna (MOBES link)
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
├── Foto galerija (by events)
├── Pitaj načelnika (email form)
└── Prijava problema (type, location, description, anonymous)

8. KONTAKT
├── Kontakti općine
├── Radno vrijeme
└── Lokacija i karta
```

**Special features identified:**
- Problem reporting → Tracked in admin (status: new/in-progress/resolved) + email notification
- "Ask the mayor" → Email to mayor
- Waste collection schedule → Static predefined table (not dynamic)
- Tenders → TBD (check if external e-nabava portal)
- Public consultations → External link only (e-savjetovanja portal)
- Budget transparency → External link only (MOBES)
- Photo gallery → Album-based (custom albums, manual organization)
- Many static info pages (landmarks, associations, settlements)
- Contact form → Email + stored in admin inbox with status tracking

**External Links (confirmed):**
- MOBES (proračunska transparentnost) → External link
- Budget transparency → External link
- Public consultations (e-savjetovanja) → External link
- Tenders → TBD (check with client if e-nabava is used)

**Simplifications decided:**
- "Ask mayor" = simple email (no tracking)
- Waste schedule is static content, not database-driven
- Language: Croatian only (no i18n needed)

### 3. Admin Panel Screens
- [x] Dashboard - Full analytics (charts, visitor demographics, content performance)
- [x] Posts/News - title, content, images, date, category, featured flag, Facebook integration
- [x] Documents - categories from client proposal (Odluke, Zapisnici, etc.)
- [x] Events - Calendar view with month navigation, title, date/time, location, description
- [x] Gallery - Album-based management (create albums, drag-drop upload, bulk operations)
- [x] Settings page - User profile + Site basics (contact info, social links, working hours)
- [x] Contact inbox - View contact form submissions with status
- [x] Problem reports - View reports with status tracking (new/in-progress/resolved)

**DECIDED - Dashboard Content:**
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

**DECIDED - Settings Page:**
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

### 4. AI Features (Detailed)
- [x] Content generation - defined below
- [x] Facebook - approval flow before posting
- [x] Chatbot - in scope, integrated LAST. RAG-based.
- [x] Croatian language - Human review ALWAYS before publish (catches language errors)

**DECIDED - Chatbot Architecture (RAG):**
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

**Chatbot capabilities:**
- Office hours, contacts, locations
- Document contents (can answer "what does decision X say?")
- Procedures (how to apply for X)
- General municipal info
- Links to relevant pages/documents

**DECIDED - Simplifications:**
- Voice dictation: Use phone's native (not our implementation)
- AI research: Google Search for topic context
- Rich text editor: Full editing capability for everyone
- Images: Multiple images can be embedded in article body
- Authorization: Staff can publish directly, no admin approval needed

**DECIDED - AI Content Creation Pipeline (Mobile-First):**

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: INPUT (Mobile-friendly)                                │
│  ┌──────────────┐  ┌─────────────────────────────────┐         │
│  │ 📷 Photo(s)   │  │ ✏️ Short notes/tips              │         │
│  │ 1 or more    │  │ (can use phone dictation)       │         │
│  └──────────────┘  └─────────────────────────────────┘         │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: AI RESEARCH (Google Search)                            │
│  • Search for relevant context about the topic                  │
│  • Find related news, background info                           │
│  • Gather any needed context automatically                      │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: AI DRAFT                                               │
│  • Generate formal Croatian article                             │
│  • Apply municipal communication style                          │
│  • Create Facebook-optimized version                            │
│  • Position multiple images within text                         │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: AI SELF-REVIEW (Anti-slop layer)                       │
│  • Proofread grammar/spelling                                   │
│  • Verify formal tone                                           │
│  • Check factual consistency                                    │
│  • Audit against municipal style guide                          │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: HUMAN REVIEW & EDIT                                    │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ 🌐 Website Preview │  │ 📘 Facebook Preview│                    │
│  │                  │  │                  │                    │
│  │  [WYSIWYG Edit]  │  │  [WYSIWYG Edit]  │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
│  User can EDIT full text in rich editor (TipTap)               │
│                                                                 │
│  [ ✅ Approve & Publish ]  [ 🔄 Regenerate ]                     │
└─────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- Multi-step to prevent AI slop
- Two AI passes: write then self-review
- Google Search for context gathering
- Multiple images supported, positioned in text
- User can FULLY EDIT text in rich editor before publishing
- Can regenerate if unhappy with output
- Mobile-first: works on phone with camera
- Native phone dictation (not our implementation)

### 5. Integrations
- [x] Facebook API - you handle auth (admin on their page), we integrate Graph API
- [x] Email setup - @velikibukovec.hr SMTP for sending
- [x] Analytics - Cloudflare Analytics (free), displayed in admin UI
- [x] MOBES - external link only, no integration

**DECIDED - Integrations:**
| Service | Approach |
|---------|----------|
| Email sending | @velikibukovec.hr SMTP |
| Analytics | Cloudflare Analytics API → show in admin dashboard |
| MOBES budget | External link only (no API integration) |
| Facebook | Graph API, you handle Page access token setup |
| Google Search | For AI content research (via API or scraping) |

### 6. Content Migration
- [x] Existing content from current site - migrate or fresh start? → Full migration
- [x] 65+ existing pages - which to keep? → All, reorganized into new structure
- [ ] Existing documents to import? → TBD (likely yes)

**DECIDED - Full Migration:**
- Scrape/export all content from current WordPress site
- Sort and organize into new structure
- Place into new design
- This is Phase 0 before launch

**Access available:**
- carnet.hr (Croatian domain registrar) - DNS control
- cPanel - current hosting control
- WordPress admin - current site content access

### 6b. Domain & DNS
- [x] Domain owned by client: velikibukovec.hr
- [x] DNS access: carnet.hr
- [x] Current hosting: cPanel access available
- [x] WordPress access: available for content export

### 7. Technical Details
- [x] Domain structure: velikibukovec.hr (public) + admin.velikibukovec.hr (admin)
- [x] SSL certificates - Cloudflare handles both (proxy mode)
- [x] Backup strategy - see below
- [x] Deployment trigger - automatic on publish, with rollback protection

**DECIDED - Storage & Backups:**
```
┌─────────────────────────────────────────────────────┐
│  FILE STORAGE                                       │
│  Phase 1: VPS local (256GB NVMe available)          │
│  Phase 2: Migrate to Cloudflare R2 (if needed)      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  BACKUP STRATEGY                                    │
│  Frequency: Daily (automated cron)                  │
│  Retention: 3 months (90 days)                      │
│  Storage: Cloudflare R2                             │
│  Contents:                                          │
│    • PostgreSQL database dump                       │
│    • Uploaded files (documents, images)             │
└─────────────────────────────────────────────────────┘
```

**R2 cost estimate (backups):**
- Storage: ~€0.015/GB/month
- If DB + files = 5GB, 90 days = ~450GB max = ~€6.75/month
- Likely much less initially

**DECIDED - Deployment Strategy:**
```
┌─────────────────────────────────────────────────────────────────┐
│  PUBLISH FLOW (instant-feeling for user)                        │
├─────────────────────────────────────────────────────────────────┤
│  1. User clicks "Publish" in admin                              │
│  2. Content saved to database                                   │
│  3. Build triggered (only changed/new pages)                    │
│  4. Changed files synced to Siteground (SFTP)                   │
│  5. Cloudflare cache purged for affected URLs                   │
│  6. Success notification to user                                │
│                                                                 │
│  Target: < 30 seconds from click to live                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ROLLBACK PROTECTION (Coolify-style)                            │
├─────────────────────────────────────────────────────────────────┤
│  • Keep last 5 successful builds                                │
│  • If build fails → don't deploy, notify admin                  │
│  • If deploy fails → auto-rollback to previous build            │
│  • Health check after deploy (verify site responds)             │
│  • Manual rollback available in admin UI                        │
└─────────────────────────────────────────────────────────────────┘
```

**SSL Certificates:**
- Both domains proxied through Cloudflare
- Cloudflare provides free SSL (edge certificates)
- Origin connection: Cloudflare → Siteground/VPS (flexible or full mode)
- No manual cert management needed

### 8. Design
- [x] Color scheme - use Veliki Bukovec crest colors (look up online)
- [x] Logo - you will handle
- [x] Mobile admin access needed? → Yes (primary use case)
- [x] Accessibility requirements → WCAG AA
- [x] Admin UI wireframes - iterate during development
- [x] Public site design - iterate during development

### 9. Premium Search Experience (Stripe-like)

**DECIDED - Search must be a "wow" feature:**
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

**Search Architecture:**
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

**Search UI Mockup:**
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
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 📄 Registar ugovora javna nabava.xlsx                     │ │
│  │    Registri > Javna nabava                   01.01.2026   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  STRANICE                                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 📄 Javna nabava - pregled                                 │ │
│  │    Rad uprave > Javna nabava                              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ────────────────────────────────────────────────────────────── │
│  Pritisni ↵ za otvaranje  •  ↑↓ za navigaciju  •  ESC za izlaz │
└─────────────────────────────────────────────────────────────────┘
```

**Keyboard shortcuts:**
- `⌘K` or `Ctrl+K` - Open search (global)
- `↑` `↓` - Navigate results
- `Enter` - Open selected result
- `ESC` - Close search
- Tab - Switch between result categories

### 9b. Newsletter System

**DECIDED - Weekly automated newsletter:**
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

**Newsletter Email Template:**
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

### 10. Security & Compliance

## ⚠️ SECURITY IS RULE #1

```
┌─────────────────────────────────────────────────────────────────┐
│  SECURITY VIOLATIONS = PROJECT FAILURE                          │
│                                                                 │
│  Previous projects were compromised by crypto miners due to     │
│  exposed services. THIS WILL NOT HAPPEN HERE.                   │
│                                                                 │
│  Every decision must pass the security check first.             │
└─────────────────────────────────────────────────────────────────┘
```

### VPS Hardening (Netcup)

**Initial Setup Checklist:**
```bash
# 1. Update system immediately
apt update && apt upgrade -y

# 2. Create non-root user
adduser deploy
usermod -aG sudo deploy

# 3. Disable root SSH login
# Edit /etc/ssh/sshd_config:
PermitRootLogin no
PasswordAuthentication no  # Use SSH keys only

# 4. Configure firewall (UFW)
ufw default deny incoming
ufw default allow outgoing
ufw allow from <YOUR_TAILSCALE_IP> to any port 22  # SSH only via Tailscale
ufw allow 80/tcp   # HTTP (for Cloudflare)
ufw allow 443/tcp  # HTTPS (for Cloudflare)
ufw enable

# 5. Install fail2ban
apt install fail2ban
systemctl enable fail2ban

# 6. Install and configure Tailscale
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up

# 7. Automatic security updates
apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

**Service Binding Rules:**
```
┌─────────────────────────────────────────────────────────────────┐
│  NEVER BIND TO 0.0.0.0 OR PUBLIC IP                             │
├─────────────────────────────────────────────────────────────────┤
│  Service          │ Bind To                                     │
│  ─────────────────┼─────────────────────────────────────────    │
│  PostgreSQL       │ 127.0.0.1:5432 (localhost only)             │
│  Ollama           │ 127.0.0.1:11434 (localhost only)            │
│  Admin App        │ 127.0.0.1:3001 (behind Cloudflare)          │
│  Node.js Dev      │ 127.0.0.1:3000 (never public)               │
│  Redis (if used)  │ 127.0.0.1:6379 (localhost only)             │
├─────────────────────────────────────────────────────────────────┤
│  ONLY Cloudflare IPs should reach ports 80/443                  │
│  ALL other access via Tailscale VPN                             │
└─────────────────────────────────────────────────────────────────┘
```

**Cloudflare IP Whitelist (optional but recommended):**
```bash
# Only allow Cloudflare IPs to reach your server
# Get current IPs: https://www.cloudflare.com/ips/

# /etc/ufw/applications.d/cloudflare
[Cloudflare]
title=Cloudflare
description=Cloudflare IP ranges
ports=80,443/tcp
```

**Tailscale Network:**
```
┌─────────────────────────────────────────────────────────────────┐
│  TAILSCALE NETWORK TOPOLOGY                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Your Machine ◄─── Tailscale ───► Netcup VPS                   │
│  (100.x.x.x)        (encrypted)    (100.x.x.x)                 │
│                                                                 │
│  Access:                                                        │
│  • SSH: ssh deploy@100.x.x.x                                   │
│  • PostgreSQL: psql -h 100.x.x.x (if needed remotely)          │
│  • Admin dev: http://100.x.x.x:3001                            │
│                                                                 │
│  Public never sees:                                             │
│  • SSH port                                                     │
│  • Database                                                     │
│  • Internal services                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**PostgreSQL Security:**
```bash
# /etc/postgresql/15/main/postgresql.conf
listen_addresses = 'localhost'  # NEVER '*'

# /etc/postgresql/15/main/pg_hba.conf
# Only local connections
local   all   all                 peer
host    all   all   127.0.0.1/32  scram-sha-256
# NO entries for 0.0.0.0/0 !!!
```

**Ollama Security:**
```bash
# Ollama service override
# /etc/systemd/system/ollama.service.d/override.conf
[Service]
Environment="OLLAMA_HOST=127.0.0.1:11434"  # Localhost only!
```

**Log Management (prevent disk explosion):**
```bash
# /etc/logrotate.d/app-logs
/var/log/velikibukovec/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
    postrotate
        systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}

# Also configure journald limits
# /etc/systemd/journald.conf
SystemMaxUse=500M
SystemMaxFileSize=50M
MaxRetentionSec=1week
```

**Application Log Rotation:**
```typescript
// Use proper logging library with rotation
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-roll',
    options: {
      file: '/var/log/velikibukovec/app',
      frequency: 'daily',
      maxFiles: 14,
      maxSize: '50m',
    }
  }
});
```

### Environment Variables

**NEVER hardcode these. ALWAYS use .env files (not committed):**

```bash
# .env.example (this IS committed - template only)
# Copy to .env and fill in real values

# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://user:password@localhost:5432/velikibukovec"

# ============================================
# AUTHENTICATION
# ============================================
NEXTAUTH_URL="https://admin.velikibukovec.hr"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# ============================================
# AI SERVICES
# ============================================
OLLAMA_CLOUD_URL="https://api.ollama.ai"
OLLAMA_CLOUD_API_KEY="your-ollama-cloud-key"
OLLAMA_LOCAL_URL="http://127.0.0.1:11434"  # Local embeddings

# ============================================
# EXTERNAL SERVICES
# ============================================
FACEBOOK_PAGE_ID="your-page-id"
FACEBOOK_ACCESS_TOKEN="your-long-lived-token"

GOOGLE_SEARCH_API_KEY="your-google-api-key"
GOOGLE_SEARCH_CX="your-search-engine-id"

# ============================================
# EMAIL (SMTP)
# ============================================
SMTP_HOST="mail.velikibukovec.hr"
SMTP_PORT="587"
SMTP_USER="noreply@velikibukovec.hr"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="Općina Veliki Bukovec <noreply@velikibukovec.hr>"

# ============================================
# CLOUDFLARE
# ============================================
CLOUDFLARE_ZONE_ID="your-zone-id"
CLOUDFLARE_API_TOKEN="your-api-token"  # For cache purging
CLOUDFLARE_ANALYTICS_TOKEN="your-analytics-token"

# ============================================
# STORAGE (R2)
# ============================================
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="velikibukovec-backups"

# ============================================
# SITEGROUND DEPLOYMENT
# ============================================
SITEGROUND_SFTP_HOST="your-server.siteground.com"
SITEGROUND_SFTP_USER="your-sftp-user"
SITEGROUND_SFTP_KEY_PATH="/path/to/private/key"
SITEGROUND_DEPLOY_PATH="/home/user/public_html"

# ============================================
# SENTRY (Error Tracking)
# ============================================
SENTRY_DSN="https://xxx@sentry.io/xxx"

# ============================================
# APP CONFIG
# ============================================
NODE_ENV="production"
LOG_LEVEL="info"
```

**Environment Variable Rules:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ENVIRONMENT VARIABLE RULES                                     │
├─────────────────────────────────────────────────────────────────┤
│  1. NEVER commit .env files (only .env.example)                 │
│  2. NEVER log environment variables                             │
│  3. NEVER expose in client-side code                            │
│  4. ALWAYS use NEXT_PUBLIC_ prefix for client vars              │
│  5. ALWAYS validate env vars at startup                         │
│  6. ALWAYS use strong, generated secrets                        │
│  7. ROTATE secrets periodically                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Env Validation (startup check):**
```typescript
// packages/shared/src/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  OLLAMA_CLOUD_API_KEY: z.string().min(1),
  // ... all required vars
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }
  return result.data;
}
```

**NIS2 Directive (Zakon o kibernetičkoj sigurnosti) - Compliance Checklist:**

| Requirement | How We Comply |
|-------------|---------------|
| **Secure Architecture** | Headless/static = no server-side execution on public site, minimal attack surface |
| **Access Control** | Role-based auth (Super Admin, Admin, Staff), NextAuth.js with secure sessions |
| **Encryption in Transit** | TLS everywhere via Cloudflare (HTTPS enforced) |
| **Encryption at Rest** | PostgreSQL encryption, Netcup disk encryption |
| **Backup & Recovery** | Daily backups to R2, 3-month retention, tested restore procedure |
| **DDoS Protection** | Cloudflare (included free) |
| **WAF (Web App Firewall)** | Cloudflare WAF rules |
| **Security Updates** | Automated dependency updates, OS patching on VPS |
| **Logging & Monitoring** | Admin action logs, error tracking, uptime monitoring |
| **Incident Response** | Documented procedure, contact points, rollback capability |
| **Supply Chain Security** | Dependency auditing (npm audit), minimal dependencies |
| **Data Minimization** | Only collect necessary data, GDPR-compliant forms |

**Architecture security advantages:**
```
┌─────────────────────────────────────────────────────────────────┐
│  WHY HEADLESS/STATIC IS INHERENTLY SECURE                       │
├─────────────────────────────────────────────────────────────────┤
│  ✓ No WordPress = no plugin vulnerabilities                     │
│  ✓ No PHP = no PHP exploits                                     │
│  ✓ Static public site = no server-side code execution           │
│  ✓ No database on public site = no SQL injection possible       │
│  ✓ Admin isolated on separate subdomain                         │
│  ✓ Admin behind Cloudflare = IP hidden, DDoS protected          │
│  ✓ Cloudflare WAF blocks common attacks                         │
│  ✓ Content served from CDN = origin rarely exposed              │
└─────────────────────────────────────────────────────────────────┘
```

**Additional security measures to implement:**
- [ ] Rate limiting on login attempts
- [ ] CSRF protection on all forms
- [ ] Content Security Policy (CSP) headers
- [ ] Secure cookie settings (HttpOnly, Secure, SameSite)
- [ ] Input validation/sanitization everywhere
- [ ] Admin action audit log (who did what, when)
- [ ] 2FA for Super Admin account (optional for others)
- [ ] Automated security scanning in CI/CD
- [ ] Regular backup restore tests

### 9. Domain Structure
- [x] `velikibukovec.hr` → public site (Siteground + Cloudflare)
- [x] `admin.velikibukovec.hr` → admin panel (VPS)

**Why subdomain for admin:**
- Separate deployment (VPS vs Siteground)
- Different caching rules
- Better security isolation
- Cleaner separation

---

## Admin Panel - Content Types Needed

Based on site structure, the admin needs to manage:

| Content Type | Fields | Notes |
|--------------|--------|-------|
| **Vijesti (News)** | title, content (rich), images[], category, date, featured? | AI-assisted creation |
| **Dokumenti (Documents)** | title, file (PDF), category, date, year | Many categories |
| **Natječaji (Tenders)** | title, content, files[], status (open/closed), deadline | TBD - may be external |
| **Događanja (Events)** | title, description, date, time, location, poster image | Calendar view |
| **Sjednice (Council sessions)** | date, documents[], notes | Part of Documents |
| **Galerija (Gallery)** | album name, description, images[] | Album-based, drag-drop |
| **Prijave problema (Problem reports)** | type, location, description, images[], status | Tracked in admin |
| **Kontakt poruke (Contact messages)** | name, email, subject, message, status | Admin inbox |
| **Newsletter pretplatnici** | email, confirmed, date | List + manual send |
| **Pitaj načelnika (Ask mayor)** | name, email, question | Email only (no tracking) |
| **Stranice (Static pages)** | title, content (rich), images[] | For landmarks, associations, etc. |

**Categories for Documents:**
- Sjednice Općinskog vijeća
- Lokalni izbori
- Planovi
- Pravo na pristup informacijama
- Obrasci
- Strateški dokumenti
- Savjetovanje s javnošću
- Zakoni i propisi
- Odluke načelnika
- Korištenje društvenih domova
- Proračun (subcategories: main, transparency, participation, reports)

**Categories for News:**
- Općinske aktualnosti
- Gospodarstvo
- Sport
- Komunalne teme
- Kultura
- Obrazovanje
- Ostalo

---

## PROJECT READINESS CHECKLIST

### ✅ DECIDED - Ready for Development

**Product & Features:**
- [x] Site structure (full 8-section menu from client)
- [x] User roles (Super Admin, Admin, Staff)
- [x] AI content pipeline (5-step with anti-slop)
- [x] Chatbot architecture (RAG with pgvector)
- [x] Content migration approach (full migration from current WP)
- [x] Design approach (iterate during development)
- [x] Language: Croatian only (no i18n)
- [x] Dashboard: Full analytics (charts, demographics, top pages)
- [x] Settings page: Profile + Site basics
- [x] Gallery: Album-based management
- [x] Events: Calendar view with month navigation
- [x] Contact form: Email + Admin inbox with status
- [x] Problem reports: Tracked in admin (status workflow)
- [x] Search: Premium "Stripe-like" (instant, beautiful, AI-smart)
- [x] Newsletter: Weekly automated digest

**Authentication (Industry Standard):**
- [x] Email + Password (traditional)
- [x] Google OAuth (Gmail login)
- [x] Passkeys/WebAuthn (biometric, hardware keys)
- [x] 2FA (TOTP - required for Super Admin)
- [x] Password reset (email-based, time-limited)
- [x] Session management (30 day remember me, 5 device limit)
- [x] User management (role-based, admin/super admin)

**External Links (not integrated):**
- [x] MOBES (budget transparency) → external link
- [x] E-savjetovanja (public consultations) → external link
- [x] Tenders → TBD (check if e-nabava is used)

**Infrastructure:**
- [x] Architecture (Cloudflare + Siteground + VPS)
- [x] Domain structure (velikibukovec.hr + admin subdomain)
- [x] SSL (Cloudflare)
- [x] Storage (VPS, plan for R2)
- [x] Backups (daily to R2, 3mo retention)
- [x] Deployment (instant publish with rollback)

**Tech Stack:**
- [x] Framework (Next.js + React)
- [x] Database (PostgreSQL + pgvector)
- [x] ORM (Prisma)
- [x] Auth (NextAuth.js + @simplewebauthn/server)
- [x] Rich text editor (TipTap)
- [x] State management (React Query + Context)
- [x] LLM (Llama 3.1 70B via Ollama Cloud)
- [x] Embeddings (local Ollama on VPS)

**Engineering:**
- [x] Database schema (full design - 19 tables)
- [x] API design (REST with defined endpoints)
- [x] Code organization (Turborepo monorepo)
- [x] Testing strategy (Vitest + Playwright, 60-70% coverage)
- [x] Error handling (consistent format, Sentry)
- [x] Data validation (Zod, client + server)
- [x] Code style (ESLint, Prettier, Conventional Commits)
- [x] Definition of Done (no half-finished features)

**Design System:**
- [x] Methodology (Mobile-first, progressive enhancement)
- [x] Design tokens (colors, typography, spacing, shadows)
- [x] Component architecture (primitives → components → features → pages)
- [x] Tech choice (Tailwind CSS + shadcn/ui)
- [x] Page templates (public: 4 templates, admin: 3 templates)
- [x] Responsive behavior (mobile, tablet, desktop breakpoints)
- [x] Component variants pattern (cva for consistent variants)
- [x] Animation system (Framer Motion with defined presets)
- [x] Motion tokens (durations, easing curves)
- [x] "Wow" moments defined (hero, success states, chatbot)

**AI Development Setup:**
- [x] CLAUDE.md created (Claude Code instructions)
- [x] AGENTS.md created (agent roles & responsibilities)
- [x] Development workflow defined
- [x] Code review process defined
- [x] Quality gates defined

**Project Structure:**
- [x] Full directory structure defined
- [x] Naming conventions established
- [x] Import order standardized

**Documentation System:**
- [x] Living documents defined (DECISIONS, CHANGELOG, ROADMAP)
- [x] Reference docs planned (ARCHITECTURE, API, COMPONENTS)
- [x] ADR system defined

**Roadmap:**
- [x] 7 phases defined with tasks
- [x] ROADMAP.md created with tracking

**Performance:**
- [x] Performance budgets (LCP < 2.5s, Lighthouse > 90)
- [x] Caching strategy (Cloudflare + browser)
- [x] Image optimization (Sharp, WebP, responsive sizes)

**Operations:**
- [x] Environments (dev + prod)
- [x] CI/CD (GitHub Actions)
- [x] Monitoring (UptimeRobot, Sentry, Cloudflare Analytics)
- [x] Logging (structured JSON, 30 day retention)

**Compliance:**
- [x] Accessibility (WCAG AA)
- [x] Security (NIS2 / Zakon o kibernetičkoj sigurnosti)
- [x] SEO (meta tags, Open Graph, JSON-LD, sitemap)

**Security & Infrastructure:**
- [x] VPS hardening guide (firewall, SSH, fail2ban)
- [x] Tailscale VPN for internal access
- [x] Service binding rules (localhost only)
- [x] PostgreSQL security config
- [x] Log rotation (prevent disk explosion)
- [x] Environment variables list
- [x] Secrets management rules
- [x] Cloudflare IP whitelist option

**AI Agent Rules:**
- [x] Banned excuses list ("TS errors preexisting", etc.)
- [x] Test integrity rules (never skip/loosen)
- [x] File size limits (schema <500 lines)
- [x] Security as Rule #1
- [x] Instant rejection criteria for reviews

**Process:**
- [x] Git branching (main + feature branches)
- [x] Releases (semver, CHANGELOG)
- [x] Dependency updates (Dependabot weekly)

### ⏳ TBD - Iterate During Development
- [ ] Admin UI design
- [ ] Public site design
- [ ] Logo in vector format (you handling)

### 📋 DURING DEVELOPMENT
- [ ] Facebook App setup & Page token (you handling)
- [ ] @velikibukovec.hr SMTP credentials
- [ ] carnet.hr DNS changes for admin subdomain
- [ ] Content export from current WordPress

---

## ARCHITECTURE & ENGINEERING DECISIONS

### 🏗️ Architecture & Patterns

**Domain Model (DDD-lite):**
```
┌─────────────────────────────────────────────────────────────────┐
│  CORE ENTITIES                                                  │
├─────────────────────────────────────────────────────────────────┤
│  CONTENT                                                        │
│  Post          - News articles with AI generation               │
│  Document      - PDFs organized by category                     │
│  Event         - Calendar events/announcements                  │
│  Page          - Static content pages (landmarks, info, etc.)   │
│  Gallery       - Photo albums                                   │
│  GalleryImage  - Individual photos in albums                    │
│  Tender        - Natječaji with open/closed status              │
│                                                                 │
│  AUTH & USERS                                                   │
│  User          - Admin users (Super Admin, Admin, Staff)        │
│  UserSession   - Active login sessions                          │
│  UserPasskey   - WebAuthn/passkey credentials                   │
│  UserTOTP      - 2FA secrets                                    │
│                                                                 │
│  COMMUNICATION                                                  │
│  ContactMessage    - Contact form submissions                   │
│  ProblemReport     - Citizen problem reports (tracked)          │
│  NewsletterSub     - Newsletter subscribers                     │
│  NewsletterSend    - Sent newsletter tracking                   │
│                                                                 │
│  SYSTEM                                                         │
│  AuditLog      - Who did what, when (security)                  │
│  Embedding     - Vector embeddings for RAG chatbot              │
│  SearchIndex   - Denormalized search data                       │
│  Setting       - Site configuration key-value pairs             │
└─────────────────────────────────────────────────────────────────┘
```

**Database Schema (PostgreSQL):**
```sql
-- Users & Auth
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role ENUM('super_admin', 'admin', 'staff') NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- News/Posts
posts (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  content TEXT NOT NULL,           -- Rich text (TipTap JSON or HTML)
  excerpt TEXT,                    -- Short summary
  featured_image VARCHAR,          -- URL
  images JSONB,                    -- Additional images [{url, caption}]
  category ENUM('aktualnosti', 'gospodarstvo', 'sport',
                'komunalno', 'kultura', 'obrazovanje', 'ostalo'),
  is_featured BOOLEAN DEFAULT FALSE,
  facebook_post_id VARCHAR,        -- If posted to FB
  author_id UUID REFERENCES users(id),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- Documents
documents (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  file_url VARCHAR NOT NULL,
  file_size INTEGER,
  category VARCHAR NOT NULL,       -- 'sjednice', 'izbori', 'planovi', etc.
  subcategory VARCHAR,
  year INTEGER,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
)

-- Events
events (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location VARCHAR,
  poster_image VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- Static Pages
pages (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES pages(id),  -- For hierarchy
  menu_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- Galleries
galleries (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  event_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

gallery_images (
  id UUID PRIMARY KEY,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  image_url VARCHAR NOT NULL,
  thumbnail_url VARCHAR,
  caption VARCHAR,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Tenders (Natječaji)
tenders (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  content TEXT NOT NULL,
  files JSONB,                     -- [{name, url}]
  status ENUM('open', 'closed') DEFAULT 'open',
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- Consultations (Savjetovanja)
consultations (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  content TEXT NOT NULL,
  files JSONB,
  status ENUM('active', 'finished') DEFAULT 'active',
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- Audit Log (Security)
audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR NOT NULL,         -- 'create', 'update', 'delete', 'login'
  entity_type VARCHAR NOT NULL,    -- 'post', 'document', etc.
  entity_id UUID,
  details JSONB,                   -- Additional context
  ip_address VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
)

-- RAG Embeddings (for Chatbot)
embeddings (
  id UUID PRIMARY KEY,
  source_type VARCHAR NOT NULL,    -- 'document', 'page', 'post'
  source_id UUID NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(384),           -- pgvector, size depends on model
  created_at TIMESTAMP DEFAULT NOW()
)

-- Site Settings
settings (
  key VARCHAR PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Contact Form Messages
contact_messages (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  subject VARCHAR,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
  replied_at TIMESTAMP,
  replied_by UUID REFERENCES users(id),
  ip_address VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Problem Reports
problem_reports (
  id UUID PRIMARY KEY,
  reporter_name VARCHAR,           -- Optional (can be anonymous)
  reporter_email VARCHAR,          -- Optional
  reporter_phone VARCHAR,          -- Optional
  problem_type VARCHAR NOT NULL,   -- 'cesta', 'rasvjeta', 'otpad', 'ostalo'
  location VARCHAR NOT NULL,
  description TEXT NOT NULL,
  images JSONB,                    -- [{url, caption}]
  status ENUM('new', 'in_progress', 'resolved', 'rejected') DEFAULT 'new',
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  ip_address VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Newsletter Subscribers
newsletter_subscribers (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  confirmation_token VARCHAR,
  confirmed_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Newsletter Sends (tracking)
newsletter_sends (
  id UUID PRIMARY KEY,
  subject VARCHAR NOT NULL,
  content_html TEXT NOT NULL,
  content_text TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  recipient_count INTEGER,
  posts_included JSONB,           -- [{id, title}]
  events_included JSONB,          -- [{id, title}]
  is_manual BOOLEAN DEFAULT FALSE -- vs automated weekly
)

-- User Sessions (for session management)
user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR UNIQUE NOT NULL,
  device_info VARCHAR,            -- Browser, OS info
  ip_address VARCHAR,
  last_active TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Passkeys (WebAuthn credentials)
user_passkeys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  credential_id VARCHAR UNIQUE NOT NULL,
  public_key BYTEA NOT NULL,
  counter INTEGER DEFAULT 0,
  device_type VARCHAR,            -- 'platform' or 'cross-platform'
  name VARCHAR,                   -- User-friendly name "MacBook Touch ID"
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- TOTP 2FA Secrets
user_totp (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  secret_encrypted VARCHAR NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  backup_codes JSONB,             -- Encrypted backup codes
  created_at TIMESTAMP DEFAULT NOW()
)

-- Search Index (denormalized for fast search)
search_index (
  id UUID PRIMARY KEY,
  source_type VARCHAR NOT NULL,   -- 'post', 'document', 'page', 'event'
  source_id UUID NOT NULL,
  title VARCHAR NOT NULL,
  content_text TEXT NOT NULL,     -- Plain text for full-text search
  category VARCHAR,
  url VARCHAR NOT NULL,
  published_at TIMESTAMP,
  search_vector TSVECTOR,         -- PostgreSQL full-text search
  embedding VECTOR(384),          -- Semantic search
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Indexes (Content)
CREATE INDEX idx_posts_published ON posts(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_featured ON posts(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_documents_category ON documents(category, year DESC);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_galleries_date ON galleries(event_date DESC);

-- Indexes (Auth)
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_passkeys_user ON user_passkeys(user_id);
CREATE INDEX idx_passkeys_credential ON user_passkeys(credential_id);

-- Indexes (Communication)
CREATE INDEX idx_contact_status ON contact_messages(status, created_at DESC);
CREATE INDEX idx_problems_status ON problem_reports(status, created_at DESC);
CREATE INDEX idx_newsletter_confirmed ON newsletter_subscribers(confirmed) WHERE confirmed = TRUE;

-- Indexes (System)
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_embeddings_source ON embeddings(source_type, source_id);

-- Indexes (Search)
CREATE INDEX idx_search_source ON search_index(source_type, source_id);
CREATE INDEX idx_search_fulltext ON search_index USING GIN(search_vector);
CREATE INDEX idx_search_embedding ON search_index USING ivfflat(embedding vector_cosine_ops);
```

**API Design: REST (simple, sufficient)**
```
Authentication:
  POST   /api/auth/login              - Email/password login
  POST   /api/auth/logout             - Logout (invalidate session)
  GET    /api/auth/me                 - Get current user
  POST   /api/auth/google             - Google OAuth callback
  POST   /api/auth/passkey/register   - Register new passkey
  POST   /api/auth/passkey/login      - Login with passkey
  POST   /api/auth/password/reset     - Request password reset
  POST   /api/auth/password/confirm   - Confirm password reset
  POST   /api/auth/2fa/setup          - Setup TOTP 2FA
  POST   /api/auth/2fa/verify         - Verify TOTP code
  DELETE /api/auth/2fa                - Disable 2FA

User Management (Admin/Super Admin):
  GET    /api/users                   - List users
  POST   /api/users                   - Create user
  PUT    /api/users/:id               - Update user
  DELETE /api/users/:id               - Delete user (super admin only)
  GET    /api/users/:id/sessions      - View user sessions
  DELETE /api/users/:id/sessions/:sid - Revoke session

Posts:
  GET    /api/posts              - List (paginated, filterable)
  GET    /api/posts/:slug        - Get single
  POST   /api/posts              - Create
  PUT    /api/posts/:id          - Update
  DELETE /api/posts/:id          - Delete (admin only)
  POST   /api/posts/:id/publish  - Publish (triggers build + FB post)
  POST   /api/posts/generate     - AI generate from notes/images

Documents:
  GET    /api/documents
  POST   /api/documents          - Upload
  DELETE /api/documents/:id

Events:
  GET    /api/events             - List (with calendar view support)
  POST   /api/events             - Create
  PUT    /api/events/:id         - Update
  DELETE /api/events/:id         - Delete

Galleries:
  GET    /api/galleries          - List albums
  POST   /api/galleries          - Create album
  PUT    /api/galleries/:id      - Update album
  DELETE /api/galleries/:id      - Delete album
  POST   /api/galleries/:id/images - Upload images
  PUT    /api/galleries/:id/reorder - Reorder images
  DELETE /api/galleries/:id/images/:imgId - Delete image

[Similar patterns for tenders, pages]

Contact & Problem Reports:
  GET    /api/contact            - List contact messages (admin)
  PUT    /api/contact/:id        - Update status
  DELETE /api/contact/:id        - Archive/delete message
  GET    /api/problems           - List problem reports (admin)
  PUT    /api/problems/:id       - Update status, add notes

Public (no auth):
  POST   /api/public/contact     - Submit contact form
  POST   /api/public/problem     - Submit problem report

Newsletter:
  GET    /api/newsletter/subscribers - List subscribers (admin)
  DELETE /api/newsletter/subscribers/:id - Remove subscriber
  POST   /api/newsletter/send    - Send manual newsletter
  GET    /api/newsletter/sends   - List sent newsletters

Public (no auth):
  POST   /api/public/newsletter/subscribe   - Subscribe
  GET    /api/public/newsletter/confirm/:token - Confirm email
  GET    /api/public/newsletter/unsubscribe/:token - Unsubscribe

Search:
  GET    /api/search             - Hybrid search (keyword + semantic)
  GET    /api/search/suggest     - Search suggestions

AI:
  POST   /api/ai/generate        - Generate content from input
  POST   /api/ai/chat            - Chatbot query

Build:
  POST   /api/build/trigger      - Trigger site rebuild
  GET    /api/build/status       - Check build status

Analytics:
  GET    /api/analytics/summary  - Dashboard stats from Cloudflare
  GET    /api/analytics/visitors - Visitor data
  GET    /api/analytics/pages    - Top pages
```

**Code Organization (Turborepo Monorepo):**
```
velikibukovec/
├── apps/
│   ├── web/                    # Public Next.js site (static export)
│   │   ├── app/
│   │   ├── components/
│   │   └── public/
│   │
│   └── admin/                  # Admin Next.js app (SSR on VPS)
│       ├── app/
│       ├── components/
│       └── features/           # Feature-based organization
│           ├── posts/
│           ├── documents/
│           ├── ai/
│           └── ...
│
├── packages/
│   ├── database/               # Prisma schema, client, migrations
│   ├── shared/                 # Shared types, utils, validation schemas
│   └── ui/                     # Shared UI components (if any)
│
├── turbo.json
└── package.json
```

**State Management:**
- **React Query (TanStack Query)** for server state (API data)
- **React Context** for UI state (modals, sidebar, etc.)
- **No Redux** - overkill for this project

---

### 🎨 Design System & Methodology

**Approach: Mobile-First + Design Tokens + Component Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│  DESIGN METHODOLOGY                                             │
├─────────────────────────────────────────────────────────────────┤
│  1. Mobile-First                                                │
│     • Design for 375px first (iPhone SE)                        │
│     • Enhance progressively for tablet (768px) and desktop      │
│     • Touch-friendly targets (min 44x44px)                      │
│     • Content prioritization for small screens                  │
│                                                                 │
│  2. Design Tokens (Single Source of Truth)                      │
│     • All design values defined once                            │
│     • Used everywhere consistently                              │
│     • Easy to update globally                                   │
│                                                                 │
│  3. Component-Based Architecture                                │
│     • Reusable, composable components                           │
│     • Consistent patterns                                       │
│     • Accessible by default                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Tech Choice: Tailwind CSS + shadcn/ui**

Why:
- Tailwind: Utility-first, design tokens built-in, mobile-first by default
- shadcn/ui: Beautiful accessible components, you own the code (not a dependency), built on Radix UI
- Both are industry standard in 2026

**Design Tokens (defined in tailwind.config.js):**

```javascript
// Colors - Based on Veliki Bukovec crest (greens + gold/yellow)
colors: {
  // Brand
  primary: {
    50:  '#f0fdf4',  // Lightest
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Main brand green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',  // Darkest
  },
  accent: {
    // Gold/yellow from crest
    500: '#eab308',
    600: '#ca8a04',
  },

  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutrals (slate for professional government feel)
  neutral: {
    50:  '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  }
}

// Typography
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],      // Body text
  display: ['Plus Jakarta Sans', 'sans-serif'],    // Headings
}

fontSize: {
  'xs':   ['0.75rem', { lineHeight: '1rem' }],     // 12px
  'sm':   ['0.875rem', { lineHeight: '1.25rem' }], // 14px
  'base': ['1rem', { lineHeight: '1.5rem' }],      // 16px
  'lg':   ['1.125rem', { lineHeight: '1.75rem' }], // 18px
  'xl':   ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
  '2xl':  ['1.5rem', { lineHeight: '2rem' }],      // 24px
  '3xl':  ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl':  ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  '5xl':  ['3rem', { lineHeight: '1' }],           // 48px
}

// Spacing (4px base unit)
spacing: {
  'px': '1px',
  '0': '0',
  '0.5': '0.125rem',  // 2px
  '1': '0.25rem',     // 4px
  '2': '0.5rem',      // 8px
  '3': '0.75rem',     // 12px
  '4': '1rem',        // 16px
  '5': '1.25rem',     // 20px
  '6': '1.5rem',      // 24px
  '8': '2rem',        // 32px
  '10': '2.5rem',     // 40px
  '12': '3rem',       // 48px
  '16': '4rem',       // 64px
  '20': '5rem',       // 80px
  '24': '6rem',       // 96px
}

// Breakpoints (mobile-first)
screens: {
  'sm': '640px',   // Large phones
  'md': '768px',   // Tablets
  'lg': '1024px',  // Small laptops
  'xl': '1280px',  // Desktops
  '2xl': '1536px', // Large screens
}

// Border radius
borderRadius: {
  'none': '0',
  'sm': '0.25rem',    // 4px
  'DEFAULT': '0.5rem', // 8px
  'md': '0.625rem',   // 10px
  'lg': '0.75rem',    // 12px
  'xl': '1rem',       // 16px
  '2xl': '1.5rem',    // 24px
  'full': '9999px',   // Pill shape
}

// Shadows
boxShadow: {
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
}
```

**Component Architecture (Atomic Design Simplified):**

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPONENT HIERARCHY                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PRIMITIVES (atoms) - Basic building blocks                     │
│  └── Button, Input, Label, Badge, Avatar, Icon, Spinner         │
│                                                                 │
│  COMPONENTS (molecules) - Combined primitives                   │
│  └── Card, Form Field, Search Bar, Dropdown, Modal, Toast       │
│      Navigation Item, Breadcrumb, Pagination                    │
│                                                                 │
│  FEATURES (organisms) - Business-specific components            │
│  └── PostCard, DocumentCard, EventCard, GalleryGrid             │
│      AIContentGenerator, ChatbotWidget, StatsCard               │
│      PostEditor, DocumentUploader, ImageUploader                │
│                                                                 │
│  LAYOUTS (templates) - Page structure                           │
│  └── PublicLayout, AdminLayout, AuthLayout                      │
│      PageHeader, Sidebar, Footer                                │
│                                                                 │
│  PAGES - Full page compositions                                 │
│  └── Homepage, NewsPage, PostDetailPage, AdminDashboard         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Folder Structure for Components:**

```
packages/ui/
├── primitives/
│   ├── button.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── spinner.tsx
│   └── index.ts
│
├── components/
│   ├── card.tsx
│   ├── form-field.tsx
│   ├── modal.tsx
│   ├── toast.tsx
│   ├── dropdown.tsx
│   ├── pagination.tsx
│   └── index.ts
│
└── index.ts              # Re-exports everything

apps/web/components/
├── features/
│   ├── post-card.tsx
│   ├── event-card.tsx
│   ├── document-list.tsx
│   └── chatbot-widget.tsx
│
├── layouts/
│   ├── public-layout.tsx
│   ├── page-header.tsx
│   └── footer.tsx
│
└── sections/             # Homepage sections, etc.
    ├── hero.tsx
    ├── news-section.tsx
    └── events-section.tsx

apps/admin/components/
├── features/
│   ├── post-editor/
│   │   ├── post-editor.tsx
│   │   ├── ai-assistant.tsx
│   │   └── image-uploader.tsx
│   ├── document-manager/
│   ├── stats-dashboard/
│   └── ...
│
├── layouts/
│   ├── admin-layout.tsx
│   ├── sidebar.tsx
│   └── admin-header.tsx
│
└── ...
```

**Page Templates (Public Site):**

```
┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: Homepage                                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Header (logo, navigation, search)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Hero (featured news, quick links)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────┐  ┌──────────────────────────────┐   │
│  │  Latest News         │  │  Quick Links / Widgets       │   │
│  │  (3-4 cards)         │  │  - Waste schedule            │   │
│  │                      │  │  - Report problem            │   │
│  │                      │  │  - Active tenders            │   │
│  └──────────────────────┘  └──────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Upcoming Events                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Footer (contacts, links, social)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌───────┐                                                     │
│  │ 💬    │  Chatbot FAB (floating action button)               │
│  └───────┘                                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: List Page (News, Documents, etc.)                    │
├─────────────────────────────────────────────────────────────────┤
│  Header                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Page Title + Breadcrumbs                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Filters (category, year, search)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Item Grid/List                                          │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐                       │   │
│  │  │ Card   │ │ Card   │ │ Card   │                       │   │
│  │  └────────┘ └────────┘ └────────┘                       │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐                       │   │
│  │  │ Card   │ │ Card   │ │ Card   │                       │   │
│  │  └────────┘ └────────┘ └────────┘                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Pagination                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│  Footer                                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: Detail Page (Single Post, Single Page)               │
├─────────────────────────────────────────────────────────────────┤
│  Header                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Breadcrumbs                                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Title + Meta (date, category, author)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Featured Image                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────┐ ┌──────────────────────┐   │
│  │  Content                       │ │  Sidebar             │   │
│  │  (rich text, images)           │ │  - Related posts     │   │
│  │                                │ │  - Share buttons     │   │
│  │                                │ │  - Contact CTA       │   │
│  └────────────────────────────────┘ └──────────────────────┘   │
│  Footer                                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: Static/Info Page (About, Settlements, Landmarks)     │
├─────────────────────────────────────────────────────────────────┤
│  Header                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Page Title + Hero Image (optional)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────┐ ┌──────────────────────┐   │
│  │  Main Content                  │ │  Sub-navigation      │   │
│  │  (flexible rich content)       │ │  (section links)     │   │
│  │                                │ │                      │   │
│  └────────────────────────────────┘ └──────────────────────┘   │
│  Footer                                                         │
└─────────────────────────────────────────────────────────────────┘
```

**Page Templates (Admin):**

```
┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: Admin Layout                                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────┬────────────────────────────────────────────────┐   │
│  │        │  Header (user menu, notifications)             │   │
│  │        ├────────────────────────────────────────────────┤   │
│  │  Side  │                                                │   │
│  │  bar   │  Page Content                                  │   │
│  │        │                                                │   │
│  │  Nav   │  ┌────────────────────────────────────────┐   │   │
│  │        │  │  Page-specific content here            │   │   │
│  │  📊    │  │                                        │   │   │
│  │  📝    │  │                                        │   │   │
│  │  📄    │  │                                        │   │   │
│  │  📅    │  │                                        │   │   │
│  │  🖼️    │  │                                        │   │   │
│  │  ⚙️    │  └────────────────────────────────────────┘   │   │
│  │        │                                                │   │
│  └────────┴────────────────────────────────────────────────┘   │
│                                                                 │
│  Mobile: Sidebar collapses to hamburger menu                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: Admin List (Posts, Documents, etc.)                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Page Title              [+ Dodaj novu]                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Search + Filters                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Data Table                                              │   │
│  │  ┌──────┬──────────┬──────────┬────────┬──────────┐     │   │
│  │  │ Sel  │ Title    │ Category │ Status │ Actions  │     │   │
│  │  ├──────┼──────────┼──────────┼────────┼──────────┤     │   │
│  │  │  ☐   │ Post 1   │ Sport    │ Draft  │ ✏️ 🗑️    │     │   │
│  │  │  ☐   │ Post 2   │ Kultura  │ Live   │ ✏️ 🗑️    │     │   │
│  │  └──────┴──────────┴──────────┴────────┴──────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Pagination + Bulk actions                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: Admin Editor (Create/Edit Post)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ← Natrag    Uredi objavu           [Spremi] [Objavi]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────┐ ┌──────────────────────┐   │
│  │  Main Editor                   │ │  Sidebar             │   │
│  │  ┌──────────────────────────┐ │ │  ┌────────────────┐  │   │
│  │  │ AI Assistant             │ │ │  │ Status         │  │   │
│  │  │ [📷 Slike] [✏️ Bilješke]  │ │ │  │ ○ Draft       │  │   │
│  │  │                          │ │ │  │ ● Objavljeno   │  │   │
│  │  │ [🤖 Generiraj članek]    │ │ │  └────────────────┘  │   │
│  │  └──────────────────────────┘ │ │  ┌────────────────┐  │   │
│  │                                │ │  │ Kategorija    │  │   │
│  │  ┌──────────────────────────┐ │ │  │ [Dropdown]    │  │   │
│  │  │ Naslov                   │ │ │  └────────────────┘  │   │
│  │  │ [________________________]│ │ │  ┌────────────────┐  │   │
│  │  └──────────────────────────┘ │ │  │ Naslovna slika│  │   │
│  │                                │ │  │ [Upload]      │  │   │
│  │  ┌──────────────────────────┐ │ │  └────────────────┘  │   │
│  │  │ Rich Text Editor         │ │ │  ┌────────────────┐  │   │
│  │  │ (TipTap)                 │ │ │  │ Facebook      │  │   │
│  │  │                          │ │ │  │ ☑ Objavi na FB│  │   │
│  │  │                          │ │ │  │ [Preview]     │  │   │
│  │  └──────────────────────────┘ │ │  └────────────────┘  │   │
│  └────────────────────────────────┘ └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Animation & Motion Design (Framer Motion):**

```
┌─────────────────────────────────────────────────────────────────┐
│  MOTION PRINCIPLES                                              │
├─────────────────────────────────────────────────────────────────┤
│  • Purposeful: Every animation has a reason (guide attention,   │
│    provide feedback, create continuity)                         │
│  • Subtle: Enhance, don't distract                              │
│  • Fast: Keep it snappy (150-300ms for most interactions)       │
│  • Consistent: Same type of action = same animation             │
│  • Accessible: Respect prefers-reduced-motion                   │
└─────────────────────────────────────────────────────────────────┘
```

**Motion Tokens:**
```javascript
// Duration scale
duration: {
  instant: '50ms',    // Micro-feedback (button press)
  fast: '150ms',      // Hover states, toggles
  normal: '250ms',    // Most transitions
  slow: '350ms',      // Complex animations
  slower: '500ms',    // Page transitions, modals
}

// Easing curves
easing: {
  // Standard Material Design curves
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',      // General use
  in: 'cubic-bezier(0.4, 0, 1, 1)',             // Enter screen
  out: 'cubic-bezier(0, 0, 0.2, 1)',            // Exit screen
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',        // On-screen movement

  // Expressive curves for "wow" moments
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',  // Bouncy
  smooth: 'cubic-bezier(0.45, 0, 0.55, 1)',           // Smooth sine
}
```

**Animation Categories:**

```
┌─────────────────────────────────────────────────────────────────┐
│  1. MICRO-INTERACTIONS (instant feedback)                       │
├─────────────────────────────────────────────────────────────────┤
│  Button press      → Scale down 0.98, 50ms                      │
│  Button hover      → Background shift, 150ms                    │
│  Link hover        → Underline slide in, color shift            │
│  Input focus       → Border color + subtle glow                 │
│  Toggle switch     → Smooth slide with spring                   │
│  Checkbox          → Checkmark draws in with SVG animation      │
│  Icon buttons      → Subtle rotation/scale on hover             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2. COMPONENT TRANSITIONS                                       │
├─────────────────────────────────────────────────────────────────┤
│  Cards hover       → Lift up (translateY -4px) + shadow grow    │
│  Dropdown open     → Fade + scale from origin, stagger items    │
│  Modal open        → Backdrop fade + modal scale/slide up       │
│  Modal close       → Reverse with slightly faster timing        │
│  Toast appear      → Slide in from edge + fade                  │
│  Accordion         → Smooth height animation                    │
│  Tabs              → Content crossfade + indicator slide        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  3. PAGE TRANSITIONS                                            │
├─────────────────────────────────────────────────────────────────┤
│  Page enter        → Fade in + slight slide up (20px)           │
│  Page exit         → Fade out (faster than enter)               │
│  Shared elements   → Morph between pages (hero images)          │
│  Navigation        → Subtle crossfade                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  4. SCROLL ANIMATIONS (Intersection Observer)                   │
├─────────────────────────────────────────────────────────────────┤
│  Section enter     → Fade up as scrolled into view              │
│  Cards             → Staggered entrance (50ms delay each)       │
│  Numbers/stats     → Count up animation                         │
│  Progress bars     → Fill animation on scroll                   │
│  Images            → Subtle parallax (optional, subtle)         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  5. LOADING STATES                                              │
├─────────────────────────────────────────────────────────────────┤
│  Skeleton          → Shimmer animation (subtle pulse)           │
│  Spinner           → Smooth rotation                            │
│  Progress          → Indeterminate bar animation                │
│  Content load      → Fade in when ready (no flash)              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  6. SPECIAL "WOW" MOMENTS                                       │
├─────────────────────────────────────────────────────────────────┤
│  Hero section      → Layered parallax, text reveal              │
│  Success state     → Confetti or checkmark animation            │
│  Publish action    → Satisfying "sent" animation                │
│  Chatbot           → Typing indicator, message bubbles slide    │
│  Gallery           → Lightbox with smooth zoom                  │
│  Stats dashboard   → Charts animate in, numbers count up        │
└─────────────────────────────────────────────────────────────────┘
```

**Framer Motion Presets (reusable):**
```typescript
// animations/presets.ts
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25 }
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 }
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.25 }
};

export const staggerChildren = {
  animate: { transition: { staggerChildren: 0.05 } }
};

// Accessibility: Respect reduced motion preference
export const useReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
```

**Responsive Behavior:**

```
Mobile (< 768px):
  • Single column layouts
  • Hamburger menu for navigation
  • Full-width cards
  • Stacked form layouts
  • Bottom sheet modals
  • Touch-optimized buttons (min 44px)

Tablet (768px - 1024px):
  • 2-column grids where appropriate
  • Collapsible sidebar
  • Side-by-side form layouts

Desktop (> 1024px):
  • Full multi-column layouts
  • Persistent sidebar
  • Hover states
  • Keyboard shortcuts
```

**Component Variants Pattern:**

```typescript
// Example: Button component with variants
const buttonVariants = cva(
  // Base styles (always applied)
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700",
        secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
        outline: "border border-neutral-300 bg-white hover:bg-neutral-50",
        ghost: "hover:bg-neutral-100",
        danger: "bg-error text-white hover:bg-red-700",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// Usage
<Button variant="primary" size="lg">Objavi</Button>
<Button variant="outline" size="sm">Odustani</Button>
```

---

### 🧪 Quality & Testing

**Testing Strategy (Pragmatic):**
```
┌─────────────────────────────────────────────────────────────────┐
│  TEST PYRAMID                                                   │
├─────────────────────────────────────────────────────────────────┤
│  E2E Tests (Playwright)           - Critical flows only         │
│    • Login flow                   - ~5 tests                    │
│    • Create & publish post                                      │
│    • Upload document                                            │
│    • AI content generation                                      │
│                                                                 │
│  Integration Tests (Vitest)       - API endpoints               │
│    • Auth endpoints               - ~20 tests                   │
│    • CRUD operations                                            │
│    • Validation errors                                          │
│                                                                 │
│  Unit Tests (Vitest)              - Business logic              │
│    • Utility functions            - ~30 tests                   │
│    • Validation schemas                                         │
│    • Data transformations                                       │
└─────────────────────────────────────────────────────────────────┘

Coverage target: 60-70% (focus on critical paths, not vanity metrics)
```

**Error Handling:**
```typescript
// Consistent API error format
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Naslov je obavezan",     // Croatian, user-friendly
    details?: { field: "title" }        // Optional technical details
  }
}

// Client-side: Global error boundary + toast notifications
// Server-side: Try-catch with structured logging
// All errors logged with context (user, action, stack trace)
```

**Data Validation (Zod - single source of truth):**
```typescript
// Shared schema used on client AND server
const PostSchema = z.object({
  title: z.string().min(3, "Naslov mora imati najmanje 3 znaka"),
  content: z.string().min(10),
  category: z.enum(['aktualnosti', 'sport', ...]),
  // ...
});

// Client: Form validation (immediate feedback)
// Server: API validation (never trust client)
// Database: Constraints as final defense
```

**Code Style:**
- ESLint with strict TypeScript rules
- Prettier for formatting (no debates)
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`
- Husky pre-commit hooks (lint + type-check)

---

### ⚡ Performance

**Performance Budgets:**
| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3.0s | Lighthouse |
| Initial JS Bundle | < 150KB | Bundlewatch |
| Lighthouse Score | > 90 | CI check |

**Caching Strategy:**
```
┌─────────────────────────────────────────────────────────────────┐
│  CLOUDFLARE                                                     │
│  • Static assets (JS, CSS, images): 1 year                      │
│  • HTML pages: Until purged on publish                          │
│  • API responses: No cache (dynamic)                            │
├─────────────────────────────────────────────────────────────────┤
│  BROWSER                                                        │
│  • Static assets: Immutable (hashed filenames)                  │
│  • HTML: No cache (always fresh from CF)                        │
├─────────────────────────────────────────────────────────────────┤
│  DATABASE                                                       │
│  • PostgreSQL query cache (built-in)                            │
│  • No Redis needed at this scale                                │
└─────────────────────────────────────────────────────────────────┘
```

**Image Optimization:**
```
Upload → Sharp processing on VPS:
  1. Convert to WebP
  2. Generate sizes: thumbnail (150px), medium (600px), large (1200px)
  3. Strip metadata
  4. Store all variants

Public site: Next.js <Image> component for automatic optimization
```

---

### 🔍 SEO & Discovery

**SEO Implementation:**
- Meta title & description on all pages
- Open Graph tags (for Facebook/social sharing)
- JSON-LD structured data:
  - Organization (municipality info)
  - Article (for news posts)
  - Event (for events)
- Auto-generated `sitemap.xml`
- `robots.txt` allowing all
- Canonical URLs

---

### 🔧 Operations

**Environments:**
```
Development  → Local machine (localhost)
Production   → VPS + Siteground

No staging needed at this scale. Can add later if needed.
```

**CI/CD Pipeline (GitHub Actions):**
```yaml
On Pull Request:
  → Lint (ESLint)
  → Type check (TypeScript)
  → Unit tests (Vitest)
  → Build check

On Merge to Main:
  → All above +
  → E2E tests (Playwright)
  → Build production
  → Deploy to VPS (admin)
  → Deploy to Siteground (public)
  → Purge Cloudflare cache
  → Health check
  → Notify on failure
```

**Monitoring & Alerting:**
- **Uptime:** UptimeRobot (free) or Cloudflare Health Checks
- **Errors:** Sentry free tier (10k events/month)
- **Performance:** Cloudflare Analytics
- **Alerts:** Email on downtime or error spike

**Logging:**
```
Application Logs:
  • Format: Structured JSON
  • Storage: VPS filesystem
  • Rotation: Daily
  • Retention: 30 days

Audit Logs (in database):
  • All user actions
  • Retention: Forever (compliance)
```

**Database Migrations:**
- Prisma Migrate
- Auto-run on deploy
- Forward-only (no rollback migrations - too risky)
- Test migrations on local DB copy first

---

### 📱 User Experience

**PWA/Offline:**
- Public site: No (static site is fast enough)
- Admin: Basic PWA manifest for "Add to Home Screen" on mobile
- No offline editing (too complex, not needed)

**Email Templates:**
- Simple, clean HTML
- Templates for:
  - Contact form confirmation
  - Problem report acknowledgment
- Croatian language
- Mobile-friendly

**Loading States:**
- Skeleton loaders for lists
- Button spinners for actions
- Optimistic updates for toggles (publish, feature)
- Toast notifications for success/error

---

### 📚 Documentation

**Code Documentation:**
- JSDoc for complex functions
- README.md in each major folder
- This DECISIONS.md file (architecture decisions)

**API Documentation:**
- Auto-generated from code comments (TypeDoc or similar)
- Available at /api/docs in dev environment

**User Manual:**
- Simple PDF/web guide for client staff
- Screenshots with Croatian instructions
- Video walkthrough at project handoff

---

### 🔄 Process

**Git Branching (Simple):**
```
main (production)
  └── feature/xyz (feature branches)
  └── fix/xyz (bug fixes)

• Feature branches merge to main via Pull Request
• All PRs require passing CI
• No complex GitFlow (overkill for this project)
```

**Releases:**
- Semantic versioning: v1.0.0, v1.0.1, v1.1.0
- CHANGELOG.md maintained
- Git tags for each release
- Deploy main = deploy to production

**Dependency Updates:**
- GitHub Dependabot enabled
- Weekly review of updates
- Always run tests before merging updates
- Security updates: Immediate

---

## MONTHLY COSTS SUMMARY

| Service | Cost |
|---------|------|
| Siteground | Already paid |
| Cloudflare (CDN, Workers, Analytics) | Free |
| Cloudflare R2 (backups) | ~€5-10 |
| Netcup VPS 1000 G12 | ~€8 |
| Ollama Cloud | €20 |
| **TOTAL** | **~€33-38/month** |

---

## AI-ASSISTED DEVELOPMENT SETUP

**Development Team:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Claude Code (Architect & Primary Developer)                    │
│  • Writes production code                                       │
│  • Makes architectural decisions                                │
│  • Creates tests                                                │
│  • Follows project guidelines strictly                          │
├─────────────────────────────────────────────────────────────────┤
│  Codex (Reviewer)                                               │
│  • Reviews code for quality                                     │
│  • Checks adherence to standards                                │
│  • Suggests improvements                                        │
│  • Validates test coverage                                      │
├─────────────────────────────────────────────────────────────────┤
│  You (Project Owner)                                            │
│  • Final approval                                               │
│  • Product decisions                                            │
│  • Manual testing                                               │
│  • Client communication                                         │
└─────────────────────────────────────────────────────────────────┘
```

**Required Configuration Files:**

```
project-root/
├── CLAUDE.md              # Claude Code instructions
├── AGENTS.md              # Agent roles & responsibilities
├── .cursorrules           # Cursor AI rules (if using Cursor)
├── DECISIONS.md           # This file - architecture decisions
├── ROADMAP.md             # Development phases & milestones
├── CHANGELOG.md           # Version history
├── CONTRIBUTING.md        # Contribution guidelines
└── docs/
    ├── ARCHITECTURE.md    # System architecture overview
    ├── API.md             # API documentation
    ├── COMPONENTS.md      # Component library docs
    └── DEPLOYMENT.md      # Deployment procedures
```

---

## STRICT PROJECT STRUCTURE

```
velikibukovec/
│
├── 📁 apps/
│   │
│   ├── 📁 web/                          # Public website (Next.js static)
│   │   ├── 📁 app/                      # Next.js App Router
│   │   │   ├── 📁 (public)/             # Public routes group
│   │   │   │   ├── 📁 vijesti/          # News pages
│   │   │   │   │   ├── page.tsx         # News list
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx     # Single news
│   │   │   │   ├── 📁 dokumenti/        # Documents
│   │   │   │   ├── 📁 dogadanja/        # Events
│   │   │   │   ├── 📁 galerija/         # Gallery
│   │   │   │   ├── 📁 kontakt/          # Contact
│   │   │   │   └── ... (other sections)
│   │   │   ├── layout.tsx               # Root layout
│   │   │   ├── page.tsx                 # Homepage
│   │   │   └── globals.css              # Global styles
│   │   │
│   │   ├── 📁 components/               # Web-specific components
│   │   │   ├── 📁 layouts/              # Layout components
│   │   │   │   ├── public-layout.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── footer.tsx
│   │   │   │   └── index.ts
│   │   │   ├── 📁 sections/             # Page sections
│   │   │   │   ├── hero.tsx
│   │   │   │   ├── news-section.tsx
│   │   │   │   ├── events-section.tsx
│   │   │   │   └── index.ts
│   │   │   ├── 📁 features/             # Feature components
│   │   │   │   ├── post-card.tsx
│   │   │   │   ├── document-card.tsx
│   │   │   │   ├── chatbot-widget.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 lib/                      # Utilities
│   │   │   ├── api.ts                   # API client
│   │   │   ├── utils.ts                 # Helper functions
│   │   │   └── constants.ts             # Constants
│   │   │
│   │   ├── 📁 hooks/                    # React hooks
│   │   │   ├── use-scroll-animation.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 public/                   # Static assets
│   │   │   ├── images/
│   │   │   ├── fonts/
│   │   │   └── favicon.ico
│   │   │
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   │
│   └── 📁 admin/                        # Admin panel (Next.js SSR)
│       ├── 📁 app/
│       │   ├── 📁 (auth)/               # Auth routes (no sidebar)
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   └── layout.tsx
│       │   │
│       │   ├── 📁 (dashboard)/          # Dashboard routes (with sidebar)
│       │   │   ├── page.tsx             # Dashboard home
│       │   │   ├── 📁 posts/
│       │   │   │   ├── page.tsx         # Posts list
│       │   │   │   ├── new/
│       │   │   │   │   └── page.tsx     # Create post
│       │   │   │   └── [id]/
│       │   │   │       └── edit/
│       │   │   │           └── page.tsx # Edit post
│       │   │   ├── 📁 documents/
│       │   │   ├── 📁 events/
│       │   │   ├── 📁 galleries/
│       │   │   ├── 📁 tenders/
│       │   │   ├── 📁 pages/
│       │   │   ├── 📁 settings/
│       │   │   └── layout.tsx           # Dashboard layout with sidebar
│       │   │
│       │   ├── 📁 api/                  # API routes
│       │   │   ├── 📁 auth/
│       │   │   │   └── [...nextauth]/
│       │   │   │       └── route.ts
│       │   │   ├── 📁 posts/
│       │   │   │   ├── route.ts         # GET (list), POST (create)
│       │   │   │   └── [id]/
│       │   │   │       └── route.ts     # GET, PUT, DELETE
│       │   │   ├── 📁 documents/
│       │   │   ├── 📁 ai/
│       │   │   │   ├── generate/
│       │   │   │   │   └── route.ts     # AI content generation
│       │   │   │   └── chat/
│       │   │   │       └── route.ts     # Chatbot
│       │   │   ├── 📁 build/
│       │   │   │   └── trigger/
│       │   │   │       └── route.ts     # Trigger rebuild
│       │   │   └── 📁 analytics/
│       │   │       └── route.ts         # Cloudflare stats
│       │   │
│       │   ├── layout.tsx
│       │   └── globals.css
│       │
│       ├── 📁 components/
│       │   ├── 📁 layouts/
│       │   │   ├── admin-layout.tsx
│       │   │   ├── sidebar.tsx
│       │   │   ├── admin-header.tsx
│       │   │   └── index.ts
│       │   ├── 📁 features/
│       │   │   ├── 📁 posts/
│       │   │   │   ├── post-editor.tsx
│       │   │   │   ├── post-list.tsx
│       │   │   │   ├── post-form.tsx
│       │   │   │   └── index.ts
│       │   │   ├── 📁 documents/
│       │   │   ├── 📁 ai/
│       │   │   │   ├── ai-assistant.tsx
│       │   │   │   ├── content-generator.tsx
│       │   │   │   └── index.ts
│       │   │   ├── 📁 dashboard/
│       │   │   │   ├── stats-cards.tsx
│       │   │   │   ├── recent-activity.tsx
│       │   │   │   └── index.ts
│       │   │   └── index.ts
│       │   └── index.ts
│       │
│       ├── 📁 lib/
│       │   ├── auth.ts                  # NextAuth config
│       │   ├── api-client.ts
│       │   └── utils.ts
│       │
│       ├── 📁 hooks/
│       │   ├── use-posts.ts             # React Query hooks
│       │   ├── use-documents.ts
│       │   └── index.ts
│       │
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── package.json
│
│
├── 📁 packages/
│   │
│   ├── 📁 database/                     # Prisma + Database
│   │   ├── 📁 prisma/
│   │   │   ├── schema.prisma            # Database schema
│   │   │   ├── 📁 migrations/           # Migration files
│   │   │   └── seed.ts                  # Seed data
│   │   ├── 📁 src/
│   │   │   ├── client.ts                # Prisma client export
│   │   │   ├── 📁 repositories/         # Data access layer
│   │   │   │   ├── posts.ts
│   │   │   │   ├── documents.ts
│   │   │   │   ├── users.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── 📁 shared/                       # Shared utilities & types
│   │   ├── 📁 src/
│   │   │   ├── 📁 types/                # TypeScript types
│   │   │   │   ├── posts.ts
│   │   │   │   ├── documents.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── api.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 schemas/              # Zod validation schemas
│   │   │   │   ├── posts.ts
│   │   │   │   ├── documents.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 utils/                # Shared utilities
│   │   │   │   ├── formatters.ts        # Date, number formatters
│   │   │   │   ├── slugify.ts
│   │   │   │   ├── validators.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 constants/
│   │   │   │   ├── categories.ts
│   │   │   │   ├── roles.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── 📁 ui/                           # Shared UI components
│       ├── 📁 src/
│       │   ├── 📁 primitives/           # Base components (shadcn)
│       │   │   ├── button.tsx
│       │   │   ├── input.tsx
│       │   │   ├── label.tsx
│       │   │   ├── badge.tsx
│       │   │   ├── avatar.tsx
│       │   │   ├── spinner.tsx
│       │   │   ├── skeleton.tsx
│       │   │   └── index.ts
│       │   ├── 📁 components/           # Composite components
│       │   │   ├── card.tsx
│       │   │   ├── modal.tsx
│       │   │   ├── dropdown.tsx
│       │   │   ├── toast.tsx
│       │   │   ├── form-field.tsx
│       │   │   ├── data-table.tsx
│       │   │   ├── pagination.tsx
│       │   │   ├── file-upload.tsx
│       │   │   └── index.ts
│       │   ├── 📁 animations/           # Framer Motion presets
│       │   │   ├── presets.ts
│       │   │   ├── variants.ts
│       │   │   └── index.ts
│       │   ├── 📁 hooks/                # UI-related hooks
│       │   │   ├── use-toast.ts
│       │   │   ├── use-modal.ts
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── tailwind.config.js           # Shared Tailwind config
│       ├── tsconfig.json
│       └── package.json
│
│
├── 📁 tooling/                          # Shared tooling configs
│   ├── 📁 eslint/
│   │   └── base.js
│   ├── 📁 typescript/
│   │   └── base.json
│   └── 📁 prettier/
│       └── base.js
│
├── 📁 docs/                             # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── COMPONENTS.md
│   ├── DEPLOYMENT.md
│   └── 📁 adr/                          # Architecture Decision Records
│       ├── 001-use-nextjs.md
│       ├── 002-headless-architecture.md
│       └── ...
│
├── 📁 scripts/                          # Build & deploy scripts
│   ├── deploy-web.sh
│   ├── deploy-admin.sh
│   ├── backup-db.sh
│   └── seed-db.ts
│
├── 📁 .github/
│   ├── 📁 workflows/
│   │   ├── ci.yml                       # Lint, test, type-check
│   │   ├── deploy-web.yml               # Deploy public site
│   │   └── deploy-admin.yml             # Deploy admin
│   └── 📁 ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
│
├── CLAUDE.md                            # Claude Code instructions
├── AGENTS.md                            # Agent definitions
├── DECISIONS.md                         # Architecture decisions (this file)
├── ROADMAP.md                           # Development roadmap
├── CHANGELOG.md                         # Version history
├── CONTRIBUTING.md                      # Contribution guidelines
├── README.md                            # Project overview
├── turbo.json                           # Turborepo config
├── package.json                         # Root package.json
├── pnpm-workspace.yaml                  # pnpm workspace config
└── .gitignore
```

**Naming Conventions:**

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `post-editor.tsx`, `use-posts.ts` |
| Components | PascalCase | `PostEditor`, `AdminLayout` |
| Functions | camelCase | `formatDate()`, `generateSlug()` |
| Constants | SCREAMING_SNAKE | `MAX_FILE_SIZE`, `API_URL` |
| Types | PascalCase | `Post`, `UserRole`, `ApiResponse` |
| CSS classes | kebab-case (Tailwind) | `bg-primary-500`, `text-lg` |
| Database tables | snake_case | `posts`, `gallery_images` |
| API routes | kebab-case | `/api/posts`, `/api/ai/generate` |
| Env variables | SCREAMING_SNAKE | `DATABASE_URL`, `OLLAMA_API_KEY` |

**Import Order (enforced by ESLint):**
```typescript
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. External packages
import { motion } from 'framer-motion';
import { z } from 'zod';

// 3. Internal packages (@repo/*)
import { Button } from '@repo/ui';
import { PostSchema } from '@repo/shared';
import { db } from '@repo/database';

// 4. Local imports (relative)
import { PostCard } from '@/components/features';
import { formatDate } from '@/lib/utils';

// 5. Types (if separate)
import type { Post } from '@repo/shared';

// 6. Styles (if any)
import './styles.css';
```

---

## DOCUMENTATION SYSTEM

**Documentation Types:**

```
┌─────────────────────────────────────────────────────────────────┐
│  LIVING DOCUMENTS (updated continuously)                        │
├─────────────────────────────────────────────────────────────────┤
│  DECISIONS.md    - Architecture decisions (this file)           │
│  CHANGELOG.md    - What changed in each version                 │
│  ROADMAP.md      - Current progress & upcoming work             │
│  README.md       - Project overview & quick start               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  REFERENCE DOCS (updated when implementation changes)           │
├─────────────────────────────────────────────────────────────────┤
│  docs/ARCHITECTURE.md  - System overview, diagrams              │
│  docs/API.md           - API endpoint documentation             │
│  docs/COMPONENTS.md    - UI component library                   │
│  docs/DEPLOYMENT.md    - How to deploy                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ADRs - Architecture Decision Records (append-only)             │
├─────────────────────────────────────────────────────────────────┤
│  docs/adr/001-use-nextjs.md                                     │
│  docs/adr/002-headless-architecture.md                          │
│  docs/adr/003-ai-content-pipeline.md                            │
│  ... (one file per major decision)                              │
└─────────────────────────────────────────────────────────────────┘
```

**CHANGELOG Format (Keep a Changelog standard):**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- AI content generation for posts
### Changed
- Improved mobile navigation
### Fixed
- Image upload memory leak

## [1.0.0] - 2026-03-15
### Added
- Initial release
- Public website with all sections
- Admin panel with post management
- AI chatbot integration
```

---

## DEVELOPMENT ROADMAP

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 0: Foundation (Week 1)                                   │
│  ═══════════════════════════════════════════════════════════    │
│  □ Project setup (Turborepo, configs, CI/CD)                    │
│  □ Database schema implementation (Prisma)                      │
│  □ Authentication system (NextAuth)                             │
│  □ Shared UI components (shadcn/ui setup)                       │
│  □ Design tokens & Tailwind config                              │
│                                                                 │
│  Deliverable: Empty but working apps with auth                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: Admin Core (Week 2-3)                                 │
│  ═══════════════════════════════════════════════════════════    │
│  □ Admin layout (sidebar, header, responsive)                   │
│  □ Dashboard page (stats, recent activity)                      │
│  □ Posts CRUD (list, create, edit, delete)                      │
│  □ Rich text editor (TipTap) integration                        │
│  □ Image upload system                                          │
│  □ Documents management                                         │
│  □ Static pages management                                      │
│                                                                 │
│  Deliverable: Functional admin without AI                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: AI Integration (Week 4)                               │
│  ═══════════════════════════════════════════════════════════    │
│  □ Ollama Cloud connection                                      │
│  □ AI content generation pipeline                               │
│  □ Google Search integration for context                        │
│  □ Multi-step review flow                                       │
│  □ Facebook preview & posting                                   │
│  □ Image handling in AI flow                                    │
│                                                                 │
│  Deliverable: AI-powered post creation                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: Public Website (Week 5-6)                             │
│  ═══════════════════════════════════════════════════════════    │
│  □ Homepage with all sections                                   │
│  □ News listing & detail pages                                  │
│  □ Documents section with categories                            │
│  □ Events calendar                                              │
│  □ Gallery with lightbox                                        │
│  □ All static pages (organization, info, etc.)                  │
│  □ Contact page with forms                                      │
│  □ Responsive design & animations                               │
│  □ SEO implementation                                           │
│                                                                 │
│  Deliverable: Complete public website                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: Deployment & Build System (Week 7)                    │
│  ═══════════════════════════════════════════════════════════    │
│  □ VPS setup (Netcup)                                           │
│  □ PostgreSQL + Ollama installation                             │
│  □ Admin deployment to VPS                                      │
│  □ Static site build pipeline                                   │
│  □ Siteground deployment (SFTP)                                 │
│  □ Cloudflare configuration                                     │
│  □ Instant publish system with rollback                         │
│  □ Backup automation (R2)                                       │
│                                                                 │
│  Deliverable: Live, deployable system                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: Content Migration (Week 8)                            │
│  ═══════════════════════════════════════════════════════════    │
│  □ Export content from current WordPress                        │
│  □ Content mapping to new structure                             │
│  □ Automated migration scripts                                  │
│  □ Image migration & optimization                               │
│  □ Content review & cleanup                                     │
│  □ Redirect setup (old URLs → new)                              │
│                                                                 │
│  Deliverable: All content migrated                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 6: Chatbot & Polish (Week 9)                             │
│  ═══════════════════════════════════════════════════════════    │
│  □ RAG system setup (pgvector)                                  │
│  □ Document processing pipeline                                 │
│  □ Chatbot UI widget                                            │
│  □ Chatbot testing & training                                   │
│  □ Performance optimization                                     │
│  □ Accessibility audit (WCAG AA)                                │
│  □ Security audit (NIS2)                                        │
│  □ Final animations & polish                                    │
│                                                                 │
│  Deliverable: Complete chatbot                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 7: Testing & Launch (Week 10)                            │
│  ═══════════════════════════════════════════════════════════    │
│  □ End-to-end testing                                           │
│  □ User acceptance testing with client                          │
│  □ Staff training                                               │
│  □ Documentation finalization                                   │
│  □ DNS switch                                                   │
│  □ Launch!                                                      │
│  □ Post-launch monitoring                                       │
│                                                                 │
│  Deliverable: LIVE WEBSITE 🎉                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

*Last updated: 2026-01-23*
