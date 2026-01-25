import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { cn } from '../lib/utils';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  linkText?: string;
  linkHref?: string;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  linkText,
  linkHref,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-6 flex items-end justify-between md:mb-8', className)}>
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900 md:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-neutral-600">{description}</p>
        )}
      </div>
      {linkText && linkHref && (
        <Link
          href={linkHref}
          className="hidden items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 md:flex"
        >
          {linkText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
