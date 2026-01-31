# ROADMAP.md - Sprint-Ready Development Roadmap

> AI-agent optimized roadmap with clear gates and parallel tracks.
> Each sprint is independently completable with defined acceptance criteria.
> Last updated: 2026-01-31

## Current Status

**Active Sprint:** Sprint 4.5.4 (Gap Analysis & Enrichment Plan)
**Overall Progress:** 62/72 sprints (86%) - Phase 0-4, 5, 6 complete; 7.1+7.5 done; 4.5.1-4.5.3 done
**Recent:** Navigation redesign (11 tasks) - sidebar nav, mobile bottom sheet, PageLayoutV2, new pages
**Target Launch:** TBD
**Latest Audit:** Phase 0/1/4 system audit in `docs/audits/PHASE-0-1-4-SYSTEM-AUDIT.md`
**Staging:** Frontend at http://100.120.125.83/ | Admin at http://100.120.125.83:3001/

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
│  ├── Staging:   velikibukovec-web.pages.dev (Cloudflare Pages) │
│  ├── Admin:     100.120.125.83:3001 (VPS via Tailscale)        │
│  └── Database:  VPS PostgreSQL 17 (velikibukovec)               │
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
**Status:** Completed | **Progress:** 6/6 | **Track:** A

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 0.1 ✅ | Project scaffold | No | - | `pnpm build` succeeds for both apps |
| 0.2 ✅ | Database schema | 🔀 | 0.1 | `pnpm db:push` creates all tables |
| 0.3 ✅ | Better Auth setup | 🔀 | 0.1 | Login/logout works, session persists |
| 0.4 ✅ | UI foundation | 🔀 | 0.1 | Button + Input + Card render correctly |
| 0.5 ✅ | CI/CD pipeline | 🔀 | 0.1 | PR triggers lint + type-check + test |
| 0.6 ✅ | Integration verify | 🔗 | 0.2-0.5 | Full auth flow with DB works |

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
**Status:** Complete | **Progress:** 12/12 | **Track:** A

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 1.1 ✅ | Admin layout shell | No | Phase 0 | Sidebar + header render, mobile menu works |
| 1.2 ✅ | Dashboard page | 🔀 | 1.1 | Stats cards + charts display (mock data OK) |
| 1.3 ✅ | Posts list + CRUD | 🔀 | 1.1 | Create, read, update, delete posts works |
| 1.4 ✅ | TipTap editor | 🔗 | 1.3 | Rich text editing in post form |
| 1.5 ✅ | Image upload (R2) | 🔀 | 1.1 | Upload image, get R2 URL, display |
| 1.6 ✅ | Documents management | 🔀 | 1.5 | Upload PDF, categorize, list, delete |
| 1.7 ✅ | Static pages CRUD | 🔀 | 1.4 | Create/edit static pages with TipTap |
| 1.8 ✅ | Events calendar | 🔀 | 1.1 | CRUD events, calendar view |
| 1.9 ✅ | Gallery management | 🔗 | 1.5 | Albums, bulk upload, reorder |
| 1.10 ✅ | Settings page | 🔀 | 1.1 | Profile, password, 2FA, sessions |
| 1.11 ✅ | User management | 🔀 | 1.10 | CRUD users (admin only) |
| 1.12 ✅ | Admin integration test | 🔗 | 1.1-1.11 | All CRUD operations work end-to-end |

Recent updates:
- Sprint 1.12 completed: Admin integration tests with Playwright E2E tests for all CRUD modules (posts, pages, events, galleries, settings, users).
- Sprint 1.12 follow-up: Hardened E2E selectors, reused shared auth helper, and added session revocation coverage plus user removal verification.
- Sprint 1.11 completed: User management with CRUD, role-based permissions, soft-delete deactivation, and login blocking for inactive users.
- Sprint 1.11 audit follow-up: tightened role hierarchy enforcement for user management.
- Sprint 2.8 audit follow-up: validated static page slugs, improved section navigation accessibility, and guarded repository queries for invalid slugs.
- Sprint 2.4 follow-up: Hardened news detail page security, metadata fallbacks, and accessibility.
- Phase 0/1/4 system audit: enforced server-side auth and audit logging across admin APIs.
- Sprint 1.10 completed: Settings page with profile, password change, 2FA setup, and sessions management.
- Sprint 1.9 completed: Gallery management with bulk image upload, drag-drop reorder, R2 integration.
- Sprint 1.7 audit fixes: corrected Croatian diacritics and zero-state pagination copy in pages admin UI.
- Sprint 1.9 follow-up: added stricter reorder validation and deduplicated R2 deletions for galleries.
- Settings page hardening: added password confirmation for backup code generation, guarded current session revocation, and improved accessibility copy.

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

