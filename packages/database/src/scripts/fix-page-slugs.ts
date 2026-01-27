/**
 * Migration script to restructure page slugs to match navigation
 *
 * Run with: pnpm --filter @repo/database fix-page-slugs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive mapping from WordPress slugs to new hierarchical structure
// Based on apps/web/lib/navigation.ts and logical content grouping
const SLUG_MAPPINGS: Record<string, string> = {
  // ============================================
  // ORGANIZACIJA section (/organizacija/...)
  // ============================================
  'opcinsko-vijece': 'organizacija/vijece',
  'opcinski-nacelnik': 'organizacija/nacelnik',
  'opcinski-nacelnik-arhiva': 'organizacija/nacelnik-arhiva',
  'juo-opcine': 'organizacija/juo',
  'jedinstveni-upravni-odjel-opcine-veliki-bukovec': 'organizacija/juo',
  'zapisnici-sa-sjednica': 'organizacija/sjednice',
  'zapisnici-sa-sjednica-2': 'organizacija/sjednice-arhiva',
  'odluke-i-akti': 'organizacija/dokumenti-sjednica',
  'akti-opcinskog-nacelnika': 'organizacija/akti-nacelnika',
  'odluke-nacelnika': 'organizacija/odluke-nacelnika',
  'arhiva-odluka': 'organizacija/arhiva-odluka',
  'arhiva-odluka-i-akata': 'organizacija/arhiva-akata',
  'obavijesti-juo': 'organizacija/obavijesti',
  'statut-opcine': 'organizacija/statut',
  'vzo-veliki-bukovec': 'organizacija/vzo',

  // ============================================
  // RAD UPRAVE section (/rad-uprave/...)
  // ============================================
  'komunalna-infrastruktura': 'rad-uprave/komunalno',
  'javna-nabava': 'rad-uprave/javna-nabava',
  'dokumenti-javne-nabave': 'rad-uprave/javna-nabava-dokumenti',
  'pristup-informacijama': 'rad-uprave/pristup-informacijama',
  'otvoreni-podaci': 'rad-uprave/otvoreni-podaci',
  'financije': 'rad-uprave/financije',
  'financijski-dokumenti': 'rad-uprave/financijski-dokumenti',
  'donacije-i-sponzorstva': 'rad-uprave/donacije',
  'koristenje-drustvenih-domova': 'rad-uprave/drustveni-domovi',
  'sudjelovanje-gradana-u-planiranju-proracuna': 'rad-uprave/sudjelovanje-gradana',
  'raspored-odvoza-otpada': 'rad-uprave/odvoz-otpada',
  'dimnjacarski-poslovi': 'rad-uprave/dimnjacari',
  'projekti': 'rad-uprave/projekti',
  'civilna-zastita': 'rad-uprave/civilna-zastita',
  'covid-19': 'rad-uprave/covid-19',

  // ============================================
  // OPCINA section (/opcina/...)
  // ============================================
  'o-opcini': 'opcina/o-nama',
  'o-nama': 'opcina/o-nama',  // Will be deleted if duplicate
  'veliki-bukovec': 'opcina/naselja/veliki-bukovec',
  'kapela': 'opcina/naselja/kapela-podravska',
  'naselja': 'opcina/naselja/dubovica',
  'mo-dubovica': 'opcina/naselja/mo-dubovica',
  'mo-kapela-podravska': 'opcina/naselja/mo-kapela',
  'mjesni-odbor-veliki-bukovec': 'opcina/naselja/mo-veliki-bukovec',
  'crkve-i-kapelice': 'opcina/znamenitosti/crkve',
  'zupa-svetog-franje-asiskog': 'opcina/znamenitosti/zupa',
  'zupni-dvor': 'opcina/znamenitosti/zupni-dvor',
  'mjesna-groblja': 'opcina/znamenitosti/groblja',
  'opcinsko-groblje': 'opcina/znamenitosti/opcinsko-groblje',
  'skola': 'opcina/ustanove/skola',

  // ============================================
  // UDRUGE section (/opcina/udruge/...)
  // ============================================
  'udruge-i-drustva': 'opcina/udruge',
  'dvd-veliki-bukovec': 'opcina/udruge/dvd-veliki-bukovec',
  'dvd-dubovica': 'opcina/udruge/dvd-dubovica',
  'dvd-kapela-podravska': 'opcina/udruge/dvd-kapela',
  'nk-bukovcan-veliki-bukovec': 'opcina/udruge/nk-bukovcan',
  'nk-poljoprivrednik-kapela': 'opcina/udruge/nk-poljoprivrednik',
  'l-d-fazan-veliki-bukovec': 'opcina/udruge/ld-fazan',
  's-r-k-linjak-veliki-bukovec': 'opcina/udruge/srk-linjak',
  'udruga-kapelske-zene': 'opcina/udruge/kapelske-zene',
  'udruga-zena-veliki-bukovec': 'opcina/udruge/udruga-zena',
  'udruga-umirovljenika-opcine-veliki-bukovec': 'opcina/udruge/umirovljenici',

  // ============================================
  // DOKUMENTI section (/dokumenti/...)
  // ============================================
  'dokumenti': 'dokumenti',
  'korisni-dokumenti': 'dokumenti/korisni',
  'arhiva-svih-dokumenata': 'dokumenti/arhiva',
  'prostorni-plan': 'dokumenti/prostorni-planovi',
  'upu-src-skareski-lug': 'dokumenti/prostorni-planovi/upu-skareski-lug',
  'planovi': 'dokumenti/planovi',
  'download': 'dokumenti/preuzimanja',

  // ============================================
  // IZBORI section (/izbori/...)
  // ============================================
  'lokalni-izbori-2017': 'izbori/lokalni-2017',
  'lokalni-izbori-2021': 'izbori/lokalni-2021',
  'lokalni-izbori-2025': 'izbori/lokalni-2025',
  'parlamentarni-izbori-2020': 'izbori/parlamentarni-2020',
  'izbori-za-zastupnike-u-hrvatski-sabor-2024': 'izbori/parlamentarni-2024',
  'predsjednicki-izbori': 'izbori/predsjednicki',
  'predsjednicki-izbori-2019': 'izbori/predsjednicki-2019',
  'izbori-za-clanove-europskog-parlamenta-2019': 'izbori/eu-2019',
  'izbori-za-eu-parlament': 'izbori/eu-parlament',

  // ============================================
  // STANDALONE pages (keep at root or specific location)
  // ============================================
  'kontakt': 'kontakt',
  'prijavite-problem': 'prijava-problema',
  'izjava-o-pristupacnosti': 'pristupacnost',

  // ============================================
  // PAGES TO POTENTIALLY DELETE (utility/legacy)
  // ============================================
  // These might be WordPress utility pages - keep but mark
  'pocetna': 'pocetna',
  'novosti': 'novosti',
  'dogadanja': 'dogadanja',
  'galerija': 'galerija',
  'vijesti': 'vijesti',
  'search': 'pretraga',
  'search_gcse': 'pretraga-google',
  'obrazac-zahtjeva-za-izdavanje-propusnice-za-mjestane-opcine-veliki-bukovec': 'rad-uprave/propusnice-covid',
};

async function main() {
  console.log('=== Page Slug Restructuring ===\n');
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
  const unmapped: { slug: string; title: string }[] = [];
  const alreadyHierarchical: string[] = [];

  for (const page of pages) {
    // Skip pages that already have hierarchical slugs
    if (page.slug.includes('/')) {
      alreadyHierarchical.push(page.slug);
      continue;
    }

    // Check if we have a mapping for this slug
    const newSlug = SLUG_MAPPINGS[page.slug];

    if (newSlug && newSlug !== page.slug) {
      updates.push({
        id: page.id,
        oldSlug: page.slug,
        newSlug,
        title: page.title,
      });
    } else if (!newSlug) {
      unmapped.push({ slug: page.slug, title: page.title });
    }
  }

  // Print summary
  if (alreadyHierarchical.length > 0) {
    console.log(`✓ ${alreadyHierarchical.length} pages already have hierarchical slugs\n`);
  }

  if (updates.length > 0) {
    console.log(`→ ${updates.length} pages will be updated:\n`);
    for (const u of updates) {
      console.log(`  ${u.oldSlug} => ${u.newSlug}`);
    }
    console.log('');
  }

  if (unmapped.length > 0) {
    console.log(`? ${unmapped.length} pages have no mapping (will keep current slug):\n`);
    for (const u of unmapped) {
      console.log(`  ${u.slug} ("${u.title}")`);
    }
    console.log('');
  }

  if (updates.length === 0) {
    console.log('No updates needed.');
    return;
  }

  // Check for conflicts - both with existing slugs and within updates
  const existingSlugs = new Set(pages.map(p => p.slug));
  const newSlugsInUpdates = new Map<string, string[]>();

  for (const u of updates) {
    if (!newSlugsInUpdates.has(u.newSlug)) {
      newSlugsInUpdates.set(u.newSlug, []);
    }
    newSlugsInUpdates.get(u.newSlug)!.push(u.oldSlug);
  }

  // Check for duplicate target slugs in updates
  const duplicateTargets = [...newSlugsInUpdates.entries()].filter(([, sources]) => sources.length > 1);
  if (duplicateTargets.length > 0) {
    console.log('WARNING: Multiple pages would map to the same slug:');
    for (const [target, sources] of duplicateTargets) {
      console.log(`  ${target} <- ${sources.join(', ')}`);
    }
    console.log('\nWill only update the first occurrence of each.\n');

    // Keep only first occurrence for each target
    const seenTargets = new Set<string>();
    const filteredUpdates = updates.filter(u => {
      if (seenTargets.has(u.newSlug)) {
        console.log(`  Skipping: ${u.oldSlug} (duplicate target ${u.newSlug})`);
        return false;
      }
      seenTargets.add(u.newSlug);
      return true;
    });
    updates.length = 0;
    updates.push(...filteredUpdates);
    console.log('');
  }

  // Check for conflicts with existing slugs
  const conflicts = updates.filter(u => existingSlugs.has(u.newSlug) && u.oldSlug !== u.newSlug);
  if (conflicts.length > 0) {
    console.log('WARNING: These updates conflict with existing slugs:');
    for (const c of conflicts) {
      console.log(`  ${c.oldSlug} => ${c.newSlug} (already exists)`);
    }
    console.log('\nSkipping conflicting updates.\n');

    const conflictSlugs = new Set(conflicts.map(c => c.newSlug));
    const nonConflicting = updates.filter(u => !conflictSlugs.has(u.newSlug));
    updates.length = 0;
    updates.push(...nonConflicting);
  }

  if (updates.length === 0) {
    console.log('No valid updates after filtering conflicts.');
    return;
  }

  // Perform updates
  console.log(`Updating ${updates.length} pages...\n`);

  let successCount = 0;
  for (const update of updates) {
    try {
      await prisma.page.update({
        where: { id: update.id },
        data: { slug: update.newSlug },
      });
      console.log(`✓ ${update.oldSlug} => ${update.newSlug}`);
      successCount++;
    } catch (error) {
      console.log(`✗ ${update.oldSlug} => ${update.newSlug} (failed)`);
    }
  }

  console.log(`\nDone! ${successCount}/${updates.length} pages updated successfully.`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
