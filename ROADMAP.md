# ROADMAP.md - Sprint-Ready Development Roadmap

> AI-agent optimized roadmap with clear gates and parallel tracks.
> Each sprint is independently completable with defined acceptance criteria.
> Last updated: 2026-01-23

## Current Status

**Active Sprint:** 0.2 - Database Schema
**Overall Progress:** 1/71 sprints
**Target Launch:** TBD
**Latest Audit:** Phase 0.1 execution review in `docs/audits/PHASE-0.1-EXECUTION-REVIEW.md`

---

## Development Setup

```
┌─────────────────────────────────────────────────────────────────┐
│  DOMAIN SITUATION                                               │
├─────────────────────────────────────────────────────────────────┤
│  Current site is LIVE at velikibukovec.hr                       │
│  Domain is OFF LIMITS until launch day                          │
│                                                                 │
│  DEVELOPMENT ENVIRONMENTS:                                      │
│  ├── Local:     localhost:3000 (web), localhost:3001 (admin)   │
│  ├── Staging:   vb-staging.pages.dev (Cloudflare Pages preview)│
│  ├── Admin:     100.x.x.x:3001 (VPS via Tailscale)             │
│  └── Database:  VPS PostgreSQL (test data)                      │
│                                                                 │
│  LAUNCH DAY ONLY:                                               │
│  └── Switch DNS to point to new infrastructure                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Parallel Tracks

```
┌─────────────────────────────────────────────────────────────────┐
│  TRACK A: Application Code              TRACK B: Infrastructure │
│  ─────────────────────────              ─────────────────────── │
│  Phase 0: Foundation ──────────────────► Phase 3: VPS Setup    │
│       ↓                                       ↓                 │
│  Phase 1: Admin Core                    (runs in parallel)      │
│       ↓                                       ↓                 │
│  Phase 2: Public Site                   Cloudflare setup        │
│       ↓                                       ↓                 │
│  Phase 5: Communication                 Backup automation       │
│       ↓                                                         │
├─────────────────────────────────────────────────────────────────┤
│  TRACK C: Content (Human)               TRACK D: AI (Last)      │
│  ────────────────────────               ──────────────────      │
│  Phase 4: Migration                     Phase 6: AI Integration │
│  (can start anytime)                    Phase 7: Chatbot        │
│  WordPress export, mapping              (after core stable)     │
├─────────────────────────────────────────────────────────────────┤
│  FINAL: Phase 8 - Testing & Launch (all tracks converge)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sprint Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Pending |
| 🔄 | In Progress |
| ✅ | Completed |
| ⏸️ | Blocked |
| 🔀 | Can run in parallel with other sprints in same phase |
| 🔗 | Has dependency (listed in Depends column) |

---

## Phase 0: Foundation
**Status:** In Progress | **Progress:** 1/6 | **Track:** A

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 0.1 ✅ | Project scaffold | No | - | `pnpm build` succeeds for both apps |
| 0.2 🔄 | Database schema | 🔀 | 0.1 | `pnpm db:push` creates all tables |
| 0.3 ⬜ | Better Auth setup | 🔀 | 0.1 | Login/logout works, session persists |
| 0.4 ⬜ | UI foundation | 🔀 | 0.1 | Button + Input + Card render correctly |
| 0.5 ⬜ | CI/CD pipeline | 🔀 | 0.1 | PR triggers lint + type-check + test |
| 0.6 ⬜ | Integration verify | 🔗 | 0.2-0.5 | Full auth flow with DB works |

### Sprint 0.1: Project Scaffold
```
Acceptance Criteria:
□ Turborepo monorepo initialized
□ pnpm workspaces configured
□ apps/web (Next.js 16, static export config)
□ apps/admin (Next.js 16, server mode)
□ packages/ui (empty, tsconfig ready)
□ packages/shared (empty, tsconfig ready)
□ packages/database (empty, tsconfig ready)
□ TypeScript strict mode in all packages
□ ESLint + Prettier configured
□ .gitignore includes .env files
□ pnpm build succeeds (even if apps are empty shells)

Gate: pnpm build && pnpm lint && pnpm type-check
```

