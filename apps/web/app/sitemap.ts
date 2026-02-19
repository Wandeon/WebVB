import {
  announcementsRepository,
  eventsRepository,
  galleriesRepository,
  postsRepository,
} from '@repo/database';
import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';

import { shouldSkipDatabase } from '@/lib/build-flags';

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
  '/obavijesti',
  '/natjecaji',
  '/odvoz-otpada',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticRoutes.map((path) => ({
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, path),
    lastModified: new Date(),
  }));

  if (shouldSkipDatabase()) {
    return staticEntries;
  }

  const [posts, announcements, events, galleries] = await Promise.all([
    postsRepository.findPublishedForSitemap(),
    announcementsRepository.findPublishedForSitemap(),
    eventsRepository.findAllForSitemap(),
    galleriesRepository.findAllForSitemap(),
  ]);

  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const postEntries = posts.map((post) => ({
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, `/vijesti/${post.slug}`),
    lastModified: post.updatedAt ?? post.publishedAt ?? new Date(),
  }));

  const announcementEntries = announcements.map((announcement) => ({
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, `/obavijesti/${announcement.slug}`),
    lastModified: announcement.updatedAt ?? announcement.publishedAt ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  const recentEvents = events.filter((event) => event.eventDate >= twoYearsAgo);
  const eventEntries = recentEvents.map((event) => ({
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
    ...announcementEntries,
    ...eventEntries,
    ...galleryEntries,
  ];
}
