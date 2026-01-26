'use client';

import { DOCUMENT_CATEGORY_OPTIONS } from '@repo/shared';
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
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InitialDocumentsData {
  documents: Document[];
  years: number[];
  counts: Record<string, number>;
  pagination: PaginationData;
}

interface DocumentsPageClientProps {
  initialData: InitialDocumentsData;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function DocumentsPageClient({ initialData }: DocumentsPageClientProps) {
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>(initialData.documents);
  const [years, setYears] = useState<number[]>(initialData.years);
  const [counts, setCounts] = useState<Record<string, number>>(initialData.counts);
  const [pagination, setPagination] = useState<PaginationData>(initialData.pagination);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const category = searchParams.get('kategorija') || undefined;
  const yearParam = searchParams.get('godina');
  const year = yearParam ? parseInt(yearParam, 10) : undefined;
  const pageParam = searchParams.get('stranica');
  const rawPage = pageParam ? parseInt(pageParam, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const needsFetch = category || year || page > 1;

  useEffect(() => {
    if (!needsFetch) {
      setDocuments(initialData.documents);
      setYears(initialData.years);
      setCounts(initialData.counts);
      setPagination(initialData.pagination);
      return;
    }

    async function fetchDocuments() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (year && Number.isFinite(year)) params.set('year', String(year));
        params.set('page', String(page));
        params.set('limit', '20');

        const response = await fetch(`${API_URL}/api/public/documents?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setDocuments(data.documents);
          setPagination(data.pagination);
          setYears(data.years || []);
          setCounts(data.counts || {});
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, [category, year, page, needsFetch, initialData]);

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
            {isLoading ? (
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
                      createdAt={new Date(doc.createdAt)}
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