### Sprint 0.2: Database Schema
```
Acceptance Criteria:
□ Prisma installed in packages/database
□ schema.prisma with all tables from DATABASE.md
□ Better Auth tables included
□ pgvector extension enabled
□ DATABASE_URL in .env.example
□ pnpm db:push creates tables in local PostgreSQL
□ Basic seed script (1 test user)

Gate: pnpm db:push && pnpm db:seed
```

### Sprint 0.3: Better Auth Setup
```
Acceptance Criteria:
□ Better Auth installed and configured
□ Email + password authentication works
□ Google OAuth configured (needs credentials)
□ Session middleware in admin app
□ Protected route wrapper component
□ Login page (basic, unstyled OK)
□ Logout functionality
□ /api/auth/* routes respond

Gate: Can login with email/password, session persists on refresh
```

### Sprint 0.4: UI Foundation
```
Acceptance Criteria:
□ Tailwind v4 configured with design tokens from DESIGN-SYSTEM.md
□ shadcn/ui initialized (Button, Input, Card, Label)
□ Inter + Plus Jakarta Sans fonts loaded
□ Color palette matches design tokens
□ packages/ui exports primitives
□ Both apps can import from @repo/ui

Gate: Button with all variants renders correctly in both apps
```

### Sprint 0.5: CI/CD Pipeline
```
Acceptance Criteria:
□ .github/workflows/ci.yml created
□ On PR: lint, type-check, test
□ On merge to main: build check
□ Cloudflare Pages connected (preview deploys)
□ Environment variables documented

Gate: Create test PR, CI runs and passes
```

### Sprint 0.6: Integration Verification
```
Acceptance Criteria:
□ Admin app connects to database
□ Login creates session in database
□ Protected routes redirect to login
□ Logout clears session
□ All previous gates still pass

Gate: pnpm test:e2e (basic auth flow)
```

**Phase 0 Deliverable:** Empty but working apps with authentication

---

## Phase 1: Admin Core
**Status:** Not Started | **Progress:** 0/12 | **Track:** A

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 1.1 ⬜ | Admin layout shell | No | Phase 0 | Sidebar + header render, mobile menu works |
| 1.2 ⬜ | Dashboard page | 🔀 | 1.1 | Stats cards + charts display (mock data OK) |
| 1.3 ⬜ | Posts list + CRUD | 🔀 | 1.1 | Create, read, update, delete posts works |
| 1.4 ⬜ | TipTap editor | 🔗 | 1.3 | Rich text editing in post form |
| 1.5 ⬜ | Image upload (R2) | 🔀 | 1.1 | Upload image, get R2 URL, display |
| 1.6 ⬜ | Documents management | 🔀 | 1.5 | Upload PDF, categorize, list, delete |
| 1.7 ⬜ | Static pages CRUD | 🔀 | 1.4 | Create/edit static pages with TipTap |
| 1.8 ⬜ | Events calendar | 🔀 | 1.1 | CRUD events, calendar view |
| 1.9 ⬜ | Gallery management | 🔗 | 1.5 | Albums, bulk upload, reorder |
| 1.10 ⬜ | Settings page | 🔀 | 1.1 | Profile, password, 2FA, sessions |
| 1.11 ⬜ | User management | 🔀 | 1.10 | CRUD users (admin only) |
| 1.12 ⬜ | Admin integration test | 🔗 | 1.1-1.11 | All CRUD operations work end-to-end |

### Sprint 1.1: Admin Layout Shell
```
Acceptance Criteria:
□ Sidebar with navigation (all menu items from FEATURES.md)
□ Header with user menu dropdown
□ Mobile: hamburger menu, slide-out sidebar
□ Active route highlighting
□ Breadcrumbs component
□ Layout matches DESIGN-SYSTEM.md patterns
□ Responsive: 375px, 768px, 1024px+

Gate: Navigate all routes, mobile menu works, no layout shifts
```

