'use client';

import { DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_OPTIONS } from '@repo/shared';
import {
  DocumentAccordion,
  DocumentCard,
  DocumentSearch,
  DocumentSidebar,
  FadeIn,
  Pagination,
  YearFilter,
} from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface Document {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  createdAt: Date;
}

interface SerializedDocument {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PublicDocumentsResponse {
  success: boolean;
  data?: {
    documents: SerializedDocument[];
    pagination: Pagination;
    years: number[];
    counts: Record<string, number>;
  };
  error?: {
    message: string;
  };
}

export interface DocumentsPageInitialData {
  documents: SerializedDocument[];
  pagination: Pagination;
  years: number[];
  counts: Record<string, number>;
}

interface DocumentsPageClientProps {
  initialData: DocumentsPageInitialData;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const FETCH_TIMEOUT_MS = 10_000;

const deserializeDocument = (doc: SerializedDocument): Document => ({
  ...doc,
  createdAt: new Date(doc.createdAt),
});

export function DocumentsPageClient({ initialData }: DocumentsPageClientProps) {
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>(
    initialData.documents.map(deserializeDocument)
  );
  const [years, setYears] = useState<number[]>(initialData.years);
  const [counts, setCounts] = useState<Record<string, number>>(
    initialData.counts
  );
  const [pagination, setPagination] = useState<Pagination>(
    initialData.pagination
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categoryParam = searchParams.get('kategorija');
  const category =
    categoryParam && categoryParam in DOCUMENT_CATEGORIES
      ? categoryParam
      : undefined;
  const yearParam = searchParams.get('godina');
  const yearValue = yearParam ? parseInt(yearParam, 10) : undefined;
  const year = Number.isFinite(yearValue) ? yearValue : undefined;
  const pageParam = searchParams.get('stranica');
  const rawPage = pageParam ? parseInt(pageParam, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  // Only use initial data if we have documents AND we're on page 1 with no filters
  // For static export, initialData is empty, so we always fetch from API
  const shouldUseInitialData = useMemo(
    () => page === 1 && !category && !year && initialData.documents.length > 0,
    [category, page, year, initialData.documents.length]
  );

  useEffect(() => {
    if (shouldUseInitialData) {
      setDocuments(initialData.documents.map(deserializeDocument));
      setPagination(initialData.pagination);
      setYears(initialData.years);
      setCounts(initialData.counts);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    async function fetchDocuments() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (year && Number.isFinite(year)) params.set('year', String(year));
        params.set('page', String(page));
        params.set('limit', '20');

        const response = await fetch(
          `${API_URL}/api/public/documents?${params.toString()}`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as PublicDocumentsResponse;

        if (!response.ok || !payload.success || !payload.data) {
          setErrorMessage('Ne možemo trenutno učitati dokumente. Pokušajte ponovno.');
          return;
        }

        setDocuments(payload.data.documents.map(deserializeDocument));
        setPagination(payload.data.pagination);
        setYears(payload.data.years || []);
        setCounts(payload.data.counts || {});
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        setErrorMessage('Ne možemo trenutno učitati dokumente. Pokušajte ponovno.');
      } finally {
        setIsLoading(false);
        window.clearTimeout(timeoutId);
      }
    }

    void fetchDocuments();

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [category, initialData, page, shouldUseInitialData, year]);

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter((doc) =>
      doc.title.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

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

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <DocumentSearch onSearch={setSearchQuery} className="sm:max-w-xs" />
              <YearFilter years={years} />
            </div>

            {/* Results count */}
            <p className="mb-4 text-sm text-neutral-500">
              {searchQuery
                ? `${filteredDocuments.length} od ${documents.length} dokumenata`
                : `${pagination.total} dokumenata`}
            </p>

            {/* Document list */}
            {errorMessage ? (
              <FadeIn>
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
                  {errorMessage}
                </div>
              </FadeIn>
            ) : isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg bg-neutral-200" />
                ))}
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="space-y-3">
                {filteredDocuments.map((doc, index) => (
                  <FadeIn key={doc.id} delay={index * 0.03}>
                    <DocumentCard
                      title={doc.title}
                      fileUrl={doc.fileUrl}
                      fileSize={doc.fileSize}
                      createdAt={doc.createdAt}
                    />
                  </FadeIn>
                ))}
              </div>
            ) : (
              <FadeIn>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
                  <p className="text-neutral-600">
                    {searchQuery
                      ? `Nema rezultata za "${searchQuery}".`
                      : 'Nema dokumenata.'}
                  </p>
                </div>
              </FadeIn>
            )}

            {/* Pagination */}
            {!searchQuery && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  baseUrl="/dokumenti"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
