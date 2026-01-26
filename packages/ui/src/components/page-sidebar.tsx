import Link from 'next/link';

import { cn } from '../lib/utils';

export interface PageSidebarItem {
  slug: string;
  title: string;
}

export interface PageSidebarProps {
  pages: PageSidebarItem[];
  currentSlug: string;
  sectionTitle: string;
  className?: string;
}

export function PageSidebar({
  pages,
  currentSlug,
  sectionTitle,
  className,
}: PageSidebarProps) {
  return (
    <nav
      aria-label={`${sectionTitle} navigacija`}
      className={cn('', className)}
    >
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">
        {sectionTitle}
      </h2>
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
  );
}
