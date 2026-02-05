import { eventsRepository } from '@repo/database';
import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';
import { Suspense } from 'react';

import { shouldSkipDatabase } from '@/lib/build-flags';

import { EventsPageClient } from './events-page-client';

import type { EventsPageInitialData } from './events-page-client';
import type { Metadata } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

export const metadata: Metadata = {
  title: 'Događanja',
  description: 'Kalendar događanja i aktivnosti u Općini Veliki Bukovec.',
  alternates: {
    canonical: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/dogadanja'),
  },
  openGraph: {
    title: 'Događanja - Općina Veliki Bukovec',
    description: 'Kalendar događanja i aktivnosti u Općini Veliki Bukovec.',
    type: 'website',
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/dogadanja'),
  },
};

function EventsPageFallback() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 h-4 w-64 animate-pulse rounded bg-neutral-200" />
      <div className="mt-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}

async function getInitialEventsData(): Promise<EventsPageInitialData> {
  const today = new Date();
  const initialYear = today.getFullYear();
  const initialMonth = today.getMonth() + 1;

  if (shouldSkipDatabase()) {
    return {
      events: [],
      calendarEvents: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
      initialYear,
      initialMonth,
    };
  }

  const [eventsResult, calendarEvents] = await Promise.all([
    eventsRepository.findAll({ page: 1, limit: 10, upcoming: true, excludeWaste: true }),
    eventsRepository.getEventsByMonth(initialYear, initialMonth),
  ]);

  return {
    events: eventsResult.events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate.toISOString(),
      eventTime: event.eventTime ? event.eventTime.toISOString() : null,
      endDate: event.endDate ? event.endDate.toISOString() : null,
      location: event.location,
      posterImage: event.posterImage,
    })),
    calendarEvents: calendarEvents.map((event) => ({
      id: event.id,
      title: event.title,
      eventDate: event.eventDate.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : null,
    })),
    pagination: eventsResult.pagination,
    initialYear,
    initialMonth,
  };
}

export default async function EventsPage() {
  const initialData = await getInitialEventsData();

  return (
    <Suspense fallback={<EventsPageFallback />}>
      <EventsPageClient initialData={initialData} />
    </Suspense>
  );
}
