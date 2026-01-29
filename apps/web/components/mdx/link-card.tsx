'use client';

import { FadeIn } from '@repo/ui';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  FileText,
  Landmark,
  MapPin,
  Phone,
  ScrollText,
  TreePine,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import type { ReactNode } from 'react';

const iconMap = {
  building: Building2,
  users: Users,
  calendar: Calendar,
  document: FileText,
  scroll: ScrollText,
  landmark: Landmark,
  tree: TreePine,
  map: MapPin,
  phone: Phone,
  alert: AlertTriangle,
};

export type IconName = keyof typeof iconMap;

export interface LinkCardProps {
  title: string;
  description: string;
  href: string;
  icon?: IconName;
  delay?: number;
  variant?: 'default' | 'featured' | 'compact';
}

export function LinkCard({
  title,
  description,
  href,
  icon = 'document',
  delay = 0,
  variant = 'default',
}: LinkCardProps) {
  const Icon = iconMap[icon] || FileText;

  if (variant === 'featured') {
    return (
      <FadeIn delay={delay}>
        <Link
          href={href}
          className="group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/20" />
            <div className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/10" />
          </div>

          <div className="relative z-10 flex flex-1 flex-col">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
              <Icon className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-bold">{title}</h3>
            <p className="mt-3 flex-1 text-base text-white/80">{description}</p>
            <div className="mt-6 flex items-center text-sm font-semibold">
              <span>Saznaj više</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
            </div>
          </div>
        </Link>
      </FadeIn>
    );
  }

  if (variant === 'compact') {
    return (
      <FadeIn delay={delay}>
        <Link
          href={href}
          className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-semibold text-neutral-900 group-hover:text-primary-600">
              {title}
            </h3>
            <p className="mt-0.5 truncate text-sm text-neutral-500">{description}</p>
          </div>
          <ArrowRight className="h-5 w-5 flex-shrink-0 text-neutral-400 transition-all group-hover:translate-x-1 group-hover:text-primary-600" />
        </Link>
      </FadeIn>
    );
  }

  // Default variant
  return (
    <FadeIn delay={delay}>
      <Link
        href={href}
        className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 transition-transform group-hover:scale-105">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="font-display text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{description}</p>
        <div className="mt-5 flex items-center text-sm font-medium text-primary-600">
          <span>Saznaj više</span>
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </FadeIn>
  );
}

export interface LinkCardGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  layout?: 'grid' | 'bento';
}

export function LinkCardGrid({ children, columns = 2, layout = 'grid' }: LinkCardGridProps) {
  if (layout === 'bento') {
    return (
      <div className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    );
  }

  const colStyles = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`not-prose grid gap-4 md:gap-6 ${colStyles[columns]}`}>
      {children}
    </div>
  );
}

// New Bento-specific components for more control
export interface BentoGridProps {
  children: ReactNode;
}

export function BentoGrid({ children }: BentoGridProps) {
  return (
    <div className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(180px,auto)]">
      {children}
    </div>
  );
}

export interface BentoCardProps {
  title: string;
  description: string;
  href: string;
  icon?: IconName;
  delay?: number;
  span?: 'default' | 'wide' | 'tall' | 'large';
  variant?: 'default' | 'primary' | 'subtle';
}

export function BentoCard({
  title,
  description,
  href,
  icon = 'document',
  delay = 0,
  span = 'default',
  variant = 'default',
}: BentoCardProps) {
  const Icon = iconMap[icon] || FileText;

  const spanStyles = {
    default: '',
    wide: 'sm:col-span-2',
    tall: 'sm:row-span-2',
    large: 'sm:col-span-2 sm:row-span-2',
  };

  const variantStyles = {
    default: 'bg-white border border-neutral-200 hover:border-primary-200',
    primary: 'bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0',
    subtle: 'bg-neutral-50 border border-neutral-100 hover:border-primary-200',
  };

  const textStyles = {
    default: {
      title: 'text-neutral-900 group-hover:text-primary-600',
      desc: 'text-neutral-600',
      link: 'text-primary-600',
      icon: 'bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600',
    },
    primary: {
      title: 'text-white',
      desc: 'text-white/80',
      link: 'text-white',
      icon: 'bg-white/20 text-white backdrop-blur-sm',
    },
    subtle: {
      title: 'text-neutral-900 group-hover:text-primary-600',
      desc: 'text-neutral-500',
      link: 'text-primary-600',
      icon: 'bg-white text-primary-600 shadow-sm',
    },
  };

  const styles = textStyles[variant];
  const isLarge = span === 'large' || span === 'tall';
  const isPrimary = variant === 'primary';

  return (
    <FadeIn delay={delay} className={spanStyles[span]}>
      <Link
        href={href}
        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${variantStyles[variant]} ${isLarge ? 'p-8' : ''}`}
      >
        {isPrimary && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/30" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/20" />
          </div>
        )}

        <div className="relative z-10 flex flex-1 flex-col">
          <div
            className={`mb-4 flex items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${styles.icon} ${isLarge ? 'h-16 w-16' : 'h-12 w-12'}`}
          >
            <Icon className={isLarge ? 'h-8 w-8' : 'h-6 w-6'} />
          </div>
          <h3
            className={`font-display font-semibold ${styles.title} ${isLarge ? 'text-xl' : 'text-base'}`}
          >
            {title}
          </h3>
          <p
            className={`mt-2 flex-1 leading-relaxed ${styles.desc} ${isLarge ? 'text-base' : 'text-sm'}`}
          >
            {description}
          </p>
          <div
            className={`mt-4 flex items-center font-medium ${styles.link} ${isLarge ? 'text-base' : 'text-sm'}`}
          >
            <span>Saznaj više</span>
            <ArrowRight
              className={`ml-1.5 transition-transform group-hover:translate-x-1 ${isLarge ? 'h-5 w-5' : 'h-4 w-4'}`}
            />
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}