### Sprint 1.11: User Management
```
Acceptance Criteria:
□ Users list page with DataTable
□ Search + filter by role (admin/editor) + status (active/inactive)
□ Pagination
□ Create user form (email, name, password, role)
□ Edit user (update profile, change role)
□ Deactivate/activate user
□ Delete user (confirmation modal, cannot delete self)
□ Password reset trigger (sends reset email)
□ API routes: GET/POST/PUT/DELETE /api/users
□ Zod validation on client and server
□ Only admin role can access user management
□ Toast notifications on success/error
□ Loading states

Gate: Create user, assign role, user can login, edit user, deactivate user
```

**Phase 1 Deliverable:** Functional admin panel (no AI features)

---

## Phase 2: Public Website
**Status:** Complete | **Progress:** 12/12 | **Track:** A

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 2.1 ✅ | Public layout + nav | No | Phase 1 | Header, footer, mobile nav |
| 2.2 ✅ | Homepage | 🔗 | 2.1 | Hero, news, events, quick links |
| 2.3 ✅ | News listing | 🔀 | 2.1 | List, pagination, category filter |
| 2.4 ✅ | News detail page | 🔗 | 2.3 | Single post, related posts |
| 2.5 ✅ | Documents section | 🔀 | 2.1 | List, filter by category/year |
| 2.6 ✅ | Events calendar | 🔀 | 2.1 | Monthly view, event details |
| 2.7 ✅ | Gallery pages | 🔀 | 2.1 | Albums, lightbox |
| 2.8 ✅ | Static pages | 🔀 | 2.1 | All pages from menu structure |
| 2.9 ✅ | Contact + forms | 🔀 | 2.1 | Contact form, problem report |
| 2.10 ✅ | Search (basic) | 🔗 | 2.3-2.8 | Full-text search, results page |
| 2.11 ✅ | SEO implementation | 🔗 | 2.2-2.9 | Meta, OG, JSON-LD, sitemap |
| 2.12 ✅ | Static Export Verify | 🔗 | 2.1-2.11 | Build succeeds, 404.html, no hydration errors |

Recent updates:
- Sprint 2.12 follow-up: added build-safe static params generation, public read-only API endpoints, and initial-data hydration for list pages in static export mode.
- Sprint 2.3 audit fixes: validated news URL params, clamped pagination, and added filter loading skeletons.
- Sprint 2.3 completed: News listing page with category filtering, pagination, skeleton loading states, and empty state handling.
- Sprint 2.2 completed: Homepage with hero section, quick links grid, latest news cards, upcoming events, newsletter signup, and scroll-triggered animations.
- Sprint 2.1 completed: Public layout with header, footer, navigation, accessibility, and SEO metadata.
- Sprint 2.1 follow-up: added aria-current states, focus-visible styling, and canonical metadata for the public navigation.

### Sprint 2.1: Public Layout + Nav
```
Acceptance Criteria:
□ Root layout with local font loading (Inter + Plus Jakarta Sans)
□ Header component with logo and mobile-responsive navigation
□ Mega-menu or dropdowns for deep hierarchy (as defined in FEATURES.md)
□ Footer component with quick links, contacts, working hours
□ Mobile drawer navigation (Hamburger menu)
□ SEO basics in layout (metadata base template)
□ Accessibility (skip-to-content, aria-labels)
□ Active state styling for navigation items

Gate: Mobile menu works, footer matches design, no layout shifts
```

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

### Sprint 2.3: News Listing
```
Acceptance Criteria:
□ /vijesti page content
□ Featured post hero card
□ Grid of standard post cards
□ Category filter pills (Općinske aktualnosti, Sport, etc.)
□ Pagination (12 items per page)
□ Search/Filter persistence in URL
□ Loading states / skeletons
□ Empty state handling

Gate: Can browse news, filter by category, and paginate
```

