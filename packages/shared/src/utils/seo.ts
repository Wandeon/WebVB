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

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export type BreadcrumbListJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
};

export type LocalBusinessJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'GovernmentOffice';
  name: string;
  url: string;
  logo?: string;
  image?: string;
  description?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  email?: string;
  openingHoursSpecification?: Array<{
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
};

export type ImageGalleryJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'ImageGallery';
  name: string;
  description?: string;
  url: string;
  dateCreated?: string;
  numberOfItems: number;
  image?: string[];
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

export function createBreadcrumbListJsonLd(
  items: BreadcrumbItem[]
): BreadcrumbListJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function createLocalBusinessJsonLd(
  input: Omit<LocalBusinessJsonLd, '@context' | '@type'>
): LocalBusinessJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOffice',
    ...input,
  };
}

export function createImageGalleryJsonLd(
  input: Omit<ImageGalleryJsonLd, '@context' | '@type'>
): ImageGalleryJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    ...input,
  };
}
