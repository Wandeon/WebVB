import { documentsRepository } from '@repo/database';
import { buildCanonicalUrl, DOCUMENT_CATEGORY_OPTIONS, getPublicEnv } from '@repo/shared';
import {
  DocumentAccordion,
  DocumentSidebar,
  FadeIn,
} from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { DocumentsClient } from './documents-client';

import type { Metadata } from 'next';

export const revalidate = 60;

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

interface DocumentsPageProps {
  searchParams: Promise<{
    kategorija?: string;
    godina?: string;
    stranica?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: DocumentsPageProps): Promise<Metadata> {
  const { kategorija } = await searchParams;
  const categoryLabel = kategorija
    ? DOCUMENT_CATEGORY_OPTIONS.find((c) => c.value === kategorija)?.label
    : null;

  return {
    title: categoryLabel ? `${categoryLabel} - Dokumenti` : 'Dokumenti',
    description:
      'Službeni dokumenti Općine Veliki Bukovec - sjednice, proračun, planovi, javna nabava i drugi javni dokumenti.',
    alternates: {
      canonical: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/dokumenti'),
    },
    openGraph: {
      title: categoryLabel
        ? `${categoryLabel} - Dokumenti - Općina Veliki Bukovec`
        : 'Dokumenti - Općina Veliki Bukovec',
      description: 'Pristupite službenim dokumentima općine.',
      type: 'website',
      url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/dokumenti'),
    },
  };
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const params = await searchParams;
  const category = params.kategorija;
  const year = params.godina ? parseInt(params.godina, 10) : undefined;
  const page = params.stranica ? parseInt(params.stranica, 10) : 1;

  const [{ documents, pagination }, counts, years] = await Promise.all([
    documentsRepository.findAll({
      category,
      year: Number.isFinite(year) ? year : undefined,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    documentsRepository.getCategoryCounts(Number.isFinite(year) ? year : undefined),
    documentsRepository.getDistinctYears(),
  ]);

  return (
    <>
      {/* Back link */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Povratak na početnu
        </Link>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 pb-6">
        <FadeIn>
          <h1 className="font-display text-3xl font-bold text-neutral-900 md:text-4xl">
            Dokumenti
          </h1>
          <p className="mt-2 text-neutral-600">
            Službeni dokumenti Općine Veliki Bukovec
          </p>
        </FadeIn>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid gap-8 lg:grid-cols-[250px,1fr]">
          {/* Sidebar - Desktop */}
          <FadeIn className="hidden lg:block">
            <div className="sticky top-8">
              <DocumentSidebar
                categories={DOCUMENT_CATEGORY_OPTIONS}
                activeCategory={category}
                counts={counts}
              />
            </div>
          </FadeIn>

          {/* Main content area */}
          <div>
            {/* Mobile accordion */}
            <div className="mb-6 lg:hidden">
              <DocumentAccordion
                categories={DOCUMENT_CATEGORY_OPTIONS}
                activeCategory={category}
                counts={counts}
              />
            </div>

            {/* Client wrapper for search and filtering */}
            <DocumentsClient
              documents={documents}
              years={years}
              pagination={pagination}
            />
          </div>
        </div>
      </div>
    </>
  );
}
