import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';
import { Suspense } from 'react';

import { DocumentsPageClient } from './documents-page-client';

import type { Metadata } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

export const metadata: Metadata = {
  title: 'Dokumenti',
  description:
    'Službeni dokumenti Općine Veliki Bukovec - sjednice, proračun, planovi, javna nabava i drugi javni dokumenti.',
  alternates: {
    canonical: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/dokumenti'),
  },
  openGraph: {
    title: 'Dokumenti - Općina Veliki Bukovec',
    description: 'Pristupite službenim dokumentima općine.',
    type: 'website',
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/dokumenti'),
  },
};

function DocumentsPageFallback() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 h-4 w-64 animate-pulse rounded bg-neutral-200" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[250px,1fr]">
        <div className="hidden h-64 animate-pulse rounded-lg bg-neutral-200 lg:block" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-neutral-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<DocumentsPageFallback />}>
      <DocumentsPageClient />
    </Suspense>
  );
}