### Sprint 2.4: News Detail Page
```
Acceptance Criteria:
□ /vijesti/[slug] page
□ Hero image with date and category
□ Typography-optimized article content breadth
□ Social share buttons (Facebook, Copy Link)
□ Related posts sidebar (3 items)
□ Image gallery within content (lightbox support)
□ Back to news link
□ Metadata generation for SEO

Gate: Open article, layout looks professional, OG tags correct
```

### Sprint 2.5: Documents Section
```
Acceptance Criteria:
□ /dokumenti page
□ Sidebar navigation for categories (Sjednice, Proračun, etc.)
□ Year filter dropdown
□ Document list items (icon + name + date + download button)
□ Grouping by sub-categories where applicable
□ Search within documents (client-side filter of current list)
□ Mobile view: Accordion for categories

Gate: Find "Proračun 2026", download PDF works
```

### Sprint 2.6: Events Calendar
```
Acceptance Criteria:
□ /dogadanja page
□ Calendar view (Month) and List view toggle
□ Event cards with date badge (Day/Month)
□ Event detail modal or page
□ "Add to Calendar" button (Google/Outlook/ICS)
□ Upcoming vs Past events tabs
□ Location map integration (static map image or link)

Gate: Switch months, click event, see details
```

### Sprint 2.7: Gallery Pages
```
Acceptance Criteria:
□ /galerija page (Albums grid)
□ Album cover with specific styling
□ /galerija/[slug] page (Photos grid)
□ Masonry or justified grid layout for photos
□ Lightbox with prev/next navigation
□ Touch swipe support for lightbox
□ Lazy loading for images

Gate: Open album, swipe through photos in lightbox
```

### Sprint 2.8: Static Pages
```
Acceptance Criteria:
□ Dynamic route catch-all or specific pages for menu structure
□ Sidebar navigation for current section (e.g., Organization)
□ Hero section with title
□ Rich text content rendering (prose)
□ Embed support (maps, YouTube)
□ "Last updated" date display
□ Contact info box for specific departments if applicable

Gate: Navigate "Općinska uprava" section, sidebar highlights correctly
```

### Sprint 2.9: Contact + Forms
```
Acceptance Criteria:
□ /kontakt page with main contact info
□ Map display (Leaflet or similar, no API key preferred if possible)
□ Contact form (Name, Email, Message)
□ Working hours display
□ "Prijava problema" dedicated page/form with Photo upload
□ Form validation (Zod)
□ Success/Error states
□ Rate limiting on submission

Gate: Submit contact form, receive success message
```

### Sprint 2.10: Search (Basic) ✅
```
Acceptance Criteria:
✓ Cmd+K / Ctrl+K opens search modal
✓ Search input with debounce (150ms)
✓ PostgreSQL full-text search (tsvector)
✓ Results grouped by type (news, docs, pages, events)
✓ Keyboard navigation (↑↓ Enter Esc)
✓ Highlighted matching text
✓ Recent searches (localStorage)
✓ Mobile: full-screen search

Gate: Search "proračun", find relevant documents and news
```

### Sprint 2.11: SEO Implementation
```
Acceptance Criteria:
✓ Next.js Metadata API for all pages
✓ Dynamic meta title/description
✓ Open Graph tags (title, description, image)
✓ JSON-LD structured data:
  - Organization (homepage)
  - Article (news posts)
  - Event (events)
✓ Auto-generated sitemap.xml
✓ robots.txt (allow all)
✓ Canonical URLs

Gate: Facebook debugger shows correct preview, Google Rich Results test passes
```

### Sprint 2.12: Static Export Verify ✅
```
Acceptance Criteria:
✓ `next build` produces optimized build
✓ `output: export` in next.config creates /out folder
✓ All dynamic routes (news, galleries, events, pages) are correctly generated
✓ Images use R2 URLs (unoptimized for static export)
✓ 404.html is generated
✓ No hydration errors (searchParams moved to client components)
✓ robots.txt and sitemap.xml generated correctly

Gate: `pnpm build` succeeds and produces working static site

Implementation Notes:
- Converted list pages to client components with Suspense for searchParams
- Fixed LeafletMap SSR by using dynamic imports
- Added generateStaticParams with error handling to all dynamic routes
- Removed ISR (revalidate) exports incompatible with static export
- Build requires database access for generateStaticParams execution
```


