import { Toaster } from '@repo/ui';

import { EventForm } from '@/components/events';
import { Breadcrumbs } from '@/components/layout';

export const metadata = {
  title: 'Novo događanje | Admin',
};

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Novo događanje
        </h1>
        <Breadcrumbs
          items={[
            { label: 'Događanja', href: '/events' },
            { label: 'Novo događanje' },
          ]}
          className="mt-1"
        />
      </div>
      <EventForm />
      <Toaster />
    </div>
  );
}
