'use client';

import { DOCUMENT_CATEGORIES } from '@repo/shared';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  FolderOpen,
  Search,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

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
  documents: Document[];
  pagination: Pagination;
  years: number[];
  counts: Record<string, number>;
  activeCategory?: string | undefined;
  activeYear?: number | undefined;
  searchQuery?: string | undefined;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('hr-HR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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
  documents,
  pagination,
  years,
  counts,
  activeCategory,
  activeYear,
  searchQuery: initialSearchQuery,
}: DocumentsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(initialSearchQuery || '');
  const [showFilters, setShowFilters] = useState(false);

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
    updateUrl({ pretraga: searchInput || undefined });
  };

  const clearFilters = () => {
    setSearchInput('');
    startTransition(() => {
      router.push('/dokumenti', { scroll: false });
    });
  };

  const hasActiveFilters = activeCategory || activeYear || initialSearchQuery;
  const totalDocuments = Object.values(counts).reduce((sum, count) => sum + count, 0);

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
            dokumenti. Ukupno {totalDocuments} dokumenata.
          </p>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          {/* Search and filter toggle */}
          <div className="flex items-center gap-3 py-3">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Pretraži dokumente..."
                className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateUrl({ pretraga: undefined });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filteri</span>
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                  {(activeCategory ? 1 : 0) + (activeYear ? 1 : 0) + (initialSearchQuery ? 1 : 0)}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-full px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Očisti</span>
              </button>
            )}
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div className="border-t border-neutral-100 py-4">
              {/* Year filter */}
              <div className="mb-4">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <Calendar className="h-3.5 w-3.5" />
                  Godina
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleYearChange(undefined)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      !activeYear
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Sve godine
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

              {/* Category filter */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <FolderOpen className="h-3.5 w-3.5" />
                  Kategorija
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange(undefined)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      !activeCategory
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Sve kategorije
                  </button>
                  {Object.entries(DOCUMENT_CATEGORIES).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleCategoryChange(key)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        activeCategory === key
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      <span>{categoryIcons[key]}</span>
                      <span>{label}</span>
                      {counts[key] && (
                        <span
                          className={`ml-1 text-xs ${
                            activeCategory === key ? 'text-primary-200' : 'text-neutral-500'
                          }`}
                        >
                          ({counts[key]})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-neutral-500">Aktivni filteri:</span>
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
            {initialSearchQuery && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                &quot;{initialSearchQuery}&quot;
                <button
                  onClick={() => {
                    setSearchInput('');
                    updateUrl({ pretraga: undefined });
                  }}
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
          {isPending && (
            <div className="flex items-center gap-2 text-sm text-primary-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
              Učitavanje...
            </div>
          )}
        </div>

        {/* Document list */}
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
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
                    {doc.fileSize && (
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {formatFileSize(doc.fileSize)}
                      </span>
                    )}
                    <span className="text-neutral-400">{formatDate(doc.createdAt)}</span>
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
        ) : (
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
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Link
              href={`/dokumenti?${new URLSearchParams({
                ...(activeCategory && { kategorija: activeCategory }),
                ...(activeYear && { godina: activeYear.toString() }),
                ...(initialSearchQuery && { pretraga: initialSearchQuery }),
                stranica: Math.max(1, pagination.page - 1).toString(),
              }).toString()}`}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                pagination.page <= 1
                  ? 'pointer-events-none text-neutral-300'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
              aria-disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <Link
                    key={pageNum}
                    href={`/dokumenti?${new URLSearchParams({
                      ...(activeCategory && { kategorija: activeCategory }),
                      ...(activeYear && { godina: activeYear.toString() }),
                      ...(initialSearchQuery && { pretraga: initialSearchQuery }),
                      stranica: pageNum.toString(),
                    }).toString()}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      pageNum === pagination.page
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
              href={`/dokumenti?${new URLSearchParams({
                ...(activeCategory && { kategorija: activeCategory }),
                ...(activeYear && { godina: activeYear.toString() }),
                ...(initialSearchQuery && { pretraga: initialSearchQuery }),
                stranica: Math.min(pagination.totalPages, pagination.page + 1).toString(),
              }).toString()}`}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                pagination.page >= pagination.totalPages
                  ? 'pointer-events-none text-neutral-300'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
              aria-disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <p className="mt-4 text-center text-sm text-neutral-500">
            Stranica {pagination.page} od {pagination.totalPages}
          </p>
        )}
      </div>
    </div>
  );
}
