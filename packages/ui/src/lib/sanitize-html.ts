import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_INLINE_TAGS = ['mark', 'strong', 'em'];

export function sanitizeInlineHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ALLOWED_INLINE_TAGS,
    ALLOWED_ATTR: [],
  });
}
