'use client';

import { FadeIn } from '@repo/ui';

export interface StatItemProps {
  value: string;
  label: string;
}

export interface StatsRowProps {
  stats: StatItemProps[];
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="my-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {stats.map((stat, index) => (
        <FadeIn key={stat.label} delay={index * 0.1}>
          <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 p-6 text-center">
            <div className="font-display text-3xl font-bold text-primary-700 md:text-4xl">
              {stat.value}
            </div>
            <div className="mt-1 text-sm text-primary-600/80">{stat.label}</div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}

export function Stat({ value, label }: StatItemProps) {
  return (
    <FadeIn>
      <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 p-6 text-center">
        <div className="font-display text-3xl font-bold text-primary-700 md:text-4xl">
          {value}
        </div>
        <div className="mt-1 text-sm text-primary-600/80">{label}</div>
      </div>
    </FadeIn>
  );
}
