# Content Enrichment Plan

> Generated: 2026-01-31
> Sprint 4.5.4 - Gap Analysis & Enrichment

---

## Executive Summary

| Metric | Count | Action |
|--------|-------|--------|
| Total Issues | 947 | |
| 🔴 Critical | 2 | DELETE (legacy pages) |
| 🟡 High Priority | 67 | Fix before launch |
| 🟠 Medium Priority | 121 | Fix soon after launch |
| 🔵 Re-validate | 757 | Broken images - likely R2 rate limiting |

### Issue Breakdown

| Category | Count | Priority |
|----------|-------|----------|
| Placeholder Text | 2 | 🔴 CRITICAL → DELETE |
| Empty Content | 39 | 🟡 HIGH |
| Missing Fields | 28 | 🟡 HIGH |
| Thin Content | 96 | 🟠 MEDIUM |
| Outdated Content | 25 | 🟠 MEDIUM |
| Broken Images | 757 | 🔵 RE-VALIDATE (likely R2 rate limiting) |
| **Total** | **947** | |

---

## Content Sources for Enrichment

Real, factual content should be drawn from these research documents:

| Document | Location | Content Type |
|----------|----------|--------------|
| DRVB_1.md | `C:\VelikiBukovec_web\DRVB_1.md` | Deep research - history, geography, organizations |
| DRVB_2.pdf | `C:\VelikiBukovec_web\DRVB_2.pdf` | Deep research - additional context |

**IMPORTANT:** Read these documents in chunks (100 lines at a time) - they are very large.

---

## Priority 1: CRITICAL (Blocks Launch)

### Action: DELETE Legacy Pages

These 2 pages contain "u izradi" placeholder text, but they are **legacy pages from the old site structure** that have been replaced by the new `/usluge` consolidated page.

| Page | Old Route | Status | Action |
|------|-----------|--------|--------|
| Financijski dokumenti | `/rad-uprave/financijski-dokumenti` | Legacy - replaced by `/usluge` (Financije tab) | **DELETE** |
| Sudjelovanje građana | `/rad-uprave/sudjelovanje-gradana` | Legacy - replaced by `/usluge` (Građani tab) | **DELETE** |

**Why DELETE instead of fix:**
- The old `/rad-uprave/*` section has been consolidated into `/usluge`
- `/usluge` has tabs: Komunalno, Financije, Građani, Udruge
- These legacy pages were never deleted during migration cleanup
- Writing content for them would duplicate the new structure

**Execution:**
```sql
-- Delete legacy rad-uprave pages
DELETE FROM pages WHERE slug IN (
  'rad-uprave/financijski-dokumenti',
  'rad-uprave/sudjelovanje-gradana'
);
```

**Time estimate:** 5 minutes

---

## Priority 2: HIGH (Should Fix Before Launch)

### 2.1 Empty Content Items (39)

Empty pages/posts need review to determine if they should be deleted or filled.

| Category | Count | Recommended Action |
|----------|-------|-------------------|
| Legacy orphaned pages | ~10-15 | DELETE |
| Active needed pages | ~15-20 | Write content (use DRVB research) |
| Stub announcements | ~5-10 | DELETE or merge |

**Review criteria:**
1. Is this page in the NEW site navigation structure?
2. Does `/[...slug]` route to it (catch-all for legacy pages)?
3. If legacy AND not linked → DELETE
4. If needed → Write using DRVB research sources

### 2.2 Missing Required Fields (28)

| Field Type | Count | Action |
|------------|-------|--------|
| Missing excerpts | ~20 | AI-generate from content |
| Missing locations (events) | ~8 | Review and fill if relevant |

### 2.3 Thin Published Posts (Recent/Visible)

Posts with < 100 words that are recent and likely to be seen by visitors.

**Expand these using DRVB research for factual accuracy:**

| Post | Words | Topic | DRVB Source Section |
|------|-------|-------|---------------------|
| Dan općine Veliki Bukovec | 53-79 | Municipal celebration | Section V - Cultural Calendar |
| Konstituirano Općinsko vijeće | 73 | Council formation | Section VII - Political Governance |
| Uređenje groblja u Velikom Bukovcu | 40 | Cemetery maintenance | Section IV.1 - Parish Infrastructure |

