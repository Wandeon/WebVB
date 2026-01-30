import { Toaster } from '@repo/ui';
import { Suspense } from 'react';

import { Breadcrumbs } from '@/components/layout';

import { ReportsList } from './reports-list';

function ReportsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
      <div className="h-64 w-full animate-pulse rounded-md bg-neutral-200" />
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Prijave problema
        </h1>
        <Breadcrumbs items={[{ label: 'Prijave problema' }]} className="mt-1" />
      </div>

      <Suspense fallback={<ReportsListSkeleton />}>
        <ReportsList />
      </Suspense>

      <Toaster />
    </div>
  );
}