### Sprint 1.3: Posts List + CRUD
```
Acceptance Criteria:
□ Posts list page with DataTable
□ Search + filter by category + status
□ Pagination
□ Create post form (title, content placeholder, category, status)
□ Edit post (load existing, save changes)
□ Delete post (confirmation modal)
□ API routes: GET/POST/PUT/DELETE /api/posts
□ Zod validation on client and server
□ Toast notifications on success/error
□ Loading states

Gate: Create post, edit it, find in list, delete it
```

### Sprint 1.5: Image Upload (R2)
```
Acceptance Criteria:
□ Image upload component (drag-drop + click)
□ Client-side validation (file type, size < 10MB)
□ Upload to API route
□ Sharp processing on server (WebP, variants)
□ Upload to Cloudflare R2
□ Return R2 URLs (thumb, medium, large)
□ Display uploaded image with loading state
□ Delete image from R2

Gate: Upload image, see thumbnail, delete it
```

**Phase 1 Deliverable:** Functional admin panel (no AI features)

---

## Phase 2: Public Website
**Status:** Not Started | **Progress:** 0/12 | **Track:** A

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 2.1 ⬜ | Public layout + nav | No | Phase 1 | Header, footer, mobile nav |
| 2.2 ⬜ | Homepage | 🔗 | 2.1 | Hero, news, events, quick links |
| 2.3 ⬜ | News listing | 🔀 | 2.1 | List, pagination, category filter |
| 2.4 ⬜ | News detail page | 🔗 | 2.3 | Single post, related posts |
| 2.5 ⬜ | Documents section | 🔀 | 2.1 | List, filter by category/year |
| 2.6 ⬜ | Events calendar | 🔀 | 2.1 | Monthly view, event details |
| 2.7 ⬜ | Gallery pages | 🔀 | 2.1 | Albums, lightbox |
| 2.8 ⬜ | Static pages | 🔀 | 2.1 | All pages from menu structure |
| 2.9 ⬜ | Contact + forms | 🔀 | 2.1 | Contact form, problem report |
| 2.10 ⬜ | Search (basic) | 🔗 | 2.3-2.8 | Full-text search, results page |
| 2.11 ⬜ | SEO implementation | 🔗 | 2.2-2.9 | Meta, OG, JSON-LD, sitemap |
| 2.12 ⬜ | Static export verify | 🔗 | 2.1-2.11 | `next build && next export` works |

### Sprint 2.2: Homepage
```
Acceptance Criteria:
□ Hero section with featured news
□ Quick links grid (Natječaji, Prijava problema, etc.)
□ Latest news cards (3-4 items)
□ Upcoming events section
□ Newsletter signup widget
□ Responsive layout per DESIGN-SYSTEM.md
□ Animations (fade-in on scroll)
□ Static generation (getStaticProps)

Gate: Homepage loads with real data from DB, Lighthouse > 80
```

### Sprint 2.10: Search (Basic)
```
Acceptance Criteria:
□ Cmd+K / Ctrl+K opens search modal
□ Search input with debounce (150ms)
□ PostgreSQL full-text search (tsvector)
□ Results grouped by type (news, docs, pages, events)
□ Keyboard navigation (↑↓ Enter Esc)
□ Highlighted matching text
□ Recent searches (localStorage)
□ Mobile: full-screen search

Gate: Search "proračun", find relevant documents and news
```

### Sprint 2.11: SEO Implementation
```
Acceptance Criteria:
□ Next.js Metadata API for all pages
□ Dynamic meta title/description
□ Open Graph tags (title, description, image)
□ JSON-LD structured data:
  - Organization (homepage)
  - Article (news posts)
  - Event (events)
□ Auto-generated sitemap.xml
□ robots.txt (allow all)
□ Canonical URLs

Gate: Facebook debugger shows correct preview, Google Rich Results test passes
```

