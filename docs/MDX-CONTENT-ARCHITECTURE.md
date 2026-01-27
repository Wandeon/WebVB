# MDX Content Architecture

> Design document for migrating static pages to MDX format.
> Multiple agents can work on this in parallel by claiming different pages.

## Architecture Decision

### What Changes

| Content Type | Old Approach | New Approach |
|--------------|--------------|--------------|
| Static pages | TipTap JSON in PostgreSQL | MDX files in `content/` |
| News/Posts | Database | Database (unchanged) |
| Documents | Database | Database (unchanged) |
| Events | Database | Database (unchanged) |

### Why MDX

1. **Version controlled** - Content changes visible in git diffs
2. **Agent-friendly** - Write files directly, no API/admin panel needed
3. **Parallel work** - Multiple agents can create different pages simultaneously
4. **Simple deployment** - No database sync for static content
5. **Component support** - Embed React components in markdown

---

## Project Context

- **Website**: Općina Veliki Bukovec (Croatian municipality)
- **Language**: Croatian (hr-HR)
- **Tech Stack**: Next.js 16, Tailwind CSS, pnpm monorepo
- **Public Site**: http://100.120.125.83/
- **Source Content**: `scripts/migration/output/pages.json`

### Contact Information (use in all pages)

```
Općina Veliki Bukovec
Trg svetog Franje 425
42231 Veliki Bukovec
Tel: 042 719 001
Email: opcina@velikibukovec.hr
Radno vrijeme: Pon-Pet 07:00-15:00
```

---

## Setup Required

### 1. Install MDX Dependencies

```bash
pnpm --filter @repo/web add @next/mdx @mdx-js/loader @mdx-js/react
pnpm --filter @repo/web add -D @types/mdx
```

### 2. Configure Next.js

Update `apps/web/next.config.ts`:

```typescript
import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@repo/ui', '@repo/shared', '@repo/database'],
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
```

### 3. Create MDX Components Provider

Create `apps/web/lib/mdx-components.tsx`:

```tsx
import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children }) => {
      if (href?.startsWith('/')) {
        return <Link href={href}>{children}</Link>;
      }
      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
    },
    img: ({ src, alt }) => (
      <Image
        src={src ?? ''}
        alt={alt ?? ''}
        width={800}
        height={450}
        className="rounded-lg"
      />
    ),
    ...components,
  };
}
```

### 4. Create mdx-components.tsx at Root

Create `apps/web/mdx-components.tsx`:

```tsx
export { useMDXComponents } from './lib/mdx-components';
```

---

## Content Structure

```
apps/web/app/
├── organizacija/
│   ├── page.mdx              # Landing page
│   ├── uprava/page.mdx       # Općinska uprava
│   ├── vijece/page.mdx       # Općinsko vijeće
│   ├── sjednice/page.mdx     # Sjednice vijeća
│   └── juo/page.mdx          # Jedinstveni upravni odjel
├── rad-uprave/
│   ├── page.mdx              # Landing page
│   ├── komunalno/page.mdx    # Komunalno gospodarstvo
│   ├── udruge/page.mdx       # Financiranje udruga
│   ├── mjestani/page.mdx     # Kutak za mještane
│   └── registri/page.mdx     # Registri i ugovori
├── opcina/
│   ├── page.mdx              # Landing page
│   ├── o-nama/page.mdx       # O općini
│   ├── turizam/page.mdx      # Turizam
│   └── povijest/page.mdx     # Povijest
├── dokumenti/
│   ├── glasnik/page.mdx      # Službeni glasnik
│   └── proracun/page.mdx     # Proračun
└── natjecaji/page.mdx        # Natječaji
```

---

## MDX Page Template

Every MDX page should follow this structure:

```mdx
import { PageLayout } from '@/components/page-layout';

export const metadata = {
  title: 'Page Title',
  description: 'Brief description for SEO',
};

<PageLayout title="Page Title" section="section-name">

## Section Heading

Content goes here in Croatian.

### Subsection

- List item 1
- List item 2

**Bold text** and *italic text*.

![Alt text](https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/2015/02/image.webp)

[Link text](/path/to/page)

</PageLayout>
```

