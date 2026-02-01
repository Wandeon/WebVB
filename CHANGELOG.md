# CHANGELOG

All notable changes to this project will be documented in this file.

## Audit 14 - Privacy, GDPR, Data Protection, and Legal-Tech Compliance (2026-02-01)

### Changed
- Redacted sensitive fields in audit logs and anonymized stored audit IP metadata
- Removed IP addresses from admin contact/problem report API responses and added GDPR delete endpoints
- Redacted search query logging to hashed summaries and added privacy notices to contact, problem report, and newsletter forms
- Updated privacy policy to reflect actual data collection, retention, and local search processing

## Audit 04 - Public Website Rendering & Accessibility (2026-02-01)

### Changed
- Sanitized announcement detail HTML rendering with shared ArticleContent component
- Added aria-pressed states and explicit button types to category filters for better keyboard/AT support
- Ensured footer external links use safe anchor handling with rel attributes
- Removed console logging from PWA registration and service worker flows
- Updated TipTap fallback rendering message to Croatian

## Audit 09 - Launch Readiness & Ops Hardening (2026-02-06)

### Changed
- Enforced explicit production env requirements (NODE_ENV, public URLs, DATABASE_URL) and blocked ALLOW_ANY_ORIGIN in production
- Added startup checks for admin runtime (env validation + database readiness) with graceful shutdown hooks
- Hardened AI queue worker crash handling and shutdown coordination for in-flight jobs
- Switched push health checks to validated cron/push env helpers and added CORS safety tests

## Audit 10 - Infrastructure Hardening (2026-02-05)

### Changed
- Added database-aware readiness checks to `/api/healthz` and tests for the new health behavior
- Added database repository health probe with test coverage
- Hardened deployment script to bind admin to localhost, require explicit public URLs, and verify health after restart
- Strengthened staging/production reverse proxy guidance with HTTPS redirects, strict headers, and admin reverse proxying

## Audit 08 - AI Generation Pipeline Hardening (2026-02-04)

### Changed
- Added queue leasing with worker identifiers and stale job recovery to prevent duplicate AI processing
- Enforced idempotency keys on AI queue creation to avoid duplicate jobs for identical inputs
- Hardened document parsing with size limits, timeouts, and clearer Croatian error messages
- Added strict AI output validation, HTML allowlisting, and quality gating for post generation
- Added AI job statuses for cancellations and dead-letter handling with updated admin visibility

## Audit 02 - Data Access & Validation (2026-02-03)

### Changed
- Enforced strict schema validation across admin and shared inputs to reject unknown fields
- Added consistent date/time validation for events and galleries, including ISO date coercion for posts/announcements
- Normalized pagination limits in repositories to prevent unbounded queries
- Validated UUID route parameters before database access
- Moved public search query execution into the database repository layer

## Audit 07 - Communication Flows (2026-02-04)

### Changed
- Sanitized contact, problem report, and newsletter inputs (HTML stripping, trimming, email normalization, phone constraints)
- Added duplicate submission detection for contact/problem reports and email-based throttling for newsletter signups
- Anonymized stored IP addresses and tightened client IP extraction for rate limiting
- Masked email addresses in logs and added admin-side rate limiting for manual newsletter sends
- Validated newsletter confirmation/unsubscribe tokens with UUID checks

## Security Hardening (2026-02-02)

### Changed
- Locked down Better Auth configuration with signup disabled, stronger password rules, and explicit rate limiting
- Enforced same-origin checks and active-user verification for admin API requests
- Restricted newsletter sending and admin-only gallery image deletion to admin roles
- Added authentication guards for admin-only page parent lookups and gallery image endpoints
- Strengthened password validation and UI guidance for admin user creation and password changes

## Security Hardening (2026-02-01)

### Changed
- Enforced validated Better Auth environment configuration to prevent empty secrets at startup
- Added validated SMTP and seed env parsing for safer configuration checks
- Seed script now requires a strong SEED_USER_PASSWORD instead of a hardcoded default
- Migration scripts now fail fast on missing R2 config and skip uploads during dry runs

## UX, SEO & Performance Improvements (2026-01-31)

### Added - Legal Pages
- `/privatnost` - GDPR-compliant privacy policy page
- `/izjava-o-pristupacnosti` - EU accessibility statement (WCAG 2.1 AA)
- `/uvjeti-koristenja` - Terms of service with AI content disclosure
- Footer links to legal pages in new "Pravne informacije" section

