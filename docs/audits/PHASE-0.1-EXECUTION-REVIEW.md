# Phase 0.1 Execution Review

## Summary
Phase 0.1 (Project Scaffold) is largely implemented. The review identified a lint gate failure caused by the removal of `next lint` in Next.js 16 and a Next.js 15 ESLint dependency mismatch. This document records the findings and remediation applied in this PR, along with remaining follow-ups.

## Scope
- Phase 0.1 acceptance criteria and gate requirements from the roadmap.
- Dependency consistency checks for Next.js-related packages.

## Evidence Reviewed
- Roadmap acceptance criteria and gate definition.
- App and tooling `package.json` files.
- Next.js config files for web/admin apps.
- `pnpm` lockfile for transitive version verification.

## Findings

### 1) Gate Failure: `pnpm lint` failed with Next.js 16
**What happened**
- The Phase 0.1 gate requires `pnpm build && pnpm lint && pnpm type-check`. The lint step fails because `next lint` is no longer a valid Next.js 16 CLI command.

**Evidence**
- The Next.js 16 CLI does not list `lint` as a command, so `next lint` is interpreted as a directory argument and fails.
- Both apps still declare `lint` as `next lint` in their package scripts.

**Impact**
- Phase 0.1 gate was not met even though build and type-check succeeded.

**Remediation (Applied)**
- Replace app lint scripts with direct ESLint invocation (`eslint .`) aligned with the shared ESLint config.
- Update ESLint ignore patterns to avoid linting build artifacts and config files.

### 2) Next.js Version Inconsistency (Next 16 apps vs Next 15 ESLint config)
**What happened**
- The apps depend on Next.js 16, but the shared ESLint config depends on `eslint-config-next@15.x`, pulling in `@next/eslint-plugin-next@15.x`.

**Evidence**
- Apps reference `next@^16.1.4`.
- Tooling references `eslint-config-next@^15.5.9`.
- `pnpm-lock.yaml` resolves `eslint-config-next@15.5.9` and `@next/eslint-plugin-next@15.5.9`.

**Impact**
- Tooling is tied to Next 15 lint rules while runtime is Next 16, increasing the risk of lint rule mismatches and inconsistent behavior across environments.

**Status**
- **Unresolved**: upgrading to `eslint-config-next` 16 requires an ESLint 9 + flat-config migration. Until that migration is planned, linting remains on the Next 15 ruleset.

### 3) Acceptance Criteria Coverage (Phase 0.1)
**Met**
- Turborepo monorepo structure, pnpm workspaces, and TypeScript strict mode are configured.
- Next.js 16 is set for both apps (web static export, admin SSR).
- Shared packages (`ui`, `shared`, `database`) exist and are wired to apps.
- `.gitignore` includes `.env` handling.
- `pnpm build` and `pnpm type-check` succeed.

**Not met (before remediation)**
- The lint gate was failing due to the `next lint` CLI mismatch.

## Action Items
1. Plan and execute ESLint 9 + flat-config migration, then upgrade `eslint-config-next` to 16 to remove the version mismatch.
2. Re-verify `pnpm lint` after the migration to confirm Phase 0.1 gate remains satisfied.

## References
- ROADMAP.md (Phase 0.1 acceptance criteria and gate).
- apps/web/package.json
- apps/admin/package.json
- tooling/eslint/package.json
- pnpm-lock.yaml
