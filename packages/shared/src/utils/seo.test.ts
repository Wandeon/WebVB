import { describe, expect, it } from 'vitest';

import {
  buildCanonicalUrl,
  createArticleJsonLd,
  createEventJsonLd,
  createOrganizationJsonLd,
  stripHtmlTags,
  truncateText,
} from './seo';

describe('seo utils', () => {
  it('strips HTML tags from text', () => {
    expect(stripHtmlTags('<p>Pozdrav <strong>svima</strong></p>')).toBe('Pozdrav svima');
  });

  it('truncates long text with ellipsis', () => {
    expect(truncateText('Veliki Bukovec', 6)).toBe('Veliki...');
  });

  it('returns original text when within limit', () => {
    expect(truncateText('Općina', 20)).toBe('Općina');
  });

  it('builds canonical URLs from base and path', () => {
    expect(buildCanonicalUrl('https://example.com', '/vijesti')).toBe('https://example.com/vijesti');
  });

  it('creates organization structured data payload', () => {
    const jsonLd = createOrganizationJsonLd({
      name: 'Općina Veliki Bukovec',
      url: 'https://example.com',
      logo: 'https://example.com/logo.png',
    });

    expect(jsonLd['@type']).toBe('Organization');
    expect(jsonLd.name).toBe('Općina Veliki Bukovec');
  });

  it('creates article structured data payload', () => {
    const jsonLd = createArticleJsonLd({
      headline: 'Naslov vijesti',
      description: 'Opis vijesti',
      datePublished: '2026-01-25T10:00:00.000Z',
      author: { '@type': 'Organization', name: 'Općina Veliki Bukovec' },
      publisher: {
        '@type': 'Organization',
        name: 'Općina Veliki Bukovec',
        logo: { '@type': 'ImageObject', url: 'https://example.com/logo.png' },
      },
      mainEntityOfPage: 'https://example.com/vijesti/novost',
    });

    expect(jsonLd['@type']).toBe('Article');
    expect(jsonLd.headline).toBe('Naslov vijesti');
    expect(jsonLd.publisher.logo?.url).toBe('https://example.com/logo.png');
  });

  it('creates event structured data payload with location', () => {
    const jsonLd = createEventJsonLd({
      name: 'Sajam',
      startDate: '2026-02-01',
      url: 'https://example.com/dogadanja/1',
      location: {
        '@type': 'Place',
        name: 'Trg',
        address: 'Veliki Bukovec',
      },
    });

    expect(jsonLd['@type']).toBe('Event');
    expect(jsonLd.location?.address).toBe('Veliki Bukovec');
  });
});
