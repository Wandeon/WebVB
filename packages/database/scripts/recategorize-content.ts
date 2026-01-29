/**
 * Recategorization Script: Assign proper categories to Posts and Documents
 *
 * This script:
 * 1. Recategorizes 88 posts from 'opcinske-vijesti' into proper categories
 * 2. Recategorizes 1034 'ostalo' documents into proper categories
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx scripts/recategorize-content.ts [--dry-run] [--execute]
 */

import { db } from '../src/client';

// ============================================================================
// POST CATEGORIZATION RULES
// ============================================================================

interface PostRule {
  patterns: RegExp[];
  category: string;
}

const POST_RULES: PostRule[] = [
  // OBRAZOVANJE - Education, schools, kindergartens, scholarships
  {
    category: 'obrazovanje',
    patterns: [
      /vrtić|krijesnica/i,
      /škol|skol/i,
      /student/i,
      /stipendij/i,
      /učenik|ucenik/i,
      /obrazovanj/i,
      /udžbenik|udzben/i,
      /pedagošk/i,
    ],
  },
  // KOMUNALNO - Infrastructure, waste, roads, utilities
  {
    category: 'komunalno',
    patterns: [
      /otpad|recikl/i,
      /odvoz/i,
      /cest[aeu]|ulica|prometnic/i,
      /rasvjet/i,
      /vodovod|kanal/i,
      /groblje/i,
      /infrastruktur/i,
      /deratizacij/i,
      /dimovod|dimnjak/i,
      /čistoća|cistoce/i,
      /komunaln/i,
    ],
  },
  // GOSPODARSTVO - Business, agriculture, economy
  {
    category: 'gospodarstvo',
    patterns: [
      /poduzet/i,
      /gospodar/i,
      /poljoprivred/i,
      /obrt/i,
      /zadruga/i,
      /pesticid/i,
      /fiskalizacij/i,
      /internet|širokopojasn/i,
      /optičk/i,
    ],
  },
  // KULTURA - Culture, events, celebrations
  {
    category: 'kultura',
    patterns: [
      /kultur/i,
      /predstav|teatar|kazališt/i,
      /dani zlate/i,
      /knjig[ua]/i,
      /božić|uskrs/i,
      /proslav|dan općine/i,
      /jaslice/i,
      /nagrad.*izvrsnost|rotary/i,
    ],
  },
  // SPORT
  {
    category: 'sport',
    patterns: [/sport/i, /ribič|ribolov/i, /prvenstvo/i, /natjecanje/i, /turnir/i],
  },
  // AKTUALNOSTI - General municipal news (default for most)
  {
    category: 'aktualnosti',
    patterns: [
      /projekt/i,
      /ugovor/i,
      /sporazum/i,
      /potpisivan/i,
      /vijeć/i,
      /sjednic/i,
      /proračun/i,
      /izvješć/i,
      /odluk[ae]/i,
      /načelnik/i,
      /općin[ae]/i,
      /konstitu/i,
      /proglašenj/i,
      /nepogod/i,
      /elementarn/i,
      /rodilj/i,
      /novorođen/i,
      /jednokratn.*pomoć/i,
      /potpor[ae]/i,
      /financij/i,
      /tribina/i,
      /anketa/i,
      /javni uvid/i,
      /javna rasprava/i,
      /procjena utjecaja/i,
    ],
  },
];

// ============================================================================
// DOCUMENT CATEGORIZATION RULES
// ============================================================================

interface DocRule {
  patterns: RegExp[];
  category: string;
}

