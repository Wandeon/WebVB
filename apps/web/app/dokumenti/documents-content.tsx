'use client';

import { DOCUMENT_CATEGORIES, getPublicEnv } from '@repo/shared';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  FolderOpen,
  Search,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';

interface Document {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: number | null;
  category: string;
  year: number | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DocumentsContentProps {
  initialDocuments: Document[];
  initialPagination: Pagination;
  years: number[];
  counts: Record<string, number>;
}

const { NEXT_PUBLIC_API_URL } = getPublicEnv();
const API_URL = NEXT_PUBLIC_API_URL;

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeLabel(fileUrl: string): string {
  const urlWithoutQuery = fileUrl.split('?')[0] ?? '';
  const extension = urlWithoutQuery.split('.').pop()?.trim();
  return extension ? extension.toUpperCase() : 'Datoteka';
}

const categoryIcons: Record<string, string> = {
  sjednice: '📋',
  proracun: '💰',
  planovi: '🗺️',
  javna_nabava: '📦',
  izbori: '🗳️',
  obrasci: '📝',
  odluke_nacelnika: '⚖️',
  strateski_dokumenti: '📊',
  zakoni_i_propisi: '📜',
  ostalo: '📁',
};

export function DocumentsContent({
  initialDocuments,
  initialPagination,
  years,
  counts,
}: DocumentsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Parse URL params
  const categoryParam = searchParams.get('kategorija');
  const activeCategory = categoryParam && categoryParam in DOCUMENT_CATEGORIES ? categoryParam : undefined;
  const yearParam = searchParams.get('godina');
  const activeYear = yearParam ? parseInt(yearParam, 10) : undefined;
  const pageParam = searchParams.get('stranica');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const rawSearchQuery = searchParams.get('pretraga') ?? searchParams.get('search') ?? '';
  const normalizedSearchQuery = rawSearchQuery.trim();
  const searchQuery = normalizedSearchQuery.length >= 2 ? normalizedSearchQuery : undefined;

  const [searchInput, setSearchInput] = useState(rawSearchQuery);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(rawSearchQuery);
  }, [rawSearchQuery]);

  useEffect(() => {
    const legacySearch = searchParams.get('search');
    const canonicalSearch = searchParams.get('pretraga');

    if (legacySearch && !canonicalSearch) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('search');
      params.set('pretraga', legacySearch);
      router.replace(`/dokumenti?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams]);

  // Check if we need to fetch (any filter active)
  const hasActiveFilters = activeCategory || activeYear || searchQuery || currentPage > 1;

  // Fetch documents when filters change
  useEffect(() => {
    if (!hasActiveFilters) {
      setDocuments(initialDocuments);
      setPagination(initialPagination);
      return;
    }

    const controller = new AbortController();

    async function fetchDocuments() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (activeCategory) params.set('category', activeCategory);
        if (activeYear && Number.isFinite(activeYear)) params.set('year', activeYear.toString());
        if (searchQuery) params.set('search', searchQuery);
        params.set('page', currentPage.toString());
        params.set('limit', '20');

        const response = await fetch(
          `${API_URL}/api/public/documents?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }

        const result = (await response.json()) as {
          success: boolean;
          data?: { documents: Document[]; pagination: Pagination };
          error?: { message: string };
        };

        if (result.success && result.data) {
          setDocuments(result.data.documents);
          setPagination(result.data.pagination);
        } else {
          throw new Error(result.error?.message ?? 'Failed to fetch documents');
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError('Ne možemo učitati dokumente. Pokušajte ponovno.');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchDocuments();

    return () => {
      controller.abort();
    };
  }, [activeCategory, activeYear, searchQuery, currentPage, hasActiveFilters, initialDocuments, initialPagination]);

  const updateUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change (except when changing page)
      if (!('stranica' in updates)) {
        params.delete('stranica');
      }

      startTransition(() => {
        router.push(`/dokumenti?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  const handleCategoryChange = (category: string | undefined) => {
    updateUrl({ kategorija: category });
  };

  const handleYearChange = (year: number | undefined) => {
    updateUrl({ godina: year?.toString() });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim().length >= 2) {
      updateUrl({ pretraga: searchInput.trim() });
    } else if (searchInput.trim().length === 0) {
      updateUrl({ pretraga: undefined });
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    updateUrl({ pretraga: undefined });
  };

  const clearFilters = () => {
    setSearchInput('');
    startTransition(() => {
      router.push('/dokumenti', { scroll: false });
    });
  };

  const totalDocuments = useMemo(
    () => Object.values(counts).reduce((sum, count) => sum + count, 0),
    [counts]
  );

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (activeCategory) params.set('kategorija', activeCategory);
    if (activeYear) params.set('godina', activeYear.toString());
    if (searchQuery) params.set('pretraga', searchQuery);
    params.set('stranica', page.toString());
    return `/dokumenti?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-primary-200">
            <Link href="/" className="hover:text-white">
              Naslovnica
            </Link>
            <span>/</span>
            <span className="text-white">Dokumenti</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
            Dokumenti
          </h1>
          <p className="mt-2 max-w-2xl text-primary-100">
            Službeni dokumenti Općine Veliki Bukovec - sjednice, proračun, planovi i drugi javni
            dokumenti.
          </p>
        </div>
      </div>

      {/* Main content with sidebar */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar - Filters (always visible on desktop) */}
          <aside className="w-full flex-shrink-0 lg:w-72">
            <div className="lg:sticky lg:top-24">
              {/* Search */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <Search className="h-4 w-4 text-primary-600" />
                  Pretraži dokumente
                </h3>
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Unesite pojam pretraživanja..."
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-4 pr-10 text-sm transition-colors focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                    {searchInput && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="mt-2 w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                  >
                    Pretraži
                  </button>
                </form>
                {searchInput.length > 0 && searchInput.length < 2 && (
                  <p className="mt-2 text-xs text-neutral-500">Minimalno 2 znaka</p>
                )}
              </div>

              {/* Category filter */}
              <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <FolderOpen className="h-4 w-4 text-primary-600" />
                  Kategorija
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryChange(undefined)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      !activeCategory
                        ? 'bg-primary-50 font-medium text-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span>Sve kategorije</span>
                    <span className="text-xs text-neutral-500">{totalDocuments}</span>
                  </button>
                  {Object.entries(DOCUMENT_CATEGORIES).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleCategoryChange(key)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        activeCategory === key
                          ? 'bg-primary-50 font-medium text-primary-700'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{categoryIcons[key]}</span>
                        <span>{label}</span>
                      </span>
                      {counts[key] ? (
                        <span className="text-xs text-neutral-500">{counts[key]}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year filter */}
              <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <Calendar className="h-4 w-4 text-primary-600" />
                  Godina
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleYearChange(undefined)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      !activeYear
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Sve
                  </button>
                  {years.slice(0, 10).map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearChange(year)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        activeYear === year
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  <X className="h-4 w-4" />
                  Očisti sve filtere
                </button>
              )}
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            {/* Active filters display */}
            {hasActiveFilters && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-neutral-500">Aktivni filteri:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                    <Search className="h-3 w-3" />
                    &quot;{searchQuery}&quot;
                    <button
                      onClick={clearSearch}
                      className="ml-1 hover:text-primary-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {activeCategory && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                    {categoryIcons[activeCategory]} {DOCUMENT_CATEGORIES[activeCategory as keyof typeof DOCUMENT_CATEGORIES]}
                    <button
                      onClick={() => handleCategoryChange(undefined)}
                      className="ml-1 hover:text-primary-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {activeYear && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                    {activeYear}
                    <button
                      onClick={() => handleYearChange(undefined)}
                      className="ml-1 hover:text-primary-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Results count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                {pagination.total === 0
                  ? 'Nema rezultata'
                  : pagination.total === 1
                    ? '1 dokument'
                    : `${pagination.total} dokumenata`}
                {hasActiveFilters && ' pronađeno'}
              </p>
              {(isPending || isLoading) && (
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
                  Učitavanje...
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
                <button
                  onClick={() => window.location.reload()}
                  className="ml-2 font-medium underline hover:no-underline"
                >
                  Pokušaj ponovno
                </button>
              </div>
            )}

            {/* Document list */}
            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${doc.title} (otvara se u novoj kartici)`}
                    className="group flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-primary-200 hover:shadow-md md:items-center"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-2xl transition-colors group-hover:bg-primary-100">
                      {categoryIcons[doc.category] || '📄'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-neutral-900 group-hover:text-primary-700">
                        {doc.title}
                      </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <FolderOpen className="h-3.5 w-3.5" />
                        {DOCUMENT_CATEGORIES[doc.category as keyof typeof DOCUMENT_CATEGORIES] || doc.category}
                      </span>
                        {doc.year && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {doc.year}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {getFileTypeLabel(doc.fileUrl)}
                          {doc.fileSize ? ` • ${formatFileSize(doc.fileSize)}` : ''}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                          Otvara se u novoj kartici
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                        <Download className="h-5 w-5" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : !isLoading && (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-neutral-300" />
                <h3 className="mt-4 font-semibold text-neutral-900">Nema dokumenata</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  {hasActiveFilters
                    ? 'Nema dokumenata koji odgovaraju vašim kriterijima. Pokušajte promijeniti filtere.'
                    : 'Trenutno nema dostupnih dokumenata.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    Očisti filtere
                  </button>
                )}
                {!hasActiveFilters && (
                  <p className="mt-3 text-sm text-neutral-500">
                    Trebate određeni dokument? Javite nam se putem{' '}
                    <Link href="/kontakt" className="text-primary-600 hover:underline">
                      kontakt obrasca
                    </Link>
                    .
                  </p>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Link
                  href={buildPageUrl(Math.max(1, currentPage - 1))}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    currentPage <= 1
                      ? 'pointer-events-none text-neutral-300'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                  aria-disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Link
                        key={pageNum}
                        href={buildPageUrl(pageNum)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                          pageNum === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                <Link
                  href={buildPageUrl(Math.min(pagination.totalPages, currentPage + 1))}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    currentPage >= pagination.totalPages
                      ? 'pointer-events-none text-neutral-300'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                  aria-disabled={currentPage >= pagination.totalPages}
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            )}

            {pagination.totalPages > 1 && (
              <p className="mt-4 text-center text-sm text-neutral-500">
                Stranica {currentPage} od {pagination.totalPages}
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
