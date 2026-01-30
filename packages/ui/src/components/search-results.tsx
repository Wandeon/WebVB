'use client';

import { Calendar, File, FileText, Newspaper } from 'lucide-react';
import { useState } from 'react';

import { SearchResultItem } from './search-result-item';

import type { GroupedResults, SearchResult } from '../hooks/use-search';

const groupConfig: Record<keyof GroupedResults, { label: string; icon: typeof Newspaper }> = {
  posts: { label: 'Vijesti', icon: Newspaper },
  documents: { label: 'Dokumenti', icon: FileText },
  pages: { label: 'Stranice', icon: File },
  events: { label: 'Događanja', icon: Calendar },
};

interface SearchResultsProps {
  results: GroupedResults;
  selectedIndex: number;
  onSelect: (result: SearchResult) => void;
  isLoading: boolean;
}

export function SearchResults({
  results,
  selectedIndex,
  onSelect,
  isLoading,
}: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState<keyof GroupedResults>('posts');

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="mb-2 h-3 w-16 rounded bg-neutral-200" />
            <div className="space-y-2">
              <div className="h-10 rounded bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const groups = (
    Object.keys(groupConfig) as Array<keyof GroupedResults>
  ).filter((key) => results[key].length > 0);

  const totalCount =
    results.posts.length +
    results.documents.length +
    results.pages.length +
    results.events.length;

  if (totalCount === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-neutral-500">Nema rezultata</p>
        <p className="mt-1 text-sm text-neutral-400">
          Pokušajte s drugim pojmom
        </p>
      </div>
    );
  }

  // Calculate flat index for keyboard navigation
  let flatIndex = 0;
  const groupStartIndices: Record<keyof GroupedResults, number> = {
    posts: 0,
    documents: 0,
    pages: 0,
    events: 0,
  };

  for (const key of Object.keys(groupConfig) as Array<keyof GroupedResults>) {
    groupStartIndices[key] = flatIndex;
    flatIndex += results[key].length;
  }

  // Determine which tab should be active based on results
  const availableTabs = groups;
  const effectiveTab = availableTabs.includes(activeTab) ? activeTab : availableTabs[0];

  return (
    <>
      {/* Mobile: Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-neutral-100 px-2 md:hidden">
        {availableTabs.map((groupKey) => {
          const config = groupConfig[groupKey];
          const Icon = config.icon;
          const count = results[groupKey].length;
          const isActive = effectiveTab === groupKey;

          return (
            <button
              key={groupKey}
              type="button"
              onClick={() => setActiveTab(groupKey)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-b-2 border-primary-500 text-primary-700'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {config.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                isActive ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile: Single column for active tab */}
      <div className="max-h-[350px] overflow-y-auto md:hidden">
        {effectiveTab && (
          <div className="py-2">
            {results[effectiveTab].map((result, index) => (
              <SearchResultItem
                key={result.id}
                result={result}
                isSelected={selectedIndex === groupStartIndices[effectiveTab] + index}
                onClick={() => onSelect(result)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Multi-column layout */}
      <div className="hidden max-h-[400px] overflow-y-auto md:block">
        <div className="grid grid-cols-3 gap-4 p-4">
          {availableTabs.slice(0, 3).map((groupKey) => {
            const config = groupConfig[groupKey];
            const items = results[groupKey];

            return (
              <div key={groupKey} className="min-w-0">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <config.icon className="h-3.5 w-3.5" />
                  {config.label}
                  <span className="ml-auto rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                    {items.length}
                  </span>
                </h3>
                <div className="space-y-1">
                  {items.slice(0, 5).map((result, index) => (
                    <SearchResultItemCompact
                      key={result.id}
                      result={result}
                      isSelected={selectedIndex === groupStartIndices[groupKey] + index}
                      onClick={() => onSelect(result)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Show events below if present and other tabs exist */}
        {results.events.length > 0 && availableTabs.length > 3 && (
          <div className="border-t border-neutral-100 px-4 py-2">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              <Calendar className="h-3.5 w-3.5" />
              Događanja
              <span className="ml-2 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                {results.events.length}
              </span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {results.events.slice(0, 3).map((result, index) => (
                <SearchResultItemCompact
                  key={result.id}
                  result={result}
                  isSelected={selectedIndex === groupStartIndices.events + index}
                  onClick={() => onSelect(result)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Compact result item for desktop columns
function SearchResultItemCompact({
  result,
  isSelected,
  onClick,
}: {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-lg px-2 py-1.5 text-left transition-colors ${
        isSelected
          ? 'bg-primary-50 text-primary-900'
          : 'hover:bg-neutral-50'
      }`}
    >
      <span
        className="line-clamp-2 text-sm font-medium text-neutral-900"
        dangerouslySetInnerHTML={{ __html: result.title }}
      />
      {result.date && (
        <span className="mt-0.5 block text-xs text-neutral-500">{result.date}</span>
      )}
    </button>
  );
}
