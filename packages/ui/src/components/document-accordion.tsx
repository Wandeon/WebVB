'use client';

import Link from 'next/link';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../primitives/accordion';
import { cn } from '../lib/utils';

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
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

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
                  href="/dokumenti"
                  className={cn(
                    'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                    !activeCategory
                      ? 'bg-primary-100 font-medium text-primary-900'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  )}
                >
                  <span>Sve kategorije</span>
                  <span className="text-xs text-neutral-500">{totalCount}</span>
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.value}>
                  <Link
                    href={`/dokumenti?kategorija=${cat.value}`}
                    className={cn(
                      'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                      activeCategory === cat.value
                        ? 'bg-primary-100 font-medium text-primary-900'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    )}
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