**Phase 2 Deliverable:** Complete public website (static export ready)

---

## Phase 3: Infrastructure
**Status:** Not Started | **Progress:** 0/9 | **Track:** B (parallel with Track A)

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 3.1 ⬜ | VPS provisioning | No | Phase 0 | SSH access via Tailscale works |
| 3.2 ⬜ | VPS hardening | 🔗 | 3.1 | UFW enabled, root disabled, fail2ban |
| 3.3 ⬜ | PostgreSQL setup | 🔗 | 3.2 | DB created, pgvector installed |
| 3.4 ⬜ | Ollama local | 🔗 | 3.2 | nomic-embed-text responds |
| 3.5 ⬜ | Cloudflare R2 | 🔀 | - | Bucket created, CORS configured |
| 3.6 ⬜ | Cloudflare Pages | 🔀 | - | Preview deploys working |
| 3.7 ⬜ | Admin deployment | 🔗 | 3.3 | PM2 serves admin on VPS |
| 3.8 ⬜ | Backup automation | 🔗 | 3.3, 3.5 | Daily DB backup to R2 |
| 3.9 ⬜ | Monitoring setup | 🔀 | 3.7 | UptimeRobot + Sentry configured |

### Sprint 3.1: VPS Provisioning
```
Acceptance Criteria:
□ Netcup VPS ordered and provisioned
□ Ubuntu 24.04 LTS installed
□ Non-root user created (deploy)
□ Tailscale installed and authenticated
□ SSH works via Tailscale IP only
□ Public IP noted (for later DNS)

Gate: ssh deploy@100.x.x.x works
```

### Sprint 3.2: VPS Hardening
```
Acceptance Criteria:
□ Root SSH login disabled
□ Password auth disabled (key only)
□ UFW firewall enabled:
  - Allow SSH from Tailscale only
  - Allow 80/443 from Cloudflare IPs
□ fail2ban installed and running
□ Automatic security updates enabled
□ All services bind to 127.0.0.1

Gate: Security checklist from SECURITY.md passes
```

**Phase 3 Deliverable:** Production-ready infrastructure

---

## Phase 4: Content Migration
**Status:** Not Started | **Progress:** 0/7 | **Track:** C (Human-driven)

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 4.1 ⬜ | WordPress export | No | - | XML + media files downloaded |
| 4.2 ⬜ | Content mapping | 🔗 | 4.1 | Spreadsheet: old URL → new URL |
| 4.3 ⬜ | Migration scripts | 🔗 | 4.2, Phase 1 | Scripts parse and transform |
| 4.4 ⬜ | Test migration | 🔗 | 4.3 | Run on staging, verify content |
| 4.5 ⬜ | Image migration | 🔗 | 4.4, 3.5 | All images in R2, URLs updated |
| 4.6 ⬜ | Final migration | 🔗 | 4.5 | Production data loaded |
| 4.7 ⬜ | Redirects setup | 🔗 | 4.6 | _redirects file, old URLs work |

### Sprint 4.1: WordPress Export (Human Task)
```
Acceptance Criteria:
□ WordPress admin access confirmed
□ Tools → Export → All content downloaded
□ Media library downloaded (FTP or plugin)
□ Files stored locally for processing

Gate: XML file + media folder provided to Claude
```

### Sprint 4.3: Migration Scripts
```
Acceptance Criteria:
□ Parse WordPress XML to JSON
□ Map categories to new structure
□ Generate slugs from titles
□ Extract inline images from content
□ Transform HTML content (clean up WP artifacts)
□ Output: JSON ready for database import

Gate: pnpm migrate:parse produces valid JSON
```

**Phase 4 Deliverable:** All content migrated, redirects working

---

