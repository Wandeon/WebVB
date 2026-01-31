'use client';

import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useEffect, useState } from 'react';

import { cn } from '../lib/utils';

export interface CategoryFilterProps {
  categories: { value: string; label: string }[];
  allLabel?: string;
  className?: string;
  sticky?: boolean;
}

export function CategoryFilter({
  categories,
  allLabel = 'Sve',
  className,
  sticky = false,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  const currentCategory = searchParams.get('kategorija');
  const isValidCategory = currentCategory
    ? categories.some((category) => category.value === currentCategory)
    : false;
  const activeCategory = isValidCategory ? currentCategory : null;

  // Scroll active button into view on mount and category change
  useEffect(() => {
    if (activeButtonRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeButtonRef.current;

      // Center the active button in the scroll container
      const scrollLeft =
        button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    }
  }, [activeCategory]);

  // Detect when sticky header becomes stuck
  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Adjust threshold based on your header height
      setIsStuck(scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

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

  const filterContent = (
    <div
      ref={scrollContainerRef}
      className={cn(
        // Mobile: horizontal scroll, hide scrollbar
        'flex gap-2 overflow-x-auto scrollbar-hide',
        // Desktop: wrap normally
        'sm:flex-wrap sm:overflow-visible',
        // Padding for scroll fade effect on mobile
        'px-4 py-3 sm:px-0 sm:py-0',
        // Negative margin to counteract padding on mobile
        '-mx-4 sm:mx-0'
      )}
    >
      <button
        ref={!activeCategory ? activeButtonRef : null}
        onClick={() => handleCategoryChange(null)}
        className={cn(
          'relative shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
          'sm:px-4 sm:py-2',
          !activeCategory
            ? 'text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        )}
      >
        {!activeCategory && (
          <motion.div
            layoutId="categoryPill"
            className="absolute inset-0 rounded-full bg-primary-600"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <span className="relative z-10">{allLabel}</span>
      </button>
      {categories.map((cat) => (
        <button
          key={cat.value}
          ref={activeCategory === cat.value ? activeButtonRef : null}
          onClick={() => handleCategoryChange(cat.value)}
          className={cn(
            'relative shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
            'sm:px-4 sm:py-2',
            activeCategory === cat.value
              ? 'text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          )}
        >
          {activeCategory === cat.value && (
            <motion.div
              layoutId="categoryPill"
              className="absolute inset-0 rounded-full bg-primary-600"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10">{cat.label}</span>
        </button>
      ))}
    </div>
  );

  if (sticky) {
    return (
      <div
        className={cn(
          'sticky top-0 z-30 -mx-4 bg-white/95 backdrop-blur-md transition-shadow sm:mx-0 sm:rounded-lg',
          isStuck ? 'shadow-md' : 'shadow-none',
          className
        )}
      >
        <div className="flex items-center gap-2 sm:p-2">
          {/* Filter icon - visible when stuck */}
          <div
            className={cn(
              'hidden items-center gap-2 pl-4 text-sm font-medium text-neutral-500 transition-opacity sm:flex',
              isStuck ? 'opacity-100' : 'opacity-0'
            )}
          >
            <Filter className="h-4 w-4" />
            <span>Filter:</span>
          </div>
          {filterContent}
        </div>
      </div>
    );
  }

  return <div className={className}>{filterContent}</div>;
}
