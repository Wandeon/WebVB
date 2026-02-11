import { Toaster } from '@repo/ui';
import { Suspense } from 'react';

import { Breadcrumbs } from '@/components/layout';

import { MailLogsList } from './mail-logs-list';

function MailLogsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
      <div className="h-64 w-full animate-pulse rounded-md bg-neutral-200" />
    </div>
  );
}

export default function MailLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Evidencija e-pošte
        </h1>
        <Breadcrumbs items={[{ label: 'Evidencija e-pošte' }]} className="mt-1" />
      </div>

      <Suspense fallback={<MailLogsListSkeleton />}>
        <MailLogsList />
      </Suspense>

      <Toaster />
    </div>
  );
}
