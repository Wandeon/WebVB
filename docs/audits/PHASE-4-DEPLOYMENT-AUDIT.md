# Phase 4 Deployment & Build System Audit

**Scope:** VPS setup, deployment automation, backups, Cloudflare Pages pipeline, secrets handling, and operational documentation.

## Executive Summary
**Status:** **PASS WITH FIXES**

The deployment architecture is well defined, but the repo had gaps between documentation and implementation (missing deploy workflows/scripts, inconsistent env naming, and missing restore procedure). These were addressed with new scripts, optional GitHub Actions workflows, and documentation updates. Remaining items are mostly operational follow-through (secrets provisioning, wiring rebuild triggers).

## Documents Reviewed
- `ROADMAP.md`
- `docs/OPERATIONS.md`
- `docs/SECURITY.md`
- `docs/ARCHITECTURE.md`
- `docs/CI-CD.md`
- `DECISIONS.md`
- `AGENTS.md`, `CLAUDE.md`

## Audit Checklist
1) **VPS bootstrap correctness**: ✅ Hardening expectations documented; PM2 config now enforces localhost binding.
2) **Secrets management**: ✅ Template expanded; naming aligned with runtime code.
3) **Postgres correctness**: ⚠️ Backups documented; migrations now scripted, but production migration discipline still needs enforcement.
4) **Ollama installation/runtime**: ✅ Localhost binding documented.
5) **Admin deployment**: ✅ Deploy script and workflow added; health check already in place.
6) **Static site pipeline**: ⚠️ Cloudflare Pages build relies on Git integration; manual rebuild workflow added.
7) **Observability**: ✅ Sentry/UptimeRobot documented; build-time gating in CI exists.
8) **Reliability**: ✅ PM2 reload + backup/restore scripts; retention policy aligned to 90 days.
9) **Security**: ✅ Localhost bindings emphasized; env handling cleaned up.

---

## Findings

### High Severity

#### 1) Deployment automation missing (scripts + workflow)
- **Impact:** Admin deploys relied on ad-hoc steps, increasing risk of drift and slow recovery.
- **Evidence:** New scripts and workflow now present:
  - `scripts/deploy-admin.sh`
  - `.github/workflows/deploy-admin.yml`
- **Fix:** **Implemented**. Added a deploy script and an opt-in GitHub Actions workflow requiring explicit secrets.

#### 2) No documented restore procedure for backups
- **Impact:** Backup integrity cannot be validated without an operational restore path.
- **Evidence:** Added restore script and runbook in operations:
  - `scripts/restore-db.sh`
  - `docs/OPERATIONS.md` (Backup & Restore section)
- **Fix:** **Implemented**. Restore procedure documented and guarded with explicit confirmation.

---

### Medium Severity

#### 3) Cloudflare Pages output directory mismatch
- **Impact:** Misconfigured build output would break Pages deployments.
- **Evidence:** `docs/CI-CD.md` now references `apps/web/out` for static export output.
- **Fix:** **Implemented**.

#### 4) Environment template incomplete / inconsistent naming
- **Impact:** Missing or mismatched env names cause runtime failures and confusion.
- **Evidence:**
  - `.env.example` now includes Cloudflare, SiteGround, and Sentry client vars.
  - `docs/SECURITY.md` aligns R2 env names with code (`CLOUDFLARE_*`).
- **Fix:** **Implemented**.

#### 5) Migration command missing in deployment flow
- **Impact:** Schema changes may not be applied on deploy.
- **Evidence:**
  - Root `package.json` and `packages/database/package.json` now expose `db:migrate`.
  - `scripts/deploy-admin.sh` runs `pnpm db:migrate`.
- **Fix:** **Implemented**.

#### 6) PM2 config in infra plan omitted localhost binding
- **Impact:** Admin app could bind to `0.0.0.0`, violating security policy.
- **Evidence:** `docs/plans/2026-01-24-phase3-remaining-infrastructure.md` now uses `-H 127.0.0.1` in PM2 args.
- **Fix:** **Implemented**.

---

### Low Severity

#### 7) Pages rebuild trigger not yet wired to content publish
- **Impact:** Content publish requires manual Pages rebuild unless automated.
- **Evidence:** Manual trigger workflow exists (`.github/workflows/trigger-pages-build.yml`), but no automated hook documented.
- **Recommendation:** Wire the admin publish flow to call the Cloudflare Pages deployment API (requires a scoped token).

---

## Fixes Applied (Summary)
- Added deployment, backup, and restore scripts in `scripts/`.
- Added optional GitHub Actions workflows for admin deploy and Pages rebuild.
- Aligned environment templates and security docs to actual runtime variable names.
- Documented backup/restore procedure in `docs/OPERATIONS.md`.
- Corrected Cloudflare Pages output directory in `docs/CI-CD.md`.

## Verification Steps
- `pnpm lint && pnpm type-check`
- `bash scripts/backup-db.sh` (requires R2 credentials and DATABASE_URL)
- `bash scripts/restore-db.sh` (requires R2 credentials and CONFIRM_RESTORE=YES)
- `workflow_dispatch` for deploy and Pages trigger after secrets are configured
