'use client';

import { Calendar, File, FileText, Newspaper } from 'lucide-react';

import { SearchHighlight } from './search-highlight';

import type { SearchResult } from '../hooks/use-search';

const typeIcons: Record<string, typeof Newspaper> = {
  post: Newspaper,
  document: FileText,
  page: File,
  event: Calendar,
};

const typeLabels: Record<string, string> = {
  post: 'Vijest',
  document: 'Dokument',
  page: 'Stranica',
  event: 'Događaj',
};

interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
}

export function SearchResultItem({
  result,
  isSelected,
  onClick,
}: SearchResultItemProps) {
  const Icon = typeIcons[result.sourceType] ?? File;
  const typeLabel = typeLabels[result.sourceType] ?? 'Sadržaj';

  return (
    <button
      type="button"
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
      className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
        isSelected
          ? 'bg-primary-50 text-primary-900'
          : 'hover:bg-neutral-50'
      }`}
    >
      <div
        className={`mt-0.5 flex-shrink-0 rounded p-1.5 ${
          isSelected ? 'bg-primary-100' : 'bg-neutral-100'
        }`}
      >
        <Icon className="h-4 w-4 text-neutral-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <SearchHighlight
            text={result.title}
            className="block truncate font-medium text-neutral-900"
          />
          <span className="flex-shrink-0 text-xs text-neutral-500">
            {typeLabel}
          </span>
        </div>
        {result.highlights && (
          <SearchHighlight
            text={result.highlights}
            className="mt-0.5 block line-clamp-2 text-sm text-neutral-600"
          />
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
          {result.category && <span>{result.category}</span>}
          {result.category && result.date && (
            <span className="text-neutral-300">•</span>
          )}
          {result.date && <span>{result.date}</span>}
        </div>
      </div>
    </button>
  );
}
