'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { cn } from '../lib/utils';

import type { LucideIcon } from 'lucide-react';


export interface QuickLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  variant?: 'standard' | 'bento';
  size?: 'small' | 'large';
  className?: string;
}

export function QuickLinkCard({
  title,
  description,
  href,
  icon: Icon,
  variant = 'standard',
  size = 'large',
  className,
}: QuickLinkCardProps) {
  const isExternal = href.startsWith('http');
  const isBento = variant === 'bento';
  const isLarge = size === 'large';

  // Standard card styles (non-bento)
  if (!isBento) {
    const standardStyles = 'group flex flex-col items-center rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm transition-all hover:border-primary-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';

    const content = (
      <>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="font-display font-semibold text-neutral-900 group-hover:text-primary-600">
          {title}
        </h3>
        <p className="mt-1 text-sm text-neutral-600">{description}</p>
      </>
    );

    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cn(standardStyles, className)}>
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={cn(standardStyles, className)}>
        {content}
      </Link>
    );
  }

  // Bento card styles - visually impressive with gradients and decorative elements
  const bentoBase = cn(
    'group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    'hover:-translate-y-1 hover:shadow-xl',
    isLarge
      ? 'bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white shadow-lg md:p-8'
      : 'border border-neutral-200 bg-white p-5 shadow-sm hover:border-primary-200 hover:shadow-lg'
  );

  const bentoContent = (
    <>
      {/* Background decoration for large cards */}
      {isLarge && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 md:h-48 md:w-48" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5 md:h-56 md:w-56" />
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col">
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
            isLarge
              ? 'mb-4 h-12 w-12 bg-white/20 backdrop-blur-sm md:mb-6 md:h-16 md:w-16'
              : 'mb-3 h-10 w-10 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600'
          )}
        >
          <Icon className={isLarge ? 'h-6 w-6 md:h-8 md:w-8' : 'h-5 w-5'} />
        </div>

        {/* Title */}
        <h3
          className={cn(
            'font-display font-bold',
            isLarge
              ? 'text-lg md:text-xl'
              : 'text-base text-neutral-900 group-hover:text-primary-600'
          )}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={cn(
            'mt-2 flex-1',
            isLarge
              ? 'text-sm text-white/80 md:text-base'
              : 'line-clamp-2 text-sm text-neutral-600'
          )}
        >
          {description}
        </p>

        {/* CTA */}
        <div
          className={cn(
            'mt-4 flex items-center text-sm font-semibold',
            isLarge ? 'text-white' : 'text-primary-600'
          )}
        >
          <span>Saznaj više</span>
          <ArrowRight
            className={cn(
              'ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2',
              isLarge ? 'md:h-5 md:w-5' : ''
            )}
          />
        </div>
      </div>
    </>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn(bentoBase, className)}>
        {bentoContent}
      </a>
    );
  }

  return (
    <Link href={href} className={cn(bentoBase, className)}>
      {bentoContent}
    </Link>
  );
}