const DOC_RULES: DocRule[] = [
  // PLANOVI - Spatial plans, urban plans
  {
    category: 'planovi',
    patterns: [
      /prostorn.*plan/i,
      /ppuo/i,
      /urbanisti/i,
      /namjena.*prostor/i,
      /građevinska.*područj/i,
      /gradevinska.*podrucj/i,
      /prometni sustav/i,
      /energetski sustav/i,
      /komunikacijski sustav/i,
      /vodnogospodarski/i,
      /posebna ograničenja/i,
      /posebne vrijednosti/i,
      /provedba.*plan/i,
      /lokacijska informacija/i,
    ],
  },
  // JAVNA_NABAVA - Procurement
  {
    category: 'javna_nabava',
    patterns: [
      /plan nabave/i,
      /izmjen.*plan.*nabave/i,
      /evidencija.*ugovor/i,
      /javna nabava/i,
      /nabava robe/i,
    ],
  },
  // PRORACUN - Budget and financial reports
  {
    category: 'proracun',
    patterns: [
      /financij.*izvješt/i,
      /financij.*izvjest/i,
      /bilješ.*financij/i,
      /biljes.*financij/i,
      /proračun/i,
      /proracun/i,
      /izvršenje/i,
      /izvrsenje/i,
      /polugodišnj/i,
      /polugodisn/i,
      /godišnji izvještaj/i,
      /godisnji izvjestaj/i,
      /rebalans/i,
    ],
  },
  // IZBORI - Elections
  {
    category: 'izbori',
    patterns: [
      /izbor/i,
      /kandidaci/i,
      /birač/i,
      /birac/i,
      /glasova/i,
      /referendum/i,
      /zbirna lista/i,
      /pravovaljana.*lista/i,
      /biralište/i,
      /biraliste/i,
      /manjin/i,
    ],
  },
  // OBRASCI - Forms for citizens
  {
    category: 'obrasci',
    patterns: [
      /^obrazac/i,
      /zahtjev/i,
      /^izjava/i,
      /prijav.*obrazac/i,
      /prijavni/i,
      /privola/i,
      /ponud[ae]/i,
      /formular/i,
    ],
  },
  // ODLUKE_NACELNIKA - Decisions, rules
  {
    category: 'odluke',
    patterns: [
      /^odluka/i,
      /^rješenje/i,
      /^rjesenje/i,
      /^zaključak/i,
      /^zakljucak/i,
      /^naredba/i,
      /^pravilnik/i,
      /^poslovnik/i,
      /^statut/i,
    ],
  },
  // STRATESKI_DOKUMENTI - Strategic documents
  {
    category: 'strateski_dokumenti',
    patterns: [
      /strategij/i,
      /provedbeni program/i,
      /plan razvoja/i,
      /plan rada/i,
      /plan ukupnog/i,
      /razvojna strategij/i,
      /akcijski plan/i,
    ],
  },
  // SJEDNICE - Council sessions (check for zapisnik, dnevni red)
  {
    category: 'sjednice',
    patterns: [/zapisnik/i, /dnevni red/i, /sjednic.*vijeć/i, /sjednic.*vijec/i],
  },
  // IZVJESCA - Reports
  {
    category: 'izvjesca',
    patterns: [
      /izvješće/i,
      /izvjesce/i,
      /izvještaj/i,
      /izvjestaj/i,
      /izvješć/i,
      /godišnje izvješće/i,
      /pregled isplaćenih/i,
      /pregled isplacenih/i,
    ],
  },
];

// ============================================================================
// CATEGORIZATION FUNCTIONS
// ============================================================================

function categorizePost(title: string): string {
  for (const rule of POST_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(title)) {
        return rule.category;
      }
    }
  }
  return 'ostalo';
}

function categorizeDocument(title: string): string {
  for (const rule of DOC_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(title)) {
        return rule.category;
      }
    }
  }
  return 'ostalo';
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

interface Stats {
  posts: Record<string, number>;
  documents: Record<string, number>;
}

async function analyzeRecategorization(): Promise<{
  posts: { id: string; title: string; oldCategory: string; newCategory: string }[];
  documents: { id: string; title: string; oldCategory: string; newCategory: string }[];
  stats: Stats;
}> {
  console.log('\n📊 Analyzing content for recategorization...\n');

  // Get all posts
  const allPosts = await db.post.findMany({
    select: { id: true, title: true, category: true },
  });

  const postsToUpdate = allPosts.map((p) => ({
    id: p.id,
    title: p.title,
    oldCategory: p.category,
    newCategory: categorizePost(p.title),
  }));

  const postStats: Record<string, number> = {};
  postsToUpdate.forEach((p) => {
    postStats[p.newCategory] = (postStats[p.newCategory] || 0) + 1;
  });

  console.log(`✓ Analyzed ${allPosts.length} posts`);

  // Get ostalo documents
  const ostaloDocs = await db.document.findMany({
    where: { category: 'ostalo' },
    select: { id: true, title: true, category: true },
  });

  const documentsToUpdate = ostaloDocs.map((d) => ({
    id: d.id,
    title: d.title,
    oldCategory: d.category,
    newCategory: categorizeDocument(d.title),
  }));

  const docStats: Record<string, number> = {};
  documentsToUpdate.forEach((d) => {
    docStats[d.newCategory] = (docStats[d.newCategory] || 0) + 1;
  });

  console.log(`✓ Analyzed ${ostaloDocs.length} documents from 'ostalo' category`);

  return {
    posts: postsToUpdate,
    documents: documentsToUpdate,
    stats: { posts: postStats, documents: docStats },
  };
}

