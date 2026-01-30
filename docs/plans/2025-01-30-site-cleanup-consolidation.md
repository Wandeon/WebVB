# Site Cleanup & Consolidation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove friction, consolidate scattered pages, and create a simple, valuable user experience by reducing 55+ database pages and cleaning up redundant files.

**Architecture:** Delete orphan MDX files overridden by TSX, create consolidated `/usluge` page (rename rad-uprave) with tabs for services, remove legacy COVID pages, and ensure all navigation paths lead users to clear, consolidated content.

**Tech Stack:** Next.js 16, TypeScript, Framer Motion, Tailwind CSS, PostgreSQL

---

## Summary of Changes

| Action | Count | Impact |
|--------|-------|--------|
| Delete orphan MDX files | 2 | Cleaner codebase |
| Create consolidated /usluge page | 1 | Replace 17 scattered rad-uprave pages |
| Delete legacy COVID pages | 2 | Remove outdated content |
| Update navigation | 1 | Clearer user paths |
| Add metadata to client pages | 4 | Better SEO |
| Rename rad-uprave → usluge | 1 | Clearer naming |

---

## Task 1: Delete Orphan MDX Files

**Files:**
- Delete: `apps/web/app/opcina/page.mdx`
- Delete: `apps/web/app/prijava-problema/page.mdx`

**Step 1: Delete the orphan files**

```bash
rm apps/web/app/opcina/page.mdx
rm apps/web/app/prijava-problema/page.mdx
```

**Step 2: Verify TSX files still exist**

```bash
ls -la apps/web/app/opcina/page.tsx
ls -la apps/web/app/prijava-problema/page.tsx
```
Expected: Both files exist

**Step 3: Verify build works**

```bash
pnpm type-check --filter=@repo/web
```
Expected: Success

---

## Task 2: Add SEO Metadata to Client Component Pages

**Files:**
- Modify: `apps/web/app/opcina/layout.tsx`
- Modify: `apps/web/app/opcina/naselja/layout.tsx`
- Modify: `apps/web/app/opcina/udruge/layout.tsx`
- Modify: `apps/web/app/organizacija/layout.tsx`
- Modify: `apps/web/app/izbori/layout.tsx`

**Step 1: Verify layouts exist and add proper metadata**

Each layout should have comprehensive metadata. Update each layout.tsx to include:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Comprehensive description for SEO',
  openGraph: {
    title: 'Page Title | Općina Veliki Bukovec',
    description: 'Comprehensive description',
  },
};
```

---

## Task 3: Create Consolidated /usluge Page (Rename rad-uprave)

**Files:**
- Create: `apps/web/app/usluge/page.tsx`
- Create: `apps/web/app/usluge/layout.tsx`
- Delete: `apps/web/app/rad-uprave/page.mdx`
- Delete: `apps/web/app/rad-uprave/komunalno/page.mdx`
- Delete: `apps/web/app/rad-uprave/udruge/page.mdx`
- Delete: `apps/web/app/rad-uprave/` directory

**Step 1: Create the consolidated usluge page**

Create `apps/web/app/usluge/page.tsx` with tabs for:
- **Komunalno** - Waste disposal, infrastructure, chimney services
- **Financije** - Budget transparency, financial reports
- **Građani** - Forms, citizen participation, information access
- **Udruge** - Association funding and support

The page should consolidate content from these 17 database pages:
- komunalno, dimnjacari, odvoz-otpada
- financije, financijski-dokumenti, donacije
- pristup-informacijama, otvoreni-podaci, sudjelovanje-gradana
- udruge, drustveni-domovi
- javna-nabava, javna-nabava-dokumenti
- civilna-zastita, projekti

**Step 2: Create layout with metadata**

```typescript
// apps/web/app/usluge/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Usluge',
  description: 'Usluge Općine Veliki Bukovec - komunalno gospodarstvo, financije, obrasci za građane i potpore udrugama',
};

export default function UslugeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

**Step 3: Delete old rad-uprave static files**

```bash
rm -rf apps/web/app/rad-uprave/
```

**Step 4: Verify build**

```bash
pnpm type-check --filter=@repo/web
```

---

## Task 4: Update Navigation Configuration

**Files:**
- Modify: `apps/web/lib/navigation.ts`

**Step 1: Update mega menu**

Replace "Uprava" group with cleaner structure:
```typescript
{
  title: 'Uprava',
  icon: 'building',
  items: [
    { title: 'Organizacija', href: '/organizacija' },
    { title: 'Usluge', href: '/usluge' },
    { title: 'Dokumenti', href: '/dokumenti' },
    { title: 'Javna nabava', href: 'https://eojn.nn.hr/', external: true },
  ],
},
```

**Step 2: Update mobile navigation**

