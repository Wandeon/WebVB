# Contact + Forms Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create contact page with map and form, plus problem report page with photo upload.

**Architecture:** Two public pages (`/kontakt`, `/prijava-problema`) with API routes storing submissions to existing ContactMessage and ProblemReport DB tables. Rate limiting via in-memory IP tracking, honeypot spam protection, Zod validation.

**Tech Stack:** Next.js App Router, react-hook-form, Zod, Leaflet/react-leaflet, existing R2 image upload.

---

## Task 1: Add Zod validation schemas to shared package

**Files:**
- Create: `packages/shared/src/validations/contact.ts`
- Create: `packages/shared/src/validations/contact.test.ts`
- Modify: `packages/shared/src/index.ts`

**Implementation:**
- `contactFormSchema`: name (required), email (required), subject (optional), message (min 10 chars), honeypot
- `problemReportSchema`: problemType (enum), location (required), description (min 10 chars), optional reporter info, images array (max 5)
- `PROBLEM_TYPES` constant with Croatian labels

---

## Task 2: Create contact form API route with rate limiting

**Files:**
- Create: `apps/web/lib/rate-limit.ts`
- Create: `apps/web/app/api/contact/route.ts`

**Implementation:**
- In-memory rate limiter: 5 requests/hour per IP
- POST handler: validate with Zod, check honeypot, store to DB
- Return JSON success/error responses

---

## Task 3: Create problem report API route

**Files:**
- Create: `apps/web/app/api/problem-report/route.ts`

**Implementation:**
- Rate limit: 3 requests/hour per IP
- POST handler: validate, check honeypot, store to DB with images array

---

## Task 4: Create ContactForm UI component

**Files:**
- Create: `packages/ui/src/components/contact-form.tsx`
- Create: `packages/ui/src/components/contact-form.test.tsx`
- Modify: `packages/ui/src/index.ts`

**Implementation:**
- react-hook-form with zodResolver
- Fields: name, email, subject (optional), message
- Hidden honeypot field
- Success/error state display

---

## Task 5: Create ProblemReportForm UI component

**Files:**
- Create: `packages/ui/src/components/problem-report-form.tsx`
- Create: `packages/ui/src/components/problem-report-form.test.tsx`
- Modify: `packages/ui/src/index.ts`

**Implementation:**
- Problem type Select dropdown
- Location and description fields
- Optional image upload (up to 5)
- Optional contact info fieldset

---

## Task 6: Create display components (ContactInfo, WorkingHours)

**Files:**
- Create: `packages/ui/src/components/contact-info.tsx`
- Create: `packages/ui/src/components/working-hours.tsx`
- Modify: `packages/ui/src/index.ts`

**Implementation:**
- ContactInfo: address, phone (tel: link), email (mailto: link) with icons
- WorkingHours: days/hours display with clock icon

---

## Task 7: Create LeafletMap component

**Files:**
- Create: `packages/ui/src/components/leaflet-map.tsx`
- Modify: `packages/ui/src/index.ts`

**Implementation:**
- Install: `leaflet react-leaflet @types/leaflet`
- Dynamic import (no SSR)
- OpenStreetMap tiles
- Marker with popup

---

## Task 8: Create /kontakt page

**Files:**
- Create: `apps/web/app/kontakt/page.tsx`

**Implementation:**
- Hero section
- Left: ContactInfo + WorkingHours + LeafletMap
- Right: ContactForm
- Server action for form submission

---

## Task 9: Create /prijava-problema page

**Files:**
- Create: `apps/web/app/prijava-problema/page.tsx`

**Implementation:**
- Hero section
- Info box about what can be reported
- ProblemReportForm
- Emergency contact note

---

## Task 10: Final verification and documentation

**Steps:**
- Run lint, type-check, tests
- Update CHANGELOG.md
- Update ROADMAP.md (mark 2.9 complete, progress 9/12)
- Commit documentation

---

## Summary

| Task | Component | Key Files |
|------|-----------|-----------|
| 1 | Zod schemas | `packages/shared/src/validations/contact.ts` |
| 2 | Contact API | `apps/web/app/api/contact/route.ts` |
| 3 | Problem API | `apps/web/app/api/problem-report/route.ts` |
| 4 | ContactForm | `packages/ui/src/components/contact-form.tsx` |
| 5 | ProblemReportForm | `packages/ui/src/components/problem-report-form.tsx` |
| 6 | Display components | `contact-info.tsx`, `working-hours.tsx` |
| 7 | LeafletMap | `packages/ui/src/components/leaflet-map.tsx` |
| 8 | Contact page | `apps/web/app/kontakt/page.tsx` |
| 9 | Problem page | `apps/web/app/prijava-problema/page.tsx` |
| 10 | Verification | CHANGELOG, ROADMAP |
