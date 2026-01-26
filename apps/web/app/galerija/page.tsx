import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';
import { Suspense } from 'react';

import { GalleryPageClient } from './gallery-page-client';

import type { Metadata } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

export const metadata: Metadata = {
  title: 'Galerija',
  description: 'Foto galerija Općine Veliki Bukovec.',
  alternates: {
    canonical: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/galerija'),
  },
  openGraph: {
    title: 'Galerija - Općina Veliki Bukovec',
    description: 'Foto galerija Općine Veliki Bukovec.',
    type: 'website',
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/galerija'),
  },
};

function GalleryPageFallback() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 h-4 w-64 animate-pulse rounded bg-neutral-200" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-lg bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<GalleryPageFallback />}>
      <GalleryPageClient />
    </Suspense>
  );
}
