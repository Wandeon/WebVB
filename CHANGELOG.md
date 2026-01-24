# CHANGELOG

All notable changes to this project will be documented in this file.

## Unreleased
- Documented Sprint 1.3 audit review findings.
- Added deployment audit report and hardened deployment documentation.
- Added admin deploy, backup, and restore scripts with R2 support.
- Aligned backup script retention default with 90-day policy.
- Added optional deployment workflows for VPS and Cloudflare Pages rebuilds.
- Expanded environment template to cover Cloudflare, SiteGround, and Sentry client vars.

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
