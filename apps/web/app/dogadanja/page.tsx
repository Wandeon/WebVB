import { eventsRepository } from '@repo/database';
import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';
import {
  EventCalendar,
  EventCard,
  EventTabs,
  FadeIn,
} from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import type { Metadata } from 'next';

export const revalidate = 60;

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

interface EventsPageProps {
  searchParams: Promise<{
    tab?: string;
    mjesec?: string;
    stranica?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const tab = params.tab === 'past' ? 'past' : 'upcoming';
  const parsedPage = params.stranica ? parseInt(params.stranica, 10) : 1;
  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  // Parse month or default to current
  const now = new Date();
  let calendarYear = now.getFullYear();
  let calendarMonth = now.getMonth() + 1;

  if (params.mjesec) {
    const [y, m] = params.mjesec.split('-').map(Number);
    if (y && m && m >= 1 && m <= 12) {
      calendarYear = y;
      calendarMonth = m;
    }
  }

  // Fetch data
  const [eventsResult, calendarEvents] = await Promise.all([
    tab === 'upcoming'
      ? eventsRepository.findAll({
          upcoming: true,
          page,
          limit: 10,
          sortBy: 'eventDate',
          sortOrder: 'asc',
        })
      : eventsRepository.getPastEvents({ page, limit: 10 }),
    eventsRepository.getEventsByMonth(calendarYear, calendarMonth),
  ]);

  const { events, pagination } = eventsResult;

  return (
    <>
      {/* Back link */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Povratak na početnu
        </Link>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 pb-6">
        <FadeIn>
          <h1 className="font-display text-3xl font-bold text-neutral-900 md:text-4xl">
            Događanja
          </h1>
          <p className="mt-2 text-neutral-600">
            Kalendar događanja Općine Veliki Bukovec
          </p>
        </FadeIn>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 pb-12">
        {/* Tabs */}
        <FadeIn>
          <EventTabs className="mb-6" />
        </FadeIn>

        {/* Calendar */}
        <FadeIn delay={0.1}>
          <EventCalendar
            events={calendarEvents.map((e) => ({
              id: e.id,
              title: e.title,
              date: e.eventDate,
            }))}
            initialDate={new Date(calendarYear, calendarMonth - 1, 1)}
            className="mb-8 rounded-lg border border-neutral-200 bg-white p-4"
          />
        </FadeIn>

        {/* Events list */}
        <FadeIn delay={0.2}>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            {tab === 'upcoming' ? 'Nadolazeći događaji' : 'Prošli događaji'}
          </h2>
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event, index) => (
                <FadeIn key={event.id} delay={0.1 + index * 0.03}>
                  <EventCard
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    eventDate={event.eventDate}
                    eventTime={event.eventTime}
                    location={event.location}
                    posterImage={event.posterImage}
                  />
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
              <p className="text-neutral-600">
                {tab === 'upcoming'
                  ? 'Trenutno nema nadolazećih događanja.'
                  : 'Nema prošlih događanja.'}
              </p>
            </div>
          )}
        </FadeIn>

        {/* Pagination info */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 text-center text-sm text-neutral-500">
            Stranica {pagination.page} od {pagination.totalPages}
          </div>
        )}
      </div>
    </>
  );
}
