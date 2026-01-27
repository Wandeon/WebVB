import { generateHTML } from '@tiptap/html';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';
import DOMPurify from 'isomorphic-dompurify';

import type { JSONContent } from '@tiptap/core';

import { cn } from '../lib/utils';

export interface ArticleContentProps {
  content: string;
  className?: string;
}

// TipTap extensions for HTML generation
// Note: StarterKit includes most common extensions, we add Link and Image
const extensions = [
  StarterKit.configure({
    // Disable any conflicting extensions
  }),
  Link,
  Image,
];

/**
 * Check if content is TipTap JSON format
 */
function isTipTapJson(content: string): boolean {
  if (!content.startsWith('{')) return false;
  try {
    const parsed = JSON.parse(content) as unknown;
    return (
      typeof parsed === 'object' &&
      parsed !== null &&
      'type' in parsed &&
      (parsed as { type: string }).type === 'doc'
    );
  } catch {
    return false;
  }
}

/**
 * Convert TipTap JSON to HTML
 */
function tipTapToHtml(jsonContent: string): string {
  try {
    const doc = JSON.parse(jsonContent) as JSONContent;
    return generateHTML(doc, extensions);
  } catch (error) {
    console.error('Failed to convert TipTap JSON to HTML:', error);
    return '<p>Error loading content</p>';
  }
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  // Convert TipTap JSON to HTML if needed
  const htmlContent = isTipTapJson(content) ? tipTapToHtml(content) : content;

  const sanitizedContent = DOMPurify.sanitize(htmlContent, {
    USE_PROFILES: { html: true },
  });

  return (
    <article
      className={cn(
        'prose prose-neutral max-w-none',
        'prose-headings:font-display prose-headings:font-semibold',
        'prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline',
        'prose-img:rounded-lg',
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
