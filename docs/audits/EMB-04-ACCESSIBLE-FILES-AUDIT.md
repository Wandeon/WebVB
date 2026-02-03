# EMB-04 — Accessible Files, Dumps, Backups, and “Whoops We Exposed It” Artifacts

**Objective:** Ensure no private files are exposed via public static directories, uploads, generated exports, backups, or leftover migration artifacts. Assume someone will crawl predictable paths.

## Scope
- Public/static folders
- Upload directories
- Generated exports
- Migration outputs
- Temporary files created by scripts
- Deployment artifacts

## Actions Taken
1) **Static/public directory sweep**
   - Reviewed `apps/web/public` and `apps/admin/public` for dumps, exports, migrations output, PDFs, or source maps.
   - Checked for suspicious archive/backup extensions in public assets (`.sql`, `.dump`, `.bak`, `.zip`, `.tar*`, `.gz`, `.7z`, `.csv`, `.xlsx`, `.pdf`, `.map`).

2) **Upload and storage access control review**
   - Verified that uploads are handled via API + R2 storage rather than local public directories.
   - Confirmed no local `uploads/` or `storage/` directories exist in the repo that would be served as static assets.

3) **Script outputs and temp files**
   - Reviewed backup/migration tooling to confirm outputs are stored outside the repo and not written to public paths.
   - Updated `.gitignore` to prevent accidental commits of database dumps and backup/export artifacts.

## Findings

### ✅ Static/Public Assets
- No database dumps, exports, backups, or migration artifacts found inside `apps/web/public` or `apps/admin/public`.
- No source map files or PDFs exist in public asset folders.

### ✅ Uploads and Storage
- Uploads are routed through authenticated API flows and stored in Cloudflare R2 rather than local public folders.
- No publicly listable local upload directories exist in the repo.

### ✅ Script Outputs and Temporary Files
- Database backups are written to `/home/deploy/backups` by default (outside repo/public paths).
- `.gitignore` now blocks common dump/backup/export file patterns and backup directories to prevent accidental commits.

## Recommendations
- Continue keeping all uploads in R2 (not in `public/`), and ensure R2 bucket policies/CORS remain intentional.
- If source maps are ever introduced, decide whether to keep or strip them in production builds.

## Status
**PASS** — No sensitive artifacts in public paths; predictable crawl paths do not expose backups or exports.
