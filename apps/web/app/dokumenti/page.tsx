// apps/web/app/dokumenti/page.tsx
import { documentsRepository } from '@repo/database';
import { buildCanonicalUrl, DOCUMENT_CATEGORIES, getPublicEnv } from '@repo/shared';
import { Suspense } from 'react';

import { DocumentsContent } from './documents-content';

import type { Metadata } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

export const metadata: Metadata = {
  title: 'Dokumenti | Općina Veliki Bukovec',
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

interface DocumentsPageProps {
  searchParams: Promise<{
    kategorija?: string;
    godina?: string;
    stranica?: string;
    pretraga?: string;
  }>;
}

function DocumentsPageFallback() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-primary-700 py-12">
        <div className="container mx-auto px-4">
          <div className="h-10 w-48 animate-pulse rounded bg-white/20" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 w-32 animate-pulse rounded-full bg-neutral-200" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function getDocumentsData(params: {
  category?: string | undefined;
  year?: number | undefined;
  page?: number | undefined;
  search?: string | undefined;
}) {
  const { category, year, page = 1, search } = params;

  const validCategory =
    category && category in DOCUMENT_CATEGORIES ? category : undefined;

  const [documentsResult, years, counts] = await Promise.all([
    documentsRepository.findAll({
      category: validCategory,
      year,
      page,
      limit: 20,
      search,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    documentsRepository.getDistinctYears(),
    documentsRepository.getCategoryCounts(year),
  ]);

  return {
    documents: documentsResult.documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize,
      category: doc.category,
      year: doc.year,
      createdAt: doc.createdAt.toISOString(),
    })),
    pagination: documentsResult.pagination,
    years,
    counts,
    activeCategory: validCategory,
    activeYear: year,
  };
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const params = await searchParams;
  const category = params.kategorija;
  const year = params.godina ? parseInt(params.godina, 10) : undefined;
  const page = params.stranica ? parseInt(params.stranica, 10) : 1;
  const search = params.pretraga;

  const data = await getDocumentsData({
    category,
    year: Number.isFinite(year) ? year : undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    search,
  });

  return (
    <Suspense fallback={<DocumentsPageFallback />}>
      <DocumentsContent
        documents={data.documents}
        pagination={data.pagination}
        years={data.years}
        counts={data.counts}
        activeCategory={data.activeCategory}
        activeYear={data.activeYear}
        searchQuery={search}
      />
    </Suspense>
  );
}