**Phase 2 Deliverable:** Complete public website (static export ready)

---

## Phase 3: Infrastructure
**Status:** Completed | **Progress:** 9/9 | **Track:** B (parallel with Track A)

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 3.1 ✅ | VPS provisioning | No | Phase 0 | SSH access via Tailscale works |
| 3.2 ✅ | VPS hardening | 🔗 | 3.1 | UFW enabled, root disabled, fail2ban |
| 3.3 ✅ | PostgreSQL setup | 🔗 | 3.2 | DB created, pgvector installed |
| 3.4 ✅ | Ollama local | 🔗 | 3.2 | nomic-embed-text responds |
| 3.5 ✅ | Cloudflare R2 | 🔀 | - | Bucket created, CORS configured |
| 3.6 ✅ | Cloudflare Pages | 🔀 | - | https://velikibukovec-web.pages.dev live |
| 3.7 ✅ | Admin deployment | 🔗 | 3.3 | PM2 serves admin at 100.120.125.83:3001 |
| 3.8 ✅ | Backup automation | 🔗 | 3.3, 3.5 | Daily DB backup to R2 (3am cron) |
| 3.9 ✅ | Monitoring setup | 🔀 | 3.7 | Sentry SDK installed, UptimeRobot ready |

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
**Status:** Complete | **Progress:** 7/7 | **Track:** C (Human-driven)

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 4.1 ✅ | WordPress export | No | - | XML + media files downloaded |
| 4.2 ✅ | Content mapping | 🔗 | 4.1 | Spreadsheet: old URL → new URL |
| 4.3 ✅ | Migration scripts | 🔗 | 4.2, Phase 1 | Scripts parse and transform |
| 4.4 ✅ | Test migration | 🔗 | 4.3 | Run on staging, verify content |
| 4.5 ✅ | Image migration | 🔗 | 4.4, 3.5 | All images in R2, URLs updated |
| 4.6 ✅ | Final migration | 🔗 | 4.5 | Production data loaded |
| 4.7 ✅ | Redirects setup | 🔗 | 4.6 | _redirects file, old URLs work |

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

## Phase 4.5: Content Enrichment & Quality
**Status:** In Progress | **Progress:** 3/5 | **Track:** C (Human + AI collaborative)

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 4.5.1 ✅ | Content sitemap & inventory | No | Phase 4 | Complete inventory with status for all content |
| 4.5.2 ✅ | Old vs new comparison | 🔗 | 4.5.1 | Migration parity report from WordPress data |
| 4.5.3 ✅ | Content quality audit | 🔗 | 4.5.1 | Programmatic quality analysis of all content |
| 4.5.4 ⬜ | Gap analysis & enrichment plan | 🔗 | 4.5.2, 4.5.3 | Prioritized list of improvements |
| 4.5.5 ⬜ | Content enrichment execution | 🔗 | 4.5.4 | Critical/important gaps addressed |

Recent updates:
- Sprint 4.5.3 completed: Content quality audit with 947 issues identified
- Sprint 4.5.2 completed: Old vs new comparison with migration parity verification
- Sprint 4.5.1 completed: Content inventory system with database queries, route mapping, empty content detection

### Sprint 4.5.1: Content Sitemap & Inventory ✅
```
Acceptance Criteria:
✓ Query database for all content counts:
  - Posts (by category, by status)
  - Pages (static pages with content status)
  - Documents (by category)
  - Events (upcoming vs past)
  - Galleries (with image counts)
  - Announcements
✓ Map all routes from codebase (app/*/page.tsx)
✓ Cross-reference: which routes have content, which are empty
✓ Mark each as: complete, partial, placeholder, empty
✓ Output: docs/content/sitemap-inventory.md

Gate: ✅ Complete inventory with counts and status for every content type

Implementation Notes:
- Created scripts/content-inventory.ts - Queries all database tables, generates markdown inventory
- Created scripts/find-empty-content.ts - Detects empty (<50 words), thin, and placeholder content
- Placeholder detection: lorem ipsum, todo, tbd, placeholder, coming soon, uskoro, u izradi
- Output: docs/content/sitemap-inventory.md with executive summary, content breakdown, route mapping
- Empty content detection appends "Content Quality Analysis" section to inventory
- Scripts use tsx runner, added as devDependency

Files Created:
- docs/content/README.md - Directory index for content audits
- docs/content/sitemap-inventory.md - Full content inventory
- scripts/content-inventory.ts - Database query script (queries posts, pages, documents, events, galleries, announcements, users, newsletters, contact messages, problem reports)
- scripts/find-empty-content.ts - Empty/placeholder detection script

Note: Inventory run against local dev database (minimal content). Re-run against production (100.120.125.83) for full stats.
```

