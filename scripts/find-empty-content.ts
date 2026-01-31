/**
 * Find Empty/Placeholder Content Script
 *
 * Detects empty, thin (<50-100 words), and placeholder content in pages and draft posts.
 * Appends findings to the content inventory document.
 *
 * Run with: pnpm tsx scripts/find-empty-content.ts
 *
 * Sprint 4.5.1 - Task 4: Identify Empty/Placeholder Content
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const db = new PrismaClient({
  log: ['error'],
});

// Placeholder patterns to detect
const PLACEHOLDER_PATTERNS = [
  // English patterns
  /lorem\s+ipsum/i,
  /\btodo\b/i,
  /\btbd\b/i,
  /\bplaceholder\b/i,
  /coming\s+soon/i,
  // Croatian patterns
  /\buskoro\b/i,
  /u\s+izradi/i,
];

// Word count thresholds
const PAGE_MIN_WORDS = 50;
const POST_MIN_WORDS = 100;

// Issue types
type IssueType = 'empty' | 'too_short' | 'placeholder';
type ContentType = 'page' | 'draft_post';

interface ContentIssue {
  type: ContentType;
  issue: IssueType;
  id: string;
  title: string;
  slug: string;
  wordCount: number;
  placeholderMatches?: string[];
}

/**
 * Strip HTML tags from content and count words
 */
function countWords(html: string | null): number {
  if (!html || html.trim() === '') {
    return 0;
  }

  // Strip HTML tags
  const text = html.replace(/<[^>]*>/g, ' ');

  // Normalize whitespace and split
  const words = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((word) => word.length > 0);

  return words.length;
}

/**
 * Check content for placeholder patterns
 */
function findPlaceholders(html: string | null): string[] {
  if (!html) {
    return [];
  }

  const matches: string[] = [];
  const text = html.replace(/<[^>]*>/g, ' ');

  for (const pattern of PLACEHOLDER_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }

  return matches;
}

/**
 * Get emoji indicator for issue type
 */
function getEmoji(issue: IssueType): string {
  switch (issue) {
    case 'empty':
      return '🔴';
    case 'too_short':
      return '🟠';
    case 'placeholder':
      return '🟡';
  }
}

/**
 * Get display label for issue type
 */
function getIssueLabel(issue: IssueType): string {
  switch (issue) {
    case 'empty':
      return 'Empty';
    case 'too_short':
      return 'Too Short';
    case 'placeholder':
      return 'Placeholder';
  }
}

/**
 * Analyze pages for content issues
 */
async function analyzePages(): Promise<ContentIssue[]> {
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

    // Check for empty content
    if (wordCount === 0) {
      issues.push({
        type: 'page',
        issue: 'empty',
        id: page.id,
        title: page.title,
        slug: page.slug,
        wordCount: 0,
      });
    }
    // Check for too short content
    else if (wordCount < PAGE_MIN_WORDS) {
      issues.push({
        type: 'page',
        issue: 'too_short',
        id: page.id,
        title: page.title,
        slug: page.slug,
        wordCount,
      });
    }

    // Check for placeholder content (can be in addition to too_short)
    if (placeholders.length > 0) {
      // Only add if not already marked as empty
      const existingIssue = issues.find(
        (i) => i.id === page.id && i.type === 'page' && i.issue === 'empty'
      );
      if (!existingIssue) {
        issues.push({
          type: 'page',
          issue: 'placeholder',
          id: page.id,
          title: page.title,
          slug: page.slug,
          wordCount,
          placeholderMatches: placeholders,
        });
      }
    }
  }

  return issues;
}

/**
 * Analyze draft posts for content issues
 */
async function analyzeDraftPosts(): Promise<ContentIssue[]> {
  const issues: ContentIssue[] = [];

  // Get draft posts (publishedAt is null)
  const draftPosts = await db.post.findMany({
    where: {
      publishedAt: null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
    },
  });

  for (const post of draftPosts) {
    const wordCount = countWords(post.content);
    const placeholders = findPlaceholders(post.content);

    // Check for empty content
    if (wordCount === 0) {
      issues.push({
        type: 'draft_post',
        issue: 'empty',
        id: post.id,
        title: post.title,
        slug: post.slug,
        wordCount: 0,
      });
    }
    // Check for too short content
    else if (wordCount < POST_MIN_WORDS) {
      issues.push({
        type: 'draft_post',
        issue: 'too_short',
        id: post.id,
        title: post.title,
        slug: post.slug,
        wordCount,
      });
    }

    // Check for placeholder content
    if (placeholders.length > 0) {
      const existingIssue = issues.find(
        (i) => i.id === post.id && i.type === 'draft_post' && i.issue === 'empty'
      );
      if (!existingIssue) {
        issues.push({
          type: 'draft_post',
          issue: 'placeholder',
          id: post.id,
          title: post.title,
          slug: post.slug,
          wordCount,
          placeholderMatches: placeholders,
        });
      }
    }
  }

  return issues;
}

