# CHANGELOG

All notable changes to this project will be documented in this file.

## Unreleased
- Nothing yet

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
