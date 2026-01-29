'use client';

import { FadeIn } from '@repo/ui';

import type { ReactNode } from 'react';

export interface TimelineItemProps {
  year: string;
  title: string;
  children: ReactNode;
}

export function TimelineItem({ year, title, children }: TimelineItemProps) {
  return (
    <FadeIn>
      <div className="relative pb-8 pl-8 last:pb-0">
        {/* Line */}
        <div className="absolute bottom-0 left-[11px] top-3 w-0.5 bg-primary-200 last:hidden" />

        {/* Dot */}
        <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-primary-500 bg-white" />

        {/* Content */}
        <div className="ml-4">
          <div className="inline-block rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
            {year}
          </div>
          <h4 className="mt-2 font-display text-lg font-semibold text-neutral-900">
            {title}
          </h4>
          <div className="mt-2 prose prose-sm max-w-none text-neutral-600">
            {children}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

export interface TimelineProps {
  children: ReactNode;
}

export function Timeline({ children }: TimelineProps) {
  return (
    <div className="my-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
      {children}
    </div>
  );
}
