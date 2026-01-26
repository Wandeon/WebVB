export type OrganizationJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone?: string;
    email?: string;
    contactType?: string;
  };
};

export type ArticleJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage: string;
  image?: string[];
};

export type EventJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'Event';
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
  url: string;
  image?: string[];
  location?: {
    '@type': 'Place';
    name: string;
    address?: string;
  };
};

export type OrganizationJsonLdInput = Omit<OrganizationJsonLd, '@context' | '@type'>;
export type ArticleJsonLdInput = Omit<ArticleJsonLd, '@context' | '@type'>;
export type EventJsonLdInput = Omit<EventJsonLd, '@context' | '@type'>;

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export function truncateText(text: string, length: number): string {
  if (length <= 0) return '';
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function buildCanonicalUrl(siteUrl: string, path: string): string {
  return new URL(path, siteUrl).toString();
}

export function createOrganizationJsonLd(
  input: OrganizationJsonLdInput
): OrganizationJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    ...input,
  };
}

export function createArticleJsonLd(input: ArticleJsonLdInput): ArticleJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    ...input,
  };
}

export function createEventJsonLd(input: EventJsonLdInput): EventJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    ...input,
  };
}