### Added - UI Components
- `ContentTypeSwitcher` - Bottom bar (mobile) / top tabs (desktop) for Vijesti/Obavijesti/Događanja
- `Typewriter` component - Animated text effect with cursor
- Enhanced `VillageHero` - Typewriter animation for village names and facts, grb image on desktop
- Enhanced `CategoryFilter` - Sticky header with horizontal scroll on mobile

### Added - SEO & AI Optimization
- `/llms.txt` and `/.well-known/llms.txt` - AI crawler guidance files
- `LocalBusiness` (GovernmentOffice) schema on homepage with geo coordinates and opening hours
- `ImageGallery` schema on gallery detail pages
- `BreadcrumbList` schema on gallery pages
- Preconnect hints for Google Fonts CDN

### Added - Page Speed
- WebP image variants for hero images (33-42% smaller)
- WebP grb image (71% smaller: 185KB → 53KB)
- Caddy caching headers: 1 year for static assets, 10 min for HTML
- Gzip/Zstd compression enabled
- Security headers (XSS, Permissions-Policy)

### Changed
- Gallery names normalized with proper Croatian diacritics
- Merged duplicate galleries, deleted test gallery
- Mobile menu: Logo now links to home, added Kontakt button
- Gallery showcase: Name, date, and photo count always visible (not just on hover)

### Database
- Normalized 13 gallery names (e.g., "Vjezba" → "Vatrogasna vježba")
- Added event date to "Događanja - Travanj 2017" gallery
- Merged 2 duplicate "DVD Dubovica" galleries into one (13 images)
- Deleted empty "Test galerija"

---

## Navigation Redesign Follow-up (2026-01-31)

### Added
- `/vijece` page - Municipal council page with members list, meeting info, documents
- `/zupa` page - Parish page with dynamic content from database (crkva, kapelice, ured, groblja)
- `/skola` page - School page with database content or fallback static content

### Changed
- Migrated `/opcina` from tabbed layout to PageLayoutV2 with 3 scroll sections (O nama, Turizam, Povijest)
- Migrated `/usluge` from tabbed layout to PageLayoutV2 with 4 scroll sections (Komunalno, Financije, Za građane, Udruge)
- `/opcina/zupa` now redirects to `/zupa`
- `/opcina/ustanove` now redirects to `/skola`

### Removed
- Tabbed navigation from /opcina and /usluge pages
- Old ZupaClient and UstanoveClient components (replaced by standalone pages)

---

## Navigation Redesign (2026-01-31)

### Added
- New sidebar navigation system with accordion behavior and scroll spy
- `useScrollSpy` hook for tracking active section during scroll
- `SidebarNav` and `SidebarItem` components with spring animations
- `MobileNavPill` - sticky bottom pill showing current page (mobile)
- `MobileNavSheet` - bottom sheet navigation with swipe gestures (mobile)
- `SmallHero` component - contained hero (200-250px) with gradient overlay
- `PageLayoutV2` - new page layout combining sidebar + hero + content
- Visible Kontakt button in header (desktop)
- `/nacelnik` page - Mayor's page with sections (O načelniku, Program rada, Dokumenti, Kontakt)
- `/naselja` landing page with village cards
- `/naselja/veliki-bukovec` - Village page with castle and church info
- `/naselja/dubovica` - Village page with chapel history
- `/naselja/kapela` - Village page with river and flood history

### Changed
- Updated navigation data structure to 3 groups (Naš Kraj, Uprava, Aktualno)
- Homepage village names: centered on mobile, left-aligned on desktop
- Header now includes prominent Kontakt button with Mail icon

### Technical Details
- Spring animations: stiffness 400/300, damping 30
- Staggered section reveals: 0.05s delay between items
- Active indicator uses `layoutId` for smooth transitions
- Scroll spy offset: 120px for proper anchor tracking
- Mobile sheet uses body scroll lock and escape key handling

## Sprint 2.12 - Static Export Verify (Completed)

### Added
- `withStaticParams` utility for safe generateStaticParams with CI/prod fail-loud behavior
- Initial data hydration for all list pages (vijesti, galerija, dogadanja, dokumenti)
- Public API endpoints in admin app for client-side fetching:
  - GET `/api/public/posts` - Posts with pagination, category filter
  - GET `/api/public/galleries` - Galleries with pagination
  - GET `/api/public/events` - Events with upcoming/past filter
  - GET `/api/public/events/calendar` - Monthly calendar events
  - GET `/api/public/documents` - Documents with category, year filter