### PageLayout Component (to create)

Create `apps/web/components/page-layout.tsx`:

```tsx
import { FadeIn, PageSidebar } from '@repo/ui';
import { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  section?: string;
  children: ReactNode;
}

export function PageLayout({ title, section, children }: PageLayoutProps) {
  return (
    <>
      <FadeIn>
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-12 text-white md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
          </div>
        </section>
      </FadeIn>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <article className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:font-semibold prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg">
          {children}
        </article>
      </div>
    </>
  );
}
```

---

## Image URLs

All migrated images are on Cloudflare R2:

- **Base URL**: `https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/`
- **Structure**: `/migration/YYYY/MM/filename.webp`

### Common Images

| Image | URL |
|-------|-----|
| Drašković coat of arms | `.../2015/02/Grb_obitelji_Drašković_Trakošćan.jpg` |
| Castle exterior | `.../2015/02/dvorac-025.webp` |
| Castle photo 5 | `.../2015/02/Dvorac_Draskovic_Veliki_Bukovac_5.jpg` |

**Full mapping**: `scripts/migration/output/media-url-map.json`

---

## Pages to Create

### Priority 1: Missing Navigation Pages

These cause 404 errors in the main navigation.

| # | File Path | Title | Source | Claimable |
|---|-----------|-------|--------|-----------|
| 1 | `organizacija/page.mdx` | Organizacija | Create new | ✅ |
| 2 | `organizacija/uprava/page.mdx` | Općinska uprava | Create new | ✅ |
| 3 | `rad-uprave/page.mdx` | Rad uprave | Create new | ✅ |
| 4 | `rad-uprave/udruge/page.mdx` | Financiranje udruga | `udruge-i-drustva` | ✅ |
| 5 | `rad-uprave/mjestani/page.mdx` | Kutak za mještane | Create new | ✅ |
| 6 | `rad-uprave/registri/page.mdx` | Registri i ugovori | Create new | ✅ |
| 7 | `opcina/page.mdx` | Općina | Create new | ✅ |
| 8 | `opcina/turizam/page.mdx` | Turizam | Create new + `o-nama` | ✅ |
| 9 | `opcina/povijest/page.mdx` | Povijest | Extract from `o-nama` | ✅ |
| 10 | `dokumenti/glasnik/page.mdx` | Službeni glasnik | Create new | ✅ |
| 11 | `dokumenti/proracun/page.mdx` | Proračun | Create new | ✅ |
| 12 | `natjecaji/page.mdx` | Natječaji | Create new | ✅ |

### Priority 2: Migrate Existing Pages

These exist in database but should become MDX.

| # | File Path | Title | Source in pages.json |
|---|-----------|-------|---------------------|
| 13 | `organizacija/vijece/page.mdx` | Općinsko vijeće | `opcinsko-vijece` |
| 14 | `organizacija/sjednice/page.mdx` | Sjednice vijeća | `zapisnici-sa-sjednica` |
| 15 | `organizacija/juo/page.mdx` | Jedinstveni upravni odjel | `juo-opcine` |
| 16 | `rad-uprave/komunalno/page.mdx` | Komunalno gospodarstvo | `raspored-odvoza-otpada` |
| 17 | `opcina/o-nama/page.mdx` | O općini | `o-nama` (general info only) |

---

## Detailed Page Specifications

### Page 1: organizacija/page.mdx

**Section landing page linking to all organization pages.**

