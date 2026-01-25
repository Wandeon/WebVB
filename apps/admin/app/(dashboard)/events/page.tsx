import { Toaster } from '@repo/ui';
import { Suspense } from 'react';

import { EventsList } from './events-list';

export const metadata = {
  title: 'Događanja | Admin',
};

function EventsListSkeleton() {
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

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<EventsListSkeleton />}>
        <EventsList />
      </Suspense>

      <Toaster />
    </div>
  );
}
