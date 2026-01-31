# Navigation Redesign Follow-up Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the navigation redesign by creating standalone pages for Vijeće, Župa, and Škola, and migrating /opcina and /usluge to the new PageLayoutV2 pattern.

**Architecture:** Each page uses PageLayoutV2 (sidebar + small hero + content with scroll spy). Content is either hardcoded (Vijeće) or database-backed (Župa, Škola). Tabbed pages are converted to single-page layouts with sections.

**Tech Stack:** Next.js 16 App Router, TypeScript, Framer Motion, PageLayoutV2 component, useScrollSpy hook, Tailwind CSS v4

---

## Current State Analysis

| Page | Current | Target | Content Source |
|------|---------|--------|----------------|
| /vijece | Tab in /organizacija | Standalone with PageLayoutV2 | Hardcoded councilMembers data |
| /zupa | /opcina/zupa (tabs, DB-backed) | /zupa with PageLayoutV2 | Database: `opcina/zupa/*` slugs |
| /skola | /opcina/ustanove (tabs, DB-backed) | /skola with PageLayoutV2 | Database: `opcina/ustanove/*` slugs |
| /opcina | Tabbed (O nama, Turizam, Povijest) | PageLayoutV2 with sections | Inline content |
| /usluge | Tabbed (4 tabs) | PageLayoutV2 with sections | Inline content |
| Mega Menu | ✅ Already 3-group structure | No changes | navigation.ts |

---

## Task 1: Create /vijece Standalone Page

**Files:**
- Create: `apps/web/app/vijece/page.tsx`

**Step 1: Create the page file**

```typescript
// apps/web/app/vijece/page.tsx
import { Users, FileText, Calendar, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '@/components/page-layout-v2';

import type { Metadata } from 'next';
import type { PageSection } from '@/lib/navigation';

export const metadata: Metadata = {
  title: 'Općinsko vijeće',
  description: 'Općinsko vijeće Veliki Bukovec - članovi, sjednice i odluke predstavničkog tijela građana.',
};

const pageSections: PageSection[] = [
  { id: 'clanovi', label: 'Članovi vijeća' },
  { id: 'sjednice', label: 'Sjednice' },
  { id: 'dokumenti', label: 'Dokumenti' },
];

interface CouncilMember {
  name: string;
  role?: string;
  party?: string;
}

const councilMembers: CouncilMember[] = [
  { name: 'Miran Stjepan Posavec', role: 'Predsjednik', party: 'HDZ' },
  { name: 'Mirko Mikulčić', role: 'Potpredsjednik', party: 'HDZ' },
  { name: 'Darko Trstenjak', party: 'HDZ' },
  { name: 'Željko Pintarić', party: 'HDZ' },
  { name: 'Josip Pintarić', party: 'HDZ' },
  { name: 'Dragutin Matoša', party: 'SDP' },
  { name: 'Marijan Špoljar', party: 'SDP' },
];

export default function VjecePage() {
  return (
    <PageLayoutV2
      sectionId="uprava"
      pageId="vijece"
      pageSections={pageSections}
      heroTitle="Općinsko vijeće"
      heroSubtitle="Predstavničko tijelo građana općine Veliki Bukovec"
    >
      {/* Članovi vijeća */}
      <section id="clanovi" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Users className="h-6 w-6 text-primary-600" />
          Članovi vijeća (2021. - 2025.)
        </h2>

        <p className="mb-6 text-lg leading-relaxed text-neutral-700">
          Općinsko vijeće je predstavničko tijelo građana i tijelo lokalne samouprave
          koje donosi odluke i akte u okviru prava i dužnosti Općine. Vijeće ima 7
          članova izabranih na neposrednim izborima. Mandat članova traje četiri godine.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {councilMembers.map((member) => (
            <div
              key={member.name}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div>
                <div className="font-medium text-neutral-900">{member.name}</div>
                {member.role && (
                  <div className="text-sm text-primary-600">{member.role}</div>
                )}
              </div>
              {member.party && (
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                  {member.party}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Sjednice */}
      <section id="sjednice" className="mt-12 scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Calendar className="h-6 w-6 text-primary-600" />
          Sjednice vijeća
        </h2>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <p className="text-neutral-700">
            Sjednice Općinskog vijeća održavaju se prema potrebi, a najmanje jednom u
            tri mjeseca. Sjednice su javne, a građani mogu prisustvovati uz prethodnu
            najavu.
          </p>

          <div className="mt-4 rounded-lg border border-primary-200 bg-primary-50 p-4">
            <h4 className="font-semibold text-primary-900">Kontakt za najavu</h4>
            <div className="mt-2 space-y-1 text-sm text-primary-800">
              <a href="mailto:opcina@velikibukovec.hr" className="flex items-center gap-2 hover:underline">
                <Mail className="h-4 w-4" />
                opcina@velikibukovec.hr
              </a>
              <a href="tel:+38542719001" className="flex items-center gap-2 hover:underline">
                <Phone className="h-4 w-4" />
                042 719 001
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Dokumenti */}
      <section id="dokumenti" className="mt-12 scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <FileText className="h-6 w-6 text-primary-600" />
          Dokumenti
        </h2>

        <p className="mb-6 text-neutral-700">
          Zapisnici i odluke sa sjednica Općinskog vijeća dostupni su u arhivi dokumenata.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/dokumenti?kategorija=sjednice"
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="font-medium text-neutral-900">Zapisnici sjednica</div>
              <div className="text-sm text-neutral-500">Zapisnici i zaključci</div>
            </div>
          </Link>

          <Link
            href="/dokumenti?kategorija=statut"
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="font-medium text-neutral-900">Statut općine</div>
              <div className="text-sm text-neutral-500">Temeljni akt samouprave</div>
            </div>
          </Link>
        </div>
      </section>
    </PageLayoutV2>
  );
}
```

