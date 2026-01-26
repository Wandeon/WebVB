'use client';

import Link from 'next/link';

import { cn } from '../lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../primitives/accordion';

export interface PageAccordionItem {
  slug: string;
  title: string;
}

export interface PageAccordionProps {
  pages: PageAccordionItem[];
  currentSlug: string;
  sectionTitle: string;
  currentTitle?: string;
  className?: string;
}

export function PageAccordion({
  pages,
  currentSlug,
  sectionTitle,
  currentTitle,
  className,
}: PageAccordionProps) {
  const displayTitle =
    currentTitle || pages.find((p) => p.slug === currentSlug)?.title || '';

  return (
    <Accordion
      type="single"
      collapsible
      className={cn('', className)}
    >
      <AccordionItem value="pages" className="border-b-0">
        <AccordionTrigger className="rounded-lg bg-neutral-100 px-4 hover:bg-neutral-200 hover:no-underline">
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-xs font-normal uppercase tracking-wider text-neutral-500">
              {sectionTitle}
            </span>
            <span className="text-sm font-semibold">{displayTitle}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <nav aria-label={`${sectionTitle} navigacija`}>
            <ul className="space-y-1">
              {pages.map((page) => {
                const isActive = page.slug === currentSlug;
                return (
                  <li key={page.slug}>
                    <Link
                      href={`/${page.slug}`}
                      className={cn(
                        'block rounded-md px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-primary-100 font-medium text-primary-900'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