- Comprehensive test coverage for all public API endpoints
- CORS support for IP-based origins (staging environments)
- VPS staging deployment documentation

### Fixed
- LeafletMap SSR issue with dynamic imports inside useEffect
- searchParams incompatibility by converting list pages to client components with Suspense
- Removed ISR `revalidate` exports incompatible with static export
- Build now fails loudly in CI/production when database unavailable

### Infrastructure
- Caddy configured to serve static files on port 80
- PM2 running admin app on port 3001
- Both accessible via Tailscale at 100.120.125.83

## Sprint 2.11 - SEO Implementation (Completed)

### Added
- Canonical URLs for public pages and dynamic content (news, events, galleries, CMS pages)
- Structured data (JSON-LD) for Organization (homepage), Article (news), and Event (event detail)
- Auto-generated sitemap.xml covering static routes, posts, events, galleries, and CMS pages
- robots.txt allowing all user agents with sitemap reference
- Shared SEO utilities for canonical URLs, structured data, and content truncation

## Sprint 2.10 - Search (Completed)

### Added
- Global search with Cmd+K / Ctrl+K keyboard shortcut
- SearchModal component with Radix Dialog, keyboard navigation, recent searches
- SearchTrigger component with desktop input-like button and mobile icon
- Search API at GET `/api/search?q=` with PostgreSQL full-text search
- SearchIndex table with tsvector, GIN index, and ts_rank relevance scoring
- ts_headline for search result highlighting with `<mark>` tags
- Results grouped by type: posts, documents, pages, events (max 5 per type)
- Recent searches stored in localStorage (max 5, persistent)
- useSearch hook with debounced fetch (150ms), abort controller
- useRecentSearches hook for localStorage management
- useSearchShortcut hook for global keyboard shortcut
- Search indexing utilities: indexPost, indexDocument, indexPage, indexEvent
- Automatic indexing on content create/update, removal on delete
- Backfill script: `pnpm --filter @repo/database run backfill-search`
- Gate: Press Cmd+K, type search term, navigate with arrows, press Enter to go

## Sprint 2.9 - Contact + Forms (Completed)

### Added
- Contact page at `/kontakt` with municipality info, working hours, and interactive map
- Problem report page at `/prijava-problema` for community issue reporting
- ContactForm component with react-hook-form, Zod validation, and honeypot spam protection
- ProblemReportForm component with problem type selector and optional image upload
- ContactInfo and WorkingHours display components with lucide-react icons
- LeafletMap component with OpenStreetMap tiles (no API key needed)
- API routes: POST `/api/contact` and POST `/api/problem-report`
- In-memory IP-based rate limiting (5/hour for contact, 3/hour for problem reports)
- Zod validation schemas: `contactFormSchema` and `problemReportSchema` in @repo/shared
- Server actions for form submission from page components
- Gate: Submit contact form, receive success message; report problem, receive confirmation

### Fixed
- Contact and problem report API routes now use repositories with structured logging and standard error payloads
- Problem report image previews are now cleaned up to avoid lingering object URLs

## Sprint 2.8 - Static Pages (Completed)

### Added
- Catch-all route at `/[...slug]` for CMS-managed static pages
- PageSidebar component for desktop section navigation (sticky)
- PageAccordion component for mobile section navigation (collapsible)
- `findPublished` and `findSiblingsBySlug` repository methods for pages
- Section-aware sidebar showing sibling pages in same section
- "Zadnje ažurirano" (Last updated) date display on static pages
- Hero section with gradient background and page title
- ISR with 60-second revalidation
- Gate: Navigate "Organizacija" section, sidebar highlights correctly

## Sprint 2.7 - Gallery Pages (Completed)

### Added
- Public gallery listing page at `/galerija` with album grid
- Gallery detail page at `/galerija/[slug]` with photo grid
- GalleryCard component for album display with cover image and photo count
- PhotoGrid component with yet-another-react-lightbox integration
- Lightbox with swipe gestures, keyboard navigation, and touch support
- findPublished repository method for public galleries
- ISR with 60-second revalidation
- Gate: Browse galleries, open album, click photo to open lightbox, swipe through photos

## Sprint 2.6 - Events Calendar (Completed)

