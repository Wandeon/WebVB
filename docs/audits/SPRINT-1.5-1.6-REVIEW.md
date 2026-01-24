# Sprint 1.5 & 1.6 Audit Review

Date: 2026-01-24
Reviewer: Codex (audit)

## Scope

- Sprint 1.5: Image upload (R2)
- Sprint 1.6: Documents management

Sources reviewed:
- `apps/admin/app/api/upload/route.ts`
- `packages/ui/src/components/ui/image-upload.tsx`
- `apps/admin/components/posts/post-form.tsx`
- `apps/admin/lib/r2.ts`
- `apps/admin/app/api/posts/[id]/route.ts`
- `apps/admin/app/(dashboard)/documents/page.tsx`
- `apps/admin/components/documents/upload-dialog.tsx`

---

## Summary

**Status:** CHANGES REQUESTED

Sprint 1.6 is largely solid. Sprint 1.5 has blocking issues around the upload response shape and R2 cleanup paths that prevent reliable featured image behavior and leave orphaned files. There is also a policy violation for environment validation in the R2 client.

---

## Required Changes (Blocking)

### 1) Image upload API response mismatches UI expectations

**Problem**
- The API returns the standard envelope `{ success: true, data: { id, thumb, medium, large } }`.
- The UI expects `{ url: string }` and calls `onChange(data.url)`.
- Result: `featuredImage` becomes `undefined`, breaking image display.

**Files**
- `apps/admin/app/api/upload/route.ts`
- `packages/ui/src/components/ui/image-upload.tsx`

**Fix proposal**
- Keep the API envelope and update the UI to parse it correctly, e.g.:
  - `const result = await response.json();`
  - `if (!result.success) setError(...)`
  - `onChange(result.data.large)` (or medium/thumb as desired)
- Alternatively, change API to return a single `{ url }` but that would drop variant URLs.

### 2) Image removal does not delete R2 objects

**Problem**
- The UI’s `onRemove` only clears local state; it never calls the DELETE endpoint.
- Post deletion does not remove R2 objects, leaving orphaned uploads.

**Files**
- `packages/ui/src/components/ui/image-upload.tsx`
- `apps/admin/components/posts/post-form.tsx`
- `apps/admin/app/api/posts/[id]/route.ts`
- `apps/admin/app/api/upload/route.ts`

**Fix proposal**
- Persist the upload `id` (or parse it from the URL path) and call `DELETE /api/upload?id=...` when the user removes the image.
- On post deletion, optionally parse the featured image URL and remove its variants from R2.

### 3) R2 client bypasses validated env usage (policy violation)

**Problem**
- `apps/admin/lib/r2.ts` reads `process.env.*` directly, violating the validated env rule in CLAUDE.md.

**Files**
- `apps/admin/lib/r2.ts`
- `packages/shared/src/env.ts`

**Fix proposal**
- Add a `getAdminR2Env()` Zod schema to `packages/shared/src/env.ts`.
- Use the validated env values in `apps/admin/lib/r2.ts`.

---

## Suggestions (Non-blocking)

### Improve Croatian diacritics in UI error strings

**Problem**
- Errors use ASCII-only Croatian (e.g., “Greska”, “Doslo”, “ucitavanja”).

**Files**
- `apps/admin/app/(dashboard)/documents/page.tsx`
- `apps/admin/components/documents/upload-dialog.tsx`

**Fix proposal**
- Update to proper Croatian diacritics:
  - `Greška`, `Došlo`, `učitavanja`, `učitajte`.

---

## Questions

1) For the featured image, should the default URL be `large` or `medium`?
2) Should post deletion always attempt to delete the associated R2 images, or only when the image is not referenced elsewhere?

