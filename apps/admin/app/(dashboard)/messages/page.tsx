import { Toaster } from '@repo/ui';
import { Suspense } from 'react';

import { Breadcrumbs } from '@/components/layout';

import { MessagesList } from './messages-list';

function MessagesListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
      <div className="h-64 w-full animate-pulse rounded-md bg-neutral-200" />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Poruke
        </h1>
        <Breadcrumbs items={[{ label: 'Poruke' }]} className="mt-1" />
      </div>

      <Suspense fallback={<MessagesListSkeleton />}>
        <MessagesList />
      </Suspense>

      <Toaster />
    </div>
  );
}