function showPreview(data: {
  posts: { id: string; title: string; oldCategory: string; newCategory: string }[];
  documents: { id: string; title: string; oldCategory: string; newCategory: string }[];
  stats: Stats;
}) {
  console.log('\n' + '='.repeat(70));
  console.log('RECATEGORIZATION PREVIEW');
  console.log('='.repeat(70));

  // Posts summary
  console.log('\n📰 POSTS - New category distribution:');
  console.log('-'.repeat(40));
  Object.entries(data.stats.posts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat.padEnd(20)} : ${count}`);
    });

  // Show some samples per category
  console.log('\n📰 POSTS - Samples per category:');
  const postsByCategory: Record<string, string[]> = {};
  data.posts.forEach((p) => {
    if (!postsByCategory[p.newCategory]) postsByCategory[p.newCategory] = [];
    if (postsByCategory[p.newCategory].length < 3) {
      postsByCategory[p.newCategory].push(p.title);
    }
  });
  Object.entries(postsByCategory).forEach(([cat, titles]) => {
    console.log(`\n  ${cat.toUpperCase()}:`);
    titles.forEach((t) => console.log(`    - ${t.substring(0, 55)}...`));
  });

  // Documents summary
  console.log('\n' + '-'.repeat(70));
  console.log('\n📄 DOCUMENTS (from ostalo) - New category distribution:');
  console.log('-'.repeat(40));
  Object.entries(data.stats.documents)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat.padEnd(20)} : ${count}`);
    });

  // Show some samples per category for documents
  console.log('\n📄 DOCUMENTS - Samples per category:');
  const docsByCategory: Record<string, string[]> = {};
  data.documents.forEach((d) => {
    if (!docsByCategory[d.newCategory]) docsByCategory[d.newCategory] = [];
    if (docsByCategory[d.newCategory].length < 2) {
      docsByCategory[d.newCategory].push(d.title);
    }
  });
  Object.entries(docsByCategory)
    .filter(([cat]) => cat !== 'ostalo')
    .forEach(([cat, titles]) => {
      console.log(`\n  ${cat.toUpperCase()}:`);
      titles.forEach((t) => console.log(`    - ${t.substring(0, 55)}...`));
    });

  console.log('\n' + '='.repeat(70));
}

async function executeRecategorization(data: {
  posts: { id: string; title: string; oldCategory: string; newCategory: string }[];
  documents: { id: string; title: string; oldCategory: string; newCategory: string }[];
}): Promise<{ postsUpdated: number; documentsUpdated: number }> {
  console.log('\n🚀 Starting recategorization...\n');

  let postsUpdated = 0;
  let documentsUpdated = 0;

  // Update posts
  console.log('📰 Updating posts...');
  for (const post of data.posts) {
    if (post.oldCategory !== post.newCategory) {
      await db.post.update({
        where: { id: post.id },
        data: { category: post.newCategory },
      });
      postsUpdated++;
    }
  }
  console.log(`  ✓ Updated ${postsUpdated} posts`);

  // Update documents
  console.log('📄 Updating documents...');
  for (const doc of data.documents) {
    if (doc.oldCategory !== doc.newCategory) {
      await db.document.update({
        where: { id: doc.id },
        data: { category: doc.newCategory },
      });
      documentsUpdated++;
    }
  }
  console.log(`  ✓ Updated ${documentsUpdated} documents`);

  return { postsUpdated, documentsUpdated };
}

async function showFinalState() {
  console.log('\n📊 Final database state:');
  console.log('-'.repeat(50));

  // Posts by category
  const postsByCategory = (await db.$queryRawUnsafe(
    'SELECT category, COUNT(*)::int as count FROM posts GROUP BY category ORDER BY count DESC'
  )) as { category: string; count: number }[];

  console.log('\nPosts:');
  postsByCategory.forEach((p) => console.log(`  ${p.category.padEnd(20)} : ${p.count}`));

  // Documents by category
  const docsByCategory = (await db.$queryRawUnsafe(
    'SELECT category, COUNT(*)::int as count FROM documents GROUP BY category ORDER BY count DESC'
  )) as { category: string; count: number }[];

  console.log('\nDocuments:');
  docsByCategory.forEach((d) => console.log(`  ${d.category.padEnd(20)} : ${d.count}`));
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--execute');

  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║     RECATEGORIZATION SCRIPT: Posts and Documents                   ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');

  if (isDryRun) {
    console.log('\n⚠️  DRY RUN MODE - No changes will be made');
    console.log('   Run with --execute to perform the recategorization\n');
  } else {
    console.log('\n🔴 EXECUTE MODE - Categories WILL be updated!\n');
  }

  try {
    const data = await analyzeRecategorization();
    showPreview(data);

    if (isDryRun) {
      console.log('\n💡 To execute this recategorization, run:');
      console.log('   DATABASE_URL="..." npx tsx scripts/recategorize-content.ts --execute\n');
    } else {
      const stats = await executeRecategorization(data);

      console.log('\n' + '='.repeat(70));
      console.log('RECATEGORIZATION COMPLETE');
      console.log('='.repeat(70));
      console.log(`  ✓ ${stats.postsUpdated} posts recategorized`);
      console.log(`  ✓ ${stats.documentsUpdated} documents recategorized`);

      await showFinalState();
    }
  } catch (error) {
    console.error('\n❌ Recategorization failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
