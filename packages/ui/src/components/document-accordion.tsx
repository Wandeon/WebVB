'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { cn } from '../lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../primitives/accordion';

export interface DocumentAccordionProps {
  categories: { value: string; label: string }[];
  activeCategory: string | undefined;
  counts: Record<string, number>;
  className?: string;
}

export function DocumentAccordion({
  categories,
  activeCategory,
  counts,
  className,
}: DocumentAccordionProps) {
  const searchParams = useSearchParams();
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const createCategoryUrl = (category?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('kategorija', category);
    } else {
      params.delete('kategorija');
    }
    params.delete('stranica');
    const queryString = params.toString();
    return `/dokumenti${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <Accordion
      type="single"
      collapsible
      {...(activeCategory && { defaultValue: 'categories' })}
      className={cn('', className)}
    >
      <AccordionItem value="categories" className="border-b-0">
        <AccordionTrigger className="rounded-lg bg-neutral-100 px-4 hover:bg-neutral-200 hover:no-underline">
          <span className="text-sm font-semibold">
            {activeCategory
              ? categories.find((c) => c.value === activeCategory)?.label
              : 'Sve kategorije'}
          </span>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <nav aria-label="Kategorije dokumenata">
            <ul className="space-y-1">
              <li>
                <Link
                  href={createCategoryUrl()}
                  className={cn(
                    'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                    !activeCategory
                      ? 'bg-primary-100 font-medium text-primary-900'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  )}
                  aria-current={!activeCategory ? 'page' : undefined}
                >
                  <span>Sve kategorije</span>
                  <span className="text-xs text-neutral-500">{totalCount}</span>
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.value}>
                  <Link
                    href={createCategoryUrl(cat.value)}
                    className={cn(
                      'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                      activeCategory === cat.value
                        ? 'bg-primary-100 font-medium text-primary-900'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    )}
                    aria-current={activeCategory === cat.value ? 'page' : undefined}
                  >
                    <span>{cat.label}</span>
                    <span className="text-xs text-neutral-500">
                      {counts[cat.value] || 0}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
