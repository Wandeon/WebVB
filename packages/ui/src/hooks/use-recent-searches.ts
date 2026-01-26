'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'velikibukovec-recent-searches';
const MAX_RECENT_SEARCHES = 5;

export interface RecentSearch {
  query: string;
  timestamp: number;
}

function getStoredSearches(): RecentSearch[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as RecentSearch[];
  } catch {
    return [];
  }
}

function saveSearches(searches: RecentSearch[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // Ignore storage errors (e.g., private browsing)
  }
}

export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setSearches(getStoredSearches());
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearches((prev) => {
      // Remove existing entry with same query
      const filtered = prev.filter(
        (s) => s.query.toLowerCase() !== trimmed.toLowerCase()
      );

      // Add new entry at the beginning
      const updated = [
        { query: trimmed, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT_SEARCHES);

      saveSearches(updated);
      return updated;
    });
  }, []);

  const removeRecentSearch = useCallback((query: string) => {
    setSearches((prev) => {
      const filtered = prev.filter(
        (s) => s.query.toLowerCase() !== query.toLowerCase()
      );
      saveSearches(filtered);
      return filtered;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setSearches([]);
    saveSearches([]);
  }, []);

  return {
    recentSearches: searches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };
}
