# CHANGELOG

All notable changes to this project will be documented in this file.

## Unreleased
- No unreleased changes.

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