### Sprint 4.5.2: Old vs New Comparison ✅
```
Acceptance Criteria:
✓ Load WordPress export data (posts.json, pages.json, url-map.json)
✓ Compare content counts: old vs new
  - 326 WP posts → 88 posts + 252 announcements + 26 events
  - 81 WP pages → 82 DB pages
  - Categories mapped: opcinske-vijesti, obavijesti, dogadanja
✓ Check URL redirect coverage (_redirects file)
  - 406/407 mappings covered (99.8%)
  - 34 identity mappings (same path)
✓ Identify any content lost in migration
  - All posts accounted for across Posts/Announcements/Events tables
✓ Compare navigation structure (old menu vs new)
  - Hierarchical → Consolidated tabbed pages
✓ Output: docs/content/old-vs-new-comparison.md

Gate: ✅ Report confirms migration parity

Implementation Notes:
- Created scripts/compare-old-new.ts with functions:
  - loadWordPressData() - Reads migration output JSON files
  - queryDatabaseCounts() - Queries Post, Page, Announcement, Document, Event, Gallery tables
  - parseRedirectsFile() - Parses _redirects into redirect rules
  - comparePosts() - Cross-references WP posts with DB (including Announcements/Events)
  - comparePages() - Compares WP pages with DB pages
  - checkRedirectCoverage() - Verifies URL mappings have redirects
  - identifyGaps() - Categorizes gaps by severity (critical/warning/info)
  - generateMarkdownReport() - Outputs comprehensive comparison report

Files Created:
- scripts/compare-old-new.ts - Comparison script
- docs/content/old-vs-new-comparison.md - Generated comparison report

Results:
- 0 critical gaps, 1 warning (homepage redirect not needed)
- 1,411 documents migrated
- 17 galleries with 108 images
- Content distribution verified: WP obavijesti → Announcements, WP dogadanja → Events
```

### Sprint 4.5.3: Content Quality Audit ✅
```
Acceptance Criteria:
✓ Programmatic analysis of all content:
  - Word count per post/page (flag < 100 words) - 96 thin content items
  - Detect placeholder text ("Lorem", "TODO", "TBD", "u izradi") - 2 found
  - Check for empty required fields - 28 missing fields
  - Verify images exist (R2 URLs) - checked 1513 URLs
  - Check internal links (do target pages exist?) - 0 broken
✓ Flag outdated content (dates, references) - 25 outdated items
✓ Output: docs/content/quality-audit.md

Gate: ✅ 947 issues identified and categorized by severity

Implementation Notes:
- Created scripts/content-quality-audit.ts with:
  - auditPosts() - Check posts for thin/empty/placeholder content
  - auditPages() - Check pages for quality issues
  - auditAnnouncements() - Check for outdated announcements
  - auditEvents() - Check for old events, missing locations
  - auditDocuments() - Check for missing year metadata
  - auditImages() - Validate R2 image URLs (with rate limit handling)
  - auditInternalLinks() - Check internal links resolve
  - generateMarkdownReport() - Output comprehensive report

Results:
- 🔴 2 critical: pages with "u izradi" placeholder
- 🟡 892 warnings: thin content, broken images, outdated
- 🔵 53 info: missing optional fields, old events
- Categories: empty(39), thin(96), placeholder(2), missing(28), outdated(25)
- Note: Image check may have false positives due to R2 rate limiting

Files Created:
- scripts/content-quality-audit.ts - Quality audit script
- docs/content/quality-audit.md - Generated audit report
```