/**
 * Print findings to console
 */
function printFindings(issues: ContentIssue[]): void {
  console.log('');
  console.log('='.repeat(70));
  console.log('  EMPTY/PLACEHOLDER CONTENT DETECTION');
  console.log('='.repeat(70));
  console.log('');

  if (issues.length === 0) {
    console.log('  No content issues found. All content meets quality thresholds.');
    console.log('');
    console.log(`  Thresholds:`);
    console.log(`  - Pages: minimum ${PAGE_MIN_WORDS} words`);
    console.log(`  - Posts: minimum ${POST_MIN_WORDS} words`);
    console.log('');
    return;
  }

  // Group by content type
  const pageIssues = issues.filter((i) => i.type === 'page');
  const postIssues = issues.filter((i) => i.type === 'draft_post');

  if (pageIssues.length > 0) {
    console.log('  PAGES');
    console.log('  ' + '-'.repeat(66));
    for (const issue of pageIssues) {
      const emoji = getEmoji(issue.issue);
      const label = getIssueLabel(issue.issue);
      const details =
        issue.issue === 'placeholder'
          ? `Found: ${issue.placeholderMatches?.join(', ')}`
          : `${issue.wordCount} words (min: ${PAGE_MIN_WORDS})`;
      console.log(`  ${emoji} [${label}] "${issue.title}" (/${issue.slug})`);
      console.log(`     ${details}`);
    }
    console.log('');
  }

  if (postIssues.length > 0) {
    console.log('  DRAFT POSTS');
    console.log('  ' + '-'.repeat(66));
    for (const issue of postIssues) {
      const emoji = getEmoji(issue.issue);
      const label = getIssueLabel(issue.issue);
      const details =
        issue.issue === 'placeholder'
          ? `Found: ${issue.placeholderMatches?.join(', ')}`
          : `${issue.wordCount} words (min: ${POST_MIN_WORDS})`;
      console.log(`  ${emoji} [${label}] "${issue.title}" (/${issue.slug})`);
      console.log(`     ${details}`);
    }
    console.log('');
  }

  console.log('  SUMMARY');
  console.log('  ' + '-'.repeat(66));
  const emptyCount = issues.filter((i) => i.issue === 'empty').length;
  const shortCount = issues.filter((i) => i.issue === 'too_short').length;
  const placeholderCount = issues.filter((i) => i.issue === 'placeholder').length;
  console.log(`  🔴 Empty:       ${emptyCount}`);
  console.log(`  🟠 Too Short:   ${shortCount}`);
  console.log(`  🟡 Placeholder: ${placeholderCount}`);
  console.log(`  Total Issues:   ${issues.length}`);
  console.log('');
  console.log('='.repeat(70));
}

/**
 * Generate markdown table for findings
 */
