/**
 * Content Quality Audit Script
 *
 * Comprehensive analysis of all content for quality issues:
 * - Word count analysis (thin content detection)
 * - Placeholder text detection
 * - Empty required fields
 * - R2 image URL validation
 * - Internal link checking
 * - Outdated content detection
 *
 * Run with: DATABASE_URL="..." pnpm tsx scripts/content-quality-audit.ts
 *
 * Sprint 4.5.3 - Content Quality Audit
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const db = new PrismaClient({
  log: ['error'],
});

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // Word count thresholds
  PAGE_MIN_WORDS: 50,
  POST_MIN_WORDS: 100,
  ANNOUNCEMENT_MIN_WORDS: 30,

  // Placeholder patterns
  PLACEHOLDER_PATTERNS: [
    /lorem\s+ipsum/i,
    /\btodo\b/i,
    /\btbd\b/i,
    /\bplaceholder\b/i,
    /coming\s+soon/i,
    /\buskoro\b/i,
    /u\s+izradi/i,
    /\bxxx+\b/i,
    /\[\s*insert\s/i,
    /\{\{\s*\w+\s*\}\}/i, // Template variables like {{name}}
  ],

  // Outdated content thresholds
  STALE_ANNOUNCEMENT_DAYS: 90, // Announcements older than 90 days
  OLD_EVENT_DAYS: 30, // Events that ended more than 30 days ago

  // R2 URL pattern
  R2_URL_PATTERN: /https:\/\/pub-[a-f0-9]+\.r2\.dev\/[^\s"')]+/gi,

  // Internal link pattern
  INTERNAL_LINK_PATTERN: /href=["']\/([^"'#]+)/gi,
};

// ============================================================================
// Types
// ============================================================================

type IssueSeverity = 'critical' | 'warning' | 'info';
type IssueCategory =
  | 'empty_content'
  | 'thin_content'
  | 'placeholder'
  | 'missing_field'
  | 'broken_image'
  | 'broken_link'
  | 'outdated';

interface ContentIssue {
  severity: IssueSeverity;
  category: IssueCategory;
  contentType: string;
  id: string;
  title: string;
  slug?: string;
  details: string;
  recommendation?: string;
}

interface AuditStats {
  totalItems: number;
  itemsWithIssues: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  byCategory: Record<IssueCategory, number>;
}

interface AuditResult {
  issues: ContentIssue[];
  stats: AuditStats;
  brokenImages: string[];
  brokenLinks: string[];
  validImages: number;
  validLinks: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

function stripHtml(html: string | null): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(content: string | null): number {
  const text = stripHtml(content);
  if (!text) return 0;
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function findPlaceholders(content: string | null): string[] {
  if (!content) return [];
  const text = stripHtml(content);
  const matches: string[] = [];

  for (const pattern of CONFIG.PLACEHOLDER_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }

  return matches;
}

function extractR2Urls(content: string | null): string[] {
  if (!content) return [];
  const matches = content.match(CONFIG.R2_URL_PATTERN) ?? [];
  return [...new Set(matches)]; // Deduplicate
}

function extractInternalLinks(content: string | null): string[] {
  if (!content) return [];
  const links: string[] = [];
  let match;

  const regex = new RegExp(CONFIG.INTERNAL_LINK_PATTERN.source, 'gi');
  while ((match = regex.exec(content)) !== null) {
    if (match[1]) {
      links.push('/' + match[1]);
    }
  }

  return [...new Set(links)];
}

function daysSince(date: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

async function checkImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentAudit/1.0)',
      },
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

// Add delay between requests to avoid rate limiting
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Audit Functions
// ============================================================================

async function auditPosts(): Promise<ContentIssue[]> {
  const issues: ContentIssue[] = [];

  const posts = await db.post.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      category: true,
    },
  });

  for (const post of posts) {
    const wordCount = countWords(post.content);
    const placeholders = findPlaceholders(post.content);
    const isPublished = post.publishedAt !== null;

    // Empty content
    if (wordCount === 0) {
      issues.push({
        severity: isPublished ? 'critical' : 'warning',
        category: 'empty_content',
        contentType: 'Post',
        id: post.id,
        title: post.title,
        slug: post.slug,
        details: 'Post has no content',
        recommendation: 'Add content or delete if not needed',
      });
    }
    // Thin content
    else if (wordCount < CONFIG.POST_MIN_WORDS) {
      issues.push({
        severity: isPublished ? 'warning' : 'info',
        category: 'thin_content',
        contentType: 'Post',
        id: post.id,
        title: post.title,
        slug: post.slug,
        details: `Only ${wordCount} words (minimum: ${CONFIG.POST_MIN_WORDS})`,
        recommendation: 'Expand content for better SEO and user value',
      });
    }

    // Placeholder content
    if (placeholders.length > 0) {
      issues.push({
        severity: isPublished ? 'critical' : 'warning',
        category: 'placeholder',
        contentType: 'Post',
        id: post.id,
        title: post.title,
        slug: post.slug,
        details: `Found: ${placeholders.join(', ')}`,
        recommendation: 'Replace placeholder text with real content',
      });
    }

    // Missing excerpt for published posts
    if (isPublished && (!post.excerpt || post.excerpt.trim() === '')) {
      issues.push({
        severity: 'info',
        category: 'missing_field',
        contentType: 'Post',
        id: post.id,
        title: post.title,
        slug: post.slug,
        details: 'Missing excerpt',
        recommendation: 'Add excerpt for better SEO and listings',
      });
    }
  }

  return issues;
}

async function auditPages(): Promise<ContentIssue[]> {
  const issues: ContentIssue[] = [];

  const pages = await db.page.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
    },
  });

  for (const page of pages) {
    const wordCount = countWords(page.content);
    const placeholders = findPlaceholders(page.content);

    // Empty content
    if (wordCount === 0) {
      issues.push({
        severity: 'critical',
        category: 'empty_content',
        contentType: 'Page',
        id: page.id,
        title: page.title,
        slug: page.slug,
        details: 'Page has no content',
        recommendation: 'Add content or remove from navigation',
      });
    }
    // Thin content
    else if (wordCount < CONFIG.PAGE_MIN_WORDS) {
      issues.push({
        severity: 'warning',
        category: 'thin_content',
        contentType: 'Page',
        id: page.id,
        title: page.title,
        slug: page.slug,
        details: `Only ${wordCount} words (minimum: ${CONFIG.PAGE_MIN_WORDS})`,
        recommendation: 'Expand content for better user experience',
      });
    }

    // Placeholder content
    if (placeholders.length > 0) {
      issues.push({
        severity: 'critical',
        category: 'placeholder',
        contentType: 'Page',
        id: page.id,
        title: page.title,
        slug: page.slug,
        details: `Found: ${placeholders.join(', ')}`,
        recommendation: 'Replace placeholder text with real content',
      });
    }
  }

  return issues;
}

async function auditAnnouncements(): Promise<ContentIssue[]> {
  const issues: ContentIssue[] = [];

  const announcements = await db.announcement.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      publishedAt: true,
      validUntil: true,
    },
  });

  const now = new Date();

  for (const ann of announcements) {
    const wordCount = countWords(ann.content);
    const isPublished = ann.publishedAt !== null;

    // Empty content
    if (wordCount === 0) {
      issues.push({
        severity: isPublished ? 'warning' : 'info',
        category: 'empty_content',
        contentType: 'Announcement',
        id: ann.id,
        title: ann.title,
        slug: ann.slug,
        details: 'Announcement has no content body',
        recommendation: 'Add details or ensure attachments contain information',
      });
    }

    // Expired announcements still published
    if (isPublished && ann.validUntil && ann.validUntil < now) {
      const daysExpired = daysSince(ann.validUntil);
      if (daysExpired > CONFIG.STALE_ANNOUNCEMENT_DAYS) {
        issues.push({
          severity: 'warning',
          category: 'outdated',
          contentType: 'Announcement',
          id: ann.id,
          title: ann.title,
          slug: ann.slug,
          details: `Expired ${daysExpired} days ago`,
          recommendation: 'Archive or unpublish outdated announcements',
        });
      }
    }
  }

  return issues;
}

async function auditEvents(): Promise<ContentIssue[]> {
  const issues: ContentIssue[] = [];

  const events = await db.event.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      eventDate: true,
      endDate: true,
      location: true,
    },
  });

  const now = new Date();

  for (const event of events) {
    const endDate = event.endDate ?? event.eventDate;
    const daysPast = daysSince(endDate);

    // Very old past events
    if (daysPast > CONFIG.OLD_EVENT_DAYS) {
      issues.push({
        severity: 'info',
        category: 'outdated',
        contentType: 'Event',
        id: event.id,
        title: event.title,
        details: `Event ended ${daysPast} days ago`,
        recommendation: 'Consider archiving old events for cleaner calendar',
      });
    }

    // Missing location
    if (!event.location || event.location.trim() === '') {
      issues.push({
        severity: 'info',
        category: 'missing_field',
        contentType: 'Event',
        id: event.id,
        title: event.title,
        details: 'Missing location',
        recommendation: 'Add location for better user information',
      });
    }
  }

  return issues;
}

async function auditDocuments(): Promise<ContentIssue[]> {
  const issues: ContentIssue[] = [];

  const documents = await db.document.findMany({
    select: {
      id: true,
      title: true,
      fileUrl: true,
      category: true,
      year: true,
    },
  });

  // Check for documents without year
  for (const doc of documents) {
    if (!doc.year) {
      issues.push({
        severity: 'info',
        category: 'missing_field',
        contentType: 'Document',
        id: doc.id,
        title: doc.title,
        details: 'Missing year',
        recommendation: 'Add year for better organization and filtering',
      });
    }
  }

  return issues;
}

async function auditImages(allContent: string[]): Promise<{
  issues: ContentIssue[];
  brokenUrls: string[];
  validCount: number;
}> {
  const issues: ContentIssue[] = [];
  const allUrls: string[] = [];

  // Extract all R2 URLs from content
  for (const content of allContent) {
    allUrls.push(...extractR2Urls(content));
  }

  const uniqueUrls = [...new Set(allUrls)];
  console.log(`  Checking ${uniqueUrls.length} unique image URLs...`);

  const brokenUrls: string[] = [];
  let validCount = 0;
  let checked = 0;

  // Check URLs in batches with delays to avoid rate limiting
  const batchSize = 5;
  const batchDelayMs = 200; // 200ms between batches

  for (let i = 0; i < uniqueUrls.length; i += batchSize) {
    const batch = uniqueUrls.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (url) => {
        const isValid = await checkImageUrl(url);
        return { url, isValid };
      })
    );

    for (const { url, isValid } of results) {
      if (isValid) {
        validCount++;
      } else {
        brokenUrls.push(url);
      }
    }

    checked += batch.length;
    if (checked % 100 === 0) {
      console.log(`    Checked ${checked}/${uniqueUrls.length} images...`);
    }

    // Add delay between batches to avoid rate limiting
    if (i + batchSize < uniqueUrls.length) {
      await delay(batchDelayMs);
    }
  }

  // Create issues for broken images
  for (const url of brokenUrls) {
    issues.push({
      severity: 'warning',
      category: 'broken_image',
      contentType: 'Image',
      id: url.substring(url.lastIndexOf('/') + 1),
      title: url.substring(url.lastIndexOf('/') + 1),
      details: `URL returns error: ${url.substring(0, 60)}...`,
      recommendation: 'Re-upload image or remove reference',
    });
  }

  return { issues, brokenUrls, validCount };
}

async function auditInternalLinks(allContent: string[]): Promise<{
  issues: ContentIssue[];
  brokenLinks: string[];
  validCount: number;
}> {
  const issues: ContentIssue[] = [];
  const allLinks: string[] = [];

  // Extract all internal links
  for (const content of allContent) {
    allLinks.push(...extractInternalLinks(content));
  }

  const uniqueLinks = [...new Set(allLinks)];
  console.log(`  Checking ${uniqueLinks.length} unique internal links...`);

  // Get all valid slugs from database
  const [pages, posts, announcements] = await Promise.all([
    db.page.findMany({ select: { slug: true } }),
    db.post.findMany({ select: { slug: true } }),
    db.announcement.findMany({ select: { slug: true } }),
  ]);

  const validSlugs = new Set([
    ...pages.map((p) => '/' + p.slug),
    ...posts.map((p) => '/vijesti/' + p.slug),
    ...announcements.map((a) => '/obavijesti/' + a.slug),
    // Static routes
    '/',
    '/vijesti',
    '/obavijesti',
    '/dokumenti',
    '/galerija',
    '/dogadanja',
    '/kontakt',
    '/prijava-problema',
    '/opcina',
    '/opcina/naselja',
    '/opcina/udruge',
    '/opcina/zupa',
    '/opcina/ustanove',
    '/organizacija',
    '/usluge',
    '/izbori',
    '/odvoz-otpada',
    '/pristupacnost',
  ]);

  const brokenLinks: string[] = [];
  let validCount = 0;

  for (const link of uniqueLinks) {
    // Normalize link (remove trailing slash, query params)
    const normalized = link.split('?')[0]?.replace(/\/$/, '') ?? link;

    if (validSlugs.has(normalized) || normalized.startsWith('/dokumenti')) {
      validCount++;
    } else {
      brokenLinks.push(link);
    }
  }

  // Create issues for broken links
  for (const link of brokenLinks) {
    issues.push({
      severity: 'warning',
      category: 'broken_link',
      contentType: 'Link',
      id: link,
      title: link,
      details: `Target page not found: ${link}`,
      recommendation: 'Update link to valid page or remove',
    });
  }

  return { issues, brokenLinks, validCount };
}

// ============================================================================
// Report Generation
// ============================================================================

function generateMarkdownReport(result: AuditResult): string {
  const now = new Date().toISOString().split('T')[0];
  const lines: string[] = [];

  lines.push('# Content Quality Audit Report');
  lines.push('');
  lines.push(`> Generated: ${now}`);
  lines.push('> Sprint 4.5.3 - Content Quality Audit');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Total Issues | ${result.issues.length} |`);
  lines.push(`| 🔴 Critical | ${result.stats.criticalCount} |`);
  lines.push(`| 🟡 Warning | ${result.stats.warningCount} |`);
  lines.push(`| 🔵 Info | ${result.stats.infoCount} |`);
  lines.push(`| Images Checked | ${result.validImages + result.brokenImages.length} |`);
  lines.push(`| Broken Images | ${result.brokenImages.length} |`);
  lines.push(`| Internal Links Checked | ${result.validLinks + result.brokenLinks.length} |`);
  lines.push(`| Broken Links | ${result.brokenLinks.length} |`);
  lines.push('');

  // Issues by Category
  lines.push('### Issues by Category');
  lines.push('');
  lines.push('| Category | Count |');
  lines.push('|----------|-------|');
  for (const [category, count] of Object.entries(result.stats.byCategory)) {
    if (count > 0) {
      const label = category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      lines.push(`| ${label} | ${count} |`);
    }
  }
  lines.push('');

  // Critical Issues
  const critical = result.issues.filter((i) => i.severity === 'critical');
  if (critical.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## 🔴 Critical Issues');
    lines.push('');
    lines.push('These issues should be fixed before launch.');
    lines.push('');
    lines.push('| Type | Title | Issue | Recommendation |');
    lines.push('|------|-------|-------|----------------|');
    for (const issue of critical) {
      const slug = issue.slug ? ` (\`/${issue.slug}\`)` : '';
      lines.push(
        `| ${issue.contentType} | ${issue.title}${slug} | ${issue.details} | ${issue.recommendation ?? '-'} |`
      );
    }
    lines.push('');
  }

  // Warnings
  const warnings = result.issues.filter((i) => i.severity === 'warning');
  if (warnings.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## 🟡 Warnings');
    lines.push('');
    lines.push('These issues should be addressed for quality.');
    lines.push('');
    lines.push('| Type | Title | Issue | Recommendation |');
    lines.push('|------|-------|-------|----------------|');
    for (const issue of warnings.slice(0, 50)) {
      const slug = issue.slug ? ` (\`/${issue.slug}\`)` : '';
      lines.push(
        `| ${issue.contentType} | ${issue.title.substring(0, 40)}${slug} | ${issue.details} | ${issue.recommendation ?? '-'} |`
      );
    }
    if (warnings.length > 50) {
      lines.push(`| ... | (${warnings.length - 50} more warnings) | ... | ... |`);
    }
    lines.push('');
  }

  // Info
  const info = result.issues.filter((i) => i.severity === 'info');
  if (info.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## 🔵 Info');
    lines.push('');
    lines.push('Optional improvements for better quality.');
    lines.push('');
    lines.push('| Type | Title | Issue |');
    lines.push('|------|-------|-------|');
    for (const issue of info.slice(0, 30)) {
      lines.push(`| ${issue.contentType} | ${issue.title.substring(0, 40)} | ${issue.details} |`);
    }
    if (info.length > 30) {
      lines.push(`| ... | (${info.length - 30} more) | ... |`);
    }
    lines.push('');
  }

  // Broken Images
  if (result.brokenImages.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## Broken Images');
    lines.push('');
    lines.push('| URL |');
    lines.push('|-----|');
    for (const url of result.brokenImages.slice(0, 20)) {
      lines.push(`| \`${url.substring(0, 80)}...\` |`);
    }
    if (result.brokenImages.length > 20) {
      lines.push(`| (${result.brokenImages.length - 20} more) |`);
    }
    lines.push('');
  }

  // Broken Links
  if (result.brokenLinks.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## Broken Internal Links');
    lines.push('');
    lines.push('| Link |');
    lines.push('|------|');
    for (const link of result.brokenLinks.slice(0, 20)) {
      lines.push(`| \`${link}\` |`);
    }
    if (result.brokenLinks.length > 20) {
      lines.push(`| (${result.brokenLinks.length - 20} more) |`);
    }
    lines.push('');
  }

  // Audit Configuration
  lines.push('---');
  lines.push('');
  lines.push('## Audit Configuration');
  lines.push('');
  lines.push('| Setting | Value |');
  lines.push('|---------|-------|');
  lines.push(`| Post minimum words | ${CONFIG.POST_MIN_WORDS} |`);
  lines.push(`| Page minimum words | ${CONFIG.PAGE_MIN_WORDS} |`);
  lines.push(`| Announcement minimum words | ${CONFIG.ANNOUNCEMENT_MIN_WORDS} |`);
  lines.push(`| Stale announcement threshold | ${CONFIG.STALE_ANNOUNCEMENT_DAYS} days |`);
  lines.push(`| Old event threshold | ${CONFIG.OLD_EVENT_DAYS} days |`);
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('*This report is automatically generated by the content-quality-audit script (Sprint 4.5.3).*');
  lines.push('');

  return lines.join('\n');
}

function printSummary(result: AuditResult): void {
  console.log('');
  console.log('='.repeat(70));
  console.log('  CONTENT QUALITY AUDIT SUMMARY');
  console.log('='.repeat(70));
  console.log('');
  console.log('  ISSUES BY SEVERITY');
  console.log('  ' + '-'.repeat(66));
  console.log(`  🔴 Critical:    ${result.stats.criticalCount}`);
  console.log(`  🟡 Warning:     ${result.stats.warningCount}`);
  console.log(`  🔵 Info:        ${result.stats.infoCount}`);
  console.log(`  Total:          ${result.issues.length}`);
  console.log('');
  console.log('  ISSUES BY CATEGORY');
  console.log('  ' + '-'.repeat(66));
  for (const [category, count] of Object.entries(result.stats.byCategory)) {
    if (count > 0) {
      const label = category.replace(/_/g, ' ').padEnd(20);
      console.log(`  ${label} ${count}`);
    }
  }
  console.log('');
  console.log('  ASSET VALIDATION');
  console.log('  ' + '-'.repeat(66));
  console.log(`  Images: ${result.validImages} valid, ${result.brokenImages.length} broken`);
  console.log(`  Links:  ${result.validLinks} valid, ${result.brokenLinks.length} broken`);
  console.log('');
  console.log('='.repeat(70));
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  console.log('Content Quality Audit - Sprint 4.5.3');
  console.log('');

  const allIssues: ContentIssue[] = [];
  const allContent: string[] = [];

  try {
    // Audit posts
    console.log('Auditing posts...');
    const postIssues = await auditPosts();
    allIssues.push(...postIssues);
    const posts = await db.post.findMany({ select: { content: true } });
    allContent.push(...posts.map((p) => p.content));
    console.log(`  Found ${postIssues.length} issues in ${posts.length} posts`);

    // Audit pages
    console.log('Auditing pages...');
    const pageIssues = await auditPages();
    allIssues.push(...pageIssues);
    const pages = await db.page.findMany({ select: { content: true } });
    allContent.push(...pages.map((p) => p.content));
    console.log(`  Found ${pageIssues.length} issues in ${pages.length} pages`);

    // Audit announcements
    console.log('Auditing announcements...');
    const annIssues = await auditAnnouncements();
    allIssues.push(...annIssues);
    const announcements = await db.announcement.findMany({ select: { content: true } });
    allContent.push(...announcements.filter((a) => a.content).map((a) => a.content!));
    console.log(`  Found ${annIssues.length} issues in ${announcements.length} announcements`);

    // Audit events
    console.log('Auditing events...');
    const eventIssues = await auditEvents();
    allIssues.push(...eventIssues);
    console.log(`  Found ${eventIssues.length} issues`);

    // Audit documents
    console.log('Auditing documents...');
    const docIssues = await auditDocuments();
    allIssues.push(...docIssues);
    console.log(`  Found ${docIssues.length} issues`);

    // Audit images
    console.log('Auditing images...');
    const imageResult = await auditImages(allContent);
    allIssues.push(...imageResult.issues);
    console.log(`  Found ${imageResult.brokenUrls.length} broken images`);

    // Audit internal links
    console.log('Auditing internal links...');
    const linkResult = await auditInternalLinks(allContent);
    allIssues.push(...linkResult.issues);
    console.log(`  Found ${linkResult.brokenLinks.length} broken links`);

    // Calculate stats
    const stats: AuditStats = {
      totalItems: 0,
      itemsWithIssues: new Set(allIssues.map((i) => `${i.contentType}-${i.id}`)).size,
      criticalCount: allIssues.filter((i) => i.severity === 'critical').length,
      warningCount: allIssues.filter((i) => i.severity === 'warning').length,
      infoCount: allIssues.filter((i) => i.severity === 'info').length,
      byCategory: {
        empty_content: allIssues.filter((i) => i.category === 'empty_content').length,
        thin_content: allIssues.filter((i) => i.category === 'thin_content').length,
        placeholder: allIssues.filter((i) => i.category === 'placeholder').length,
        missing_field: allIssues.filter((i) => i.category === 'missing_field').length,
        broken_image: allIssues.filter((i) => i.category === 'broken_image').length,
        broken_link: allIssues.filter((i) => i.category === 'broken_link').length,
        outdated: allIssues.filter((i) => i.category === 'outdated').length,
      },
    };

    const result: AuditResult = {
      issues: allIssues,
      stats,
      brokenImages: imageResult.brokenUrls,
      brokenLinks: linkResult.brokenLinks,
      validImages: imageResult.validCount,
      validLinks: linkResult.validCount,
    };

    // Generate report
    const markdown = generateMarkdownReport(result);

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'docs', 'content');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write report
    const outputPath = path.join(outputDir, 'quality-audit.md');
    fs.writeFileSync(outputPath, markdown, 'utf-8');
    console.log(`\nReport written to: ${outputPath}`);

    // Print summary
    printSummary(result);

    console.log('\nContent quality audit complete.');
  } catch (error) {
    console.error('Error during audit:', error);
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
