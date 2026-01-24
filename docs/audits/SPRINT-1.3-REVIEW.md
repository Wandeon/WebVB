# Sprint 1.3 Review - Posts List + CRUD Audit

## Summary
- Reviewed posts list UI, post form, delete flow, and related API routes for Sprint 1.3.
- Checked alignment with standards in CLAUDE.md and AGENTS.md (repository usage, response format, localization, logging, and tests).

## Issues Found
1. API routes for posts use direct `db` queries instead of the repository pattern required by the project standards.
2. API responses do not follow the standard `{ success: true|false, data, error }` envelope defined in the project API conventions.
3. User-facing Croatian strings in the posts experience (client toasts and API errors) are missing diacritics (e.g., "Greska" instead of "Greška").
4. Console-based error logging is present in the posts list UI and API routes; project guidelines call for structured logging instead.
5. Sprint 1.3 lacks automated tests covering posts CRUD flows (API validation, list filters, pagination, and delete confirmation).

## Fixes Applied
1. **Repository pattern**: Created `packages/database/src/repositories/posts.ts` with `postsRepository` exposing `findAll`, `findById`, `findBySlug`, `slugExists`, `create`, `update`, `delete`, and `exists` methods. Updated API routes to use repository instead of direct `db` queries.

2. **Standard response envelope**: Created `apps/admin/lib/api-response.ts` with `apiSuccess()` and `apiError()` helpers returning `{ success: true, data }` or `{ success: false, error: { code, message } }` format. Updated all API routes and client-side code to use the new format.

3. **Croatian diacritics**: Fixed all user-facing strings:
   - "Greska" → "Greška"
   - "pronadena" → "pronađena"
   - "dohvacanja" → "dohvaćanja"
   - "azuriranja" → "ažuriranja"
   - "Doslo" → "Došlo"
   - "uspjesno" → "uspješno"
   - "Sadrzaj" → "Sadržaj"
   - "Sazetak" → "Sažetak"
   - "moze" → "može"
   - "zelite" → "želite"
   - "ponistiti" → "poništiti"
   - "Obrisi" → "Obriši"

4. **Structured logging**: Added `pino` and `pino-pretty` dependencies. Created `apps/admin/lib/logger.ts` with domain-specific child loggers (`postsLogger`). Replaced all `console.error` calls with structured `postsLogger.error()` and added info-level logging for successful operations.

5. **Automated tests**: Added vitest to admin app with 37 new tests:
   - `lib/validations/post.test.ts`: 18 tests for Zod schemas (validation rules, Croatian error messages, category enum, query params)
   - `lib/api-response.test.ts`: 9 tests for response envelope helpers (success, error, status codes, details)
   - `lib/utils/slug.test.ts`: 10 tests for slug generation (diacritics, special characters, edge cases)
