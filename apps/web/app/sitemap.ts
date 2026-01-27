import {
  eventsRepository,
  galleriesRepository,
  postsRepository,
} from '@repo/database';
import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';

import type { MetadataRoute } from 'next';

// Required for static export - sitemap is generated at build time
export const dynamic = 'force-static';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

const staticRoutes = [
  '/',
  '/vijesti',
  '/dogadanja',
  '/dokumenti',
  '/galerija',
  '/kontakt',
  '/prijava-problema',
  '/organizacija',
  '/organizacija/uprava',
  '/organizacija/vijece',
  '/organizacija/sjednice',
  '/organizacija/juo',
  '/rad-uprave',
  '/rad-uprave/komunalno',
  '/rad-uprave/udruge',
  '/rad-uprave/mjestani',
  '/rad-uprave/registri',
  '/opcina',
  '/opcina/o-nama',
  '/opcina/turizam',
  '/opcina/povijest',
  '/dokumenti/glasnik',
  '/dokumenti/proracun',
  '/dokumenti/prostorni-planovi',
  '/dokumenti/pravo-na-pristup-informacijama',
  '/natjecaji',
  '/odvoz-otpada',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, events, galleries] = await Promise.all([
    postsRepository.findPublishedForSitemap(),
    eventsRepository.findAllForSitemap(),
    galleriesRepository.findAllForSitemap(),
  ]);

  const staticEntries = staticRoutes.map((path) => ({
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, path),
    lastModified: new Date(),
  }));

  const postEntries = posts.map((post) => ({
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, `/vijesti/${post.slug}`),
    lastModified: post.updatedAt ?? post.publishedAt ?? new Date(),
  }));

  const eventEntries = events.map((event) => ({
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, `/dogadanja/${event.id}`),
    lastModified: event.updatedAt ?? event.eventDate,
  }));

  const galleryEntries = galleries.map((gallery) => ({
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, `/galerija/${gallery.slug}`),
    lastModified: gallery.createdAt,
  }));

  return [
    ...staticEntries,
    ...postEntries,
    ...eventEntries,
    ...galleryEntries,
  ];
}
