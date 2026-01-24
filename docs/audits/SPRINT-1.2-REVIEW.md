# Sprint 1.2 Review - Dashboard Page Audit

## Summary
- Audited dashboard charts and cards for accessibility and localization compliance.
- Verified icon usage does not add noisy screen reader output.
- Added coverage to ensure chart visuals expose descriptive labels.

## Issues Found
1. Chart visuals had no accessible label, leaving screen reader users without context for the data visualizations.
2. Decorative icons in dashboard cards and activity items were not marked as hidden from assistive technology.
3. Category chart title missed Croatian diacritics ("Sadrzaj" instead of "Sadržaj").

## Fixes Applied
- Added `role="img"` and `aria-label` attributes to dashboard charts for descriptive narration.
- Marked decorative icons as `aria-hidden` to prevent redundant announcements.
- Corrected Croatian diacritics in the category chart title.
- Added Playwright coverage to confirm chart labels are exposed after login.
