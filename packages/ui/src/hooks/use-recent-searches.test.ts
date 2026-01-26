import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRecentSearches } from './use-recent-searches';

const STORAGE_KEY = 'velikibukovec-recent-searches';

describe('useRecentSearches', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with empty searches when localStorage is empty', () => {
    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.recentSearches).toEqual([]);
  });

  it('loads existing searches from localStorage', () => {
    const stored = [{ query: 'test', timestamp: 1000 }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.recentSearches).toEqual(stored);
  });

  it('adds a new search to the beginning', () => {
    const { result } = renderHook(() => useRecentSearches());

    vi.setSystemTime(new Date(1000));
    act(() => {
      result.current.addRecentSearch('hello');
    });

    expect(result.current.recentSearches).toEqual([
      { query: 'hello', timestamp: 1000 },
    ]);
  });

  it('removes duplicate queries (case insensitive)', () => {
    const { result } = renderHook(() => useRecentSearches());

    vi.setSystemTime(new Date(1000));
    act(() => {
      result.current.addRecentSearch('hello');
    });

    vi.setSystemTime(new Date(2000));
    act(() => {
      result.current.addRecentSearch('HELLO');
    });

    expect(result.current.recentSearches).toHaveLength(1);
    expect(result.current.recentSearches[0]?.query).toBe('HELLO');
    expect(result.current.recentSearches[0]?.timestamp).toBe(2000);
  });

  it('limits to 5 recent searches', () => {
    const { result } = renderHook(() => useRecentSearches());

    for (let i = 0; i < 7; i++) {
      vi.setSystemTime(new Date(i * 1000));
      act(() => {
        result.current.addRecentSearch(`search-${i}`);
      });
    }

    expect(result.current.recentSearches).toHaveLength(5);
    // Most recent should be first
    expect(result.current.recentSearches[0]?.query).toBe('search-6');
    expect(result.current.recentSearches[4]?.query).toBe('search-2');
  });

  it('removes a specific search', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecentSearch('one');
      result.current.addRecentSearch('two');
    });

    act(() => {
      result.current.removeRecentSearch('one');
    });

    expect(result.current.recentSearches).toHaveLength(1);
    expect(result.current.recentSearches[0]?.query).toBe('two');
  });

  it('clears all searches', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecentSearch('one');
      result.current.addRecentSearch('two');
    });

    act(() => {
      result.current.clearRecentSearches();
    });

    expect(result.current.recentSearches).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('[]');
  });

  it('ignores empty queries', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecentSearch('');
      result.current.addRecentSearch('   ');
    });

    expect(result.current.recentSearches).toEqual([]);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useRecentSearches());

    vi.setSystemTime(new Date(1000));
    act(() => {
      result.current.addRecentSearch('test');
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown[];
    expect(stored).toEqual([{ query: 'test', timestamp: 1000 }]);
  });
});