```mdx
import { PageLayout } from '@/components/page-layout';

export const metadata = {
  title: 'Organizacija',
  description: 'Organizacijska struktura Općine Veliki Bukovec',
};

<PageLayout title="Organizacija" section="organizacija">

Općina Veliki Bukovec organizirana je prema Zakonu o lokalnoj i područnoj (regionalnoj) samoupravi.

## Tijela općine

### [Općinska uprava](/organizacija/uprava)
Obavlja upravne i stručne poslove iz samoupravnog djelokruga općine.

### [Općinsko vijeće](/organizacija/vijece)
Predstavničko tijelo građana koje donosi odluke i akte u okviru prava i dužnosti općine.

### [Sjednice vijeća](/organizacija/sjednice)
Zapisnici i dokumenti sa sjednica Općinskog vijeća.

### [Jedinstveni upravni odjel](/organizacija/juo)
Upravno tijelo koje obavlja poslove iz samoupravnog djelokruga općine.

</PageLayout>
```

---

### Page 2: organizacija/uprava/page.mdx

**Municipal administration overview.**

```mdx
import { PageLayout } from '@/components/page-layout';

export const metadata = {
  title: 'Općinska uprava',
  description: 'Općinska uprava Općine Veliki Bukovec - kontakt, radno vrijeme, djelatnici',
};

<PageLayout title="Općinska uprava" section="organizacija">

Općinska uprava obavlja upravne i stručne poslove iz samoupravnog djelokruga Općine Veliki Bukovec, kao i povjerene poslove državne uprave.

## Kontakt

**Općina Veliki Bukovec**
Trg svetog Franje 425
42231 Veliki Bukovec

Telefon: 042 719 001
Email: [opcina@velikibukovec.hr](mailto:opcina@velikibukovec.hr)

## Radno vrijeme

Ponedjeljak - Petak: 07:00 - 15:00

## Djelatnici

- **Pročelnik Jedinstvenog upravnog odjela**
- Referent za računovodstvene poslove
- Komunalni redar

## Usluge

Općinska uprava pruža sljedeće usluge građanima:

- Izdavanje potvrda i uvjerenja
- Ovjera potpisa i prijepisa
- Upisi u registre
- Prijava prebivališta
- Komunalne usluge

Za više informacija posjetite [Kutak za mještane](/rad-uprave/mjestani).

</PageLayout>
```

---

### Page 9: opcina/povijest/page.mdx

**Extract history from `o-nama` page in pages.json.**

Source content includes extensive history about:
- Drašković family origins (1643)
- Castle construction (1745-1755)
- 19th century - Illyrian movement connection
- 20th century - Pavao Drašković
- Return of castle (1990s)

```mdx
import { PageLayout } from '@/components/page-layout';

export const metadata = {
  title: 'Povijest Velikog Bukovca',
  description: 'Povijest općine Veliki Bukovec, dvorac Drašković i obitelj Drašković',
};

<PageLayout title="Povijest Velikog Bukovca" section="opcina">

![Grb obitelji Drašković](https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/2015/02/Grb_obitelji_Drašković_Trakošćan.jpg)

## Povijest posjeda i loze Drašković

Posjed Veliki Bukovec nastao je u 16. stoljeću iz bednjanskog vlastelinstva. Budući da je u ono doba taj kraj bio izložen turskim pustošenjima, već sredinom 16. stoljeća sagrađena je u Velikom Bukovcu utvrda koja je služila kao utočište okolnom stanovništvu.

<!-- Continue with full history from o-nama page -->

## Dvorac Drašković

![Dvorac Drašković](https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/2015/02/dvorac-025.webp)

Dvorac u Velikom Bukovcu izgradio je u razdoblju od 1745. do 1755. godine grof Josip Kazimir Drašković (1716.-1765.).

<!-- Continue with castle description -->

## Perivoj

Perivoj površine 11 hektara počeo se uređivati nakon izgradnje dvorca...

<!-- Continue with park description -->

</PageLayout>
```

---

### Page 8: opcina/turizam/page.mdx