### Sprint 4.5.4: Gap Analysis & Enrichment Plan
```
Acceptance Criteria:
□ Compile findings from 4.5.1, 4.5.2, 4.5.3
□ Categorize issues:
  - Missing content (pages exist but empty)
  - Thin content (< 100 words, needs expansion)
  - Broken references (dead links, missing images)
  - Outdated info (old dates, stale announcements)
  - Migration gaps (content in WP but not migrated)
□ Prioritize: critical (blocks launch), important, nice-to-have
□ For each gap: suggest fix (AI-generate, human-write, delete)
□ Output: docs/content/enrichment-plan.md

Gate: Actionable prioritized list ready for execution
```

### Sprint 4.5.5: Content Enrichment Execution
```
Acceptance Criteria:
□ Fix critical issues first:
  - Fill empty required pages
  - Fix broken links/images
  - Remove placeholder text
□ Address important issues:
  - Expand thin content (AI-assisted)
  - Update outdated information
  - Add missing migrated content
□ Human review for all AI-generated content
□ Re-run quality audit to verify improvements
□ Output: Updated content, revised quality scores

Gate: Zero critical issues, important issues resolved
```

**Phase 4.5 Deliverable:** Verified content quality with all critical gaps filled

---

## Phase 5: Communication Features
**Status:** Complete | **Progress:** 6/6 | **Track:** A

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 5.1 ✅ | Contact form backend | No | Phase 1 | Form submits, stored in DB, email sent |
| 5.2 ✅ | Problem reports | 🔀 | 5.1 | Submit with images, status workflow |
| 5.3 ✅ | Admin inbox | 🔗 | 5.1, 5.2 | View messages, update status |
| 5.4 ✅ | Newsletter subscribe | 🔀 | Phase 2 | Double opt-in, stored in DB |
| 5.5 ✅ | Newsletter send | 🔗 | 5.4 | Manual + weekly automated |
| 5.6 ✅ | Email templates | 🔗 | 5.1-5.5 | Croatian, responsive HTML |

Recent updates:
- Sprint 5.5 completed: Newsletter compose page with preview, batch sending, progress tracking, add-to-newsletter buttons.
- Sprint 5.4 completed: Newsletter subscribe with double opt-in, confirmation emails, unsubscribe flow.
- Sprint 5.3 completed: Admin inbox for messages and problem reports with status workflow.
- Sprint 5.1-5.2 completed: Contact form and problem reports with rate limiting, honeypot protection.

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
**Status:** Complete | **Progress:** 4/4 | **Track:** D (Last)

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 6.1 ✅ | Ollama Cloud connection | No | Phase 3 | API responds, model works |
| 6.2 ✅ | AI queue system | 🔗 | 6.1 | Queue table, worker processes |
| 6.3 ✅ | AI Post Generation | 🔗 | 6.2 | Generate article from instructions + document |
| 6.4 ✅ | Self-review pipeline | 🔗 | 6.3 | REVIEW → REWRITE → POLISH stages |

Note: Google Search removed (Ollama has web_search). Facebook posting deferred to post-launch.

Recent updates:
- Sprint 6.4 completed: AI self-review pipeline with Croatian banned words, quality scoring (clarity, localRelevance, slopScore, flow), rewrite loop (max 2x), and polish stage.
- Sprint 6.3 completed: AI post generation with document parsing (PDF, DOCX, OCR), queue integration, and admin UI dialog.
- Sprint 6.2 completed: AI queue system with ai_queue table, background worker, retry logic, rate limit handling, and admin status page.
- Sprint 6.1 completed: Ollama Cloud connection with generate API, typed responses, error handling.

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

### Sprint 6.4: Self-Review Pipeline
```
Acceptance Criteria:
✓ Croatian banned words list (AI buzzwords, filler phrases)
✓ Review prompt with quality scoring (clarity, localRelevance, slopScore, flow)
✓ Rewrite prompt for fixing identified issues
✓ Polish prompt for final grammar/spelling pass
✓ Pipeline processor: REVIEW → REWRITE (max 2x) → POLISH
✓ Queue worker integration with pipeline metrics
✓ Tests for banned words detection and review parsing

Gate: Generate article, pipeline runs REVIEW → REWRITE → POLISH, quality score stored
```

**Phase 6 Deliverable:** AI-powered content generation working

---

## Phase 7: Chatbot & Polish
**Status:** In Progress | **Progress:** 2/8 | **Track:** D

