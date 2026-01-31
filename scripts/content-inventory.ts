/**
 * Content Inventory Script
 *
 * Queries all database content and generates a comprehensive markdown inventory.
 * Run with: npx tsx scripts/content-inventory.ts
 *
 * Sprint 4.5.1 - Content Audit
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const db = new PrismaClient({
  log: ['error'],
});

// Route definitions for inventory
const PUBLIC_ROUTES = [
  { path: '/', name: 'Naslovnica', type: 'static' },
  { path: '/opcina', name: 'Opcina (O nama, Turizam, Povijest)', type: 'static' },
  { path: '/opcina/naselja', name: 'Naselja (Veliki Bukovec, Dubovica, Kapela)', type: 'static' },
  { path: '/opcina/udruge', name: 'Udruge', type: 'static' },
  { path: '/organizacija', name: 'Organizacija (Nacelnik, Vijece, Uprava)', type: 'static' },
  { path: '/usluge', name: 'Usluge (Komunalno, Financije, Gradani, Udruge)', type: 'static' },
  { path: '/izbori', name: 'Izbori', type: 'static' },
  { path: '/vijesti', name: 'Vijesti', type: 'dynamic' },
  { path: '/obavijesti', name: 'Obavijesti', type: 'dynamic' },
  { path: '/dokumenti', name: 'Dokumenti', type: 'dynamic' },
  { path: '/galerija', name: 'Galerija', type: 'dynamic' },
  { path: '/dogadanja', name: 'Dogadanja', type: 'dynamic' },
  { path: '/kontakt', name: 'Kontakt', type: 'static' },
  { path: '/prijava-problema', name: 'Prijava problema', type: 'static' },
  { path: '/[...slug]', name: 'Catch-all stranice', type: 'dynamic' },
];

const ADMIN_ROUTES = [
  { path: '/dashboard', name: 'Dashboard', type: 'static' },
  { path: '/posts', name: 'Vijesti', type: 'crud' },
  { path: '/announcements', name: 'Obavijesti', type: 'crud' },
  { path: '/documents', name: 'Dokumenti', type: 'crud' },
  { path: '/pages', name: 'Stranice', type: 'crud' },
  { path: '/events', name: 'Dogadanja', type: 'crud' },
  { path: '/gallery', name: 'Galerija', type: 'crud' },
  { path: '/users', name: 'Korisnici', type: 'crud' },
  { path: '/contact-messages', name: 'Poruke', type: 'crud' },
  { path: '/problem-reports', name: 'Prijave problema', type: 'crud' },
  { path: '/newsletter', name: 'Newsletter', type: 'crud' },
  { path: '/settings', name: 'Postavke', type: 'static' },
];

interface ContentStats {
  posts: {
    total: number;
    published: number;
    draft: number;
    featured: number;
    byCategory: Record<string, number>;
  };
  announcements: {
    total: number;
    published: number;
    draft: number;
    active: number;
    expired: number;
    byCategory: Record<string, number>;
    totalAttachments: number;
  };
  documents: {
    total: number;
    byCategory: Record<string, number>;
    byYear: Record<number, number>;
  };
  pages: {
    total: number;
    topLevel: number;
    withParent: number;
  };
  events: {
    total: number;
    upcoming: number;
    past: number;
    withPoster: number;
  };
  galleries: {
    total: number;
    totalImages: number;
  };
  searchIndex: {
    total: number;
    bySourceType: Record<string, number>;
  };
  users: {
    total: number;
    byRole: Record<string, number>;
    active: number;
  };
  contactMessages: {
    total: number;
  };
  problemReports: {
    total: number;
  };
  newsletterSubscribers: {
    total: number;
    confirmed: number;
  };
}

async function gatherStats(): Promise<ContentStats> {
  const now = new Date();

  // Posts
  const posts = await db.post.findMany({
    select: {
      id: true,
      category: true,
      publishedAt: true,
      isFeatured: true,
    },
  });

  const postStats = {
    total: posts.length,
    published: posts.filter((p) => p.publishedAt !== null).length,
    draft: posts.filter((p) => p.publishedAt === null).length,
    featured: posts.filter((p) => p.isFeatured).length,
    byCategory: posts.reduce(
      (acc, p) => {
        acc[p.category] = (acc[p.category] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  // Announcements
  const announcements = await db.announcement.findMany({
    select: {
      id: true,
      category: true,
      publishedAt: true,
      validFrom: true,
      validUntil: true,
      _count: {
        select: { attachments: true },
      },
    },
  });

  const announcementStats = {
    total: announcements.length,
    published: announcements.filter((a) => a.publishedAt !== null).length,
    draft: announcements.filter((a) => a.publishedAt === null).length,
    active: announcements.filter(
      (a) =>
        a.publishedAt !== null &&
        (a.validFrom === null || a.validFrom <= now) &&
        (a.validUntil === null || a.validUntil >= now)
    ).length,
    expired: announcements.filter(
      (a) => a.validUntil !== null && a.validUntil < now
    ).length,
    byCategory: announcements.reduce(
      (acc, a) => {
        acc[a.category] = (acc[a.category] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    totalAttachments: announcements.reduce((acc, a) => acc + a._count.attachments, 0),
  };

  // Documents
  const documents = await db.document.findMany({
    select: {
      id: true,
      category: true,
      year: true,
    },
  });

  const documentStats = {
    total: documents.length,
    byCategory: documents.reduce(
      (acc, d) => {
        acc[d.category] = (acc[d.category] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byYear: documents.reduce(
      (acc, d) => {
        if (d.year !== null) {
          acc[d.year] = (acc[d.year] ?? 0) + 1;
        }
        return acc;
      },
      {} as Record<number, number>
    ),
  };

  // Pages
  const pages = await db.page.findMany({
    select: {
      id: true,
      parentId: true,
      content: true,
    },
  });

  const pageStats = {
    total: pages.length,
    topLevel: pages.filter((p) => p.parentId === null).length,
    withParent: pages.filter((p) => p.parentId !== null).length,
  };

  // Events
  const events = await db.event.findMany({
    select: {
      id: true,
      eventDate: true,
      posterImage: true,
    },
  });

  const eventStats = {
    total: events.length,
    upcoming: events.filter((e) => e.eventDate >= now).length,
    past: events.filter((e) => e.eventDate < now).length,
    withPoster: events.filter((e) => e.posterImage !== null).length,
  };

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

  // SearchIndex
  const searchIndexRaw = await db.searchIndex.groupBy({
    by: ['sourceType'],
    _count: {
      sourceType: true,
    },
  });

  const searchIndexStats = {
    total: searchIndexRaw.reduce((acc, s) => acc + s._count.sourceType, 0),
    bySourceType: searchIndexRaw.reduce(
      (acc, s) => {
        acc[s.sourceType] = s._count.sourceType;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  // Users
  const users = await db.user.findMany({
    select: {
      id: true,
      role: true,
      active: true,
    },
  });

  const userStats = {
    total: users.length,
    byRole: users.reduce(
      (acc, u) => {
        acc[u.role] = (acc[u.role] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    active: users.filter((u) => u.active).length,
  };

  // ContactMessages
  const contactMessageCount = await db.contactMessage.count();

  // ProblemReports
  const problemReportCount = await db.problemReport.count();

  // NewsletterSubscribers
  const newsletterTotal = await db.newsletterSubscriber.count();
  const newsletterConfirmed = await db.newsletterSubscriber.count({
    where: { confirmed: true },
  });

  return {
    posts: postStats,
    announcements: announcementStats,
    documents: documentStats,
    pages: pageStats,
    events: eventStats,
    galleries: galleryStats,
    searchIndex: searchIndexStats,
    users: userStats,
    contactMessages: { total: contactMessageCount },
    problemReports: { total: problemReportCount },
    newsletterSubscribers: { total: newsletterTotal, confirmed: newsletterConfirmed },
  };
}

function generateMarkdown(stats: ContentStats): string {
  const now = new Date().toISOString().split('T')[0];
  const lines: string[] = [];

  lines.push('# Content Inventory - Veliki Bukovec');
  lines.push('');
  lines.push(`> Generated: ${now}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push('| Content Type | Count | Status |');
  lines.push('|--------------|-------|--------|');
  lines.push(`| Vijesti (Posts) | ${stats.posts.total} | ${stats.posts.published} published, ${stats.posts.draft} draft |`);
  lines.push(`| Obavijesti (Announcements) | ${stats.announcements.total} | ${stats.announcements.active} active, ${stats.announcements.expired} expired |`);
  lines.push(`| Dokumenti (Documents) | ${stats.documents.total} | ${Object.keys(stats.documents.byCategory).length} categories |`);
  lines.push(`| Stranice (Pages) | ${stats.pages.total} | ${stats.pages.topLevel} top-level |`);
  lines.push(`| Dogadanja (Events) | ${stats.events.total} | ${stats.events.upcoming} upcoming |`);
  lines.push(`| Galerije (Galleries) | ${stats.galleries.total} | ${stats.galleries.totalImages} images |`);
  lines.push(`| Search Index | ${stats.searchIndex.total} | - |`);
  lines.push(`| Korisnici (Users) | ${stats.users.total} | ${stats.users.active} active |`);
  lines.push(`| Kontakt poruke | ${stats.contactMessages.total} | - |`);
  lines.push(`| Prijave problema | ${stats.problemReports.total} | - |`);
  lines.push(`| Newsletter pretplatnici | ${stats.newsletterSubscribers.total} | ${stats.newsletterSubscribers.confirmed} confirmed |`);
  lines.push('');

  // Posts Detail
  lines.push('---');
  lines.push('');
  lines.push('## Vijesti (Posts)');
  lines.push('');
  lines.push(`- **Total:** ${stats.posts.total}`);
  lines.push(`- **Published:** ${stats.posts.published}`);
  lines.push(`- **Draft:** ${stats.posts.draft}`);
  lines.push(`- **Featured:** ${stats.posts.featured}`);
  lines.push('');
  lines.push('### By Category');
  lines.push('');
  lines.push('| Category | Count |');
  lines.push('|----------|-------|');
  for (const [cat, count] of Object.entries(stats.posts.byCategory).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${cat} | ${count} |`);
  }
  lines.push('');

  // Announcements Detail
  lines.push('---');
  lines.push('');
  lines.push('## Obavijesti (Announcements)');
  lines.push('');
  lines.push(`- **Total:** ${stats.announcements.total}`);
  lines.push(`- **Published:** ${stats.announcements.published}`);
  lines.push(`- **Draft:** ${stats.announcements.draft}`);
  lines.push(`- **Active:** ${stats.announcements.active}`);
  lines.push(`- **Expired:** ${stats.announcements.expired}`);
  lines.push(`- **Total Attachments:** ${stats.announcements.totalAttachments}`);
  lines.push('');
  lines.push('### By Category');
  lines.push('');
  lines.push('| Category | Count |');
  lines.push('|----------|-------|');
  for (const [cat, count] of Object.entries(stats.announcements.byCategory).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${cat} | ${count} |`);
  }
  lines.push('');

  // Documents Detail
  lines.push('---');
  lines.push('');
  lines.push('## Dokumenti (Documents)');
  lines.push('');
  lines.push(`- **Total:** ${stats.documents.total}`);
  lines.push('');
  lines.push('### By Category');
  lines.push('');
  lines.push('| Category | Count |');
  lines.push('|----------|-------|');
  for (const [cat, count] of Object.entries(stats.documents.byCategory).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${cat} | ${count} |`);
  }
  lines.push('');
  lines.push('### By Year');
  lines.push('');
  lines.push('| Year | Count |');
  lines.push('|------|-------|');
  for (const [year, count] of Object.entries(stats.documents.byYear).sort((a, b) => Number(b[0]) - Number(a[0]))) {
    lines.push(`| ${year} | ${count} |`);
  }
  lines.push('');

  // Pages Detail
  lines.push('---');
  lines.push('');
  lines.push('## Stranice (Pages)');
  lines.push('');
  lines.push(`- **Total:** ${stats.pages.total}`);
  lines.push(`- **Top-level:** ${stats.pages.topLevel}`);
  lines.push(`- **With Parent:** ${stats.pages.withParent}`);
  lines.push('');

  // Events Detail
  lines.push('---');
  lines.push('');
  lines.push('## Dogadanja (Events)');
  lines.push('');
  lines.push(`- **Total:** ${stats.events.total}`);
  lines.push(`- **Upcoming:** ${stats.events.upcoming}`);
  lines.push(`- **Past:** ${stats.events.past}`);
  lines.push(`- **With Poster Image:** ${stats.events.withPoster}`);
  lines.push('');

  // Galleries Detail
  lines.push('---');
  lines.push('');
  lines.push('## Galerije (Galleries)');
  lines.push('');
  lines.push(`- **Total Galleries:** ${stats.galleries.total}`);
  lines.push(`- **Total Images:** ${stats.galleries.totalImages}`);
  lines.push(`- **Average Images per Gallery:** ${stats.galleries.total > 0 ? (stats.galleries.totalImages / stats.galleries.total).toFixed(1) : 0}`);
  lines.push('');

  // Search Index Detail
  lines.push('---');
  lines.push('');
  lines.push('## Search Index');
  lines.push('');
  lines.push(`- **Total Indexed:** ${stats.searchIndex.total}`);
  lines.push('');
  lines.push('### By Source Type');
  lines.push('');
  lines.push('| Source Type | Count |');
  lines.push('|-------------|-------|');
  for (const [type, count] of Object.entries(stats.searchIndex.bySourceType).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${type} | ${count} |`);
  }
  lines.push('');

  // Users Detail
  lines.push('---');
  lines.push('');
  lines.push('## Korisnici (Users)');
  lines.push('');
  lines.push(`- **Total:** ${stats.users.total}`);
  lines.push(`- **Active:** ${stats.users.active}`);
  lines.push('');
  lines.push('### By Role');
  lines.push('');
  lines.push('| Role | Count |');
  lines.push('|------|-------|');
  for (const [role, count] of Object.entries(stats.users.byRole).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${role} | ${count} |`);
  }
  lines.push('');

  // Communication Stats
  lines.push('---');
  lines.push('');
  lines.push('## Communication');
  lines.push('');
  lines.push(`- **Contact Messages:** ${stats.contactMessages.total}`);
  lines.push(`- **Problem Reports:** ${stats.problemReports.total}`);
  lines.push(`- **Newsletter Subscribers:** ${stats.newsletterSubscribers.total} (${stats.newsletterSubscribers.confirmed} confirmed)`);
  lines.push('');

  // Route Inventory
  lines.push('---');
  lines.push('');
  lines.push('## Route Inventory');
  lines.push('');
  lines.push('### Public Routes');
  lines.push('');
  lines.push('| Path | Name | Type |');
  lines.push('|------|------|------|');
  for (const route of PUBLIC_ROUTES) {
    lines.push(`| \`${route.path}\` | ${route.name} | ${route.type} |`);
  }
  lines.push('');
  lines.push('### Admin Routes');
  lines.push('');
  lines.push('| Path | Name | Type |');
  lines.push('|------|------|------|');
  for (const route of ADMIN_ROUTES) {
    lines.push(`| \`${route.path}\` | ${route.name} | ${route.type} |`);
  }
  lines.push('');

  // Content Status Summary
  lines.push('---');
  lines.push('');
  lines.push('## Content Status Summary');
  lines.push('');

  const totalContent = stats.posts.total + stats.announcements.total + stats.documents.total +
                       stats.pages.total + stats.events.total + stats.galleries.total;
  const publishedContent = stats.posts.published + stats.announcements.published;
  const draftContent = stats.posts.draft + stats.announcements.draft;

  lines.push(`- **Total Content Items:** ${totalContent}`);
  lines.push(`- **Published/Active:** ${publishedContent}`);
  lines.push(`- **Draft:** ${draftContent}`);
  lines.push(`- **Search Indexed:** ${stats.searchIndex.total}`);
  lines.push('');
  lines.push('### Coverage');
  lines.push('');
  const indexCoverage = totalContent > 0 ? ((stats.searchIndex.total / totalContent) * 100).toFixed(1) : 0;
  lines.push(`- Search index covers approximately ${indexCoverage}% of content`);
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('*This inventory is automatically generated by the content-inventory script.*');
  lines.push('');

  return lines.join('\n');
}

function printSummary(stats: ContentStats): void {
  console.log('');
  console.log('='.repeat(60));
  console.log('  CONTENT INVENTORY SUMMARY');
  console.log('='.repeat(60));
  console.log('');
  console.log('  Content Type               Count    Details');
  console.log('  ' + '-'.repeat(56));
  console.log(`  Posts (Vijesti)            ${String(stats.posts.total).padEnd(8)} ${stats.posts.published} published, ${stats.posts.draft} draft`);
  console.log(`  Announcements (Obavijesti) ${String(stats.announcements.total).padEnd(8)} ${stats.announcements.active} active`);
  console.log(`  Documents (Dokumenti)      ${String(stats.documents.total).padEnd(8)} ${Object.keys(stats.documents.byCategory).length} categories`);
  console.log(`  Pages (Stranice)           ${String(stats.pages.total).padEnd(8)} ${stats.pages.topLevel} top-level`);
  console.log(`  Events (Dogadanja)         ${String(stats.events.total).padEnd(8)} ${stats.events.upcoming} upcoming`);
  console.log(`  Galleries (Galerije)       ${String(stats.galleries.total).padEnd(8)} ${stats.galleries.totalImages} images`);
  console.log(`  Search Index               ${String(stats.searchIndex.total).padEnd(8)} indexed items`);
  console.log(`  Users (Korisnici)          ${String(stats.users.total).padEnd(8)} ${stats.users.active} active`);
  console.log(`  Contact Messages           ${String(stats.contactMessages.total).padEnd(8)}`);
  console.log(`  Problem Reports            ${String(stats.problemReports.total).padEnd(8)}`);
  console.log(`  Newsletter Subscribers     ${String(stats.newsletterSubscribers.total).padEnd(8)} ${stats.newsletterSubscribers.confirmed} confirmed`);
  console.log('');
  console.log('='.repeat(60));
}

async function main() {
  console.log('Content Inventory Script - Veliki Bukovec');
  console.log('Gathering content statistics...');
  console.log('');

  try {
    const stats = await gatherStats();

    // Generate markdown
    const markdown = generateMarkdown(stats);

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'docs', 'content');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write markdown file
    const outputPath = path.join(outputDir, 'sitemap-inventory.md');
    fs.writeFileSync(outputPath, markdown, 'utf-8');
    console.log(`Inventory written to: ${outputPath}`);

    // Print summary to console
    printSummary(stats);

    console.log('');
    console.log('Inventory generation complete.');
  } catch (error) {
    console.error('Error generating inventory:', error);
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
