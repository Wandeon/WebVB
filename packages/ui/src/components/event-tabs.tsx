'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { cn } from '../lib/utils';

export interface EventTabsProps {
  className?: string;
}

export function EventTabs({ className }: EventTabsProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'upcoming';

  const tabs = [
    { value: 'upcoming', label: 'Nadolazeći' },
    { value: 'past', label: 'Prošli' },
  ];

  const buildTabUrl = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'upcoming') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    params.delete('stranica');
    return `/dogadanja?${params.toString()}`;
  };

  return (
    <div className={cn('flex gap-2', className)}>
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={buildTabUrl(tab.value)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            activeTab === tab.value
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          )}
          aria-current={activeTab === tab.value ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
