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
  const showDescription = variant === 'standard' || size === 'large';

  const baseStyles = isBento
    ? 'group flex flex-col rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
    : 'group flex flex-col items-center rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm transition-all hover:border-primary-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';

  const iconStyles = isBento
    ? 'mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100'
    : 'mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100';

  const iconSize = isBento ? 'h-5 w-5' : 'h-7 w-7';

  const descriptionStyles = isBento
    ? 'mt-1 text-sm text-neutral-600 line-clamp-1'
    : 'mt-1 text-sm text-neutral-600';

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseStyles, className)}
      >
        <div className={iconStyles}>
          <Icon className={iconSize} />
        </div>
        <h3 className="font-display font-semibold text-neutral-900 group-hover:text-primary-600">
          {title}
        </h3>
        {showDescription && (
          <p className={descriptionStyles}>{description}</p>
        )}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={cn(baseStyles, className)}
    >
      <div className={iconStyles}>
        <Icon className={iconSize} />
      </div>
      <h3 className="font-display font-semibold text-neutral-900 group-hover:text-primary-600">
        {title}
      </h3>
      {showDescription && (
        <p className={descriptionStyles}>{description}</p>
      )}
    </Link>
  );
}
