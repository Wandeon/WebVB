'use client';

import { FadeIn } from '@repo/ui';
import {
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
};

export type IconName = keyof typeof iconMap;

export interface LinkCardProps {
  title: string;
  description: string;
  href: string;
  icon?: IconName;
  delay?: number;
}

export function LinkCard({ title, description, href, icon = 'document', delay = 0 }: LinkCardProps) {
  const Icon = iconMap[icon] || FileText;

  return (
    <FadeIn delay={delay}>
      <Link
        href={href}
        className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-display text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-neutral-600">{description}</p>
        <div className="mt-4 flex items-center text-sm font-medium text-primary-600">
          <span>Saznaj više</span>
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </FadeIn>
  );
}

export interface LinkCardGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

export function LinkCardGrid({ children, columns = 2 }: LinkCardGridProps) {
  const colStyles = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={`grid gap-6 ${colStyles[columns]}`}>{children}</div>;
}