### Added
- Public events page at `/dogadanja` with FullCalendar month view
- Event detail page at `/dogadanja/[id]` with poster hero and "Add to Calendar"
- EventCalendar component with FullCalendar integration (dayGrid, Croatian locale)
- EventTabs component for switching between upcoming and past events
- AddToCalendar component with Google Calendar link and ICS file download
- EventHero component for event poster display
- getEventsByMonth and getPastEvents repository methods
- Tabs persist in URL (?tab=upcoming/past)
- Calendar displays first word of event title in cells
- Event click navigates to detail page with Next.js router
- ISR with 60-second revalidation
- Gate: Browse events, switch tabs, click calendar event, see details, add to calendar

## Sprint 2.5 - Documents Section (Completed)

### Added
- Public documents page at `/dokumenti` with category sidebar and year filter
- DocumentCard component for document list items with PDF icon and download button
- DocumentSidebar component for desktop category navigation (sticky)
- DocumentAccordion component for mobile category navigation (collapsible)
- YearFilter dropdown component using Radix Select
- DocumentSearch component with instant client-side filtering
- Accordion primitive using @radix-ui/react-accordion
- getDistinctYears and getCategoryCounts repository methods
- URL-driven filtering (kategorija, godina, stranica)
- ISR with 60-second revalidation
- Gate: Browse documents at `/dokumenti`, filter by category and year, search filters list, download PDF works

## Phase 4: Content Migration Complete (2026-01-26)

### Added - Full WordPress Independence

**Content Migrated:**
- 302 posts (234 with R2 images)
- 82 pages (74 with content)
- 1,450 documents (categorized)
- 17 galleries (108 images)
- 26 events (converted from dogadanja posts)

**Migration Scripts:**
- `reimport-posts.ts` - Re-imported posts with HTML preserved to TipTap JSON
- `update-pages.ts` - Updated pages with WordPress content
- `import-documents.ts` - Imported and categorized all documents
- `import-galleries.ts` - Imported galleries with image relationships
- `convert-events.ts` - Converted dogadanja posts to proper events
- `generate-redirects.ts` - Generated 372 URL redirects
- `fix-remaining-urls.ts` - Fixed internal links and external images
- `fix-malformed-urls.ts` - Fixed malformed paths like /pocetnawp-content/

**URL Migration:**
- 295 internal links fixed across posts and pages
- 11 external images (Google) downloaded to R2
- 3 expired Facebook CDN images removed
- 6 malformed URL paths corrected
- 372 URL redirects generated for old WordPress URLs

**Verification:**
- Zero WordPress dependencies remain
- Site is 100% independent of velikibukovec.hr
- All media served from Cloudflare R2

---

## Unreleased
- Added build-safe static params wrapper with CI/production guardrails for static export builds.
- Added public API endpoints for posts, galleries, events (including calendar), and documents to support static list page navigation.
- Converted public list pages to server-provided initial data with client-side fetch fallbacks and improved error handling.
- Removed ISR revalidation from the homepage to preserve static export compatibility.
- Documented Sprint 1.5-1.6 audit review findings.
- Hardened admin Playwright E2E coverage with shared login usage, more resilient selectors, settings session revocation flow, and user removal verification.
- Improved public navigation accessibility with aria-current states, focus-visible styles, and canonical metadata.
- Enforced server-side admin API authorization with audit logging for all core CRUD actions.
- Added test coverage for homepage UI components and animations.
- Clarified newsletter signup availability messaging and disabled submissions when unavailable.
- Displayed optional event poster thumbnails in event cards.
- Hardened news listing URL state handling and added tests for published pagination clamping.
- Secured news detail rendering with HTML sanitization, resilient metadata fallbacks, and improved share/hero accessibility.
- Hardened documents filters with year-aware counts, safer download links, and category URL persistence.
- Audited events calendar: sanitized event descriptions, synced calendar month state to URL, and corrected calendar exports for time zones.
- Improved gallery pagination clamping, lightbox focus restoration, and alt text fallbacks for photo grids.
- Hardened static pages slug validation, sidebar navigation accessibility, and repository guards for invalid slugs.

## Sprint 2.4 - News Detail Page (Completed)

### Added
- News detail page at `/vijesti/[slug]` with dynamic routing
- ArticleHero component with featured image, gradient overlay, category badge, and formatted date
- ArticleContent component with Tailwind Typography prose styling for rich HTML
- ShareButtons client component with Facebook share popup and copy-to-clipboard with "Kopirano!" feedback
- RelatedPosts sidebar component showing up to 3 posts from same category
- getRelatedPosts repository method for fetching related articles
- Dynamic metadata generation for SEO with Open Graph article tags
- generateStaticParams for build-time pre-rendering of published posts
- ISR with 60-second revalidation
- Back navigation link to news listing
- FadeIn animations for content sections
- Gate: Open article at `/vijesti/[slug]`, layout looks professional, OG tags correct

