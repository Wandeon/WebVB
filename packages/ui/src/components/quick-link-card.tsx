'use client';

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  FileSearch,
  FileText,
  MessageSquare,
  Trash2,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '../lib/utils';

import type { LucideIcon } from 'lucide-react';

// Icon map for string-based icon names
const iconMap: Record<string, LucideIcon> = {
  alertTriangle: AlertTriangle,
  calendarDays: CalendarDays,
  fileSearch: FileSearch,
  fileText: FileText,
  messageSquare: MessageSquare,
  trash2: Trash2,
  users: Users,
};

export type QuickLinkIconName = keyof typeof iconMap;

/**
 * Color variants inspired by Veliki Bukovec crest:
 * - sky: Sky blue (crest background)
 * - gold: Golden amber (flower center)
 * - green: Primary green (nature/environment)
 * - rose: Soft rose/coral (warmth)
 * - slate: Neutral slate (documents/formal)
 */
export type QuickLinkColorVariant = 'sky' | 'gold' | 'green' | 'rose' | 'slate';

export interface QuickLinkCardProps {
  title: string;
  description: string;
  href: string;
  /** Icon name string (for server components) or direct icon component */
  icon: QuickLinkIconName | LucideIcon;
  variant?: 'standard' | 'bento';
  /** Color variant for bento cards */
  color?: QuickLinkColorVariant;
  /** Size affects padding and typography */
  size?: 'small' | 'large';
  className?: string;
  /** Optional dynamic content rendered below description in bento variant */
  children?: React.ReactNode;
}

// Color configurations with gradients and accents
const colorConfig: Record<QuickLinkColorVariant, {
  gradient: string;
  iconBg: string;
  decorCircle1: string;
  decorCircle2: string;
}> = {
  sky: {
    gradient: 'from-sky-500 to-sky-700',
    iconBg: 'bg-white/20 backdrop-blur-sm',
    decorCircle1: 'bg-white/15',
    decorCircle2: 'bg-white/10',
  },
  gold: {
    gradient: 'from-amber-500 to-amber-700',
    iconBg: 'bg-white/20 backdrop-blur-sm',
    decorCircle1: 'bg-white/15',
    decorCircle2: 'bg-white/10',
  },
  green: {
    gradient: 'from-emerald-600 to-emerald-800',
    iconBg: 'bg-white/20 backdrop-blur-sm',
    decorCircle1: 'bg-white/15',
    decorCircle2: 'bg-white/10',
  },
  rose: {
    gradient: 'from-rose-500 to-rose-700',
    iconBg: 'bg-white/20 backdrop-blur-sm',
    decorCircle1: 'bg-white/15',
    decorCircle2: 'bg-white/10',
  },
  slate: {
    gradient: 'from-slate-600 to-slate-800',
    iconBg: 'bg-white/20 backdrop-blur-sm',
    decorCircle1: 'bg-white/15',
    decorCircle2: 'bg-white/10',
  },
};

export function QuickLinkCard({
  title,
  description,
  href,
  icon,
  variant = 'standard',
  color = 'green',
  size = 'large',
  className,
  children,
}: QuickLinkCardProps) {
  const isExternal = href.startsWith('http');
  const isBento = variant === 'bento';
  const isLarge = size === 'large';

  // Resolve icon - can be a string name or direct component
  const Icon = typeof icon === 'string' ? iconMap[icon] || FileText : icon;

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

  // Get color configuration
  const colorCfg = colorConfig[color];

  // Bento card - all cards get beautiful gradient backgrounds
  const bentoBase = cn(
    'group relative flex h-full flex-col overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'hover:-translate-y-1 hover:shadow-xl',
    'bg-gradient-to-br text-white shadow-lg',
    colorCfg.gradient,
    isLarge ? 'p-4 sm:p-6 md:p-8' : 'p-3 sm:p-4 md:p-5',
    // Focus ring color based on variant
    color === 'sky' && 'focus-visible:ring-sky-500',
    color === 'gold' && 'focus-visible:ring-amber-500',
    color === 'green' && 'focus-visible:ring-emerald-500',
    color === 'rose' && 'focus-visible:ring-rose-500',
    color === 'slate' && 'focus-visible:ring-slate-500',
  );

  const bentoContent = (
    <>
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={cn(
          'absolute rounded-full',
          colorCfg.decorCircle1,
          isLarge
            ? '-right-6 -top-6 h-24 w-24 sm:h-32 sm:w-32 md:h-48 md:w-48'
            : '-right-4 -top-4 h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32'
        )} />
        <div className={cn(
          'absolute rounded-full',
          colorCfg.decorCircle2,
          isLarge
            ? '-bottom-8 -left-8 h-28 w-28 sm:h-40 sm:w-40 md:h-56 md:w-56'
            : '-bottom-6 -left-6 h-20 w-20 sm:h-28 sm:w-28 md:h-36 md:w-36'
        )} />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center rounded-lg sm:rounded-xl transition-transform duration-300 group-hover:scale-110',
            colorCfg.iconBg,
            isLarge ? 'mb-2 h-10 w-10 sm:mb-4 sm:h-12 sm:w-12 md:mb-5 md:h-14 md:w-14' : 'mb-2 h-8 w-8 sm:mb-3 sm:h-10 sm:w-10 md:h-12 md:w-12'
          )}
        >
          <Icon className={isLarge ? 'h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7' : 'h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6'} />
        </div>

        {/* Title */}
        <h3
          className={cn(
            'font-display font-bold text-white',
            isLarge ? 'text-base sm:text-lg md:text-xl' : 'text-sm sm:text-base md:text-lg'
          )}
        >
          {title}
        </h3>

        {/* Description - hidden on very small screens for non-large cards */}
        <p
          className={cn(
            'mt-1 sm:mt-2 flex-1 text-white/85',
            isLarge ? 'text-xs sm:text-sm md:text-base' : 'hidden sm:block line-clamp-2 text-xs sm:text-sm'
          )}
        >
          {description}
        </p>

        {children && <div className="mt-3">{children}</div>}

        {/* CTA */}
        <div className={cn(
          'mt-2 sm:mt-4 flex items-center text-xs sm:text-sm font-semibold text-white',
          isLarge ? 'md:mt-5' : ''
        )}>
          <span>Saznaj više</span>
          <ArrowRight
            className={cn(
              'ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-2',
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