## Phase 5: Communication Features
**Status:** Not Started | **Progress:** 0/6 | **Track:** A

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 5.1 ⬜ | Contact form backend | No | Phase 1 | Form submits, stored in DB, email sent |
| 5.2 ⬜ | Problem reports | 🔀 | 5.1 | Submit with images, status workflow |
| 5.3 ⬜ | Admin inbox | 🔗 | 5.1, 5.2 | View messages, update status |
| 5.4 ⬜ | Newsletter subscribe | 🔀 | Phase 2 | Double opt-in, stored in DB |
| 5.5 ⬜ | Newsletter send | 🔗 | 5.4 | Manual + weekly automated |
| 5.6 ⬜ | Email templates | 🔗 | 5.1-5.5 | Croatian, responsive HTML |

### Sprint 5.1: Contact Form Backend
```
Acceptance Criteria:
□ POST /api/contact endpoint
□ Zod validation (name, email, subject, message)
□ Store in contact_messages table
□ Send notification email to admin
□ Send confirmation email to sender
□ Rate limiting (5 per hour per IP)
□ Honeypot spam protection

Gate: Submit form, appears in DB, emails received
```

**Phase 5 Deliverable:** Full communication features working

---

## Phase 6: AI Integration
**Status:** Not Started | **Progress:** 0/7 | **Track:** D (Last)

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 6.1 ⬜ | Ollama Cloud connection | No | Phase 3 | API responds, model works |
| 6.2 ⬜ | AI queue system | 🔗 | 6.1 | Queue table, worker processes |
| 6.3 ⬜ | Google Search integration | 🔀 | 6.1 | Context gathering works |
| 6.4 ⬜ | Content generation | 🔗 | 6.2, 6.3 | Generate draft from input |
| 6.5 ⬜ | Self-review step | 🔗 | 6.4 | AI checks for "slop" |
| 6.6 ⬜ | Generation UI | 🔗 | 6.5 | Admin UI for AI flow |
| 6.7 ⬜ | Facebook posting | 🔀 | Phase 1 | Post to page from admin |

### Sprint 6.2: AI Queue System
```
Acceptance Criteria:
□ ai_queue table (from DATABASE.md)
□ Worker polls for pending jobs
□ Rate limit detection (429 response)
□ Exponential backoff retry (30s, 60s, 120s)
□ Max 3 attempts before fail
□ Status updates in real-time
□ Admin can see queue status

Gate: Submit job, hit rate limit, auto-retry succeeds
```

### Sprint 6.4: Content Generation
```
Acceptance Criteria:
□ Input: photos + notes
□ Step 1: Extract context from images (if supported)
□ Step 2: Google Search for additional context
□ Step 3: Generate article with Llama 3.1 70B
□ Croatian formal tone
□ Proper structure (title, intro, body)
□ Output: Draft ready for review

Gate: Input notes about road repair, get coherent Croatian article
```

**Phase 6 Deliverable:** AI-powered content generation working

---

## Phase 7: Chatbot & Polish
**Status:** Not Started | **Progress:** 0/8 | **Track:** D

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 7.1 ⬜ | Embedding pipeline | No | Phase 3 | Content → embeddings → pgvector |
| 7.2 ⬜ | RAG retrieval | 🔗 | 7.1 | Query → relevant chunks |
| 7.3 ⬜ | Chatbot API | 🔗 | 7.2 | Question → answer with sources |
| 7.4 ⬜ | Chatbot UI | 🔗 | 7.3 | Floating widget, conversation |
| 7.5 ⬜ | Semantic search upgrade | 🔗 | 7.1 | Hybrid search (keyword + vector) |
| 7.6 ⬜ | Performance optimization | 🔀 | Phase 2 | Lighthouse > 90 all pages |
| 7.7 ⬜ | Accessibility audit | 🔀 | Phase 2 | WCAG AA compliance |
| 7.8 ⬜ | Security audit | 🔀 | All | NIS2 checklist passes |

### Sprint 7.1: Embedding Pipeline
```
Acceptance Criteria:
□ On content publish: generate embeddings
□ Chunk content (~500 tokens)
□ Call local Ollama (nomic-embed-text)
□ Store in embeddings table
□ Index with pgvector (HNSW)
□ Process existing content (backfill)
□ Process PDFs (extract text, chunk, embed)

Gate: Publish post, embedding appears in DB
```

