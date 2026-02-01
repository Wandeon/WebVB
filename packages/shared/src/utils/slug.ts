import { PAGE_SLUG_SEGMENT_REGEX, RESERVED_PAGE_SLUGS } from '../constants';

const RESERVED_PAGE_SLUG_SET = new Set<string>(RESERVED_PAGE_SLUGS);

export function isValidPageSlug(slug: string): boolean {
  if (!slug) {
    return false;
  }

  if (slug.startsWith('/') || slug.endsWith('/')) {
    return false;
  }

  const segments = slug.split('/');

  return segments.every((segment) => PAGE_SLUG_SEGMENT_REGEX.test(segment));
}

export function isReservedPageSlug(slug: string): boolean {
  if (!slug) {
    return false;
  }

  const firstSegment = slug.split('/')[0] ?? '';
  return RESERVED_PAGE_SLUG_SET.has(firstSegment);
}
