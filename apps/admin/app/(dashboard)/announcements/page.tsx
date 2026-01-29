import { Toaster } from '@repo/ui';
import { Suspense } from 'react';

import { Breadcrumbs } from '@/components/layout';

import { AnnouncementsList } from './announcements-list';

function AnnouncementsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="h-10 w-32 animate-pulse rounded-md bg-neutral-200" />
      </div>
      <div className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
      <div className="h-64 w-full animate-pulse rounded-md bg-neutral-200" />
    </div>
  );
}

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Obavijesti
        </h1>
        <Breadcrumbs items={[{ label: 'Obavijesti' }]} className="mt-1" />
      </div>

      <Suspense fallback={<AnnouncementsListSkeleton />}>
        <AnnouncementsList />
      </Suspense>

      <Toaster />
    </div>
  );
}
