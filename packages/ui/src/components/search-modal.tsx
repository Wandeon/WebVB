'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { ArrowDown, ArrowUp, Clock, CornerDownLeft, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { SearchResults } from './search-results';
import { useRecentSearches } from '../hooks/use-recent-searches';
import { useSearch } from '../hooks/use-search';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl?: string;
}

export function SearchModal({ isOpen, onClose, apiUrl = '' }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    results,
    isLoading,
    error,
    selectedIndex,
    search,
    clearResults,
    navigateUp,
    navigateDown,
    selectCurrent,
  } = useSearch({ apiUrl });
  const { recentSearches, removeRecentSearch, clearRecentSearches } =
    useRecentSearches();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the dialog is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  // Clear state when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearResults();
    }
  }, [isOpen, clearResults]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        navigateUp();
        break;
      case 'ArrowDown':
        e.preventDefault();
        navigateDown();
        break;
      case 'Enter': {
        e.preventDefault();
        const selected = selectCurrent();
        if (selected) {
          router.push(selected.url);
          onClose();
        }
        break;
      }
      case 'Escape':
        onClose();
        break;
    }
  };

  const handleResultSelect = (result: { url: string }) => {
    router.push(result.url);
    onClose();
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    void search(recentQuery);
    if (inputRef.current) {
      inputRef.current.value = recentQuery;
    }
  };

  const showRecentSearches = !query && recentSearches.length > 0;
  const showResults = query.length >= 2 && (results || isLoading);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl bg-white shadow-2xl md:top-[15%]"
          onKeyDown={handleKeyDown}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-neutral-200 p-4">
            <Search className="h-5 w-5 flex-shrink-0 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Pretraži..."
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-neutral-400"
              defaultValue={query}
              onChange={(e) => void search(e.target.value)}
            />
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1 hover:bg-neutral-100"
                aria-label="Zatvori"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="min-h-[200px]">
            {error && (
              <div className="p-4 text-center text-red-600">{error}</div>
            )}

            {showRecentSearches && (
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Nedavna pretraživanja
                  </h3>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-xs text-neutral-500 hover:text-neutral-700"
                  >
                    Obriši sve
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((recent) => (
                    <div
                      key={recent.timestamp}
                      className="flex items-center justify-between"
                    >
                      <button
                        type="button"
                        onClick={() => handleRecentSearchClick(recent.query)}
                        className="flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <Clock className="h-4 w-4 text-neutral-400" />
                        {recent.query}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRecentSearch(recent.query)}
                        className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                        aria-label={`Ukloni "${recent.query}"`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showResults && results && (
              <SearchResults
                results={results}
                selectedIndex={selectedIndex}
                onSelect={handleResultSelect}
                isLoading={isLoading}
              />
            )}

            {showResults && isLoading && !results && (
              <SearchResults
                results={{ posts: [], documents: [], pages: [], events: [] }}
                selectedIndex={-1}
                onSelect={() => {}}
                isLoading={true}
              />
            )}

            {!showRecentSearches && !showResults && (
              <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-500">
                <Search className="mb-2 h-8 w-8 text-neutral-300" />
                <p>Započnite unosom pojma za pretraživanje</p>
                <p className="mt-1 text-sm text-neutral-400">
                  Minimalno 2 znaka
                </p>
              </div>
            )}
          </div>

          {/* Footer with keyboard hints */}
          <div className="flex items-center justify-end gap-4 border-t border-neutral-200 px-4 py-2 text-xs text-neutral-500">
            <span className="hidden items-center gap-1 md:flex">
              <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono">
                <ArrowUp className="inline h-3 w-3" />
              </kbd>
              <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono">
                <ArrowDown className="inline h-3 w-3" />
              </kbd>
              navigacija
            </span>
            <span className="hidden items-center gap-1 md:flex">
              <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono">
                <CornerDownLeft className="inline h-3 w-3" />
              </kbd>
              odaberi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px]">
                Esc
              </kbd>
              zatvori
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
