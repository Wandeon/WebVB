# Sprint 2.5 - Documents Section Audit Request

**Sprint:** 2.5 - Documents Section
**Completed:** 2026-01-25
**PR:** #46 (merged)
**Auditor:** [To be assigned]

---

## Scope

Review all code introduced in Sprint 2.5 for security, accessibility, performance, and code quality issues.

### Files to Audit

**UI Components (packages/ui/src/components/):**
- `document-card.tsx` - Document list item component
- `document-sidebar.tsx` - Desktop category navigation
- `document-accordion.tsx` - Mobile category navigation
- `year-filter.tsx` - Year dropdown filter
- `document-search.tsx` - Search input component

**Primitives (packages/ui/src/primitives/):**
- `accordion.tsx` - Radix Accordion primitive

**Database (packages/database/src/repositories/):**
- `documents.ts` - getDistinctYears, getCategoryCounts methods

**Web App (apps/web/app/dokumenti/):**
- `page.tsx` - Documents page server component
- `documents-client.tsx` - Client-side filtering component

**Exports:**
- `packages/ui/src/index.ts`
- `packages/ui/src/primitives/index.ts`

---

## Audit Checklist

### 1. Security

- [ ] **XSS Prevention:** Verify document titles are properly escaped in rendering
- [ ] **URL Parameter Validation:** Check kategorija, godina, stranica params are validated
- [ ] **File URL Safety:** Verify fileUrl is sanitized before rendering in download links
- [ ] **Integer Parsing:** Check parseInt usage for godina/stranica has proper validation (NaN handling)
- [ ] **Query Injection:** Review Prisma queries for any potential injection vectors

### 2. Accessibility

- [ ] **Keyboard Navigation:** Sidebar links, accordion, and year filter are keyboard accessible
- [ ] **Screen Reader:** Proper aria-labels on search input, download buttons, navigation
- [ ] **Focus Management:** Visible focus states on all interactive elements
- [ ] **aria-current:** Active category links have aria-current="page"
- [ ] **Accordion ARIA:** Accordion trigger/content have proper ARIA attributes
- [ ] **Search Input:** Has aria-label and proper autocomplete attributes

### 3. Performance

- [ ] **ISR Configuration:** Verify revalidate = 60 is appropriate
- [ ] **Parallel Data Fetching:** Promise.all for documents, counts, years is correct
- [ ] **Client-side Search:** Filter logic is efficient (no unnecessary re-renders)
- [ ] **FadeIn Delays:** Staggered animation delays don't cause performance issues with many items

### 4. Code Quality

- [ ] **TypeScript:** No `any` types, proper type exports
- [ ] **Import Order:** ESLint import/order rules followed
- [ ] **Component Props:** All props are properly typed with interfaces
- [ ] **Error Handling:** Empty states handled gracefully
- [ ] **Croatian Localization:** All user-facing text in Croatian
- [ ] **Consistent Patterns:** Follows existing codebase patterns

### 5. UI/UX

- [ ] **Mobile Responsiveness:** Sidebar hidden on mobile, accordion shown
- [ ] **Empty States:** Proper messaging when no documents found
- [ ] **Loading States:** Search filtering is instant (no loading needed)
- [ ] **Download Button:** Opens in new tab with proper rel attributes
- [ ] **Active State Styling:** Category highlight matches design system

### 6. Edge Cases

- [ ] **Zero Documents:** Page handles empty document list
- [ ] **Invalid Category:** Unknown kategorija param handled gracefully
- [ ] **Invalid Year:** Non-numeric godina param handled
- [ ] **Invalid Page:** Out-of-range stranica param clamped
- [ ] **Long Titles:** Document titles truncate properly
- [ ] **Null fileSize:** File size badge hidden when null

---

## Known Issues to Verify

1. **Pagination URL Persistence:** When filtering by year, does pagination preserve the year param?
2. **Search + Pagination:** When searching, pagination is hidden - verify this behavior is intentional
3. **Category Counts Accuracy:** Do counts update when year filter is applied? (Currently shows total counts)

---

## Audit Tasks

After completing the checklist, create fixes for any issues found:

### Priority 1 (Security)
- Fix any XSS or injection vulnerabilities immediately

### Priority 2 (Accessibility)
- Add missing ARIA attributes
- Fix keyboard navigation issues
- Ensure screen reader compatibility

### Priority 3 (Code Quality)
- Fix TypeScript issues
- Correct import order violations
- Add missing error handling

### Priority 4 (UX Polish)
- Fix edge case handling
- Improve empty states
- Enhance mobile experience

---

## Deliverables

1. **Audit Report:** Document all findings with severity ratings
2. **Fix PR:** Single PR with all fixes, referencing this audit
3. **Test Coverage:** Add tests for any security-critical fixes

---

## Reference

- Design System: `docs/DESIGN-SYSTEM.md`
- Sprint Plan: `docs/plans/2026-01-25-sprint-2.5-documents.md`
- Sprint Design: `docs/plans/2026-01-25-sprint-2.5-documents-design.md`
- Previous Audit (2.4): PR #45
