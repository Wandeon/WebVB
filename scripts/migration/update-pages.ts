/**
 * Update Pages Script
 * Task 3: Update Pages with WordPress Content
 *
 * This script updates existing pages in the database with full WordPress content,
 * converting HTML to TipTap JSON and replacing WordPress URLs with R2 URLs.
 *
 * Run with: cd /mnt/c/VelikiBukovec_web/apps/admin && npx tsx ../../scripts/migration/update-pages.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

// Load env manually
function loadEnv(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([^#=]+)=["']?(.*)["']?$/);
      if (match && !process.env[match[1].trim()]) {
        process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    /* ignore */
  }
}
loadEnv('/mnt/c/VelikiBukovec_web/.env');
loadEnv('/mnt/c/VelikiBukovec_web/apps/admin/.env');

const prisma = new PrismaClient();

interface ParsedPage {
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

// TipTap node types
interface TipTapMark {
  type: string;
  attrs?: Record<string, string | number | boolean | null>;
}

interface TipTapNode {
  type: string;
  attrs?: Record<string, string | number | boolean | null>;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
}

interface TipTapDocument {
  type: 'doc';
  content: TipTapNode[];
}

// URL mapping cache
let urlMap: Record<string, string> = {};

/**
 * Replace WordPress URLs with R2 URLs in a string
 * Handles both exact matches and thumbnail variations
 */
function replaceUrls(text: string): string {
  let result = text;

  // Sort URLs by length (longest first) to avoid partial replacements
  const sortedEntries = Object.entries(urlMap).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [oldUrl, newUrl] of sortedEntries) {
    if (result.includes(oldUrl)) {
      result = result.split(oldUrl).join(newUrl);
    }
  }

