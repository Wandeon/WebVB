# CHANGELOG

All notable changes to this project will be documented in this file.

## Unreleased
- Documented Phase 0.2 execution review and compliance gaps.
- Added shared environment validation utilities with tests and public URL defaults.
- Updated auth and database layers to use validated env helpers and shared role constants.
- Audited Sprint 0.4 UI foundation: aligned animation presets and localized UI demo text.
- Audited Sprint 0.5 CI pipeline: added guardrails for TODO/FIXME, console.log, and `any` types.

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
