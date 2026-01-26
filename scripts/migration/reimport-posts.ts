/**
 * Re-import Posts Script
 * Task 1: Fix Post Content - Re-import with HTML preserved and R2 URLs
 *
 * This script re-imports posts from posts.json with proper HTML to TipTap conversion,
 * preserving images, links, formatting, and replacing WordPress URLs with R2 URLs.
 *
 * Run with: cd /mnt/c/VelikiBukovec_web/apps/admin && npx tsx ../../scripts/migration/reimport-posts.ts
 */

import { readFileSync, writeFileSync } from 'fs';
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

interface ParsedPost {
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
    // Remove Elementor artifacts
    .replace(/\[elementor[^\]]*\]/g, '')
    .trim();

  // Split into blocks (paragraphs, images, lists, etc.)
  // First, handle explicit block elements
  const blockPattern =
    /(<p[^>]*>[\s\S]*?<\/p>|<ul[^>]*>[\s\S]*?<\/ul>|<ol[^>]*>[\s\S]*?<\/ol>|<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>|<blockquote[^>]*>[\s\S]*?<\/blockquote>|<a[^>]*>\s*<img[^>]*\/?\s*>\s*<\/a>|<img[^>]*\/?\s*>)/gi;

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
    if (lowerBlock.startsWith('<p')) {
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

/**
 * Extract all image URLs from TipTap content for the images field
 */
function extractImages(
  tipTapDoc: TipTapDocument
): Array<{ url: string; caption: string }> {
  const images: Array<{ url: string; caption: string }> = [];

  function walk(node: TipTapNode) {
    if (node.type === 'image' && node.attrs?.src) {
      images.push({
        url: node.attrs.src as string,
        caption: (node.attrs.alt as string) || '',
      });
    }
    if (node.content) {
      for (const child of node.content) {
        walk(child);
      }
    }
  }

  for (const node of tipTapDoc.content) {
    walk(node);
  }

  return images;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  console.log('=== Re-import Posts Script ===\n');

  if (dryRun) {
    console.log('[DRY RUN MODE - No changes will be made]\n');
  }

  // Load posts.json
  const postsPath = join(
    process.cwd(),
    '../../scripts/migration/output/posts.json'
  );
  const posts: ParsedPost[] = JSON.parse(readFileSync(postsPath, 'utf-8'));
  console.log(`Loaded ${posts.length} posts from posts.json`);

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
  let updated = 0;
  let notFound = 0;
  let errors = 0;
  const notFoundSlugs: string[] = [];

  console.log('\nProcessing posts...\n');

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];

    try {
      // Find existing post by slug
      const existing = await prisma.post.findUnique({
        where: { slug: post.slug },
      });

      if (!existing) {
        notFound++;
        notFoundSlugs.push(post.slug);
        if (verbose) {
          console.log(`  [NOT FOUND] ${post.slug}`);
        }
        continue;
      }

      // Convert HTML to TipTap
      const tipTapDoc = htmlToTipTap(post.content);
      const tipTapJson = JSON.stringify(tipTapDoc);

      // Extract images for the images field
      const images = extractImages(tipTapDoc);

      if (verbose) {
        console.log(`  Processing: ${post.title.substring(0, 50)}...`);
        console.log(`    - Images found: ${images.length}`);
      }

      if (!dryRun) {
        await prisma.post.update({
          where: { id: existing.id },
          data: {
            content: tipTapJson,
            images: images.length > 0 ? images : null,
          },
        });
      }

      updated++;

      // Progress indicator
      if ((i + 1) % 50 === 0) {
        console.log(`  Progress: ${i + 1}/${posts.length}`);
      }
    } catch (error) {
      errors++;
      console.error(`  [ERROR] ${post.slug}: ${error}`);
    }
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total posts in JSON: ${posts.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Not found in database: ${notFound}`);
  console.log(`Errors: ${errors}`);

  if (notFoundSlugs.length > 0 && notFoundSlugs.length <= 20) {
    console.log('\nNot found slugs:');
    for (const slug of notFoundSlugs) {
      console.log(`  - ${slug}`);
    }
  }

  if (dryRun) {
    console.log('\n[DRY RUN] No changes were made to the database.');
  }

  // Save a sample output for verification
  if (posts.length > 0) {
    const samplePost = posts.find((p) => p.content.includes('<img')) || posts[0];
    const sampleTipTap = htmlToTipTap(samplePost.content);

    const samplePath = join(
      process.cwd(),
      '../../scripts/migration/output/sample-tiptap-output.json'
    );
    writeFileSync(
      samplePath,
      JSON.stringify(
        {
          original: samplePost.content,
          converted: sampleTipTap,
        },
        null,
        2
      )
    );
    console.log(`\nSample output saved to: ${samplePath}`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
