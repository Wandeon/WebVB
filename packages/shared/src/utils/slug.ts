import { PAGE_SLUG_SEGMENT_REGEX } from '../constants';

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