Replace "Organizacija" and remove "Rad uprave":
```typescript
{
  title: 'Organizacija',
  href: '/organizacija',
},
{
  title: 'Usluge',
  href: '/usluge',
  items: [
    { title: 'Komunalno', href: '/usluge#komunalno' },
    { title: 'Financije', href: '/usluge#financije' },
    { title: 'Za građane', href: '/usluge#gradani' },
    { title: 'Udruge', href: '/usluge#udruge' },
  ],
},
```

**Step 3: Update footer quick links**

Add Usluge to footer if helpful for users.

---

## Task 5: Clean Up Legacy Database Pages

**Context:** The following database pages are legacy/outdated and should be marked for deletion or hidden:

**COVID-related (outdated):**
- `rad-uprave/covid-19`
- `rad-uprave/propusnice-covid`

**Duplicate content (now in consolidated pages):**
- All `izbori/*` pages (9 pages) - now in /izbori consolidated
- All `rad-uprave/*` pages (17 pages) - now in /usluge consolidated
- Duplicate `organizacija/*` archive pages

**Step 1: Create database cleanup script**

Create `packages/database/src/scripts/cleanup-legacy-pages.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Pages to delete (legacy/duplicate)
const PAGES_TO_DELETE = [
  'rad-uprave/covid-19',
  'rad-uprave/propusnice-covid',
  // Add more as identified
];

// Pages to keep but hide from sidebar (archive)
const PAGES_TO_ARCHIVE = [
  'organizacija/sjednice-arhiva',
  'organizacija/nacelnik-arhiva',
  'organizacija/arhiva-odluka',
  'organizacija/arhiva-akata',
];

async function main() {
  console.log('=== Legacy Page Cleanup ===\n');

  // Delete legacy pages
  for (const slug of PAGES_TO_DELETE) {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (page) {
      await prisma.page.delete({ where: { slug } });
      console.log(`✓ Deleted: ${slug}`);
    } else {
      console.log(`- Not found: ${slug}`);
    }
  }

  console.log('\nCleanup complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Step 2: Run the cleanup (carefully)**

```bash
pnpm --filter @repo/database tsx src/scripts/cleanup-legacy-pages.ts
```

---

## Task 6: Add Redirects for Old URLs

**Files:**
- Create: `apps/web/next.config.ts` redirects section

**Step 1: Add redirects for renamed routes**

```typescript
// In next.config.ts
async redirects() {
  return [
    {
      source: '/rad-uprave/:path*',
      destination: '/usluge',
      permanent: true,
    },
    {
      source: '/dozivi-opcinu/:path*',
      destination: '/opcina',
      permanent: true,
    },
  ];
}
```

---

## Task 7: Final Build and Deploy

**Step 1: Run full type check**

```bash
pnpm type-check
```

**Step 2: Run linter**

```bash
pnpm lint --filter=@repo/web
```

**Step 3: Build**

```bash
pnpm build --filter=@repo/web
```

**Step 4: Deploy**

```bash
scp -r apps/web/out/* deploy@100.120.125.83:~/apps/web-static/
```

**Step 5: Verify all new pages**

```bash
curl -s -o /dev/null -w "%{http_code}" http://100.120.125.83/usluge
curl -s -o /dev/null -w "%{http_code}" http://100.120.125.83/organizacija
curl -s -o /dev/null -w "%{http_code}" http://100.120.125.83/opcina
curl -s -o /dev/null -w "%{http_code}" http://100.120.125.83/izbori
```

---

## Task 8: User Experience Improvements

**Step 1: Add "back to top" or section navigation for long pages**

For consolidated pages with tabs (opcina, organizacija, usluge, izbori), ensure:
- Tabs are sticky at top for easy navigation
- Smooth scroll behavior
- Clear visual hierarchy

**Step 2: Ensure mobile responsiveness**

Test all consolidated pages at 375px width:
- Tabs should wrap or become scrollable
- Content should be readable
- Touch targets are 44x44px minimum

---

## Final Checklist

- [ ] Orphan MDX files deleted (2 files)
- [ ] All layout.tsx files have proper metadata
- [ ] /usluge consolidated page created
- [ ] rad-uprave directory deleted
- [ ] Navigation updated (mega menu + mobile + footer)
- [ ] Legacy database pages cleaned up
- [ ] Redirects configured for old URLs
- [ ] Build passes with no errors
- [ ] All pages return 200 OK
- [ ] Mobile responsive verified

---

## Rollback Plan

If issues arise:
1. Git revert the commits
2. Restore deleted files from git history
3. Database pages are soft-deletable, can be restored

---

## Post-Implementation

After deployment:
1. Test all navigation paths manually
2. Check Google Search Console for crawl errors
3. Monitor analytics for 404s
4. Update sitemap if needed