## Sprint 2.3 - News Listing (Completed)

### Added
- News listing page at `/vijesti` with posts grid
- CategoryFilter component with URL state persistence (`?kategorija=...`)
- Pagination component with ellipsis for many pages (`?stranica=...`)
- PostCardSkeleton component for loading states
- findPublished repository method for public posts listing
- Featured post hero display on first page without filters
- Category filtering via URL searchParams
- Empty state handling with Croatian messages
- SEO metadata for news listing page
- Gate: Browse news, filter by category, paginate through results

## Sprint 2.2 - Homepage (Completed)

### Added
- HeroSection component with featured news display
- PostCard component for news display
- EventCard component for events display
- QuickLinkCard component for quick links grid
- NewsletterSignup component with form validation
- SectionHeader component for section titles
- FadeIn animation component using framer-motion
- Homepage data fetching methods in repositories (getFeaturedPost, getLatestPosts, getUpcomingEvents)
- Quick links configuration for homepage
- Complete homepage with hero, quick links, news, events, and newsletter sections
- Revalidation every 60 seconds for fresh data
- Gate: Homepage loads with real data, responsive layout works

## Sprint 2.1 - Public Layout + Nav (Completed)

### Added
- Public site root layout with Inter and Plus Jakarta Sans fonts
- SiteHeader component with responsive navigation
- NavMenu component with dropdown menus for desktop
- MobileDrawer component with sheet-based mobile navigation
- SiteFooter component with link groups and copyright
- Navigation data structure with full site hierarchy
- Skip-to-content accessibility link
- Active state styling for navigation items
- Comprehensive SEO metadata configuration
- Gate: Mobile menu works, footer renders, no layout shifts

## Sprint 1.12 - Admin Integration Tests (Completed)

### Added
- Shared login helper for E2E tests (`e2e/helpers/auth.ts`)
- Database helpers for entity CRUD assertions (`e2e/helpers/db.ts`)
- Posts E2E test (create, edit, delete flow with TipTap editor)
- Pages E2E test (create, edit, delete flow)
- Events E2E test (create, edit, delete flow with date picker)
- Galleries E2E test (create, edit, delete flow)
- Settings E2E test (profile update, sessions list)
- Users E2E test (create, edit, deactivate flow)
- Gate: All CRUD operations have end-to-end Playwright tests
- Added deployment audit report and hardened deployment documentation.
- Added admin deploy, backup, and restore scripts with R2 support.
- Aligned backup script retention default with 90-day policy.
- Added optional deployment workflows for VPS and Cloudflare Pages rebuilds.
- Expanded environment template to cover Cloudflare, SiteGround, and Sentry client vars.
- Fixed Croatian diacritics and zero-state pagination messaging in pages admin UI.
- Fixed events list API response to return events payload consistently and aligned client expectations.
- Ensured event poster cleanup removes all R2 image variants when posters are replaced or events deleted.
- Tightened gallery reorder validation and added test coverage for reorder endpoint.
- Prevented duplicate R2 deletions when removing galleries with shared cover images.
- Hardened settings security flows with password confirmation for backup codes, safer session revocation guards, and accessibility copy fixes.
- Tightened user management role enforcement to prevent admin-to-admin escalation and added permission tests.

## Sprint 1.11 - User Management (Completed)

### Added
- User `active` field for soft-delete deactivation pattern
- User types and role schema (super_admin, admin, staff) in @repo/shared
- Users repository in @repo/database with CRUD, deactivate, and activate
- Permission helper utilities (canManageUser, canAssignRole, getAssignableRoles, isAdmin)
- Users API routes (GET, POST, PUT, DELETE) with role-based access control
- Login blocking for inactive users via Better Auth databaseHooks
- Users list page with DataTable, search, and role filtering
- UserForm component with role-restricted options based on actor permissions
- Create/edit user pages with Breadcrumbs
- Users link in admin sidebar navigation under Administracija section
- User validation schemas with Croatian error messages (25 new tests)
- API route tests for users endpoints (15 new tests)
- Gate: Create user, assign role, user can login, edit user, deactivate user

## Sprint 1.10 - Settings Page (Completed)

