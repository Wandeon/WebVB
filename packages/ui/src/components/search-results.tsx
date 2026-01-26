'use client';

import { SearchResultItem } from './search-result-item';

import type { GroupedResults, SearchResult } from '../hooks/use-search';

const groupLabels: Record<keyof GroupedResults, string> = {
  posts: 'Vijesti',
  documents: 'Dokumenti',
  pages: 'Stranice',
  events: 'Događanja',
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

  // Calculate flat index for each result
  const groups = (
    Object.keys(groupLabels) as Array<keyof GroupedResults>
  ).filter((key) => results[key].length > 0);

  let flatIndex = 0;

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

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {groups.map((groupKey) => {
        const items = results[groupKey];
        const groupStartIndex = flatIndex;
        flatIndex += items.length;

        return (
          <div key={groupKey} className="py-2">
            <h3 className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {groupLabels[groupKey]}
            </h3>
            <div>
              {items.map((result, index) => (
                <SearchResultItem
                  key={result.id}
                  result={result}
                  isSelected={selectedIndex === groupStartIndex + index}
                  onClick={() => {
                    onSelect(result);
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
