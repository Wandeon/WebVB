# CHANGELOG

All notable changes to this project will be documented in this file.

## Unreleased
- Added Phase 0.1 execution review audit document.
- Updated lint scripts and ESLint ignores to keep Phase 0.1 gate checks passing.

## Sprint 0.1 - Project Scaffold (Completed)
- Turborepo monorepo with pnpm workspaces
- Next.js 16 apps (web static export, admin SSR)
- Shared packages (@repo/ui, @repo/shared, @repo/database)
- TypeScript strict mode, ESLint, Prettier configuration
- Gate passed: `pnpm build && pnpm lint && pnpm type-check`