**Step 2: Verify the page renders**

Run: `cd /home/wandeon/WebVB && pnpm dev --filter=@repo/web`

Navigate to `http://localhost:3000/vijece` and verify:
- Sidebar shows "Uprava" section with Vijeće highlighted
- Small hero displays correctly
- All 3 sections render with scroll spy working
- Mobile bottom sheet works

**Step 3: Commit**

```bash
git add apps/web/app/vijece/page.tsx
git commit -m "feat(web): add standalone /vijece page with PageLayoutV2

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create /zupa Standalone Page

**Files:**
- Create: `apps/web/app/zupa/page.tsx`

**Step 1: Create the page file**

The page fetches content from database with slug prefix `opcina/zupa` and displays it using PageLayoutV2.

```typescript
// apps/web/app/zupa/page.tsx
import { Church, Cross, MapPin, Book } from 'lucide-react';
import { pagesRepository } from '@repo/database';

import { PageLayoutV2 } from '@/components/page-layout-v2';
import { RichContent } from '@/components/rich-content';

import type { Metadata } from 'next';
import type { PageSection } from '@/lib/navigation';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Župa sv. Franje Asiškog',
  description: 'Informacije o župi, crkvama, kapelicama i grobljima na području općine Veliki Bukovec.',
};

// Map slug endings to section IDs and icons
const sectionConfig: Record<string, { id: string; label: string; icon: typeof Church }> = {
  'crkva': { id: 'crkva', label: 'Župna crkva', icon: Church },
  'crkve-i-kapelice': { id: 'kapelice', label: 'Crkve i kapelice', icon: Cross },
  'zupni-ured': { id: 'ured', label: 'Župni ured', icon: Book },
  'groblja': { id: 'groblja', label: 'Groblja', icon: MapPin },
};

const tabOrder = ['crkva', 'crkve-i-kapelice', 'zupni-ured', 'groblja'];

