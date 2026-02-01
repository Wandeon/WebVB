import DOMPurify from 'isomorphic-dompurify';

import { cn } from '../lib/utils';

export interface ArticleContentProps {
  content: string;
  className?: string;
}

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

interface TipTapDoc {
  type: 'doc';
  content?: TipTapNode[];
}

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
 * Convert TipTap marks to HTML tags
 */
function renderMarks(text: string, marks?: TipTapNode['marks']): string {
  if (!marks || marks.length === 0) return text;

  let result = text;
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        result = `<strong>${result}</strong>`;
        break;
      case 'italic':
        result = `<em>${result}</em>`;
        break;
      case 'underline':
        result = `<u>${result}</u>`;
        break;
      case 'strike':
        result = `<s>${result}</s>`;
        break;
      case 'code':
        result = `<code>${result}</code>`;
        break;
      case 'link': {
        const rawHref = mark.attrs?.href;
        const rawTarget = mark.attrs?.target;
        const href = typeof rawHref === 'string' ? rawHref : '#';
        const target = typeof rawTarget === 'string' ? rawTarget : '_blank';
        result = `<a href="${href}" target="${target}" rel="noopener noreferrer">${result}</a>`;
        break;
      }
    }
  }
  return result;
}

/**
 * Recursively convert TipTap node to HTML
 */
function nodeToHtml(node: TipTapNode): string {
  // Text node
  if (node.type === 'text' && node.text) {
    return renderMarks(node.text, node.marks);
  }

  // Get children HTML
  const childrenHtml = node.content?.map(nodeToHtml).join('') ?? '';

  switch (node.type) {
    case 'doc':
      return childrenHtml;

    case 'paragraph':
      return `<p>${childrenHtml}</p>`;

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 2;
      return `<h${level}>${childrenHtml}</h${level}>`;
    }

    case 'bulletList':
      return `<ul>${childrenHtml}</ul>`;

    case 'orderedList':
      return `<ol>${childrenHtml}</ol>`;

    case 'listItem':
      return `<li>${childrenHtml}</li>`;

    case 'blockquote':
      return `<blockquote>${childrenHtml}</blockquote>`;

    case 'codeBlock':
      return `<pre><code>${childrenHtml}</code></pre>`;

    case 'horizontalRule':
      return '<hr />';

    case 'hardBreak':
      return '<br />';

    case 'image': {
      const rawSrc = node.attrs?.src;
      const rawAlt = node.attrs?.alt;
      const rawTitle = node.attrs?.title;
      const src = typeof rawSrc === 'string' ? rawSrc : '';
      const alt = typeof rawAlt === 'string' ? rawAlt : '';
      const title = typeof rawTitle === 'string' ? rawTitle : '';
      return `<img src="${src}" alt="${alt}" title="${title}" />`;
    }

    case 'table':
      return `<table>${childrenHtml}</table>`;

    case 'tableRow':
      return `<tr>${childrenHtml}</tr>`;

    case 'tableHeader':
      return `<th>${childrenHtml}</th>`;

    case 'tableCell':
      return `<td>${childrenHtml}</td>`;

    default:
      // Unknown node type, just return children
      return childrenHtml;
  }
}

/**
 * Convert TipTap JSON to HTML
 */
function tipTapToHtml(jsonContent: string): string {
  try {
    const doc = JSON.parse(jsonContent) as TipTapDoc;
    return nodeToHtml(doc as TipTapNode);
  } catch {
    return '<p>Sadržaj trenutno nije moguće prikazati.</p>';
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