function generateMarkdownSection(issues: ContentIssue[]): string {
  const lines: string[] = [];
  const now = new Date().toISOString().split('T')[0];

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Content Quality Analysis');
  lines.push('');
  lines.push(`> Generated: ${now}`);
  lines.push('');
  lines.push('### Detection Thresholds');
  lines.push('');
  lines.push(`- **Pages:** Minimum ${PAGE_MIN_WORDS} words`);
  lines.push(`- **Posts:** Minimum ${POST_MIN_WORDS} words`);
  lines.push(`- **Placeholder patterns:** lorem ipsum, todo, tbd, placeholder, coming soon, uskoro, u izradi`);
  lines.push('');

  if (issues.length === 0) {
    lines.push('### Findings');
    lines.push('');
    lines.push('No content issues detected. All pages and draft posts meet quality thresholds.');
    lines.push('');
  } else {
    lines.push('### Issues Found');
    lines.push('');
    lines.push('| Status | Type | Title | Slug | Words | Details |');
    lines.push('|--------|------|-------|------|-------|---------|');

    for (const issue of issues) {
      const emoji = getEmoji(issue.issue);
      const label = getIssueLabel(issue.issue);
      const typeLabel = issue.type === 'page' ? 'Page' : 'Draft Post';
      const details =
        issue.issue === 'placeholder'
          ? `Found: ${issue.placeholderMatches?.join(', ')}`
          : issue.issue === 'empty'
            ? 'No content'
            : `Below ${issue.type === 'page' ? PAGE_MIN_WORDS : POST_MIN_WORDS} word threshold`;

      lines.push(
        `| ${emoji} ${label} | ${typeLabel} | ${issue.title} | \`/${issue.slug}\` | ${issue.wordCount} | ${details} |`
      );
    }

    lines.push('');

    // Summary
    const emptyCount = issues.filter((i) => i.issue === 'empty').length;
    const shortCount = issues.filter((i) => i.issue === 'too_short').length;
    const placeholderCount = issues.filter((i) => i.issue === 'placeholder').length;

    lines.push('### Summary');
    lines.push('');
    lines.push(`- 🔴 **Empty:** ${emptyCount}`);
    lines.push(`- 🟠 **Too Short:** ${shortCount}`);
    lines.push(`- 🟡 **Placeholder:** ${placeholderCount}`);
    lines.push(`- **Total Issues:** ${issues.length}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('*This section is automatically generated by the find-empty-content script.*');
  lines.push('');

  return lines.join('\n');
}

/**
 * Append findings to inventory document
 */
function appendToInventory(markdownSection: string): void {
  const inventoryPath = path.join(process.cwd(), 'docs', 'content', 'sitemap-inventory.md');

  if (!fs.existsSync(inventoryPath)) {
    console.error(`Error: Inventory file not found at ${inventoryPath}`);
    console.log('Please run content-inventory.ts first to create the inventory.');
    return;
  }

  let content = fs.readFileSync(inventoryPath, 'utf-8');

  // Check if the Content Quality Analysis section already exists
  const sectionMarker = '## Content Quality Analysis';
  const sectionIndex = content.indexOf(sectionMarker);

  if (sectionIndex !== -1) {
    // Find the end of this section (next ## or end of file)
    const afterSection = content.slice(sectionIndex + sectionMarker.length);
    const nextSectionMatch = afterSection.match(/\n## [^#]/);
    const endOfAutogenNote = content.indexOf(
      '*This section is automatically generated by the find-empty-content script.*'
    );

    if (endOfAutogenNote !== -1) {
      // Find the end of the autogen section (including trailing newlines and ---)
      let endIndex = endOfAutogenNote;
      const remaining = content.slice(endOfAutogenNote);
      const endMatch = remaining.match(/\*This section is automatically generated by the find-empty-content script\.\*\n*---?\n*/);
      if (endMatch) {
        endIndex = endOfAutogenNote + endMatch[0].length;
      } else {
        // Just find the end of the line with potential trailing content
        const lineEnd = remaining.indexOf('\n');
        endIndex = endOfAutogenNote + (lineEnd !== -1 ? lineEnd + 1 : remaining.length);
      }

      // Replace the existing section
      const beforeSection = content.slice(0, content.lastIndexOf('\n---\n', sectionIndex) + 1);
      const afterOldSection = content.slice(endIndex);
      content = beforeSection + markdownSection + afterOldSection;
    } else if (nextSectionMatch) {
      // Replace up to next section
      const nextSectionIndex = sectionIndex + sectionMarker.length + nextSectionMatch.index!;
      content = content.slice(0, content.lastIndexOf('\n---\n', sectionIndex) + 1) + markdownSection + content.slice(nextSectionIndex);
    } else {
      // Replace to end of file
      content = content.slice(0, content.lastIndexOf('\n---\n', sectionIndex) + 1) + markdownSection;
    }
  } else {
    // Append to end, but before the final auto-generated note if it exists
    const inventoryNote = '*This inventory is automatically generated by the content-inventory script.*';
    const noteIndex = content.indexOf(inventoryNote);

    if (noteIndex !== -1) {
      // Insert before the inventory note
      const beforeNote = content.slice(0, content.lastIndexOf('\n---\n', noteIndex));
      const afterNote = content.slice(noteIndex);
      content = beforeNote + markdownSection + '\n---\n\n' + afterNote;
    } else {
      // Just append to end
      content += markdownSection;
    }
  }

  fs.writeFileSync(inventoryPath, content, 'utf-8');
  console.log(`Findings appended to: ${inventoryPath}`);
}

async function main() {
  console.log('Find Empty/Placeholder Content - Veliki Bukovec');
  console.log('Analyzing content for quality issues...');
  console.log('');

  try {
    // Gather issues from pages and draft posts
    const pageIssues = await analyzePages();
    const postIssues = await analyzeDraftPosts();
    const allIssues = [...pageIssues, ...postIssues];

    // Print to console
    printFindings(allIssues);

    // Generate markdown and append to inventory
    const markdownSection = generateMarkdownSection(allIssues);
    appendToInventory(markdownSection);

    console.log('');
    console.log('Content quality analysis complete.');
  } catch (error) {
    console.error('Error analyzing content:', error);
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