### Added
- Better Auth twoFactor plugin integration for TOTP-based 2FA
- ProfileForm component for updating user name
- PasswordForm component with password strength validation
- TwoFactorSetup component with QR code generation and backup codes
- SessionsList component for viewing and revoking active sessions
- Settings validation schemas with Croatian error messages
- Settings page combining profile, security, and sessions management
- Validation tests for all settings schemas (17 new tests)
- Gate: Update profile, change password, enable/disable 2FA, view/revoke sessions

## Sprint 1.9 - Gallery Management (Completed)

### Added
- Gallery types and Zod schemas in @repo/shared
- Galleries repository in @repo/database with image management (addImages, deleteImage, reorderImages)
- Galleries API routes (GET, POST, PUT, DELETE) with R2 cleanup for cover and all images
- Gallery image routes for bulk upload, individual delete, and reorder
- Galleries list page with DataTable, search, and pagination
- GalleryForm component with cover image upload and date picker
- ImageManager component combining upload zone and image grid
- ImageGrid with HTML5 drag-drop reordering, inline caption editing, set cover
- ImageUploadZone for bulk image uploads
- Create/edit gallery routes with Breadcrumbs
- Galleries link in admin sidebar navigation (Images icon)
- API route tests for galleries endpoints
- Gate: Create gallery, upload images, reorder, set cover, edit, delete (R2 cleaned)

## Sprint 1.8 - Events Calendar (Completed)

### Added
- Events repository in @repo/database with date filtering and upcoming filter
- Event types and Zod schemas in @repo/shared
- Events API routes (GET, POST, PUT, DELETE) with R2 poster cleanup
- Events list page with DataTable and date range filters
- EventForm component with TipTap editor and poster upload
- PosterUpload component for drag-drop image uploads
- Create/edit event routes with Breadcrumbs
- Events link in admin sidebar navigation (CalendarDays icon)
- API route tests for events endpoints
- Gate: Create event with poster, filter by date, edit, delete (poster cleaned from R2)

## Sprint 1.7 - Static Pages CRUD (Completed)

### Added
- Pages repository in @repo/database with hierarchy support
- Page types and Zod schemas in @repo/shared
- Pages API routes (GET, POST, PUT, DELETE) with parent validation
- Pages list page with DataTable and search
- PageForm component with TipTap editor and parent selection
- Create/edit page routes
- Pages link in admin sidebar navigation
- API route tests for pages endpoints
- Gate: Create page, set parent, edit it, delete it

## Sprint 1.6 - Documents Management (Completed)

### Added
- Document management system with PDF upload to Cloudflare R2
- Document categories: sjednice, proracun, planovi, javna_nabava, izbori, obrasci, odluke_nacelnika, strateski_dokumenti, zakoni_i_propisi, ostalo
- Document constants and types in @repo/shared (DOCUMENT_CATEGORIES, DOCUMENT_MAX_SIZE_BYTES, DocumentCategory)
- Zod validation schemas in @repo/shared (documentSchema, createDocumentSchema, updateDocumentSchema, documentQuerySchema)
- Documents repository in @repo/database with CRUD operations
- PDF signature validation (%PDF- header check) and MIME type validation
- DocumentUpload component with drag-drop support
- Documents DataTable with filtering by category/year, search, and pagination
- Upload, Edit, and Delete dialogs with Croatian labels
- Admin documents page at /documents with full CRUD interface
- AlertDialog primitive added to @repo/ui
- API route tests for documents endpoints
- Gate: Upload PDF, see it in list, edit metadata, delete it

## Sprint 1.5 - Image Upload (Completed)

### Added
- Image upload component with drag-drop support in @repo/ui
- Image upload API with Sharp processing (thumb 150px, medium 800px, large 1920px variants)
- Cloudflare R2 integration for image storage
- Featured image field in post form

## Sprint 1.4 - TipTap Editor (Completed)

### Added
- TipTap rich text editor component in @repo/ui package
- Rich text editing in post form with toolbar (bold, italic, underline, links, headings, lists, blockquote)
- HTML content validation that strips tags before checking for empty content

### Fixed
- Aligned post form validation with shared HTML-aware content rules.
- Corrected documentation to reflect HTML storage for TipTap content.

