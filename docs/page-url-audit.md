# Page URL Audit - Veliki Bukovec Website

Generated: 2026-01-27

This document maps all URLs expected by navigation, sitemap, and the actual migrated pages from WordPress.

---

## Table of Contents

1. [Navigation URLs](#1-navigation-urls)
2. [Sitemap Static Routes](#2-sitemap-static-routes)
3. [Migrated WordPress Pages](#3-migrated-wordpress-pages)
4. [URL Mapping Status](#4-url-mapping-status)
5. [Missing Pages (Navigation expects but don't exist)](#5-missing-pages)
6. [Orphaned Pages (Migrated but not in navigation)](#6-orphaned-pages)
7. [Recommended Actions](#7-recommended-actions)

---

## 1. Navigation URLs

### Main Navigation (`mainNav`)

| Section | Title | Expected URL | Status |
|---------|-------|--------------|--------|
| Home | Naslovnica | `/` | ✅ Static route |
| **Organizacija** | | `/organizacija` | ❌ No landing page |
| | Općinska uprava | `/organizacija/uprava` | ❌ **MISSING** |
| | Općinsko vijeće | `/organizacija/vijece` | ✅ Mapped from `opcinsko-vijece` |
| | Sjednice vijeća | `/organizacija/sjednice` | ✅ Mapped from `zapisnici-sa-sjednica` |
| | Jedinstveni upravni odjel | `/organizacija/juo` | ✅ Mapped from `juo-opcine` |
| **Rad uprave** | | `/rad-uprave` | ❌ No landing page |
| | Javna nabava | `https://e-nabava.hr` | ✅ External link |
| | Komunalno gospodarstvo | `/rad-uprave/komunalno` | ✅ Mapped from `komunalna-infrastruktura` |
| | Financiranje udruga | `/rad-uprave/udruge` | ❌ **MISSING** |
| | Kutak za mještane | `/rad-uprave/mjestani` | ❌ **MISSING** |
| | Registri i ugovori | `/rad-uprave/registri` | ❌ **MISSING** |
| **Vijesti** | | `/vijesti` | ✅ Dynamic route |
| | Općinske aktualnosti | `/vijesti/kategorija/aktualnosti` | ✅ Category filter |
| | Gospodarstvo | `/vijesti/kategorija/gospodarstvo` | ✅ Category filter |
| | Sport | `/vijesti/kategorija/sport` | ✅ Category filter |
| | Kultura | `/vijesti/kategorija/kultura` | ✅ Category filter |
| | Sve vijesti | `/vijesti` | ✅ Dynamic route |
| **Dokumenti** | | `/dokumenti` | ✅ Dynamic route |
| | Službeni glasnik | `/dokumenti/glasnik` | ❌ **MISSING** |
| | Proračun | `/dokumenti/proracun` | ❌ **MISSING** |
| | Prostorni planovi | `/dokumenti/prostorni-planovi` | ✅ Mapped from `prostorni-plan` |
| | Svi dokumenti | `/dokumenti` | ✅ Dynamic route |
| **Općina** | | `/opcina` | ❌ No landing page |
| | O općini | `/opcina/o-nama` | ✅ Mapped from `o-nama` |
| | Turizam | `/opcina/turizam` | ❌ **MISSING** |
| | Povijest | `/opcina/povijest` | ❌ **MISSING** |
| | Lokacija | `/kontakt` | ✅ Exists |
| **Kontakt** | | `/kontakt` | ✅ Exists |

### Footer Links (`footerLinks`)

| Title | Expected URL | Status |
|-------|--------------|--------|
| Natječaji | `/natjecaji` | ❌ **MISSING** |
| Prijava problema | `/prijava-problema` | ✅ Mapped from `prijavite-problem` |
| Odvoz otpada | `/odvoz-otpada` | ⚠️ Mapped to `/rad-uprave/odvoz-otpada` |
| Pristup informacijama | `/dokumenti/pravo-na-pristup-informacijama` | ⚠️ Mapped to `/rad-uprave/pristup-informacijama` |

---

## 2. Sitemap Static Routes

These routes are hardcoded in `apps/web/app/sitemap.ts`:

| Route | Status |
|-------|--------|
| `/` | ✅ Homepage |
| `/vijesti` | ✅ News listing |
| `/dogadanja` | ✅ Events listing |
| `/dokumenti` | ✅ Documents listing |
| `/galerija` | ✅ Gallery listing |
| `/kontakt` | ✅ Contact page |
| `/prijava-problema` | ✅ Problem report form |

**Dynamic routes** (generated from database):
- `/vijesti/[slug]` - Individual news posts
- `/dogadanja/[id]` - Individual events
- `/galerija/[slug]` - Individual galleries
- `/[...slug]` - Static pages (catch-all)

---

## 3. Migrated WordPress Pages

Total: **82 pages** migrated from WordPress

### By Original WordPress Structure

| WordPress Slug | Title | Old URL | New Mapped Slug |
|----------------|-------|---------|-----------------|
| `o-nama` | Naselja | /o-nama/ | `opcina/o-nama` |
| `opcinski-nacelnik` | Općinski načelnik | /juo-opcine/opcinski-nacelnik/ | `organizacija/nacelnik` |
| `opcinsko-vijece` | Općinsko vijeće | /o-nama/opcinsko-vijece/ | `organizacija/vijece` |
| `naselja` | Dubovica | /o-nama/naselja/ | `opcina/naselja/dubovica` |
| `dokumenti` | Dokumenti | /dokumenti/ | `dokumenti` |
| `udruge-i-drustva` | Udruge-društva | /udruge-i-drustva/ | `opcina/udruge` |
| `kontakt` | Kontakt | /kontakt/ | `kontakt` |
| `juo-opcine` | Općinska tijela | /juo-opcine/ | `organizacija/juo` |
| `statut-opcine` | Statut općine | /juo-opcine/statut-opcine/ | `organizacija/statut` |
| `obavijesti-juo` | Obavijesti JUO | /juo-opcine/obavijesti-juo/ | `organizacija/obavijesti` |
| `financije` | Financije | /juo-opcine/financije/ | `rad-uprave/financije` |
| `javna-nabava` | Javna nabava | /juo-opcine/javna-nabava/ | `rad-uprave/javna-nabava` |
| `kapela` | Kapela Podravska | /o-nama/kapela/ | `opcina/naselja/kapela-podravska` |
| `veliki-bukovec` | Veliki Bukovec | /o-nama/veliki-bukovec/ | `opcina/naselja/veliki-bukovec` |
| `nk-bukovcan-veliki-bukovec` | NK Bukovčan | /udruge-i-drustva/nk-bukovcan-veliki-bukovec/ | `opcina/udruge/nk-bukovcan` |
| `dvd-dubovica` | DVD Dubovica | /udruge-i-drustva/dvd-dubovica/ | `opcina/udruge/dvd-dubovica` |
| `skola` | Osnovna škola | /skola/ | `opcina/ustanove/skola` |
| `pristup-informacijama` | Pristup informacijama | /juo-opcine/pristup-informacijama/ | `rad-uprave/pristup-informacijama` |
| `raspored-odvoza-otpada` | Raspored odvoza otpada | /raspored-odvoza-otpada/ | `rad-uprave/odvoz-otpada` |
| `galerija` | Galerija | /galerija/ | `galerija` |
| `search` | Pretraga | /search/ | `pretraga` |
| `zupa-svetog-franje-asiskog` | Crkva | /zupa-svetog-franje-asiskog/ | `opcina/znamenitosti/zupa` |
| `crkve-i-kapelice` | Crkve i kapelice | /zupa-svetog-franje-asiskog/crkve-i-kapelice/ | `opcina/znamenitosti/crkve` |
| `zupni-dvor` | Župni ured | /zupa-svetog-franje-asiskog/zupni-dvor/ | `opcina/znamenitosti/zupni-dvor` |
| `mjesna-groblja` | Mjesna groblja | /zupa-svetog-franje-asiskog/mjesna-groblja/ | `opcina/znamenitosti/groblja` |
| `dvd-veliki-bukovec` | DVD Veliki Bukovec | /udruge-i-drustva/dvd-veliki-bukovec/ | `opcina/udruge/dvd-veliki-bukovec` |
| `jedinstveni-upravni-odjel-opcine-veliki-bukovec` | JUO | /jedinstveni-upravni-odjel-opcine-veliki-bukovec/ | `organizacija/juo` (duplicate) |
| `nk-poljoprivrednik-kapela` | NK Poljoprivrednik | /nk-poljoprivrednik-kapela/ | `opcina/udruge/nk-poljoprivrednik` |
| `akti-opcinskog-nacelnika` | Akti načelnika | /registar-dokumenata-za-download-2/akti-opcinskog-nacelnika/ | `organizacija/akti-nacelnika` |
| `lokalni-izbori-2017` | Lokalni izbori 2017 | /lokalni-izbori-2017/ | `izbori/lokalni-2017` |
| `zapisnici-sa-sjednica` | Arhiva zapisnika | /download/zapisnici-sa-sjednica/ | `organizacija/sjednice` |
| `odluke-i-akti` | Dokumenti sa sjednica | /download/odluke-i-akti/ | `organizacija/dokumenti-sjednica` |
| `arhiva-odluka` | Arhiva odluka | /download/odluke-i-akti/arhiva-odluka/ | `organizacija/arhiva-odluka` |
| `download` | Download | /download/ | `dokumenti/preuzimanja` |
| `arhiva-odluka-i-akata` | Arhiva odluka i akata | /download/odluke-i-akti/arhiva-odluka-i-akata/ | `organizacija/arhiva-akata` |
| `zapisnici-sa-sjednica-2` | Zapisnici sa sjednica | /download/zapisnici-sa-sjednica-2/ | `organizacija/sjednice-arhiva` |
| `arhiva-svih-dokumenata` | Arhiva svih dokumenata | /download/arhiva-svih-dokumenata/ | `dokumenti/arhiva` |
| `novosti` | Novosti | /novosti/ | `novosti` |
| `vijesti` | Vijesti | /vijesti/ | `vijesti` |
| `dogadanja` | Događanja | /dogadanja/ | `dogadanja` |
| `korisni-dokumenti` | Korisni dokumenti | /korisni-dokumenti/ | `dokumenti/korisni` |
| `prijavite-problem` | Prijavite problem | /prijavite-problem/ | `prijava-problema` |
| `mjesni-odbor-veliki-bukovec` | MO Veliki Bukovec | /juo-opcine/mjesni-odbor-veliki-bukovec/ | `opcina/naselja/mo-veliki-bukovec` |
| `mo-dubovica` | MO Dubovica | /juo-opcine/mo-dubovica/ | `opcina/naselja/mo-dubovica` |
| `search_gcse` | Search Results | /search_gcse/ | `pretraga-google` |
| `dokumenti-javne-nabave` | Dokumenti javne nabave | /download/dokumenti-javne-nabave/ | `rad-uprave/javna-nabava-dokumenti` |
| `financijski-dokumenti` | Financijski dokumenti | /download/financijski-dokumenti/ | `rad-uprave/financijski-dokumenti` |
| `izbori-za-clanove-europskog-parlamenta-2019` | EU izbori 2019 | /izbori-za-clanove-europskog-parlamenta-2019/ | `izbori/eu-2019` |
| `upu-src-skareski-lug` | UPU SRC Škareški lug | /upu-src-skareski-lug/ | `dokumenti/prostorni-planovi/upu-skareski-lug` |
| `projekti` | Projekti | /projekti/ | `rad-uprave/projekti` |
| `predsjednicki-izbori-2019` | Predsjednički izbori 2019 | /predsjednicki-izbori-2019/ | `izbori/predsjednicki-2019` |
| `covid-19` | COVID-19 | /covid-19/ | `rad-uprave/covid-19` |
| `obrazac-zahtjeva-za-izdavanje-propusnice...` | Propusnice COVID | /obrazac-zahtjeva.../ | `rad-uprave/propusnice-covid` |
| `parlamentarni-izbori-2020` | Parlamentarni izbori 2020 | /parlamentarni-izbori-2020/ | `izbori/parlamentarni-2020` |
| `opcinsko-groblje` | Općinsko groblje | /juo-opcine/opcinsko-groblje/ | `opcina/znamenitosti/opcinsko-groblje` |
| `komunalna-infrastruktura` | Komunalna infrastruktura | /juo-opcine/komunalna-infrastruktura/ | `rad-uprave/komunalno` |
| `lokalni-izbori-2021` | Lokalni izbori 2021 | /lokalni-izbori-2021/ | `izbori/lokalni-2021` |
| `odluke-nacelnika` | Odluke načelnika | /download/odluke-nacelnika/ | `organizacija/odluke-nacelnika` |
| `otvoreni-podaci` | Otvoreni podaci | /juo-opcine/otvoreni-podaci/ | `rad-uprave/otvoreni-podaci` |
| `pocetna` | Početna | / | `pocetna` |
| `izjava-o-pristupacnosti` | Izjava o pristupačnosti | /izjava-o-pristupacnosti/ | `pristupacnost` |
| `vzo-veliki-bukovec` | VZO Veliki Bukovec | /udruge-i-drustva/vzo-veliki-bukovec/ | `organizacija/vzo` |
| `dvd-kapela-podravska` | DVD Kapela Podravska | /udruge-i-drustva/dvd-kapela-podravska/ | `opcina/udruge/dvd-kapela` |
| `s-r-k-linjak-veliki-bukovec` | SRK Linjak | /udruge-i-drustva/s-r-k-linjak-veliki-bukovec/ | `opcina/udruge/srk-linjak` |
| `l-d-fazan-veliki-bukovec` | LD Fazan | /udruge-i-drustva/l-d-fazan-veliki-bukovec/ | `opcina/udruge/ld-fazan` |
| `udruga-umirovljenika-opcine-veliki-bukovec` | UUVB | /udruge-i-drustva/udruga-umirovljenika.../ | `opcina/udruge/umirovljenici` |
| `udruga-zena-veliki-bukovec` | Udruga žena | /udruge-i-drustva/udruga-zena-veliki-bukovec/ | `opcina/udruge/udruga-zena` |
| `mo-kapela-podravska` | MO Kapela Podravska | /juo-opcine/mo-kapela-podravska/ | `opcina/naselja/mo-kapela` |
| `dimnjacarski-poslovi` | Dimnjačarski poslovi | /juo-opcine/dimnjacarski-poslovi/ | `rad-uprave/dimnjacari` |
| `civilna-zastita` | Civilna zaštita | /juo-opcine/civilna-zastita/ | `rad-uprave/civilna-zastita` |
| `koristenje-drustvenih-domova` | Korištenje društvenih domova | /download/koristenje-drustvenih-domova/ | `rad-uprave/drustveni-domovi` |
| `sudjelovanje-gradana-u-planiranju-proracuna` | Sudjelovanje građana | /juo-opcine/sudjelovanje-gradana.../ | `rad-uprave/sudjelovanje-gradana` |
| `izbori-za-zastupnike-u-hrvatski-sabor-2024` | Parlamentarni izbori 2024 | /izbori-za-zastupnike-u-hrvatski-sabor-2024/ | `izbori/parlamentarni-2024` |
| `izbori-za-eu-parlament` | EU Parlament izbori | /izbori-za-eu-parlament/ | `izbori/eu-parlament` |
| `donacije-i-sponzorstva` | Donacije i sponzorstva | /juo-opcine/donacije-i-sponzorstva/ | `rad-uprave/donacije` |
| `udruga-kapelske-zene` | Udruga Kapelske žene | /udruge-i-drustva/udruga-kapelske-zene/ | `opcina/udruge/kapelske-zene` |
| `predsjednicki-izbori` | Predsjednički izbori | /predsjednicki-izbori/ | `izbori/predsjednicki` |
| `prostorni-plan` | Prostorni plan | /juo-opcine/prostorni-plan/ | `dokumenti/prostorni-planovi` |
| `planovi` | Planovi | /planovi/ | `dokumenti/planovi` |
| `lokalni-izbori-2025` | Lokalni izbori 2025 | /lokalni-izbori-2025/ | `izbori/lokalni-2025` |
| `opcinski-nacelnik-arhiva` | Općinski načelnik arhiva | /juo-opcine/opcinski-nacelnik-arhiva/ | `organizacija/nacelnik-arhiva` |

---

## 4. URL Mapping Status

### Configured Slug Mappings (fix-page-slugs.ts)

The migration script maps **68 WordPress slugs** to new hierarchical URLs.

**Mapping Categories:**
- ORGANIZACIJA: 15 mappings
- RAD UPRAVE: 15 mappings
- OPCINA: 12 mappings
- UDRUGE: 11 mappings
- DOKUMENTI: 7 mappings
- IZBORI: 9 mappings
- STANDALONE: 3 mappings
- UTILITY: 8 mappings

---

## 5. Missing Pages

These URLs are expected by navigation but have **NO corresponding page**:

| Expected URL | Nav Location | Recommendation |
|--------------|--------------|----------------|
| `/organizacija` | Main nav section | Create landing page or redirect to first child |
| `/organizacija/uprava` | Organizacija submenu | Create new page or remove from nav |
| `/rad-uprave` | Main nav section | Create landing page or redirect to first child |
| `/rad-uprave/udruge` | Rad uprave submenu | Create new page (financiranje udruga) |
| `/rad-uprave/mjestani` | Rad uprave submenu | Create new page or remove from nav |
| `/rad-uprave/registri` | Rad uprave submenu | Create new page or remove from nav |
| `/opcina` | Main nav section | Create landing page or redirect to first child |
| `/opcina/turizam` | Općina submenu | Create new page or remove from nav |
| `/opcina/povijest` | Općina submenu | Create new page (content exists in o-nama) |
| `/dokumenti/glasnik` | Dokumenti submenu | Create new page or remove from nav |
| `/dokumenti/proracun` | Dokumenti submenu | Create new page or remove from nav |
| `/natjecaji` | Footer | Create new page or remove from footer |
| `/odvoz-otpada` | Footer | Update to `/rad-uprave/odvoz-otpada` |
| `/dokumenti/pravo-na-pristup-informacijama` | Footer | Update to `/rad-uprave/pristup-informacijama` |

---

## 6. Orphaned Pages

These pages were migrated but are **NOT linked in navigation**:

### Izbori (Elections) - Consider adding to nav or archive
| New Slug | Title |
|----------|-------|
| `izbori/lokalni-2017` | Lokalni izbori 2017 |
| `izbori/lokalni-2021` | Lokalni izbori 2021 |
| `izbori/lokalni-2025` | Lokalni izbori 2025 |
| `izbori/parlamentarni-2020` | Parlamentarni izbori 2020 |
| `izbori/parlamentarni-2024` | Parlamentarni izbori 2024 |
| `izbori/predsjednicki` | Predsjednički izbori |
| `izbori/predsjednicki-2019` | Predsjednički izbori 2019 |
| `izbori/eu-2019` | EU izbori 2019 |
| `izbori/eu-parlament` | EU Parlament izbori |

### Organizacija extras
| New Slug | Title |
|----------|-------|
| `organizacija/nacelnik` | Općinski načelnik |
| `organizacija/nacelnik-arhiva` | Općinski načelnik arhiva |
| `organizacija/statut` | Statut općine |
| `organizacija/obavijesti` | Obavijesti JUO |
| `organizacija/dokumenti-sjednica` | Dokumenti sa sjednica |
| `organizacija/akti-nacelnika` | Akti načelnika |
| `organizacija/odluke-nacelnika` | Odluke načelnika |
| `organizacija/arhiva-odluka` | Arhiva odluka |
| `organizacija/arhiva-akata` | Arhiva odluka i akata |
| `organizacija/sjednice-arhiva` | Zapisnici sa sjednica (arhiva) |
| `organizacija/vzo` | VZO Veliki Bukovec |

### Rad uprave extras
| New Slug | Title |
|----------|-------|
| `rad-uprave/javna-nabava` | Javna nabava |
| `rad-uprave/javna-nabava-dokumenti` | Dokumenti javne nabave |
| `rad-uprave/financije` | Financije |
| `rad-uprave/financijski-dokumenti` | Financijski dokumenti |
| `rad-uprave/pristup-informacijama` | Pristup informacijama |
| `rad-uprave/otvoreni-podaci` | Otvoreni podaci |
| `rad-uprave/donacije` | Donacije i sponzorstva |
| `rad-uprave/drustveni-domovi` | Korištenje društvenih domova |
| `rad-uprave/sudjelovanje-gradana` | Sudjelovanje građana |
| `rad-uprave/odvoz-otpada` | Raspored odvoza otpada |
| `rad-uprave/dimnjacari` | Dimnjačarski poslovi |
| `rad-uprave/projekti` | Projekti |
| `rad-uprave/civilna-zastita` | Civilna zaštita |
| `rad-uprave/covid-19` | COVID-19 |
| `rad-uprave/propusnice-covid` | Propusnice COVID |

### Općina extras (naselja, znamenitosti, ustanove)
| New Slug | Title |
|----------|-------|
| `opcina/naselja/veliki-bukovec` | Veliki Bukovec |
| `opcina/naselja/kapela-podravska` | Kapela Podravska |
| `opcina/naselja/dubovica` | Dubovica |
| `opcina/naselja/mo-veliki-bukovec` | MO Veliki Bukovec |
| `opcina/naselja/mo-dubovica` | MO Dubovica |
| `opcina/naselja/mo-kapela` | MO Kapela Podravska |
| `opcina/znamenitosti/zupa` | Crkva |
| `opcina/znamenitosti/crkve` | Crkve i kapelice |
| `opcina/znamenitosti/zupni-dvor` | Župni ured |
| `opcina/znamenitosti/groblja` | Mjesna groblja |
| `opcina/znamenitosti/opcinsko-groblje` | Općinsko groblje |
| `opcina/ustanove/skola` | Osnovna škola |

### Udruge (all not directly in nav)
| New Slug | Title |
|----------|-------|
| `opcina/udruge` | Udruge-društva (landing) |
| `opcina/udruge/dvd-veliki-bukovec` | DVD Veliki Bukovec |
| `opcina/udruge/dvd-dubovica` | DVD Dubovica |
| `opcina/udruge/dvd-kapela` | DVD Kapela Podravska |
| `opcina/udruge/nk-bukovcan` | NK Bukovčan |
| `opcina/udruge/nk-poljoprivrednik` | NK Poljoprivrednik |
| `opcina/udruge/ld-fazan` | LD Fazan |
| `opcina/udruge/srk-linjak` | SRK Linjak |
| `opcina/udruge/kapelske-zene` | Udruga Kapelske žene |
| `opcina/udruge/udruga-zena` | Udruga žena |
| `opcina/udruge/umirovljenici` | Udruga umirovljenika |

### Dokumenti extras
| New Slug | Title |
|----------|-------|
| `dokumenti/korisni` | Korisni dokumenti |
| `dokumenti/arhiva` | Arhiva svih dokumenata |
| `dokumenti/prostorni-planovi/upu-skareski-lug` | UPU SRC Škareški lug |
| `dokumenti/planovi` | Planovi |
| `dokumenti/preuzimanja` | Download |

### Utility/Legacy pages
| New Slug | Title | Note |
|----------|-------|------|
| `pocetna` | Početna | Redirect to `/` |
| `novosti` | Novosti | Redirect to `/vijesti` |
| `dogadanja` | Događanja | Redirect to `/dogadanja` |
| `galerija` | Galerija | Redirect to `/galerija` |
| `vijesti` | Vijesti | Redirect to `/vijesti` |
| `pretraga` | Pretraga | Internal search |
| `pretraga-google` | Google pretraga | Remove |
| `pristupacnost` | Izjava o pristupačnosti | Add to footer |

---

## 7. Recommended Actions

### Priority 1: Fix Navigation Links

Update `apps/web/lib/navigation.ts`:

```typescript
// REMOVE or UPDATE these broken links:
{ title: 'Općinska uprava', href: '/organizacija/uprava' }, // MISSING
{ title: 'Financiranje udruga', href: '/rad-uprave/udruge' }, // MISSING
{ title: 'Kutak za mještane', href: '/rad-uprave/mjestani' }, // MISSING
{ title: 'Registri i ugovori', href: '/rad-uprave/registri' }, // MISSING
{ title: 'Turizam', href: '/opcina/turizam' }, // MISSING
{ title: 'Povijest', href: '/opcina/povijest' }, // MISSING - content in o-nama
{ title: 'Službeni glasnik', href: '/dokumenti/glasnik' }, // MISSING
{ title: 'Proračun', href: '/dokumenti/proracun' }, // MISSING
```

### Priority 2: Fix Footer Links

```typescript
// UPDATE these footer links:
{ title: 'Odvoz otpada', href: '/rad-uprave/odvoz-otpada' }, // was /odvoz-otpada
{ title: 'Pristup informacijama', href: '/rad-uprave/pristup-informacijama' }, // was /dokumenti/...
{ title: 'Natječaji', href: '/vijesti' }, // or remove - no dedicated page
```

### Priority 3: Add Section Landing Pages

Create landing pages for main sections:
- `/organizacija` - Overview of organizational structure
- `/rad-uprave` - Overview of administration services
- `/opcina` - Overview of municipality

### Priority 4: Consider Adding Navigation Items

These migrated pages have useful content but aren't in navigation:
- **Izbori section** - Add dropdown for election archives
- **Udruge** - Link to `/opcina/udruge` in Općina submenu
- **Naselja** - Link to settlement pages in Općina submenu
- **Pristupačnost** - Add accessibility statement to footer

### Priority 5: Cleanup Utility Pages

- Redirect `pocetna`, `novosti`, `vijesti`, `dogadanja`, `galerija` to their proper routes
- Remove `pretraga-google` (obsolete)
- Keep `pretraga` for internal search

---

## Summary

| Category | Count |
|----------|-------|
| Total migrated pages | 82 |
| Navigation URLs (internal) | 22 |
| Missing pages (nav expects) | 14 |
| Orphaned pages (not in nav) | ~60 |
| Footer link issues | 4 |
| Section landing pages needed | 3 |