**Priority criteria for thin content:**
1. Recent posts (2024-2026) → HIGH priority
2. Evergreen topics (municipal info, services) → HIGH priority
3. Old announcements (2017-2020) → LOW priority
4. One-time events → LOW priority (don't expand)

---

## Priority 3: MEDIUM (Fix Soon After Launch)

### 3.1 Thin Content - Older Posts (~76 items)

These are older posts (2017-2023) with thin content. Many are:
- Time-sensitive announcements that have passed
- Event notices that are now historical
- Document publication notices

**Action:**
- Leave as historical archive
- Only expand if they remain relevant or frequently accessed
- Consider batch archiving announcements older than 2 years

### 3.2 Outdated Announcements (25)

Announcements with expired validity or past event dates.

**Action options:**
1. Mark as "archived" (keep for historical record)
2. Unpublish (hide from public)
3. Delete (if no historical value)

### 3.3 Old Events (50+)

Events that ended > 30 days ago.

**Action:**
- Bulk archive events older than 1 year
- Keep recent past events visible (historical interest)
- Add "Past Event" badge to old events instead of deleting

---

## Priority 4: LOW (Nice-to-Have)

### 4.1 Event Location Missing (~15)

Many old events (2017-2019) are missing location data.

**Action:** Low priority - fill only if doing other edits to these events

### 4.2 Missing Optional Metadata

- Year metadata on documents
- Optional fields on posts

**Action:** Batch-fillable, but not blocking

---

## Broken Images Investigation (757)

The 757 "broken images" are **likely false positives** due to R2 rate limiting during the audit.

**Verification needed:**
1. Re-run image check with delays between requests
2. Sample 20 random images manually
3. If R2 rate limiting confirmed → Not a content issue, infrastructure config needed

**Probable cause:**
- Audit script hit R2 CDN too fast
- R2 returned 429/503 errors
- Script counted as "broken"

---

## Action Items by Type

### DELETE (Legacy Content)

| Item | Route | Reason |
|------|-------|--------|
| Financijski dokumenti | `/rad-uprave/financijski-dokumenti` | Replaced by `/usluge` |
| Sudjelovanje građana | `/rad-uprave/sudjelovanje-gradana` | Replaced by `/usluge` |

### WRITE (New Content Needed)

Use DRVB_1.md and DRVB_2.pdf as source material:

| Topic | Target Page | DRVB Section |
|-------|-------------|--------------|
| O općini / About | `/opcina` (O nama tab) | Section I, II - Geography, History |
| Turizam | `/opcina` (Turizam tab) | Sections III, IV - Castle, Church |
| Povijest | `/opcina` (Povijest tab) | Sections III, V - Drašković, Timeline |
| Naselja - Veliki Bukovec | `/opcina/naselja` | Section I, VII |
| Naselja - Dubovica | `/opcina/naselja` | Section II.3, IV.2 |
| Naselja - Kapela Podravska | `/opcina/naselja` | Section II.2 - Floods |
| Udruge | `/opcina/udruge` | Section V, VI - Organizations |

### EXPAND (Thin Content)

AI-assisted expansion with human review:

| Priority | Content Type | Count | Method |
|----------|--------------|-------|--------|
| High | Recent posts (2024-2026) | ~15 | AI expand + DRVB facts |
| Medium | Evergreen municipal info | ~10 | AI expand + DRVB facts |
| Low | Old announcements | ~70 | Leave as-is or archive |

### ARCHIVE (Outdated)

| Content Type | Count | Action |
|--------------|-------|--------|
| Old events (> 1 year) | ~40 | Set status to "archived" |
| Expired announcements | ~25 | Set status to "archived" |

---

## Execution Sequence

### Phase 1: Cleanup (Sprint 4.5.5)
1. ✅ Delete 2 legacy placeholder pages (rad-uprave/*)
2. Re-validate broken images with rate limiting
3. Review 39 empty content items (categorize: delete vs write)

### Phase 2: Content Writing (Sprint 4.6)
1. Write `/opcina` content using DRVB research
2. Write `/opcina/naselja` content using DRVB research
3. Write `/opcina/udruge` content using DRVB research
4. AI-generate missing excerpts

### Phase 3: Expansion (Sprint 4.7)
1. Expand thin content on recent/visible posts
2. Archive outdated announcements
3. Bulk archive old events

### Phase 4: Polish (Post-Launch)
1. Fill missing optional metadata
2. Review and clean older thin content
3. Ongoing content quality monitoring

---

## Verification Checklist

- [ ] 2 legacy placeholder pages deleted
- [ ] Broken images re-validated (R2 rate limiting addressed)
- [ ] Empty content items categorized and actioned
- [ ] High-priority thin content expanded
- [ ] Missing excerpts generated
- [ ] Outdated content archived
- [ ] Old events archived

---

## Notes

1. **DO NOT write content for legacy pages** - only for pages in the NEW site structure
2. **Always cross-reference DRVB research** for factual accuracy
3. **AI-generated content requires human review** before publishing
4. **Broken images are likely R2 rate limiting** - re-validate before fixing

---

*This plan is generated from Sprint 4.5.1-4.5.3 findings (sitemap-inventory.md, old-vs-new-comparison.md, quality-audit.md)*
