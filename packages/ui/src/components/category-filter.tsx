'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '../lib/utils';

export interface CategoryFilterProps {
  categories: { value: string; label: string }[];
  allLabel?: string;
  className?: string;
}

export function CategoryFilter({
  categories,
  allLabel = 'Sve',
  className,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('kategorija');
  const isValidCategory = currentCategory
    ? categories.some((category) => category.value === currentCategory)
    : false;
  const activeCategory = isValidCategory ? currentCategory : null;

  const handleCategoryChange = useCallback(
    (category: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category) {
        params.set('kategorija', category);
      } else {
        params.delete('kategorija');
      }
      params.delete('stranica');
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        onClick={() => handleCategoryChange(null)}
        className={cn(
          'rounded-full px-4 py-2 text-sm font-medium transition-colors',
          !activeCategory
            ? 'bg-primary-600 text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        )}
      >
        {allLabel}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleCategoryChange(cat.value)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            activeCategory === cat.value
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