## Sprint 1.3 - Posts List + CRUD (Completed)
- UI Primitives: Table, Dialog, Select, Badge, Textarea, Toast, Toaster components
- Zod validation schemas for posts with Croatian error messages
- POST_CATEGORIES constant in @repo/shared for single source of truth
- API routes: GET/POST /api/posts with filtering, pagination, sorting
- API routes: GET/PUT/DELETE /api/posts/[id] with slug regeneration
- Slug generation utility with Croatian diacritic handling
- DataTable components with TanStack React Table
- Data table toolbar with search and category/status filters
- Data table pagination with page size selection
- PostForm component with react-hook-form and zodResolver
- Delete confirmation dialog
- Posts list page with URL state management
- Create post page (/posts/new)
- Edit post page (/posts/[id])
- Toaster added to dashboard layout
- Gate: Create post, edit it, find in list, delete it

## Sprint 1.2 - Dashboard Page (Completed)
- Audited Sprint 1.2 dashboard: added accessible chart labels, hid decorative icons from assistive tech, fixed Croatian diacritics, and added e2e coverage for chart labels.
- StatsCard component with title, value, icon, and trend indicator
- VisitorsChart (area chart) showing 7-day visitor data using Recharts
- CategoryChart (horizontal bar chart) showing content distribution by category
- RecentActivity component displaying activity feed with icons and timestamps
- QuickActions component with navigation buttons for common tasks
- TopPages component showing most viewed pages
- Mock data utilities for dashboard statistics
- cn utility function (clsx + tailwind-merge)
- Installed Recharts ^3.7.0 for data visualization
- Full dashboard page integration with all components
- Gate: Stats cards + charts display with mock data

## Sprint 1.1 - Admin Layout Shell (Completed)
- Admin layout shell with sidebar, header, mobile menu, breadcrumbs
- Audited Sprint 1.1 admin layout: improved navigation accessibility labeling and active state semantics, localized sheet close label, and added e2e coverage for active nav states.
- Documented Phase 0.2 execution review and compliance gaps.
- Added shared environment validation utilities with tests and public URL defaults.
- Updated auth and database layers to use validated env helpers and shared role constants.
- Audited Sprint 0.4 UI foundation: aligned animation presets and localized UI demo text.
- Audited Sprint 0.5 CI pipeline: added guardrails for TODO/FIXME, console.log, and `any` types.
- Sprint 0.6: Added Playwright E2E tests for auth flow (login, protected routes, logout)
- Migrated to ESLint 9 with flat config (eslint.config.mjs)
- Aligned eslint-config-next@16.1.4 with Next.js 16.1.4
- Added /healthz endpoint to admin app with service and commit metadata

## Sprint 3.9 - Monitoring Setup (Completed)
- Sentry SDK (@sentry/nextjs) installed in admin app
- Client, server, and edge configs created
- Placeholder SENTRY_DSN added to VPS environment
- Manual: Create Sentry project, fill DSN, redeploy
- UptimeRobot: Monitor https://velikibukovec-web.pages.dev
- Gate: Sentry integration ready, UptimeRobot pending setup

## Sprint 3.8 - Backup Automation (Completed)
- Backup script at /home/deploy/scripts/backup-db.sh
- Uses rclone for reliable R2 uploads (Cloudflare recommended)
- Compresses with gzip, uploads to R2 backups/ prefix
- 30-day retention for local and R2 backups
- Cron job: Daily at 3am (/etc/cron.d/vb-backup)
- Gate: Cron exists, backups verified in R2

## Sprint 3.7 - Admin Deployment (Completed)
- Node.js 20.20.0, PM2 6.0.14, pnpm 10.28.1 installed
- Repository cloned to /home/deploy/apps/admin-repo
- Production .env with DB, R2, auth, and Ollama config
- PM2 ecosystem.config.js with logging and memory limits
- PM2 startup service enabled (pm2-deploy.service)
- Health endpoint: /api/healthz returns {"ok":true}
- Gate: Admin app live at http://100.120.125.83:3001

## Sprint 3.6 - Cloudflare Pages (Completed)
- Static export configured (apps/web/next.config.ts)
- Pages project created via API: velikibukovec-web
- Deployed using wrangler direct upload
- Production URL: https://velikibukovec-web.pages.dev
- Cloudflare API credentials stored on VPS
- Gate: Pages site live, returns "Općina Veliki Bukovec"

## Sprint 3.5 - Cloudflare R2 (Completed)
- R2 bucket `velikibukovec-media` created in weur region
- CORS configured for production and localhost origins
- R2 credentials stored securely on VPS
- Gate: Bucket exists, CORS rules configured

