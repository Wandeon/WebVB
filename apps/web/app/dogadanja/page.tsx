import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';
import { Suspense } from 'react';

import { EventsPageClient } from './events-page-client';

import type { Metadata } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

export const metadata: Metadata = {
  title: 'Događanja',
  description: 'Kalendar događanja i aktivnosti u Općini Veliki Bukovec.',
  alternates: {
    canonical: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/dogadanja'),
  },
  openGraph: {
    title: 'Događanja - Općina Veliki Bukovec',
    description: 'Kalendar događanja i aktivnosti u Općini Veliki Bukovec.',
    type: 'website',
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/dogadanja'),
  },
};

function EventsPageFallback() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 h-4 w-64 animate-pulse rounded bg-neutral-200" />
      <div className="mt-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsPageFallback />}>
      <EventsPageClient />
    </Suspense>
  );
}
