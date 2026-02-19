# Page Cleanup Audit — velikibukovec.hr

**Date:** 2026-02-18
**Total DB pages:** 82
**Issue:** Many old pages from the WordPress migration are still accessible via URL but contain outdated, duplicate, or irrelevant content.

---

## 1. DELETE — Outdated/Irrelevant Pages (5 pages)

These pages contain obsolete content and should be removed from the database.

| URL | Title | Reason |
|-----|-------|--------|
| `/rad-uprave/covid-19` | COVID-19 | Pandemic is over, outdated health guidelines |
| `/rad-uprave/propusnice-covid` | Obrazac zahtjeva za propusnice | COVID travel passes, completely irrelevant |
| `/pretraga-google` | Search Results | Old Google Custom Search embed, replaced by `/pretraga` |
| `/pocetna` | Početna | Old homepage content served via catch-all, real homepage is `/` |
| `/novosti` | Novosti | Old news page (151KB of stale content), replaced by `/vijesti` |

---

## 2. DELETE — Dead-Weight DB Rows (7 pages)

These pages exist in the DB but are **blocked by `isReservedPageSlug()`** — the hardcoded Next.js routes always win. The DB rows serve no purpose.

| DB Slug | Hardcoded Route That Wins |
|---------|--------------------------|
| `dogadanja` | `/dogadanja` (events list) |
| `galerija` | `/galerija` (gallery list) |
| `vijesti` | `/vijesti` (news list) |
| `dokumenti` | `/dokumenti` (documents list) |
| `kontakt` | `/kontakt` (contact page) |
| `pretraga` | `/pretraga` (search page) |
| `prijava-problema` | `/prijava-problema` (problem report) |

---

## 3. REVIEW — Old Election Pages (9 pages)

Historical election info. Could be kept as archive or removed if not useful.

| URL | Title |
|-----|-------|
| `/izbori/eu-2019` | Izbori za članove Europskog parlamenta - 2019 |
| `/izbori/eu-parlament` | Izbori za EU Parlament. |
| `/izbori/lokalni-2017` | Lokalni izbori 2017. |
| `/izbori/lokalni-2021` | Lokalni izbori 2021 |
| `/izbori/lokalni-2025` | Lokalni izbori 2025 |
| `/izbori/parlamentarni-2020` | Parlamentarni izbori 2020 |
| `/izbori/parlamentarni-2024` | Izbori za zastupnike u Hrvatski sabor 2024 |
| `/izbori/predsjednicki` | Predsjednički izbori |
| `/izbori/predsjednicki-2019` | Predsjednički izbori 2019 |

**Decision needed:** Keep as historical archive? Move to a single "Arhiva izbora" page? Delete old ones?

---

## 4. REVIEW — Archive/Duplicate Organization Pages (5 pages)

Multiple pages for the same concept (e.g., two "arhiva odluka" pages, two "sjednice" pages).

| URL | Title | Possible Duplicate Of |
|-----|-------|-----------------------|
| `/organizacija/nacelnik-arhiva` | Općinski načelnik arhiva | `/organizacija/nacelnik` |
| `/organizacija/arhiva-odluka` | Arhiva odluka | `/organizacija/arhiva-akata` |
| `/organizacija/arhiva-akata` | Arhiva odluka i akata | `/organizacija/arhiva-odluka` |
| `/organizacija/sjednice-arhiva` | Zapisnici sa sjednica | `/organizacija/sjednice` |
| `/dokumenti/arhiva` | Arhiva svih dokumenata | `/dokumenti` (hardcoded list page) |

**Decision needed:** Merge content into single pages? Delete duplicates?

---

## 5. REVIEW — `rad-uprave/*` Pages (14 pages)

These are all served under `/rad-uprave/` via the catch-all route. Some overlap with hardcoded routes, some may have stale content.

| URL | Title | Notes |
|-----|-------|-------|
| `/rad-uprave/civilna-zastita` | Civilna zaštita | Review if current |
| `/rad-uprave/dimnjacari` | Dimnjačarski poslovi | Review if current |
| `/rad-uprave/donacije` | Donacije i sponzorstva | Review if current |
| `/rad-uprave/drustveni-domovi` | Korištenje društvenih domova | Review if current |
| `/rad-uprave/financije` | Financije | Overlaps with `/transparentnost`? |
| `/rad-uprave/financijski-dokumenti` | Financijski dokumenti | Overlaps with `/dokumenti`? |
| `/rad-uprave/javna-nabava` | Javna nabava | Overlaps with `/javna-nabava` hardcoded? |
| `/rad-uprave/javna-nabava-dokumenti` | Dokumenti javne nabave | Overlaps with `/javna-nabava`? |
| `/rad-uprave/komunalno` | Komunalna infrastruktura | Review if current |
| `/rad-uprave/odvoz-otpada` | Raspored odvoza otpada | Overlaps with `/odvoz-otpada` hardcoded? |
| `/rad-uprave/otvoreni-podaci` | Otvoreni podaci | Review if current |
| `/rad-uprave/pristup-informacijama` | Pristup informacijama | Review if current |
| `/rad-uprave/projekti` | Projekti | Review if current |
| `/rad-uprave/sudjelovanje-gradana` | Sudjelovanje građana u planiranju proračuna | Review if current |

**Decision needed:** Which of these have current content worth keeping? Which overlap with new hardcoded routes and should be deleted?

---

## 6. REVIEW — Other Potentially Stale Pages

| URL | Title | Notes |
|-----|-------|-------|
| `/o-opcini` | O Opcini | Only 120 bytes of content — nearly empty |
| `/juo-opcine` | Općinska tijela općine Veliki Bukovec | Only 531 bytes — may be stale |
| `/opcina/o-nama` | Naselja | Title says "Naselja" but slug says "o-nama" — confusing |
| `/pristupacnost` | Izjava o pristupačnosti | Check if matches `/izjava-o-pristupacnosti` hardcoded route |
| `/dokumenti/preuzimanja` | Download | Generic title, check content |
| `/organizacija/obavijesti` | Obavijesti JUO | Check if current |

---

## Summary

| Action | Count |
|--------|-------|
| Delete (outdated) | 5 |
| Delete (dead-weight duplicates) | 7 |
| Review (elections) | 9 |
| Review (archive duplicates) | 5 |
| Review (rad-uprave) | 14 |
| Review (other) | 6 |
| **OK (no action needed)** | **~36** |

### Quick Win SQL (for sections 1 & 2)

```sql
-- Section 1: Delete outdated pages
DELETE FROM pages WHERE slug IN (
  'rad-uprave/covid-19',
  'rad-uprave/propusnice-covid',
  'pretraga-google',
  'pocetna',
  'novosti'
);

-- Section 2: Delete dead-weight DB rows (blocked by hardcoded routes)
DELETE FROM pages WHERE slug IN (
  'dogadanja',
  'galerija',
  'vijesti',
  'dokumenti',
  'kontakt',
  'pretraga',
  'prijava-problema'
);
```

### After Cleanup
- Rebuild static site (`pnpm build --filter=@repo/web`)
- Deploy to vb-vps
- Verify deleted pages return 404
- Update `search_index` to remove deleted page entries
