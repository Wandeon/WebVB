import { announcementsRepository } from '@repo/database';
import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';
import { Suspense } from 'react';

import { shouldSkipDatabase } from '@/lib/build-flags';

import { AnnouncementsPageClient } from './announcements-page-client';

import type { AnnouncementsPageInitialData } from './announcements-page-client';
import type { Metadata } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

export const metadata: Metadata = {
  title: 'Obavijesti',
  description: 'Natječaji, oglasi, javni pozivi i službene obavijesti Općine Veliki Bukovec.',
  alternates: {
    canonical: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/obavijesti'),
  },
  openGraph: {
    title: 'Obavijesti - Općina Veliki Bukovec',
    description: 'Natječaji, oglasi, javni pozivi i službene obavijesti Općine Veliki Bukovec.',
    type: 'website',
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/obavijesti'),
  },
};

function AnnouncementsPageFallback() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 h-4 w-96 animate-pulse rounded bg-neutral-200" />
      <div className="mt-8 mb-8 flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-neutral-100" />
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}

async function getInitialAnnouncementsData(): Promise<AnnouncementsPageInitialData> {
  if (shouldSkipDatabase()) {
    return {
      announcements: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
    };
  }

  const result = await announcementsRepository.findPublished({
    page: 1,
    limit: 12,
    activeOnly: true,
  });

  const announcements = result.announcements.map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    excerpt: announcement.excerpt,
    slug: announcement.slug,
    category: announcement.category as 'natjecaj' | 'oglas' | 'poziv' | 'obavijest',
    validFrom: announcement.validFrom ? announcement.validFrom.toISOString() : null,
    validUntil: announcement.validUntil ? announcement.validUntil.toISOString() : null,
    publishedAt: announcement.publishedAt ? announcement.publishedAt.toISOString() : null,
    attachments: announcement.attachments.map((att) => ({
      id: att.id,
      fileName: att.fileName,
      fileUrl: att.fileUrl,
      fileSize: att.fileSize,
      mimeType: att.mimeType,
    })),
  }));

  return {
    announcements,
    pagination: result.pagination,
  };
}

export default async function AnnouncementsPage() {
  const initialData = await getInitialAnnouncementsData();

  return (
    <Suspense fallback={<AnnouncementsPageFallback />}>
      <AnnouncementsPageClient initialData={initialData} />
    </Suspense>
  );
}
