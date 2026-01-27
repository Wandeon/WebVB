/**
 * Migration script to fix page slugs to match navigation structure
 *
 * Run with: pnpm tsx scripts/migration/fix-page-slugs.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping from flat slugs or titles to hierarchical slugs
// Based on apps/web/lib/navigation.ts structure
const SLUG_MAPPINGS: Record<string, string> = {
  // Organizacija section
  'uprava': 'organizacija/uprava',
  'opcinska-uprava': 'organizacija/uprava',
  'vijece': 'organizacija/vijece',
  'opcinsko-vijece': 'organizacija/vijece',
  'sjednice': 'organizacija/sjednice',
  'sjednice-vijeca': 'organizacija/sjednice',
  'juo': 'organizacija/juo',
  'jedinstveni-upravni-odjel': 'organizacija/juo',

  // Rad uprave section
  'komunalno': 'rad-uprave/komunalno',
  'komunalno-gospodarstvo': 'rad-uprave/komunalno',
  'udruge': 'rad-uprave/udruge',
  'financiranje-udruga': 'rad-uprave/udruge',
  'mjestani': 'rad-uprave/mjestani',
  'kutak-za-mjestane': 'rad-uprave/mjestani',
  'registri': 'rad-uprave/registri',
  'registri-i-ugovori': 'rad-uprave/registri',

  // Opcina section
  'o-nama': 'opcina/o-nama',
  'o-opcini': 'opcina/o-nama',
  'turizam': 'opcina/turizam',
  'povijest': 'opcina/povijest',

  // Dokumenti section (these might be dynamic, but adding common ones)
  'glasnik': 'dokumenti/glasnik',
  'sluzbeni-glasnik': 'dokumenti/glasnik',
  'proracun': 'dokumenti/proracun',
  'prostorni-planovi': 'dokumenti/prostorni-planovi',
  'pravo-na-pristup-informacijama': 'dokumenti/pravo-na-pristup-informacijama',
};

// Title-based mappings (fallback if slug doesn't match)
const TITLE_TO_SLUG: Record<string, string> = {
  'Općinska uprava': 'organizacija/uprava',
  'Općinsko vijeće': 'organizacija/vijece',
  'Sjednice vijeća': 'organizacija/sjednice',
  'Jedinstveni upravni odjel': 'organizacija/juo',
  'Komunalno gospodarstvo': 'rad-uprave/komunalno',
  'Financiranje udruga': 'rad-uprave/udruge',
  'Kutak za mještane': 'rad-uprave/mjestani',
  'Registri i ugovori': 'rad-uprave/registri',
  'O općini': 'opcina/o-nama',
  'O nama': 'opcina/o-nama',
  'Turizam': 'opcina/turizam',
  'Povijest': 'opcina/povijest',
  'Službeni glasnik': 'dokumenti/glasnik',
  'Proračun': 'dokumenti/proracun',
  'Prostorni planovi': 'dokumenti/prostorni-planovi',
};

async function main() {
  console.log('Fetching all pages...\n');

  const pages = await prisma.page.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: { slug: 'asc' },
  });

  console.log(`Found ${pages.length} pages:\n`);

  const updates: { id: string; oldSlug: string; newSlug: string; title: string }[] = [];

  for (const page of pages) {
    // Skip pages that already have hierarchical slugs
    if (page.slug.includes('/')) {
      console.log(`✓ ${page.slug} (already hierarchical)`);
      continue;
    }

    // Check if we have a mapping for this slug
    let newSlug = SLUG_MAPPINGS[page.slug];

    // If no slug mapping, try title mapping
    if (!newSlug) {
      newSlug = TITLE_TO_SLUG[page.title];
    }

    if (newSlug && newSlug !== page.slug) {
      updates.push({
        id: page.id,
        oldSlug: page.slug,
        newSlug,
        title: page.title,
      });
      console.log(`→ ${page.slug} => ${newSlug} ("${page.title}")`);
    } else {
      console.log(`? ${page.slug} ("${page.title}") - no mapping found`);
    }
  }

  if (updates.length === 0) {
    console.log('\nNo updates needed.');
    return;
  }

  console.log(`\n${updates.length} pages will be updated.\n`);

  // Check for conflicts
  const existingSlugs = new Set(pages.map(p => p.slug));
  const conflicts = updates.filter(u => existingSlugs.has(u.newSlug) && u.oldSlug !== u.newSlug);

  if (conflicts.length > 0) {
    console.log('WARNING: The following updates would create conflicts:');
    for (const c of conflicts) {
      console.log(`  - ${c.oldSlug} => ${c.newSlug} (already exists)`);
    }
    console.log('\nAborting. Please resolve conflicts manually.');
    return;
  }

  // Perform updates
  console.log('Updating pages...\n');

  for (const update of updates) {
    await prisma.page.update({
      where: { id: update.id },
      data: { slug: update.newSlug },
    });
    console.log(`✓ Updated: ${update.oldSlug} => ${update.newSlug}`);
  }

  console.log('\nDone! All pages updated successfully.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