## Sprint 3.4 - Ollama Local (Completed)
- Ollama 0.15.0 installed (CPU-only mode)
- Bound to 127.0.0.1:11434 only (not exposed publicly)
- nomic-embed-text model pulled (274 MB)
- Embedding endpoint returns 768-dimensional vectors
- No UFW changes required
- Gate: Embedding request returns vector

## Sprint 3.3 - PostgreSQL Setup (Completed)
- PostgreSQL 17.7 installed on Debian 13
- Bound to 127.0.0.1 only (localhost)
- pgvector 0.8.0 extension installed
- pg_trgm extension for full-text search
- Database `velikibukovec` created with dedicated user
- pg_hba.conf configured for local + scram-sha-256
- Remote access via SSH tunnel only
- Gate: DB created, pgvector installed, no public exposure

## Sprint 3.2 - VPS Hardening (Completed)
- Root SSH login disabled
- Password authentication disabled (key only)
- UFW firewall enabled:
  - SSH allowed from Tailscale network (100.64.0.0/10) only
  - 80/443 temporarily open (until Cloudflare proxy confirmed)
- fail2ban installed with sshd jail (24h ban, 3 retries)
- unattended-upgrades configured for security updates
- Cloudflare IP updater script prepared for Sprint 3.6
- Gate: Security checklist passes

## Sprint 3.1 - VPS Provisioning (Completed)
- Netcup VPS provisioned (Debian 13 trixie)
- Public IP: 159.195.61.215
- Non-root user `deploy` created with sudo access
- Tailscale installed and authenticated
- Tailscale IP: 100.120.125.83
- SSH key authentication configured
- Gate: ssh deploy@100.120.125.83 works

## Sprint 0.6 - Integration Verification (Completed)
- Playwright E2E testing configured
- Auth flow tests: login creates session, protected routes redirect, logout clears session
- Gate: pnpm test:e2e passes all tests

## Sprint 0.5 - CI/CD Pipeline (Completed)
- GitHub Actions workflow for lint, type-check, test on PRs
- Build job on merge to main
- Prisma client generation in CI
- Concurrency control to cancel duplicate runs
- CI/CD documentation in docs/CI-CD.md
- Gate: PR triggers lint + type-check + test; merge triggers build

## Sprint 0.4 - UI Foundation (Completed)
- Tailwind CSS v4 configured with design tokens from DESIGN-SYSTEM.md
- PostCSS configured in all packages
- Inter and Plus Jakarta Sans fonts loaded via next/font
- Button component with CVA variants (primary, secondary, outline, ghost, danger, link)
- Input component with error state
- Label component with required indicator
- Card component with subcomponents (Header, Title, Description, Content, Footer)
- cn() utility for className merging
- Both apps updated to use Tailwind styling
- Gate: Button with all variants renders correctly in both apps

## PR #2 Audit Fixes (Completed)
- Added AuditLog model to Prisma schema for tracking user actions
- Replaced console.log with process.stdout.write in seed.ts
- Documented constraint validation design choice in DATABASE.md (app-layer validation)

## Sprint 0.3 - Better Auth Setup (Completed)
- Better Auth library installed and configured
- Prisma adapter with PostgreSQL database
- Email/password authentication enabled
- Google OAuth provider configured (requires credentials in .env)
- Session management with 7-day expiration and cookie caching
- Session provider component for React context
- Protected route wrapper with role-based access control
- Login page with Croatian labels
- Logout functionality on dashboard
- Path alias (@/*) configured for clean imports
- Gate: Login with email/password, session persists on refresh

## Sprint 0.2 - Database Schema (Completed)
- Complete Prisma schema with 19 database tables
- Better Auth tables: User, Session, Account, Verification, Passkey, TwoFactor
- Content tables: Post, Document, Event, Page, Gallery, GalleryImage
- Communication tables: ContactMessage, ProblemReport, NewsletterSubscriber, NewsletterSend
- System tables: Setting, Embedding, SearchIndex, AiQueue
- pgvector extension enabled for RAG embeddings
- Seed script with test users and initial settings
- Shared types and constants updated to match schema
- Gate: `pnpm db:generate` passes, `pnpm type-check && pnpm lint` passes

## Sprint 0.1 - Project Scaffold (Completed)
- Turborepo monorepo with pnpm workspaces
- Next.js 16 apps (web static export, admin SSR)
- Shared packages (@repo/ui, @repo/shared, @repo/database)
- TypeScript strict mode, ESLint, Prettier configuration
- Gate passed: `pnpm build && pnpm lint && pnpm type-check`
