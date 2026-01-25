import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { cn } from '../lib/utils';

export interface QuickLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  className?: string;
}

export function QuickLinkCard({
  title,
  description,
  href,
  icon: Icon,
  className,
}: QuickLinkCardProps) {
  const isExternal = href.startsWith('http');

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'group flex flex-col items-center rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm transition-all hover:border-primary-200 hover:shadow-md',
          className
        )}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="font-display font-semibold text-neutral-900 group-hover:text-primary-600">
          {title}
        </h3>
        <p className="mt-1 text-sm text-neutral-600">{description}</p>
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col items-center rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm transition-all hover:border-primary-200 hover:shadow-md',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-display font-semibold text-neutral-900 group-hover:text-primary-600">
        {title}
      </h3>
      <p className="mt-1 text-sm text-neutral-600">{description}</p>
    </Link>
  );
}
