import { eventsRepository } from '@repo/database';
import { Toaster } from '@repo/ui';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/layout';
import { EventForm } from '@/components/events';

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditEventPageProps) {
  const { id } = await params;
  const event = await eventsRepository.findById(id);

  return {
    title: event ? `Uredi: ${event.title} | Admin` : 'Događanje nije pronađeno',
  };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const event = await eventsRepository.findById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Uredi događanje
        </h1>
        <Breadcrumbs
          items={[
            { label: 'Događanja', href: '/events' },
            { label: event.title },
          ]}
          className="mt-1"
        />
      </div>
      <EventForm
        initialData={{
          id: event.id,
          title: event.title,
          description: event.description,
          eventDate: event.eventDate.toISOString(),
          eventTime: event.eventTime?.toISOString() ?? null,
          endDate: event.endDate?.toISOString() ?? null,
          location: event.location,
          posterImage: event.posterImage,
        }}
      />
      <Toaster />
    </div>
  );
}
