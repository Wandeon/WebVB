import { Suspense } from 'react';

import { Breadcrumbs } from '@/components/layout';

import { DashboardContent } from './dashboard-content';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
            Nadzorna ploča
          </h1>
          <Breadcrumbs items={[{ label: 'Nadzorna ploča' }]} className="mt-1" />
        </div>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-neutral-100" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-xl bg-neutral-100" />
        <div className="h-80 rounded-xl bg-neutral-100" />
      </div>
    </div>
  );
}