  // Handle thumbnail URLs (e.g., image-300x169.jpg -> image.webp)
  // WordPress creates thumbnails like: original-WIDTHxHEIGHT.ext
  const thumbnailPattern =
    /(https?:\/\/velikibukovec\.hr\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"'\s]+?)-\d+x\d+\.(jpg|jpeg|png|gif)/gi;

  result = result.replace(thumbnailPattern, (match, basePath, ext) => {
    // Try to find the full image URL in the map
    const fullImageUrl = `${basePath}.${ext}`;
    const httpFullUrl = fullImageUrl.replace('https://', 'http://');

    if (urlMap[fullImageUrl]) {
      return urlMap[fullImageUrl];
    }
    if (urlMap[httpFullUrl]) {
      return urlMap[httpFullUrl];
    }

    // If not found, try to construct R2 URL directly
    const pathMatch = fullImageUrl.match(
      /\/wp-content\/uploads\/(\d{4}\/\d{2}\/[^"'\s]+)\.(jpg|jpeg|png|gif)/i
    );
    if (pathMatch) {
      return `https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/${pathMatch[1]}.webp`;
    }

    return match;
  });

  return result;
}

/**
 * Parse inline content (text with marks like bold, italic, links)
 */
function parseInlineContent(html: string): TipTapNode[] {
  const nodes: TipTapNode[] = [];

  if (!html || !html.trim()) {
    return nodes;
  }

  // Process the HTML character by character, handling tags
  let remaining = html;

  while (remaining.length > 0) {
    // Find next tag
    const tagMatch = remaining.match(
      /^([\s\S]*?)<(\/?)(\w+)([^>]*)>/
    );

    if (!tagMatch) {
      // No more tags, add remaining text
      const text = decodeHtmlEntities(remaining.trim());
      if (text) {
        nodes.push({ type: 'text', text });
      }
      break;
    }

    const [fullMatch, beforeTag, isClosing, tagName, attrs] = tagMatch;
    const lowerTag = tagName.toLowerCase();

    // Add text before tag
    if (beforeTag) {
      const text = decodeHtmlEntities(beforeTag);
      if (text) {
        nodes.push({ type: 'text', text });
      }
    }

    remaining = remaining.slice(fullMatch.length);

    // Handle self-closing tags
    if (lowerTag === 'br') {
      nodes.push({ type: 'hardBreak' });
      continue;
    }

    if (lowerTag === 'img' && !isClosing) {
      // This is handled at block level, skip here
      continue;
    }

    // Handle opening tags with content
    if (!isClosing) {
      if (lowerTag === 'a') {
        // Find closing </a>
        const closeMatch = remaining.match(/^([\s\S]*?)<\/a>/i);
        if (closeMatch) {
          const linkContent = closeMatch[1];
          const hrefMatch = attrs.match(/href=["']([^"']+)["']/);
          const href = hrefMatch ? replaceUrls(hrefMatch[1]) : '#';

          // Check if this is an image link
          if (linkContent.includes('<img')) {
            // Skip - image links are handled at block level
            remaining = remaining.slice(closeMatch[0].length);
            continue;
          }

          const linkText = decodeHtmlEntities(
            linkContent.replace(/<[^>]+>/g, '')
          );
          if (linkText) {
            nodes.push({
              type: 'text',
              text: linkText,
              marks: [{ type: 'link', attrs: { href, target: '_blank' } }],
            });
          }
          remaining = remaining.slice(closeMatch[0].length);
        }
        continue;
      }

      if (lowerTag === 'strong' || lowerTag === 'b') {
        const closeMatch = remaining.match(/^([\s\S]*?)<\/(strong|b)>/i);
        if (closeMatch) {
          const innerNodes = parseInlineContent(closeMatch[1]);
          for (const node of innerNodes) {
            if (node.type === 'text') {
              node.marks = [...(node.marks || []), { type: 'bold' }];
            }
            nodes.push(node);
          }
          remaining = remaining.slice(closeMatch[0].length);
        }
        continue;
      }

      if (lowerTag === 'em' || lowerTag === 'i') {
        const closeMatch = remaining.match(/^([\s\S]*?)<\/(em|i)>/i);
        if (closeMatch) {
          const innerNodes = parseInlineContent(closeMatch[1]);
          for (const node of innerNodes) {
            if (node.type === 'text') {
              node.marks = [...(node.marks || []), { type: 'italic' }];
            }
            nodes.push(node);
          }
          remaining = remaining.slice(closeMatch[0].length);
        }
        continue;
      }

      if (lowerTag === 'u') {
        const closeMatch = remaining.match(/^([\s\S]*?)<\/u>/i);
        if (closeMatch) {
          const innerNodes = parseInlineContent(closeMatch[1]);
          for (const node of innerNodes) {
            if (node.type === 'text') {
              node.marks = [...(node.marks || []), { type: 'underline' }];
            }
            nodes.push(node);
          }
          remaining = remaining.slice(closeMatch[0].length);
        }
        continue;
      }

      if (lowerTag === 'span') {
        // Handle span - just extract content without special styling
        const closeMatch = remaining.match(/^([\s\S]*?)<\/span>/i);
        if (closeMatch) {
          const innerNodes = parseInlineContent(closeMatch[1]);
          nodes.push(...innerNodes);
          remaining = remaining.slice(closeMatch[0].length);
        }
        continue;
      }
    }
  }

  return nodes;
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/&hellip;/g, '...')
    .replace(/&laquo;/g, '"')
    .replace(/&raquo;/g, '"')
    .replace(/&#\d+;/g, (match) => {
      const code = parseInt(match.slice(2, -1), 10);
      return String.fromCharCode(code);
    });
}

/**
 * Extract image attributes from an img tag
 */
function parseImageTag(
  imgTag: string
): { src: string; alt: string; title: string } | null {
  const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
  if (!srcMatch) return null;

  const altMatch = imgTag.match(/alt=["']([^"']*)["']/);
  const titleMatch = imgTag.match(/title=["']([^"']*)["']/);

  return {
    src: replaceUrls(srcMatch[1]),
    alt: altMatch ? decodeHtmlEntities(altMatch[1]) : '',
    title: titleMatch ? decodeHtmlEntities(titleMatch[1]) : '',
  };
}

/**
 * Parse a list (ul/ol) into TipTap nodes
 */
function parseList(html: string, ordered: boolean): TipTapNode | null {
  const items: TipTapNode[] = [];
  const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match;

  while ((match = liPattern.exec(html)) !== null) {
    const liContent = match[1];
    const innerContent = parseInlineContent(liContent);

    items.push({
      type: 'listItem',
      content: [
        {
          type: 'paragraph',
          content: innerContent.length > 0 ? innerContent : undefined,
        },
      ],
    });
  }

  if (items.length === 0) return null;

  return {
    type: ordered ? 'orderedList' : 'bulletList',
    content: items,
  };
}

/**
 * Parse a table into TipTap nodes
 */
function parseTable(html: string): TipTapNode | null {
  const rows: TipTapNode[] = [];
  const trPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;

  while ((trMatch = trPattern.exec(html)) !== null) {
    const rowContent = trMatch[1];
    const cells: TipTapNode[] = [];

    // Match both th and td cells
    const cellPattern = /<(th|td)[^>]*>([\s\S]*?)<\/\1>/gi;
    let cellMatch;

    while ((cellMatch = cellPattern.exec(rowContent)) !== null) {
      const cellType = cellMatch[1].toLowerCase();
      const cellContent = cellMatch[2];
      const innerContent = parseInlineContent(cellContent.replace(/<[^>]+>/g, ' ').trim());

      cells.push({
        type: cellType === 'th' ? 'tableHeader' : 'tableCell',
        content: [
          {
            type: 'paragraph',
            content: innerContent.length > 0 ? innerContent : undefined,
          },
        ],
      });
    }

    if (cells.length > 0) {
      rows.push({
        type: 'tableRow',
        content: cells,
      });
    }
  }

  if (rows.length === 0) return null;

  return {
    type: 'table',
    content: rows,
  };
}

/**
 * Convert HTML to TipTap JSON document
 */
function htmlToTipTap(html: string): TipTapDocument {
  const content: TipTapNode[] = [];

  if (!html || !html.trim()) {
    return {
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }],
    };
  }

  // Normalize HTML
  let normalized = html
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove WordPress comments
    .replace(/<!--more-->/g, '')
    .replace(/<!-- wp:[^>]+-->/g, '')
    .replace(/<!-- \/wp:[^>]+-->/g, '')
    // Remove WordPress shortcodes like [caption], [Best_Wordpress_Gallery], etc.
    .replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi, '$1')
    .replace(/\[Best_Wordpress_Gallery[^\]]*\]/gi, '')
    .replace(/\[elementor[^\]]*\]/g, '')
    .trim();

  // Split into blocks (paragraphs, images, lists, tables, etc.)
  const blockPattern =
    /(<table[^>]*>[\s\S]*?<\/table>|<p[^>]*>[\s\S]*?<\/p>|<ul[^>]*>[\s\S]*?<\/ul>|<ol[^>]*>[\s\S]*?<\/ol>|<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>|<blockquote[^>]*>[\s\S]*?<\/blockquote>|<a[^>]*>\s*<img[^>]*\/?\s*>\s*<\/a>|<img[^>]*\/?\s*>)/gi;

  let lastIndex = 0;
  let match;
  const regex = new RegExp(blockPattern, 'gi');

  while ((match = regex.exec(normalized)) !== null) {
    // Handle text before this block
    const beforeText = normalized.slice(lastIndex, match.index).trim();
    if (beforeText) {
      // Split by double newlines to create paragraphs
      const paragraphs = beforeText.split(/\n\n+/);
      for (const para of paragraphs) {
        const trimmed = para.trim();
        if (trimmed) {
          const inlineContent = parseInlineContent(trimmed);
          if (inlineContent.length > 0) {
            content.push({
              type: 'paragraph',
              content: inlineContent,
            });
          }
        }
      }
    }

    const blockHtml = match[0];
    const lowerBlock = blockHtml.toLowerCase();

    // Handle different block types
    if (lowerBlock.startsWith('<table')) {
      // Table
      const table = parseTable(blockHtml);
      if (table) content.push(table);
    } else if (lowerBlock.startsWith('<p')) {
      // Paragraph
      const innerMatch = blockHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      if (innerMatch) {
        const innerHtml = innerMatch[1].trim();

        // Check if paragraph contains only an image
        if (/^\s*(<a[^>]*>)?\s*<img/i.test(innerHtml)) {
          // Extract image(s)
          const imgPattern = /<img[^>]*>/gi;
          let imgMatch;
          while ((imgMatch = imgPattern.exec(innerHtml)) !== null) {
            const imgAttrs = parseImageTag(imgMatch[0]);
            if (imgAttrs) {
              content.push({
                type: 'image',
                attrs: {
                  src: imgAttrs.src,
                  alt: imgAttrs.alt,
                  title: imgAttrs.title,
                },
              });
            }
          }
        } else if (innerHtml) {
          const inlineContent = parseInlineContent(innerHtml);
          if (inlineContent.length > 0) {
            content.push({
              type: 'paragraph',
              content: inlineContent,
            });
          }
        }
      }
    } else if (lowerBlock.startsWith('<ul')) {
      // Unordered list
      const list = parseList(blockHtml, false);
      if (list) content.push(list);
    } else if (lowerBlock.startsWith('<ol')) {
      // Ordered list
      const list = parseList(blockHtml, true);
      if (list) content.push(list);
    } else if (lowerBlock.startsWith('<h')) {
      // Heading
      const headingMatch = blockHtml.match(/<h([1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/i);
      if (headingMatch) {
        const level = parseInt(headingMatch[1], 10);
        const innerContent = parseInlineContent(headingMatch[2]);
        content.push({
          type: 'heading',
          attrs: { level },
          content: innerContent.length > 0 ? innerContent : undefined,
        });
      }
    } else if (lowerBlock.startsWith('<blockquote')) {
      // Blockquote
      const quoteMatch = blockHtml.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
      if (quoteMatch) {
        const innerContent = parseInlineContent(
          quoteMatch[1].replace(/<[^>]+>/g, '')
        );
        content.push({
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: innerContent.length > 0 ? innerContent : undefined,
            },
          ],
        });
      }
    } else if (lowerBlock.includes('<img')) {
      // Standalone image (possibly wrapped in link)
      const linkMatch = blockHtml.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/i);
      const imgMatch = blockHtml.match(/<img[^>]*>/i);

      if (imgMatch) {
        const imgAttrs = parseImageTag(imgMatch[0]);
        if (imgAttrs) {
          // If the link points to a larger image, use that as the src
          if (linkMatch) {
            const linkHref = replaceUrls(linkMatch[1]);
            // Check if link is to an image
            if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(linkHref)) {
              imgAttrs.src = linkHref;
            }
          }

          content.push({
            type: 'image',
            attrs: {
              src: imgAttrs.src,
              alt: imgAttrs.alt,
              title: imgAttrs.title,
            },
          });
        }
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Handle remaining text after last block
  const afterText = normalized.slice(lastIndex).trim();
  if (afterText) {
    const paragraphs = afterText.split(/\n\n+/);
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (trimmed) {
        const inlineContent = parseInlineContent(trimmed);
        if (inlineContent.length > 0) {
          content.push({
            type: 'paragraph',
            content: inlineContent,
          });
        }
      }
    }
  }

  // Ensure at least one paragraph
  if (content.length === 0) {
    content.push({ type: 'paragraph', content: [] });
  }

  return {
    type: 'doc',
    content,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  console.log('=== Update Pages Script ===\n');

  if (dryRun) {
    console.log('[DRY RUN MODE - No changes will be made]\n');
  }

  // Load pages.json
  const pagesPath = join(
    process.cwd(),
    '../../scripts/migration/output/pages.json'
  );
  const pages: ParsedPage[] = JSON.parse(readFileSync(pagesPath, 'utf-8'));
  console.log(`Loaded ${pages.length} pages from pages.json`);

  // Load media-url-map.json
  const urlMapPath = join(
    process.cwd(),
    '../../scripts/migration/output/media-url-map.json'
  );
  try {
    urlMap = JSON.parse(readFileSync(urlMapPath, 'utf-8'));
    console.log(`Loaded ${Object.keys(urlMap).length} URL mappings`);
  } catch {
    console.warn('Warning: Could not load media-url-map.json, URLs will not be replaced');
    urlMap = {};
  }

  // Stats
  let matched = 0;
  let updated = 0;
  let notFound = 0;
  let errors = 0;
  const notFoundSlugs: string[] = [];
  const contentLengths: { slug: string; before: number; after: number }[] = [];

  console.log('\nProcessing pages...\n');

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    try {
      // Find existing page by slug
      const existing = await prisma.page.findUnique({
        where: { slug: page.slug },
      });

      if (!existing) {
        notFound++;
        notFoundSlugs.push(page.slug);
        if (verbose) {
          console.log(`  [NOT FOUND] ${page.slug}`);
        }
        continue;
      }

      matched++;

      // Convert HTML to TipTap
      const tipTapDoc = htmlToTipTap(page.content);
      const tipTapJson = JSON.stringify(tipTapDoc);

      const beforeLen = existing.content.length;
      const afterLen = tipTapJson.length;

      if (verbose) {
        console.log(`  Processing: ${page.title.substring(0, 50)}...`);
        console.log(`    - Content: ${beforeLen} -> ${afterLen} chars`);
      }

      contentLengths.push({
        slug: page.slug,
        before: beforeLen,
        after: afterLen,
      });

      if (!dryRun) {
        await prisma.page.update({
          where: { id: existing.id },
          data: {
            content: tipTapJson,
          },
        });
      }

      updated++;

      // Progress indicator
      if ((i + 1) % 20 === 0) {
        console.log(`  Progress: ${i + 1}/${pages.length}`);
      }
    } catch (error) {
      errors++;
      console.error(`  [ERROR] ${page.slug}: ${error}`);
    }
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total pages in JSON: ${pages.length}`);
  console.log(`Matched in database: ${matched}`);
  console.log(`Updated: ${updated}`);
  console.log(`Not found in database: ${notFound}`);
  console.log(`Errors: ${errors}`);

  if (notFoundSlugs.length > 0 && notFoundSlugs.length <= 20) {
    console.log('\nNot found slugs:');
    for (const slug of notFoundSlugs) {
      console.log(`  - ${slug}`);
    }
  } else if (notFoundSlugs.length > 20) {
    console.log(`\nFirst 20 not found slugs (${notFoundSlugs.length} total):`);
    for (const slug of notFoundSlugs.slice(0, 20)) {
      console.log(`  - ${slug}`);
    }
  }

  // Content length analysis
  if (contentLengths.length > 0) {
    const avgBefore = contentLengths.reduce((sum, c) => sum + c.before, 0) / contentLengths.length;
    const avgAfter = contentLengths.reduce((sum, c) => sum + c.after, 0) / contentLengths.length;
    const shortContentBefore = contentLengths.filter(c => c.before < 300).length;
    const longContentAfter = contentLengths.filter(c => c.after >= 1000).length;

    console.log('\n=== Content Length Analysis ===');
    console.log(`Average content length before: ${Math.round(avgBefore)} chars`);
    console.log(`Average content length after: ${Math.round(avgAfter)} chars`);
    console.log(`Pages with short content before (<300 chars): ${shortContentBefore}`);
    console.log(`Pages with substantial content after (>=1000 chars): ${longContentAfter}`);
  }

  if (dryRun) {
    console.log('\n[DRY RUN] No changes were made to the database.');
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