| Sprint | Task | Parallel | Depends | Gate |
|--------|------|----------|---------|------|
| 7.1 ✅ | Embedding pipeline | No | Phase 3 | Content → embeddings → pgvector |
| 7.2 ⬜ | RAG retrieval | 🔗 | 7.1 | Query → relevant chunks |
| 7.3 ⬜ | Chatbot API | 🔗 | 7.2 | Question → answer with sources |
| 7.4 ⬜ | Chatbot UI | 🔗 | 7.3 | Floating widget, conversation |
| 7.5 ✅ | Semantic search upgrade | 🔗 | 7.1 | Hybrid search (keyword + vector) |
| 7.6 ⬜ | Performance optimization | 🔀 | Phase 2 | Lighthouse > 90 all pages |
| 7.7 ⬜ | Accessibility audit | 🔀 | Phase 2 | WCAG AA compliance |
| 7.8 ⬜ | Security audit | 🔀 | All | NIS2 checklist passes |

Recent updates:
- Sprint 7.5 completed: Hybrid search with keyword (40%), fuzzy (20%), and semantic/vector (40%) scoring.
- Sprint 7.1 completed: Embedding pipeline with nomic-embed-text, search_index table with pgvector.

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
| 4.5 | 5 | Content Enrichment (inventory, compare, audit, enrich) |
| 5 | 6 | Communication (forms, newsletter) |
| 6 | 4 | AI Integration (generation, queue, review) |
| 7 | 8 | Chatbot & Polish (RAG, perf, a11y) |
| 8 | 8 | Launch (E2E, training, go-live) |
| **Total** | **72** | |

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
| 2026-01-23 | Sprint 0.2 completed: Database schema with 19 tables |
| 2026-01-24 | Sprint 0.3 completed: Better Auth with email/password and Google OAuth |
| 2026-01-24 | Sprint 0.5 completed: CI/CD with GitHub Actions (lint, type-check, test, build) |
| 2026-01-24 | Sprint 0.4 completed: UI foundation with Tailwind v4 and shadcn/ui components |
| 2026-01-24 | Sprint 0.6 completed: Integration verification with Playwright E2E tests |
| 2026-01-24 | Sprint 1.1 completed: Admin layout shell with sidebar, header, mobile menu |
| 2026-01-24 | Sprint 1.2 completed: Dashboard page with stats cards, charts, and activity feed |
| 2026-01-24 | Sprint 1.3 completed: Posts list + CRUD with DataTable, filtering, pagination |
| 2026-01-24 | Sprint 1.4 completed: TipTap editor integration with HTML content |
| 2026-01-24 | Sprint 1.5 completed: Image upload to R2 with Sharp processing |
| 2026-01-24 | Sprint 1.6 completed: Documents management with PDF upload, validation, CRUD |
| 2026-01-24 | Sprint 1.8 audit fixes: normalized events API payload and cleaned R2 poster variants |
| 2026-01-24 | Sprint 3.1 completed: VPS provisioned (Debian 13), Tailscale configured |
| 2026-01-24 | Sprint 3.2 completed: UFW, SSH hardening, fail2ban, unattended-upgrades |
| 2026-01-24 | Sprint 3.3 completed: PostgreSQL 17 + pgvector 0.8.0, localhost only |
| 2026-01-24 | Sprint 3.4 completed: Ollama 0.15.0 + nomic-embed-text (768-dim vectors) |
| 2026-01-24 | Sprint 3.5 completed: R2 bucket velikibukovec-media created, CORS configured |
| 2026-01-25 | Sprint 1.11 completed: User management with CRUD, soft-delete, role-based permissions |
| 2026-01-25 | Sprint 2.2 completed: Homepage with hero, quick links, news, events, newsletter, animations |
| 2026-01-25 | Sprint 2.3 completed: News listing with category filter, pagination, skeleton loading |
| 2026-01-25 | Sprint 2.3 audit fixes: news URL validation, pagination clamping, and filter skeletons |
| 2026-01-25 | Sprint 2.4 completed: News detail page with hero, content, share buttons, related posts, SEO |
| 2026-01-25 | Sprint 2.5 completed: Documents section with sidebar navigation, accordion mobile, year filter, search |
| 2026-01-25 | Sprint 2.5 audit fixes: year-filtered category counts, safe download URLs, filter-preserving category links |
| 2026-01-25 | Sprint 2.6 completed: Events calendar with FullCalendar, event detail page, Add to Calendar (Google + ICS) |
| 2026-01-25 | Sprint 2.7 completed: Gallery pages with album grid, photo grid, yet-another-react-lightbox |
| 2026-01-26 | Sprint 2.6 audit fixes: sanitized event descriptions, month URL sync, timezone-safe calendar exports |
| 2026-01-26 | Sprint 2.7 audit fixes: gallery pagination clamping, lightbox focus restoration, alt text fallbacks |
| 2026-01-26 | Sprint 2.8 completed: Static pages with catch-all route, section sidebar navigation, mobile accordion |
| 2026-01-26 | Sprint 2.8 audit fixes: validated static page slugs, improved section navigation accessibility, guarded repository queries |
| 2026-01-26 | Sprint 2.9 completed: Contact page with map, problem report page, rate-limited API routes, honeypot spam protection |
| 2026-01-27 | Sprint 2.9 audit fixes: repository-based contact/problem storage, structured logging, preview cleanup |
| 2026-01-26 | Sprint 2.10 completed: Full-text search with Cmd+K modal, keyboard navigation, recent searches |
| 2026-01-26 | Sprint 2.11 completed: SEO with metadata, JSON-LD, sitemap.xml, robots.txt, canonical URLs |
| 2026-01-26 | Sprint 2.12 completed: Static export with client component wrappers, fixed LeafletMap SSR, all routes generate |
| 2026-01-26 | Sprint 2.12 follow-up: Merged public API endpoints with tests, withStaticParams utility, initial data hydration |
| 2026-01-26 | Staging deployed: Frontend (Caddy) at :80, Admin (PM2) at :3001 on VPS via Tailscale |
| 2026-01-26 | Phase 4 Content Migration complete: 302 posts (234 with R2 images), 82 pages (74 with content), 1450 documents, 17 galleries (108 images), 26 events migrated from WordPress |
| 2026-01-30 | Announcements system completed: Full CRUD, PDF attachments, validity dates, migration script |
| 2026-01-30 | Phase 5 completed: Contact form, problem reports, admin inbox, newsletter subscribe/send, email templates |
| 2026-01-30 | Sprint 6.1 completed: Ollama Cloud connection with typed API, error handling, rate limit detection |
| 2026-01-30 | Sprint 6.2 completed: AI queue system with ai_queue table, background worker, retry logic, admin status page |
| 2026-01-30 | Sprint 6.3 completed: AI post generation with document parsing (PDF, DOCX, OCR), generate-post API, dialog UI |
| 2026-01-30 | Sprint 6.4 (Google Search) removed: Ollama Cloud now has built-in web_search API |
| 2026-01-30 | Sprint 7.1 completed: Embedding pipeline with nomic-embed-text and pgvector search_index |
| 2026-01-30 | Sprint 7.5 completed: Hybrid search with keyword + fuzzy + semantic scoring |
| 2026-01-30 | Sprint 6.4 completed: AI self-review pipeline with REVIEW → REWRITE → POLISH stages, banned words detection |
| 2026-01-30 | Phase 6 complete: AI Integration (Ollama Cloud, queue, generation, self-review pipeline) |
| 2026-01-30 | Phase 4.5 added: Content Enrichment & Quality (sitemap, old vs new comparison, quality audit, visual audit, gap analysis, enrichment) |
| 2026-01-31 | Sprint 4.5.1 completed: Content inventory scripts (content-inventory.ts, find-empty-content.ts), sitemap-inventory.md generated |
| 2026-01-31 | Sprint 4.5.2 completed: Old vs new comparison (compare-old-new.ts), migration parity verified (326 WP posts → 88+252+26, 406/407 redirects) |
| 2026-01-31 | Sprint 4.5.3 completed: Content quality audit (content-quality-audit.ts), 947 issues identified (2 critical, 892 warnings, 53 info) |
| 2026-01-31 | Navigation fix: Created /opcina/zupa and /opcina/ustanove pages, added redirects for legacy rad-uprave/* URLs |
| 2026-01-31 | Navigation redesign implemented: 11 tasks completed - sidebar navigation, mobile bottom sheet, PageLayoutV2, SmallHero, Kontakt button, Načelnik page, Naselja landing + 3 village subpages |