export default async function ZupaPage() {
  const pages = await pagesRepository.findBySlugPrefix('opcina/zupa');

  // Sort by predefined order
  const sortedPages = pages.sort((a, b) => {
    const aKey = a.slug.split('/').pop() ?? '';
    const bKey = b.slug.split('/').pop() ?? '';
    const aIdx = tabOrder.indexOf(aKey);
    const bIdx = tabOrder.indexOf(bKey);
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  // Build page sections from database content
  const pageSections: PageSection[] = sortedPages.map((page) => {
    const key = page.slug.split('/').pop() ?? '';
    const config = sectionConfig[key];
    return {
      id: config?.id ?? key,
      label: config?.label ?? page.title,
    };
  });

  return (
    <PageLayoutV2
      sectionId="nas-kraj"
      pageId="zupa"
      pageSections={pageSections}
      heroTitle="Župa sv. Franje Asiškog"
      heroSubtitle="Duhovno središte općine Veliki Bukovec"
    >
      {sortedPages.map((page) => {
        const key = page.slug.split('/').pop() ?? '';
        const config = sectionConfig[key];
        const Icon = config?.icon ?? Church;
        const sectionId = config?.id ?? key;

        return (
          <section key={page.id} id={sectionId} className="scroll-mt-24 [&:not(:first-child)]:mt-12">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
              <Icon className="h-6 w-6 text-primary-600" />
              {page.title}
            </h2>

            <div className="prose prose-neutral max-w-none">
              <RichContent content={page.content ?? ''} />
            </div>
          </section>
        );
      })}
    </PageLayoutV2>
  );
}
```

**Step 2: Verify the page renders**

Run: `cd /home/wandeon/WebVB && pnpm dev --filter=@repo/web`

Navigate to `http://localhost:3000/zupa` and verify:
- Content loads from database
- Sidebar shows "Naš Kraj" section with Župa highlighted
- All sections render with scroll spy

**Step 3: Commit**

```bash
git add apps/web/app/zupa/page.tsx
git commit -m "feat(web): add standalone /zupa page with PageLayoutV2

Content fetched from database (opcina/zupa/* slugs)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create /skola Standalone Page

**Files:**
- Create: `apps/web/app/skola/page.tsx`

**Step 1: Create the page file**

```typescript
// apps/web/app/skola/page.tsx
import { GraduationCap, Users, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { pagesRepository } from '@repo/database';

import { PageLayoutV2 } from '@/components/page-layout-v2';
import { RichContent } from '@/components/rich-content';

import type { Metadata } from 'next';
import type { PageSection } from '@/lib/navigation';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Osnovna škola',
  description: 'Osnovna škola na području općine Veliki Bukovec - informacije o obrazovanju.',
};

export default async function SkolaPage() {
  const pages = await pagesRepository.findBySlugPrefix('opcina/ustanove');

  // Filter for school-related content only
  const schoolPages = pages.filter((p) => p.slug.includes('skola'));

  // Build page sections from database content, or use fallback
  const pageSections: PageSection[] = schoolPages.length > 0
    ? schoolPages.map((page) => ({
        id: page.slug.split('/').pop() ?? 'skola',
        label: page.title,
      }))
    : [
        { id: 'o-skoli', label: 'O školi' },
        { id: 'kontakt', label: 'Kontakt' },
      ];

  const hasDbContent = schoolPages.length > 0;

  return (
    <PageLayoutV2
      sectionId="nas-kraj"
      pageId="skola"
      pageSections={pageSections}
      heroTitle="Osnovna škola"
      heroSubtitle="Obrazovanje za budućnost naše zajednice"
    >
      {hasDbContent ? (
        // Render database content
        schoolPages.map((page) => {
          const sectionId = page.slug.split('/').pop() ?? 'skola';
          return (
            <section key={page.id} id={sectionId} className="scroll-mt-24 [&:not(:first-child)]:mt-12">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
                <GraduationCap className="h-6 w-6 text-primary-600" />
                {page.title}
              </h2>

              <div className="prose prose-neutral max-w-none">
                <RichContent content={page.content ?? ''} />
              </div>
            </section>
          );
        })
      ) : (
        // Fallback static content
        <>
          <section id="o-skoli" className="scroll-mt-24">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
              <GraduationCap className="h-6 w-6 text-primary-600" />
              O školi
            </h2>

            <p className="mb-6 text-lg leading-relaxed text-neutral-700">
              Osnovna škola Veliki Bukovec pruža kvalitetno obrazovanje djeci s područja
              naše općine. Škola je dio sustava osnovnog obrazovanja Varaždinske županije.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-neutral-900">Učenici i učitelji</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Škola okuplja učenike iz sva tri naselja općine
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-neutral-900">Školska godina</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Redovna nastava prema rasporedu Ministarstva
                </p>
              </div>
            </div>
          </section>

          <section id="kontakt" className="mt-12 scroll-mt-24">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
              <Phone className="h-6 w-6 text-primary-600" />
              Kontakt
            </h2>

            <div className="rounded-xl border border-primary-200 bg-primary-50 p-6">
              <div className="space-y-3 text-primary-800">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Veliki Bukovec
                </p>
                <a href="tel:+38542719XXX" className="flex items-center gap-2 hover:underline">
                  <Phone className="h-4 w-4" />
                  042 719 XXX
                </a>
                <a href="mailto:skola@example.hr" className="flex items-center gap-2 hover:underline">
                  <Mail className="h-4 w-4" />
                  skola@example.hr
                </a>
              </div>
              <p className="mt-4 text-sm text-primary-700">
                Za aktualne informacije kontaktirajte školu direktno.
              </p>
            </div>
          </section>
        </>
      )}
    </PageLayoutV2>
  );
}
```

**Step 2: Verify the page renders**

Navigate to `http://localhost:3000/skola` and verify:
- Page renders (with database or fallback content)
- Sidebar shows "Naš Kraj" section with Škola highlighted

**Step 3: Commit**

```bash
git add apps/web/app/skola/page.tsx
git commit -m "feat(web): add standalone /skola page with PageLayoutV2

Fetches content from database if available, otherwise shows fallback

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Migrate /opcina to PageLayoutV2

**Files:**
- Modify: `apps/web/app/opcina/page.tsx`

**Current state:** 365 lines, tabbed page with O nama, Turizam, Povijest sections
**Target state:** PageLayoutV2 with 3 scroll sections

**Step 1: Rewrite the page**

```typescript
// apps/web/app/opcina/page.tsx
import { Info, Mountain, History, MapPin, Users, TreePine } from 'lucide-react';
import Image from 'next/image';

import { PageLayoutV2 } from '@/components/page-layout-v2';

import type { Metadata } from 'next';
import type { PageSection } from '@/lib/navigation';

export const metadata: Metadata = {
  title: 'O općini',
  description: 'Upoznajte općinu Veliki Bukovec - povijest, zemljopis, turizam i zanimljivosti.',
};

const pageSections: PageSection[] = [
  { id: 'o-nama', label: 'O nama' },
  { id: 'turizam', label: 'Turizam' },
  { id: 'povijest', label: 'Povijest' },
];

export default function OpcinaPage() {
  return (
    <PageLayoutV2
      sectionId="nas-kraj"
      pageId="opcina"
      pageSections={pageSections}
      heroTitle="Općina Veliki Bukovec"
      heroSubtitle="Dobrodošli u srce Podravine"
    >
      {/* O nama */}
      <section id="o-nama" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Info className="h-6 w-6 text-primary-600" />
          O nama
        </h2>

        <p className="mb-6 text-lg leading-relaxed text-neutral-700">
          Općina Veliki Bukovec smještena je u sjeverozapadnom dijelu Republike Hrvatske,
          u Varaždinskoj županiji. Općina obuhvaća tri naselja: Veliki Bukovec, Dubovicu
          i Kapelu Podravsku.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">24.5</div>
            <div className="text-sm text-neutral-500">km² površine</div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">~1,400</div>
            <div className="text-sm text-neutral-500">stanovnika</div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <TreePine className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">3</div>
            <div className="text-sm text-neutral-500">naselja</div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="font-semibold text-neutral-900">Zemljopisni položaj</h3>
          <p className="mt-2 text-neutral-600">
            Općina se prostire u nizinskom dijelu Varaždinske županije, uz rijeku Bednju.
            Karakterizira je bogata priroda, plodna poljoprivredna zemljišta i očuvani
            seoski krajolik.
          </p>
        </div>
      </section>

      {/* Turizam */}
      <section id="turizam" className="mt-12 scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Mountain className="h-6 w-6 text-primary-600" />
          Turizam
        </h2>

        <p className="mb-6 text-lg leading-relaxed text-neutral-700">
          Veliki Bukovec nudi mir i prirodne ljepote. Idealan je za biciklizam,
          šetnje prirodom i uživanje u autentičnom seoskom ambijentu Podravine.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="relative h-48 bg-neutral-100">
              <Image
                src="/images/villages/veliki-bukovec.jpg"
                alt="Priroda Velikog Bukovca"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-neutral-900">Rijeka Bednja</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Rijeka Bednja prolazi kroz općinu i nudi mogućnosti za ribolov i šetnje
                uz obalu.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="relative h-48 bg-neutral-100">
              <Image
                src="/images/villages/dubovica.jpg"
                alt="Seoski turizam"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-neutral-900">Seoski turizam</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Doživite autentičan seoski život, domaću kuhinju i gostoprimstvo
                naših mještana.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-primary-200 bg-primary-50 p-6">
          <h3 className="font-semibold text-primary-900">Biciklističke staze</h3>
          <p className="mt-2 text-primary-800">
            Općina je dio mreže biciklističkih staza Varaždinske županije. Ravničarski
            teren idealan je za obiteljski biciklizam.
          </p>
        </div>
      </section>

      {/* Povijest */}
      <section id="povijest" className="mt-12 scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <History className="h-6 w-6 text-primary-600" />
          Povijest
        </h2>

        <p className="mb-6 text-lg leading-relaxed text-neutral-700">
          Povijest Velikog Bukovca seže daleko u prošlost. Područje je bilo naseljeno
          još u prapovijesno doba, a prvi pisani tragovi datiraju iz srednjeg vijeka.
        </p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
              13.
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">13. stoljeće</h4>
              <p className="text-neutral-600">Prvi pisani spomen naselja u povijesnim dokumentima.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
              18.
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">18. stoljeće</h4>
              <p className="text-neutral-600">Izgradnja župne crkve sv. Franje Asiškog.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
              1993
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">1993. godina</h4>
              <p className="text-neutral-600">Osnivanje Općine Veliki Bukovec kao samostalne jedinice lokalne samouprave.</p>
            </div>
          </div>
        </div>
      </section>
    </PageLayoutV2>
  );
}
```

**Step 2: Remove old client/layout files if any**

Check and remove any client.tsx or layout.tsx specific to old tabbed structure.

**Step 3: Verify the page renders**

Navigate to `http://localhost:3000/opcina` and verify:
- New PageLayoutV2 layout with sidebar
- All 3 sections render with scroll spy

**Step 4: Commit**

```bash
git add apps/web/app/opcina/page.tsx
git commit -m "refactor(web): migrate /opcina from tabs to PageLayoutV2

Converted tabbed layout to single page with scroll sections

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Migrate /usluge to PageLayoutV2

**Files:**
- Modify: `apps/web/app/usluge/page.tsx`

**Current state:** 453 lines, tabbed page with Komunalno, Financije, Za građane, Udruge sections
**Target state:** PageLayoutV2 with 4 scroll sections

**Step 1: Rewrite the page**

Extract the ServiceCard component and convert tabs to sections. Keep all content but restructure layout.

```typescript
// apps/web/app/usluge/page.tsx
import {
  Truck,
  Landmark,
  Users2,
  Heart,
  Flame,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  Building,
  Leaf,
  Receipt,
  HandHeart,
  ClipboardList,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '@/components/page-layout-v2';

import type { Metadata } from 'next';
import type { PageSection } from '@/lib/navigation';

export const metadata: Metadata = {
  title: 'Usluge',
  description: 'Usluge Općine Veliki Bukovec - komunalno, financije, usluge za građane i udruge.',
};

const pageSections: PageSection[] = [
  { id: 'komunalno', label: 'Komunalno' },
  { id: 'financije', label: 'Financije' },
  { id: 'gradani', label: 'Za građane' },
  { id: 'udruge', label: 'Udruge' },
];

function ServiceCard({
  icon: Icon,
  title,
  description,
  details,
  link,
  linkText,
  external,
}: {
  icon: typeof Truck;
  title: string;
  description: string;
  details?: string;
  link?: string;
  linkText?: string;
  external?: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600">{description}</p>
      {details && <p className="mt-2 text-xs text-neutral-500">{details}</p>}
      {link && linkText && (
        <Link
          href={link}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          {linkText}
          {external && <ExternalLink className="h-3 w-3" />}
        </Link>
      )}
    </div>
  );
}

export default function UslugePage() {
  return (
    <PageLayoutV2
      sectionId="uprava"
      pageId="usluge"
      pageSections={pageSections}
      heroTitle="Usluge"
      heroSubtitle="Sve usluge Općine Veliki Bukovec na jednom mjestu"
    >
      {/* Komunalno */}
      <section id="komunalno" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Truck className="h-6 w-6 text-primary-600" />
          Komunalno
        </h2>

        <p className="mb-6 text-lg leading-relaxed text-neutral-700">
          Komunalno gospodarstvo brine se za održavanje javnih površina,
          infrastrukture i kvalitetu života u našoj općini.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={Truck}
            title="Odvoz otpada"
            description="Redoviti odvoz komunalnog i reciklabilnog otpada prema rasporedu"
            link="/odvoz-otpada"
            linkText="Raspored odvoza"
          />
          <ServiceCard
            icon={Leaf}
            title="Javne površine"
            description="Održavanje parkova, cesta, javne rasvjete i zelenih površina"
          />
          <ServiceCard
            icon={Flame}
            title="Dimnjačarski poslovi"
            description="Redoviti pregledi i čišćenje dimnjaka za sigurnost građana"
            details="Ovlašteni dimnjačar: Darko Novak, tel: 098 XXX XXXX"
          />
          <ServiceCard
            icon={Building}
            title="Groblja"
            description="Upravljanje i održavanje mjesnih grobalja"
          />
        </div>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h4 className="flex items-center gap-2 font-semibold text-amber-900">
            <Phone className="h-4 w-4" />
            Prijava komunalnog problema
          </h4>
          <p className="mt-2 text-sm text-amber-800">
            Uočili ste oštećenje ceste, problema s rasvjetom ili nelegalno
            odlaganje otpada? Prijavite nam!
          </p>
          <Link
            href="/prijava-problema"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900"
          >
            Prijavite problem →
          </Link>
        </div>
      </section>

      {/* Financije */}
      <section id="financije" className="mt-12 scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Landmark className="h-6 w-6 text-primary-600" />
          Financije
        </h2>

        <p className="mb-6 text-lg leading-relaxed text-neutral-700">
          Transparentno upravljanje javnim sredstvima - proračun, izvještaji i
          financijski dokumenti dostupni svim građanima.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={Receipt}
            title="Proračun"
            description="Godišnji proračun općine s detaljnim planiranjem prihoda i rashoda"
            link="/dokumenti?kategorija=proracun"
            linkText="Proračunski dokumenti"
          />
          <ServiceCard
            icon={FileText}
            title="Financijski izvještaji"
            description="Polugodišnji i godišnji izvještaji o izvršenju proračuna"
            link="/dokumenti?kategorija=proracun"
            linkText="Pogledaj izvještaje"
          />
          <ServiceCard
            icon={HandHeart}
            title="Donacije i sponzorstva"
            description="Pregled primljenih donacija i dodijeljenih sponzorstava"
          />
          <ServiceCard
            icon={ClipboardList}
            title="Javna nabava"
            description="Postupci javne nabave objavljuju se na EOJN portalu"
            link="https://eojn.nn.hr/"
            linkText="EOJN portal"
            external
          />
        </div>

        <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <h4 className="font-semibold text-neutral-900">
            Sudjelovanje građana u planiranju proračuna
          </h4>
          <p className="mt-2 text-sm text-neutral-600">
            Pozivamo sve građane da sudjeluju u kreiranju proračuna za sljedeću
            godinu. Svoje prijedloge možete dostaviti putem kontakt obrasca ili
            osobno u općinskoj upravi.
          </p>
        </div>
      </section>

      {/* Za građane */}
      <section id="gradani" className="mt-12 scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Users2 className="h-6 w-6 text-primary-600" />
          Za građane
        </h2>

        <p className="mb-6 text-lg leading-relaxed text-neutral-700">
          Sve što vam treba na jednom mjestu - obrasci, zahtjevi i informacije
          za građane.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={FileText}
            title="Obrasci i zahtjevi"
            description="Preuzmite obrasce za različite upravne postupke"
            link="/dokumenti?kategorija=obrasci"
            linkText="Svi obrasci"
          />
          <ServiceCard
            icon={Shield}
            title="Pristup informacijama"
            description="Ostvarite pravo na pristup informacijama sukladno zakonu"
            link="/dokumenti/pravo-na-pristup-informacijama"
            linkText="Više informacija"
          />
          <ServiceCard
            icon={Building}
            title="Društveni domovi"
            description="Rezervacija prostora društvenih domova za događanja"
            details="Kontaktirajte JUO za rezervacije"
          />
          <ServiceCard
            icon={Shield}
            title="Civilna zaštita"
            description="Informacije o sustavu civilne zaštite i postupanju u izvanrednim situacijama"
          />
        </div>

        <div className="mt-8 rounded-xl border border-primary-200 bg-primary-50 p-5">
          <h4 className="flex items-center gap-2 font-semibold text-primary-900">
            <Phone className="h-4 w-4" />
            Radno vrijeme za stranke
          </h4>
          <div className="mt-2 text-sm text-primary-800">
            <p>Ponedjeljak - Petak: 8:00 - 14:00</p>
            <p className="mt-1">Telefon: 042 719 001</p>
            <p>Email: opcina@velikibukovec.hr</p>
          </div>
        </div>
      </section>

      {/* Udruge */}
      <section id="udruge" className="mt-12 scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Heart className="h-6 w-6 text-primary-600" />
          Udruge
        </h2>

        <p className="mb-6 text-lg leading-relaxed text-neutral-700">
          Općina podržava rad udruga civilnog društva kroz financiranje programa
          i projekata od interesa za opće dobro.
        </p>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-900">Javni natječaj za udruge</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Svake godine Općina raspisuje javni natječaj za financiranje
              programa i projekata udruga. Natječaj se objavljuje početkom godine.
            </p>
            <Link
              href="/obavijesti?kategorija=natjecaj"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Aktualni natječaji →
            </Link>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-900">Uvjeti financiranja</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                Udruga mora biti registrirana i djelovati na području općine
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                Program mora biti od interesa za lokalnu zajednicu
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                Uredno izvještavanje o prethodnim projektima
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-900">Dokumenti za prijavu</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Potrebni obrasci za prijavu na natječaj dostupni su u sekciji dokumenata.
            </p>
            <Link
              href="/dokumenti?kategorija=obrasci"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <FileText className="h-4 w-4" />
              Obrasci za udruge
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/udruge"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Heart className="h-4 w-4" />
            Pogledaj sve udruge
          </Link>
        </div>
      </section>
    </PageLayoutV2>
  );
}
```

**Step 2: Verify the page renders**

Navigate to `http://localhost:3000/usluge` and verify:
- New PageLayoutV2 layout
- All 4 sections with scroll spy

**Step 3: Commit**

```bash
git add apps/web/app/usluge/page.tsx
git commit -m "refactor(web): migrate /usluge from tabs to PageLayoutV2

Converted 4-tab layout to single page with scroll sections

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Handle Legacy Routes and Cleanup

**Files:**
- Create: `apps/web/app/opcina/zupa/page.tsx` (redirect)
- Create: `apps/web/app/opcina/ustanove/page.tsx` (redirect)
- Possibly delete: `apps/web/app/organizacija/` (if obsolete)

**Step 1: Add redirect from /opcina/zupa to /zupa**

```typescript
// apps/web/app/opcina/zupa/page.tsx
import { redirect } from 'next/navigation';

export default function OldZupaPage() {
  redirect('/zupa');
}
```

**Step 2: Add redirect from /opcina/ustanove to /skola**

```typescript
// apps/web/app/opcina/ustanove/page.tsx
import { redirect } from 'next/navigation';

export default function OldUstanovePage() {
  redirect('/skola');
}
```

**Step 3: Evaluate /organizacija**

Since /nacelnik and /vijece are now standalone pages, check if /organizacija is still needed.
- If only "Uprava" tab content remains useful, create redirect to /nacelnik or keep for JUO info
- For now, keep it but remove Načelnik tab content (link to /nacelnik instead)

**Step 4: Commit**

```bash
git add apps/web/app/opcina/zupa/page.tsx apps/web/app/opcina/ustanove/page.tsx
git commit -m "chore(web): add redirects for legacy /opcina/zupa and /opcina/ustanove

Routes now redirect to standalone /zupa and /skola pages

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Update Documentation

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`
- Modify: `docs/DESIGN-SYSTEM.md`

**Step 1: Update CHANGELOG.md**

Add entry for navigation follow-up completion.

**Step 2: Update ROADMAP.md**

Mark navigation redesign follow-up tasks as complete.

**Step 3: Update DESIGN-SYSTEM.md**

Document which pages now use PageLayoutV2.

**Step 4: Commit**

```bash
git add CHANGELOG.md ROADMAP.md docs/DESIGN-SYSTEM.md
git commit -m "docs: update documentation for navigation follow-up completion

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create /vijece page | `apps/web/app/vijece/page.tsx` |
| 2 | Create /zupa page | `apps/web/app/zupa/page.tsx` |
| 3 | Create /skola page | `apps/web/app/skola/page.tsx` |
| 4 | Migrate /opcina to PageLayoutV2 | `apps/web/app/opcina/page.tsx` |
| 5 | Migrate /usluge to PageLayoutV2 | `apps/web/app/usluge/page.tsx` |
| 6 | Handle legacy routes | Redirects + cleanup |
| 7 | Update documentation | CHANGELOG, ROADMAP, DESIGN-SYSTEM |

**Mega Menu:** No changes needed - already uses 3-group structure from navigation.ts

---

## Verification Checklist

- [ ] /vijece renders with PageLayoutV2
- [ ] /zupa renders with database content
- [ ] /skola renders (with DB or fallback content)
- [ ] /opcina uses PageLayoutV2 with 3 sections
- [ ] /usluge uses PageLayoutV2 with 4 sections
- [ ] /opcina/zupa redirects to /zupa
- [ ] /opcina/ustanove redirects to /skola
- [ ] Sidebar navigation highlights correct items on all pages
- [ ] Mobile bottom sheet works on all new pages
- [ ] Scroll spy highlights correct section on all pages
- [ ] No TypeScript errors: `pnpm type-check`
- [ ] No lint errors: `pnpm lint`
