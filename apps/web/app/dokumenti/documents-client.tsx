'use client';

import {
  DocumentCard,
  DocumentSearch,
  FadeIn,
  Pagination,
  YearFilter,
} from '@repo/ui';
import { useMemo, useState } from 'react';

import type { DocumentWithUploader } from '@repo/database';

interface DocumentsClientProps {
  documents: DocumentWithUploader[];
  years: number[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function DocumentsClient({
  documents,
  years,
  pagination,
}: DocumentsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter((doc) =>
      doc.title.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  return (
    <>
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
      {filteredDocuments.length > 0 ? (
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

      {/* Pagination - only show if not searching and more than 1 page */}
      {!searchQuery && pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            baseUrl="/dokumenti"
          />
        </div>
      )}
    </>
  );
}