```mdx
import { PageLayout } from '@/components/page-layout';

export const metadata = {
  title: 'Turizam',
  description: 'Turističke atrakcije općine Veliki Bukovec - dvorac, priroda, znamenitosti',
};

<PageLayout title="Turizam" section="opcina">

Dobrodošli u Veliki Bukovec! Naša općina nudi bogatu kulturno-povijesnu baštinu i prirodne ljepote.

## Dvorac Drašković

![Dvorac Drašković](https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/2015/02/dvorac-025.webp)

Barokni dvorac iz 18. stoljeća, jedna od najljepših građevina sjeverozapadne Hrvatske. Dvorac je u privatnom vlasništvu obitelji Drašković.

[Saznajte više o povijesti dvorca](/opcina/povijest)

## Perivoj

Park površine 11 hektara uređen u engleskom stilu okružuje dvorac. Sadrži egzotične vrste drveća i šetnice.

## Rijeka Plitvica

Rijeka Plitvica protječe kroz općinu i pruža mogućnosti za ribolov i odmor u prirodi.

## Crkve i kapelice

- **Župna crkva sv. Franje Asiškog** - barokna crkva iz 18. stoljeća
- Kapelica u Dubovici
- Kapelica u Kapeli Podravskoj

## Kontakt za turističke informacije

Općina Veliki Bukovec
Telefon: 042 719 001
Email: [opcina@velikibukovec.hr](mailto:opcina@velikibukovec.hr)

</PageLayout>
```

---

## Writing Guidelines

### Tone & Style
- **Formal but accessible** Croatian
- **Clear and concise** - government website style
- **Informative** - focus on practical information
- **No marketing fluff** - straightforward facts

### Structure
- Start with brief introduction (1-2 sentences)
- Use H2 for main sections, H3 for subsections
- Use bullet lists for services, contacts, requirements
- Include relevant images from R2
- End with contact info where appropriate

### Croatian Language Notes
- Use formal "Vi" form
- Proper Croatian diacritics: č, ć, đ, š, ž
- Date format: DD. mjesec YYYY. (e.g., "15. siječnja 2026.")

---

## Parallel Work Protocol

### Claiming a Page

Before starting work, update this document:

1. Change `✅` to `🔒 @agent-name` in the Claimable column
2. Commit with message: `claim: page-name`

### Completing a Page

1. Create the MDX file
2. Test locally if possible
3. Commit with message: `content: add page-name`
4. Update Claimable column to `✅ Done`

### Avoiding Conflicts

- Only work on pages you've claimed
- Don't modify shared files (next.config.ts, etc.) without coordination
- If setup changes are needed, coordinate in a separate task

---

## Verification Checklist

For each page:

- [ ] File path matches navigation URL
- [ ] Title is descriptive
- [ ] Content is in Croatian with proper diacritics
- [ ] Images use R2 URLs
- [ ] Internal links use relative paths (`/path`)
- [ ] Metadata includes title and description
- [ ] PageLayout wrapper is used

---

## Source Content Reference

Key content from `scripts/migration/output/pages.json`:

| Old Slug | Use For |
|----------|---------|
| `o-nama` | **HISTORY** - Full Drašković family history, castle, park |
| `opcinski-nacelnik` | Mayor information |
| `opcinsko-vijece` | Council members |
| `juo-opcine` | Administrative bodies |
| `udruge-i-drustva` | Associations, funding rules |
| `raspored-odvoza-otpada` | Waste collection schedule |
| `kontakt` | Verify contact information |

---

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/migration/output/pages.json` | WordPress content (HTML) |
| `scripts/migration/output/media-url-map.json` | Image URL mapping |
| `apps/web/lib/navigation.ts` | URL structure (must match) |
| `docs/page-url-audit.md` | Full URL audit |

---

## After MDX Migration

Once all MDX pages are created:

1. Remove database page fetching from `[...slug]/page.tsx`
2. Or convert it to only handle legacy URLs with redirects
3. Update `generateStaticParams` to not query database for pages
4. Clean up `pagesRepository` if no longer needed

---

## Changelog

### 2026-01-27
- Initial architecture document
- Defined MDX setup requirements
- Listed 17 pages to create/migrate
- Added detailed specifications for key pages