### Sprint 7.4: Chatbot UI
```
Acceptance Criteria:
□ Floating action button (bottom-right)
□ Click opens chat modal
□ Message input + send button
□ Conversation history
□ Typing indicator while AI responds
□ Source citations with links
□ Mobile-friendly
□ Close/minimize

Gate: Ask "radno vrijeme općine", get correct answer with source
```

**Phase 7 Deliverable:** Complete chatbot, polished product

---

## Phase 8: Testing & Launch
**Status:** Not Started | **Progress:** 0/8 | **Track:** Final (all converge)

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 8.1 ⬜ | E2E test suite | No | All features | Critical flows automated |
| 8.2 ⬜ | User acceptance testing | 🔗 | 8.1 | Client approves |
| 8.3 ⬜ | Staff training | 🔗 | 8.2 | Admins can use CMS |
| 8.4 ⬜ | Documentation | 🔀 | Phase 7 | User guide complete |
| 8.5 ⬜ | Pre-launch checklist | 🔗 | 8.1-8.4 | All items green |
| 8.6 ⬜ | DNS switch | 🔗 | 8.5 | Domain points to new site |
| 8.7 ⬜ | Launch | 🔗 | 8.6 | Site live! |
| 8.8 ⬜ | Post-launch monitoring | 🔗 | 8.7 | 7 days stable |

### Sprint 8.1: E2E Test Suite
```
Acceptance Criteria:
□ Playwright installed and configured
□ Test: Public homepage loads
□ Test: Search works
□ Test: Admin login
□ Test: Create + publish post
□ Test: Upload document
□ Test: Contact form submit
□ Test: Chatbot responds
□ Tests run in CI

Gate: pnpm test:e2e passes all tests
```

### Sprint 8.6: DNS Switch
```
Acceptance Criteria:
□ All tests passing
□ Client approval received
□ Backup of old site confirmed
□ Low-traffic time chosen
□ In Cloudflare DNS:
  - A/CNAME for velikibukovec.hr → Cloudflare Pages
  - A for admin.velikibukovec.hr → VPS IP
□ SSL certificates active
□ Old host notified

Gate: https://velikibukovec.hr shows new site
```

**Phase 8 Deliverable:** 🚀 LIVE WEBSITE

---

## Sprint Summary

| Phase | Sprints | Focus |
|-------|---------|-------|
| 0 | 6 | Foundation (scaffold, auth, UI, CI) |
| 1 | 12 | Admin Core (CRUD, uploads, editor) |
| 2 | 12 | Public Website (pages, search, SEO) |
| 3 | 9 | Infrastructure (VPS, R2, deploys) |
| 4 | 7 | Migration (WordPress → new) |
| 5 | 6 | Communication (forms, newsletter) |
| 6 | 7 | AI Integration (generation, queue) |
| 7 | 8 | Chatbot & Polish (RAG, perf, a11y) |
| 8 | 8 | Launch (E2E, training, go-live) |
| **Total** | **71** | |

---

## How to Use This Roadmap

### For AI Agents (Claude)

1. Check "Active Sprint" at top
2. Read sprint acceptance criteria
3. Complete all criteria
4. Run the gate command
5. Report completion with evidence
6. Human marks sprint ✅

### For Humans

1. Review sprint before starting
2. Provide any human-required inputs
3. Verify gate passes
4. Mark sprint complete
5. Update "Active Sprint"

### Parallel Work

- 🔀 sprints can run simultaneously
- 🔗 sprints have dependencies (check Depends column)
- Track B (infra) can run alongside Track A (code)
- Track C (migration) is mostly human-driven

---

## Change Log

| Date | Change |
|------|--------|
| 2026-01-23 | Initial roadmap created |
| 2026-01-23 | Restructured for AI agent sprints with gates |
