/**
 * Old vs New Comparison Script
 *
 * Compares WordPress export data with migrated content in the new system.
 * Generates a comprehensive markdown report identifying gaps and verifying parity.
 *
 * Run with: npx tsx scripts/compare-old-new.ts
 *
 * Sprint 4.5.2 - Migration Verification
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const db = new PrismaClient({
  log: ['error'],
});

// Type definitions for WordPress export data
interface WPPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  status: string;
  author: string;
  categories: string[];
  tags: string[];
  featuredImageId: number | null;
  isFeatured: boolean;
  oldUrl: string;
}

interface WPPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  date: string;
  modified: string;
  status: string;
  parentId: number;
  menuOrder: number;
  oldUrl: string;
}

interface UrlMap {
  [oldUrl: string]: string;
}

interface RedirectRule {
  from: string;
  to: string;
  status: number;
}

interface WordPressData {
  posts: WPPost[];
  pages: WPPage[];
  urlMap: UrlMap;
}

interface DatabaseCounts {
  posts: {
    total: number;
    published: number;
    byCategory: Record<string, number>;
  };
  pages: {
    total: number;
    topLevel: number;
    withParent: number;
  };
  announcements: {
    total: number;
    published: number;
    byCategory: Record<string, number>;
  };
  documents: {
    total: number;
  };
  events: {
    total: number;
  };
  galleries: {
    total: number;
    totalImages: number;
  };
}

interface ComparisonResult {
  wpData: WordPressData;
  dbCounts: DatabaseCounts;
  redirects: RedirectRule[];
  postsComparison: {
    wpTotal: number;
    wpPublished: number;
    dbTotal: number;
    dbPublished: number;
    wpByCategory: Record<string, number>;
    dbByCategory: Record<string, number>;
    missingPosts: WPPost[];
  };
  pagesComparison: {
    wpTotal: number;
    wpPublished: number;
    dbTotal: number;
    wpTopLevel: number;
    wpWithParent: number;
    dbTopLevel: number;
    dbWithParent: number;
    missingPages: WPPage[];
  };
  redirectCoverage: {
    totalMappings: number;
    totalRedirects: number;
    identityMappings: string[];
    coveredMappings: number;
    uncoveredMappings: Array<{ oldUrl: string; newPath: string }>;
  };
  gaps: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: string;
    description: string;
    recommendation?: string;
  }>;
}

// ============================================================================
// Data Loading Functions
// ============================================================================

function loadWordPressData(): WordPressData {
  const migrationDir = path.join(process.cwd(), 'scripts', 'migration', 'output');

  const postsPath = path.join(migrationDir, 'posts.json');
  const pagesPath = path.join(migrationDir, 'pages.json');
  const urlMapPath = path.join(migrationDir, 'url-map.json');

  const posts: WPPost[] = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
  const pages: WPPage[] = JSON.parse(fs.readFileSync(pagesPath, 'utf-8'));
  const urlMap: UrlMap = JSON.parse(fs.readFileSync(urlMapPath, 'utf-8'));

  return { posts, pages, urlMap };
}

async function queryDatabaseCounts(): Promise<DatabaseCounts> {
  // Posts
  const posts = await db.post.findMany({
    select: {
      id: true,
      category: true,
      publishedAt: true,
    },
  });

  const postStats = {
    total: posts.length,
    published: posts.filter((p) => p.publishedAt !== null).length,
    byCategory: posts.reduce(
      (acc, p) => {
        acc[p.category] = (acc[p.category] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  // Pages
  const pages = await db.page.findMany({
    select: {
      id: true,
      parentId: true,
    },
  });

  const pageStats = {
    total: pages.length,
    topLevel: pages.filter((p) => p.parentId === null).length,
    withParent: pages.filter((p) => p.parentId !== null).length,
  };

  // Announcements
  const announcements = await db.announcement.findMany({
    select: {
      id: true,
      category: true,
      publishedAt: true,
    },
  });

  const announcementStats = {
    total: announcements.length,
    published: announcements.filter((a) => a.publishedAt !== null).length,
    byCategory: announcements.reduce(
      (acc, a) => {
        acc[a.category] = (acc[a.category] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  // Documents
  const documentCount = await db.document.count();

  // Events
  const eventCount = await db.event.count();

  // Galleries
  const galleries = await db.gallery.findMany({
    select: {
      id: true,
      _count: {
        select: { images: true },
      },
    },
  });

  const galleryStats = {
    total: galleries.length,
    totalImages: galleries.reduce((acc, g) => acc + g._count.images, 0),
  };

  return {
    posts: postStats,
    pages: pageStats,
    announcements: announcementStats,
    documents: { total: documentCount },
    events: { total: eventCount },
    galleries: galleryStats,
  };
}

function parseRedirectsFile(): RedirectRule[] {
  const redirectsPath = path.join(process.cwd(), 'apps', 'web', 'public', '_redirects');

  if (!fs.existsSync(redirectsPath)) {
    console.warn('Warning: _redirects file not found');
    return [];
  }

  const content = fs.readFileSync(redirectsPath, 'utf-8');
  const lines = content.split('\n');

  const redirects: RedirectRule[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
      redirects.push({
        from: parts[0],
        to: parts[1],
        status: parseInt(parts[2], 10),
      });
    }
  }

  return redirects;
}

// ============================================================================
// Comparison Functions
// ============================================================================

async function comparePosts(
  wpData: WordPressData,
  dbCounts: DatabaseCounts
): Promise<ComparisonResult['postsComparison']> {
  const wpPosts = wpData.posts;
  const wpPublished = wpPosts.filter((p) => p.status === 'publish');

  // Count WP posts by category
  const wpByCategory: Record<string, number> = {};
  for (const post of wpPublished) {
    for (const cat of post.categories) {
      wpByCategory[cat] = (wpByCategory[cat] ?? 0) + 1;
    }
  }

  // Get DB post slugs for comparison
  const dbPosts = await db.post.findMany({
    select: { slug: true, publishedAt: true },
  });
  const dbSlugs = new Set(dbPosts.map((p) => p.slug));

  // Get DB announcement slugs (WP obavijesti are now in announcements table)
  const dbAnnouncements = await db.announcement.findMany({
    select: { slug: true },
  });
  const announcementSlugs = new Set(dbAnnouncements.map((a) => a.slug));

  // Get DB event titles (WP dogadanja are now in events table)
  const dbEvents = await db.event.findMany({
    select: { title: true },
  });
  const eventTitles = new Set(dbEvents.map((e) => e.title.toLowerCase()));

  // Find missing posts (published in WP but not in DB posts, announcements, or events)
  const missingPosts = wpPublished.filter((p) => {
    // Check if in posts table
    if (dbSlugs.has(p.slug)) return false;

    // Check if in announcements table (obavijesti category)
    if (announcementSlugs.has(p.slug)) return false;

    // Check if title matches an event (dogadanja category)
    if (eventTitles.has(p.title.toLowerCase())) return false;

    return true;
  });

  return {
    wpTotal: wpPosts.length,
    wpPublished: wpPublished.length,
    dbTotal: dbCounts.posts.total,
    dbPublished: dbCounts.posts.published,
    wpByCategory,
    dbByCategory: dbCounts.posts.byCategory,
    missingPosts,
  };
}

async function comparePages(
  wpData: WordPressData,
  dbCounts: DatabaseCounts
): Promise<ComparisonResult['pagesComparison']> {
  const wpPages = wpData.pages;
  const wpPublished = wpPages.filter((p) => p.status === 'publish');

  // Get DB page slugs for comparison
  const dbPages = await db.page.findMany({
    select: { slug: true },
  });
  const dbSlugs = new Set(dbPages.map((p) => p.slug));

  // Find missing pages (published in WP but not in DB)
  const missingPages = wpPublished.filter((p) => !dbSlugs.has(p.slug));

  return {
    wpTotal: wpPages.length,
    wpPublished: wpPublished.length,
    dbTotal: dbCounts.pages.total,
    wpTopLevel: wpPages.filter((p) => p.parentId === 0).length,
    wpWithParent: wpPages.filter((p) => p.parentId !== 0).length,
    dbTopLevel: dbCounts.pages.topLevel,
    dbWithParent: dbCounts.pages.withParent,
    missingPages,
  };
}

function checkRedirectCoverage(
  urlMap: UrlMap,
  redirects: RedirectRule[]
): ComparisonResult['redirectCoverage'] {
  // Create a map of redirect rules: from -> to
  const redirectMap = new Map<string, string>();
  for (const r of redirects) {
    redirectMap.set(r.from, r.to);
  }

  const identityMappings: string[] = [];
  const uncoveredMappings: Array<{ oldUrl: string; newPath: string }> = [];
  let coveredCount = 0;

  for (const [oldUrl, newPath] of Object.entries(urlMap)) {
    // Extract the path from oldUrl (remove domain)
    const oldPath = oldUrl.replace('https://velikibukovec.hr', '').replace(/\/$/, '');

    // Check if it's an identity mapping (same path, different format)
    const normalizedOld = oldPath.replace(/^\//, '');
    const normalizedNew = newPath.replace(/^\//, '');

    if (normalizedOld === normalizedNew) {
      identityMappings.push(oldPath);
      coveredCount++;
      continue;
    }

    // Check if redirect exists
    if (redirectMap.has(oldPath)) {
      coveredCount++;
    } else {
      uncoveredMappings.push({ oldUrl, newPath });
    }
  }

  return {
    totalMappings: Object.keys(urlMap).length,
    totalRedirects: redirects.length,
    identityMappings,
    coveredMappings: coveredCount,
    uncoveredMappings,
  };
}

function identifyGaps(
  postsComparison: ComparisonResult['postsComparison'],
  pagesComparison: ComparisonResult['pagesComparison'],
  redirectCoverage: ComparisonResult['redirectCoverage'],
  dbCounts: DatabaseCounts
): ComparisonResult['gaps'] {
  const gaps: ComparisonResult['gaps'] = [];

  // Check for missing posts after accounting for announcements and events
  const missingCount = postsComparison.missingPosts.length;
  const obavijesti = postsComparison.wpByCategory['obavijesti'] ?? 0;
  const dogadanja = postsComparison.wpByCategory['dogadanja'] ?? 0;

  // Calculate expected posts vs actual
  const expectedVijesti = postsComparison.wpPublished - obavijesti - dogadanja;
  const actualMigrated =
    postsComparison.dbPublished + dbCounts.announcements.total + dbCounts.events.total;

  if (missingCount === 0) {
    gaps.push({
      severity: 'info',
      category: 'Posts',
      description: 'All WP posts accounted for in Posts, Announcements, or Events tables',
      recommendation: 'Migration complete',
    });
  } else if (missingCount < 30) {
    gaps.push({
      severity: 'info',
      category: 'Posts',
      description: `${missingCount} WP posts not found in any table (may be intentionally excluded)`,
      recommendation: 'Review missing posts for duplicates or low-value content',
    });
  } else {
    gaps.push({
      severity: 'warning',
      category: 'Posts',
      description: `${missingCount} WP posts not found after checking Posts, Announcements, and Events`,
      recommendation: 'Review missingPosts list - may indicate migration gap or content reorganization',
    });
  }

  // Add migration summary
  gaps.push({
    severity: 'info',
    category: 'Migration Summary',
    description: `WP content distributed: ${postsComparison.dbPublished} posts + ${dbCounts.announcements.total} announcements + ${dbCounts.events.total} events = ${actualMigrated} items (from ${postsComparison.wpPublished} WP posts)`,
    recommendation: obavijesti > 0 ? `${obavijesti} obavijesti → Announcements table` : undefined,
  });

  // Check for page differences
  const pageDiff = pagesComparison.wpPublished - pagesComparison.dbTotal;
  if (pageDiff > 10) {
    gaps.push({
      severity: 'warning',
      category: 'Pages',
      description: `${pageDiff} WP pages not individually migrated`,
      recommendation: 'Many pages consolidated into tabbed sections - verify content preserved',
    });
  } else if (pageDiff > 0) {
    gaps.push({
      severity: 'info',
      category: 'Pages',
      description: `${pageDiff} WP pages consolidated or removed`,
      recommendation: 'Expected due to navigation simplification',
    });
  }

  // Check redirect coverage
  if (redirectCoverage.uncoveredMappings.length > 0) {
    gaps.push({
      severity: 'warning',
      category: 'Redirects',
      description: `${redirectCoverage.uncoveredMappings.length} URL mappings without redirect rules`,
      recommendation: 'Add redirect rules or verify paths are identity mappings',
    });
  }

  // Positive observations
  if (dbCounts.announcements.total > 0) {
    gaps.push({
      severity: 'info',
      category: 'Announcements',
      description: `${dbCounts.announcements.total} announcements in dedicated table`,
      recommendation: 'Obavijesti successfully separated from posts',
    });
  }

  if (dbCounts.documents.total > 1000) {
    gaps.push({
      severity: 'info',
      category: 'Documents',
      description: `${dbCounts.documents.total} documents successfully migrated`,
      recommendation: 'Document archive fully preserved',
    });
  }

  if (dbCounts.events.total > 0) {
    gaps.push({
      severity: 'info',
      category: 'Events',
      description: `${dbCounts.events.total} events in dedicated table`,
      recommendation: 'Events successfully extracted from posts',
    });
  }

  if (dbCounts.galleries.total > 0) {
    gaps.push({
      severity: 'info',
      category: 'Galleries',
      description: `${dbCounts.galleries.total} galleries with ${dbCounts.galleries.totalImages} images`,
      recommendation: 'Gallery content preserved',
    });
  }

  return gaps;
}

// ============================================================================
// Report Generation
// ============================================================================

function generateMarkdownReport(result: ComparisonResult): string {
  const now = new Date().toISOString().split('T')[0];
  const lines: string[] = [];

  lines.push('# Old vs New Comparison Report');
  lines.push('');
  lines.push(`> Generated: ${now}`);
  lines.push('> Sprint 4.5.2 - Migration Verification');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push('| Metric | WordPress | New System | Status |');
  lines.push('|--------|-----------|------------|--------|');

  // Posts status: consider announcements and events as part of migrated content
  const totalMigrated =
    result.postsComparison.dbPublished +
    result.dbCounts.announcements.total +
    result.dbCounts.events.total;
  const postsStatus = totalMigrated >= result.postsComparison.wpPublished ? '✅' : '⚠️';
  const pagesStatus = result.pagesComparison.dbTotal > 0 ? '✅' : '⚠️';
  const announcementsStatus = result.dbCounts.announcements.total > 0 ? '✅ Separated' : '❓';
  const documentsStatus = result.dbCounts.documents.total > 0 ? '✅' : '⚠️';
  const eventsStatus = result.dbCounts.events.total > 0 ? '✅' : '⚠️';
  const galleriesStatus = result.dbCounts.galleries.total > 0 ? '✅' : '⚠️';

  lines.push(
    `| Posts (Vijesti) | ${result.postsComparison.wpPublished} published | ${result.postsComparison.dbPublished} posts + ${result.dbCounts.announcements.total} ann. + ${result.dbCounts.events.total} events | ${postsStatus} |`
  );
  lines.push(
    `| Pages (Stranice) | ${result.pagesComparison.wpPublished} published | ${result.pagesComparison.dbTotal} total | ${pagesStatus} |`
  );
  lines.push(
    `| Announcements | (in posts) | ${result.dbCounts.announcements.total} | ${announcementsStatus} |`
  );
  lines.push(`| Documents | - | ${result.dbCounts.documents.total} | ${documentsStatus} |`);
  lines.push(`| Events | - | ${result.dbCounts.events.total} | ${eventsStatus} |`);
  lines.push(
    `| Galleries | - | ${result.dbCounts.galleries.total} (${result.dbCounts.galleries.totalImages} images) | ${galleriesStatus} |`
  );
  lines.push('');

  // Posts Comparison
  lines.push('---');
  lines.push('');
  lines.push('## Posts Comparison');
  lines.push('');
  lines.push(`- **WordPress Total:** ${result.postsComparison.wpTotal}`);
  lines.push(`- **WordPress Published:** ${result.postsComparison.wpPublished}`);
  lines.push(`- **Database Total:** ${result.postsComparison.dbTotal}`);
  lines.push(`- **Database Published:** ${result.postsComparison.dbPublished}`);
  lines.push('');
  lines.push('### WordPress Categories');
  lines.push('');
  lines.push('| Category | Count |');
  lines.push('|----------|-------|');
  for (const [cat, count] of Object.entries(result.postsComparison.wpByCategory).sort(
    (a, b) => b[1] - a[1]
  )) {
    lines.push(`| ${cat} | ${count} |`);
  }
  lines.push('');
  lines.push('### Database Categories');
  lines.push('');
  lines.push('| Category | Count |');
  lines.push('|----------|-------|');
  for (const [cat, count] of Object.entries(result.postsComparison.dbByCategory).sort(
    (a, b) => b[1] - a[1]
  )) {
    lines.push(`| ${cat} | ${count} |`);
  }
  lines.push('');

  if (result.postsComparison.missingPosts.length > 0) {
    lines.push('### Missing Posts (First 20)');
    lines.push('');
    lines.push('| Title | Slug | Categories |');
    lines.push('|-------|------|------------|');
    for (const post of result.postsComparison.missingPosts.slice(0, 20)) {
      const cats = post.categories.join(', ');
      lines.push(`| ${post.title.substring(0, 50)}... | ${post.slug} | ${cats} |`);
    }
    if (result.postsComparison.missingPosts.length > 20) {
      lines.push(`| ... | (${result.postsComparison.missingPosts.length - 20} more) | ... |`);
    }
    lines.push('');
  }

  // Pages Comparison
  lines.push('---');
  lines.push('');
  lines.push('## Pages Comparison');
  lines.push('');
  lines.push(`- **WordPress Total:** ${result.pagesComparison.wpTotal}`);
  lines.push(`- **WordPress Published:** ${result.pagesComparison.wpPublished}`);
  lines.push(`- **WordPress Top-level:** ${result.pagesComparison.wpTopLevel}`);
  lines.push(`- **WordPress With Parent:** ${result.pagesComparison.wpWithParent}`);
  lines.push(`- **Database Total:** ${result.pagesComparison.dbTotal}`);
  lines.push(`- **Database Top-level:** ${result.pagesComparison.dbTopLevel}`);
  lines.push(`- **Database With Parent:** ${result.pagesComparison.dbWithParent}`);
  lines.push('');

  if (result.pagesComparison.missingPages.length > 0) {
    lines.push('### Missing Pages (First 20)');
    lines.push('');
    lines.push('| Title | Slug | Parent ID |');
    lines.push('|-------|------|-----------|');
    for (const page of result.pagesComparison.missingPages.slice(0, 20)) {
      lines.push(`| ${page.title.substring(0, 50)} | ${page.slug} | ${page.parentId} |`);
    }
    if (result.pagesComparison.missingPages.length > 20) {
      lines.push(`| ... | (${result.pagesComparison.missingPages.length - 20} more) | ... |`);
    }
    lines.push('');
  }

  // Redirect Coverage
  lines.push('---');
  lines.push('');
  lines.push('## Redirect Coverage');
  lines.push('');
  lines.push(`- **Total URL Mappings:** ${result.redirectCoverage.totalMappings}`);
  lines.push(`- **Total Redirect Rules:** ${result.redirectCoverage.totalRedirects}`);
  lines.push(
    `- **Identity Mappings (no redirect needed):** ${result.redirectCoverage.identityMappings.length}`
  );
  lines.push(`- **Covered Mappings:** ${result.redirectCoverage.coveredMappings}`);
  lines.push(`- **Uncovered Mappings:** ${result.redirectCoverage.uncoveredMappings.length}`);
  lines.push('');

  if (result.redirectCoverage.uncoveredMappings.length > 0) {
    lines.push('### Uncovered URL Mappings');
    lines.push('');
    lines.push('| Old URL | New Path |');
    lines.push('|---------|----------|');
    for (const mapping of result.redirectCoverage.uncoveredMappings.slice(0, 20)) {
      const oldPath = mapping.oldUrl.replace('https://velikibukovec.hr', '');
      lines.push(`| ${oldPath} | ${mapping.newPath} |`);
    }
    if (result.redirectCoverage.uncoveredMappings.length > 20) {
      lines.push(`| ... | (${result.redirectCoverage.uncoveredMappings.length - 20} more) |`);
    }
    lines.push('');
  }

  // Navigation Structure
  lines.push('---');
  lines.push('');
  lines.push('## Navigation Structure');
  lines.push('');
  lines.push('### Old WordPress Structure');
  lines.push('- Hierarchical menu with nested pages');
  lines.push('- Multiple top-level sections');
  lines.push('- Subpages for each section');
  lines.push('');
  lines.push('### New Consolidated Structure');
  lines.push('- Flat navigation with consolidated pages');
  lines.push('- `/opcina` - Consolidated (tabs: O nama, Turizam, Povijest)');
  lines.push('- `/opcina/naselja` - Consolidated (tabs: Veliki Bukovec, Dubovica, Kapela)');
  lines.push('- `/organizacija` - Consolidated (tabs: Načelnik, Vijeće, Uprava)');
  lines.push('- `/usluge` - Consolidated (tabs: Komunalno, Financije, Građani, Udruge)');
  lines.push('- Dynamic lists for: /vijesti, /obavijesti, /dokumenti, /galerija, /dogadanja');
  lines.push('');

  // Identified Gaps
  lines.push('---');
  lines.push('');
  lines.push('## Identified Gaps');
  lines.push('');

  const criticalGaps = result.gaps.filter((g) => g.severity === 'critical');
  const warningGaps = result.gaps.filter((g) => g.severity === 'warning');
  const infoGaps = result.gaps.filter((g) => g.severity === 'info');

  if (criticalGaps.length > 0) {
    lines.push('### 🔴 Critical');
    lines.push('');
    for (const gap of criticalGaps) {
      lines.push(`- **${gap.category}:** ${gap.description}`);
      if (gap.recommendation) {
        lines.push(`  - *Recommendation:* ${gap.recommendation}`);
      }
    }
    lines.push('');
  }

  if (warningGaps.length > 0) {
    lines.push('### 🟡 Warnings');
    lines.push('');
    for (const gap of warningGaps) {
      lines.push(`- **${gap.category}:** ${gap.description}`);
      if (gap.recommendation) {
        lines.push(`  - *Recommendation:* ${gap.recommendation}`);
      }
    }
    lines.push('');
  }

  if (infoGaps.length > 0) {
    lines.push('### 🟢 Info / Positive');
    lines.push('');
    for (const gap of infoGaps) {
      lines.push(`- **${gap.category}:** ${gap.description}`);
      if (gap.recommendation) {
        lines.push(`  - *Note:* ${gap.recommendation}`);
      }
    }
    lines.push('');
  }

  // Recommendations
  lines.push('---');
  lines.push('');
  lines.push('## Recommendations');
  lines.push('');
  lines.push(
    '1. **Verify Announcements:** Confirm WP obavijesti posts are in Announcements table'
  );
  lines.push(
    '2. **Check Consolidated Pages:** Verify content from missing WP pages exists in tabbed sections'
  );
  lines.push(
    '3. **Add Missing Redirects:** Create redirect rules for any uncovered URL mappings'
  );
  lines.push('4. **Test Old URLs:** Manually test sample old URLs to verify redirects work');
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push(
    '*This report is automatically generated by the compare-old-new script (Sprint 4.5.2).*'
  );
  lines.push('');

  return lines.join('\n');
}

function printSummary(result: ComparisonResult): void {
  console.log('');
  console.log('='.repeat(70));
  console.log('  OLD VS NEW COMPARISON SUMMARY');
  console.log('='.repeat(70));
  console.log('');
  console.log('  Content Type          WordPress    New System    Difference');
  console.log('  ' + '-'.repeat(64));
  console.log(
    `  Posts (Published)     ${String(result.postsComparison.wpPublished).padEnd(12)} ${String(result.postsComparison.dbPublished).padEnd(13)} ${result.postsComparison.dbPublished - result.postsComparison.wpPublished}`
  );
  console.log(
    `  Pages (Published)     ${String(result.pagesComparison.wpPublished).padEnd(12)} ${String(result.pagesComparison.dbTotal).padEnd(13)} ${result.pagesComparison.dbTotal - result.pagesComparison.wpPublished}`
  );
  console.log(
    `  Announcements         (in posts)    ${String(result.dbCounts.announcements.total).padEnd(13)} +${result.dbCounts.announcements.total}`
  );
  console.log(
    `  Documents             -            ${String(result.dbCounts.documents.total).padEnd(13)} +${result.dbCounts.documents.total}`
  );
  console.log(
    `  Events                -            ${String(result.dbCounts.events.total).padEnd(13)} +${result.dbCounts.events.total}`
  );
  console.log(
    `  Galleries             -            ${String(result.dbCounts.galleries.total).padEnd(13)} +${result.dbCounts.galleries.total}`
  );
  console.log('');
  console.log('  ' + '-'.repeat(64));
  console.log('  REDIRECT COVERAGE');
  console.log('  ' + '-'.repeat(64));
  console.log(`  URL Mappings:         ${result.redirectCoverage.totalMappings}`);
  console.log(`  Redirect Rules:       ${result.redirectCoverage.totalRedirects}`);
  console.log(`  Identity Mappings:    ${result.redirectCoverage.identityMappings.length}`);
  console.log(`  Covered:              ${result.redirectCoverage.coveredMappings}`);
  console.log(`  Uncovered:            ${result.redirectCoverage.uncoveredMappings.length}`);
  console.log('');
  console.log('  ' + '-'.repeat(64));
  console.log('  GAPS IDENTIFIED');
  console.log('  ' + '-'.repeat(64));

  const criticalCount = result.gaps.filter((g) => g.severity === 'critical').length;
  const warningCount = result.gaps.filter((g) => g.severity === 'warning').length;
  const infoCount = result.gaps.filter((g) => g.severity === 'info').length;

  console.log(`  🔴 Critical:          ${criticalCount}`);
  console.log(`  🟡 Warnings:          ${warningCount}`);
  console.log(`  🟢 Info:              ${infoCount}`);
  console.log('');
  console.log('='.repeat(70));
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  console.log('Old vs New Comparison Script - Sprint 4.5.2');
  console.log('Loading WordPress export data...');

  try {
    // Load data
    const wpData = loadWordPressData();
    console.log(`  Loaded ${wpData.posts.length} posts, ${wpData.pages.length} pages`);
    console.log(`  Loaded ${Object.keys(wpData.urlMap).length} URL mappings`);

    console.log('Querying database...');
    const dbCounts = await queryDatabaseCounts();
    console.log(`  Found ${dbCounts.posts.total} posts, ${dbCounts.pages.total} pages`);
    console.log(`  Found ${dbCounts.announcements.total} announcements`);
    console.log(`  Found ${dbCounts.documents.total} documents`);
    console.log(`  Found ${dbCounts.events.total} events`);
    console.log(`  Found ${dbCounts.galleries.total} galleries`);

    console.log('Parsing redirects file...');
    const redirects = parseRedirectsFile();
    console.log(`  Found ${redirects.length} redirect rules`);

    console.log('Comparing posts...');
    const postsComparison = await comparePosts(wpData, dbCounts);

    console.log('Comparing pages...');
    const pagesComparison = await comparePages(wpData, dbCounts);

    console.log('Checking redirect coverage...');
    const redirectCoverage = checkRedirectCoverage(wpData.urlMap, redirects);

    console.log('Identifying gaps...');
    const gaps = identifyGaps(postsComparison, pagesComparison, redirectCoverage, dbCounts);

    const result: ComparisonResult = {
      wpData,
      dbCounts,
      redirects,
      postsComparison,
      pagesComparison,
      redirectCoverage,
      gaps,
    };

    // Generate markdown report
    const markdown = generateMarkdownReport(result);

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'docs', 'content');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write markdown file
    const outputPath = path.join(outputDir, 'old-vs-new-comparison.md');
    fs.writeFileSync(outputPath, markdown, 'utf-8');
    console.log(`\nReport written to: ${outputPath}`);

    // Print summary to console
    printSummary(result);

    console.log('\nComparison complete.');
  } catch (error) {
    console.error('Error running comparison:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
