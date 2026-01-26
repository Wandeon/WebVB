'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useRecentSearches } from './use-recent-searches';

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  category: string | null;
  date: string | null;
  highlights: string;
  sourceType: string;
}

export interface GroupedResults {
  posts: SearchResult[];
  documents: SearchResult[];
  pages: SearchResult[];
  events: SearchResult[];
}

export interface SearchResponse {
  results: GroupedResults;
  totalCount: number;
  query: string;
}

const DEBOUNCE_MS = 150;

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupedResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { addRecentSearch } = useRecentSearches();
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flatten results for navigation
  const flatResults = results
    ? [
        ...results.posts,
        ...results.documents,
        ...results.pages,
        ...results.events,
      ]
    : [];

  const totalResults = flatResults.length;

  const search = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    setQuery(trimmed);

    // Clear debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Clear previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear results for short queries
    if (trimmed.length < 2) {
      setResults(null);
      setSelectedIndex(-1);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Debounce the actual fetch
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: abortControllerRef.current.signal }
        );

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = (await response.json()) as SearchResponse;
        setResults(data.results);
        setSelectedIndex(-1);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was aborted, ignore
          return;
        }
        setError('Pretraživanje nije uspjelo');
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const clearResults = useCallback(() => {
    setQuery('');
    setResults(null);
    setSelectedIndex(-1);
    setError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const navigateUp = useCallback(() => {
    setSelectedIndex((prev) => {
      if (totalResults === 0) return -1;
      return prev <= 0 ? totalResults - 1 : prev - 1;
    });
  }, [totalResults]);

  const navigateDown = useCallback(() => {
    setSelectedIndex((prev) => {
      if (totalResults === 0) return -1;
      return prev >= totalResults - 1 ? 0 : prev + 1;
    });
  }, [totalResults]);

  const selectCurrent = useCallback((): SearchResult | null => {
    if (selectedIndex >= 0 && selectedIndex < flatResults.length) {
      const result = flatResults[selectedIndex];
      if (result && query.trim()) {
        addRecentSearch(query.trim());
      }
      return result ?? null;
    }
    // If nothing selected but query exists, add to recent
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
    return null;
  }, [selectedIndex, flatResults, query, addRecentSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    results,
    isLoading,
    error,
    selectedIndex,
    flatResults,
    search,
    clearResults,
    navigateUp,
    navigateDown,
    selectCurrent,
  };
}
