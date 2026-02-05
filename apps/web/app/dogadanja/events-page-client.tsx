'use client';

import { getPublicEnv } from '@repo/shared';
import {
  ContentTypeSwitcher,
  EventCalendar,
  EventCard,
  EventTabs,
  FadeIn,
} from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface Event {
  id: string;
  title: string;
  description: string | null;
  eventDate: Date;
  eventTime: Date | null;
  endDate: Date | null;
  location: string | null;
  posterImage: string | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate: Date | null;
}

interface SerializedEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string | null;
  endDate: string | null;
  location: string | null;
  posterImage: string | null;
}

interface SerializedCalendarEvent {
  id: string;
  title: string;
  eventDate: string;
  endDate: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PublicEventsResponse {
  success: boolean;
  data?: {
    events: SerializedEvent[];
    pagination: Pagination;
  };
  error?: {
    message: string;
  };
}

interface PublicCalendarResponse {
  success: boolean;
  data?: {
    events: SerializedCalendarEvent[];
  };
  error?: {
    message: string;
  };
}

export interface EventsPageInitialData {
  events: SerializedEvent[];
  calendarEvents: SerializedCalendarEvent[];
  pagination: Pagination;
  initialYear: number;
  initialMonth: number;
}

interface EventsPageClientProps {
  initialData: EventsPageInitialData;
}

const { NEXT_PUBLIC_API_URL } = getPublicEnv();
const API_URL = NEXT_PUBLIC_API_URL;
const FETCH_TIMEOUT_MS = 10_000;

const deserializeEvent = (event: SerializedEvent): Event => ({
  ...event,
  eventDate: new Date(event.eventDate),
  eventTime: event.eventTime ? new Date(event.eventTime) : null,
  endDate: event.endDate ? new Date(event.endDate) : null,
});

const deserializeCalendarEvent = (event: SerializedCalendarEvent): CalendarEvent => ({
  id: event.id,
  title: event.title,
  date: new Date(event.eventDate),
  endDate: event.endDate ? new Date(event.endDate) : null,
});

export function EventsPageClient({ initialData }: EventsPageClientProps) {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>(
    initialData.events.map(deserializeEvent)
  );
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(
    initialData.calendarEvents.map(deserializeCalendarEvent)
  );
  const [pagination, setPagination] = useState<Pagination>(
    initialData.pagination
  );
  const [isLoading, setIsLoading] = useState(false);
  const [listErrorMessage, setListErrorMessage] = useState<string | null>(null);
  const [calendarErrorMessage, setCalendarErrorMessage] = useState<string | null>(null);

  const tab = searchParams.get('tab') === 'past' ? 'past' : 'upcoming';
  const pageParam = searchParams.get('stranica');
  const parsedPage = pageParam ? parseInt(pageParam, 10) : 1;
  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  // Parse month or default to current
  let calendarYear = initialData.initialYear;
  let calendarMonth = initialData.initialMonth;

  const mjesec = searchParams.get('mjesec');
  if (mjesec) {
    const [y, m] = mjesec.split('-').map(Number);
    if (y && m && m >= 1 && m <= 12) {
      calendarYear = y;
      calendarMonth = m;
    }
  }

  const shouldUseInitialEvents = useMemo(
    () => tab === 'upcoming' && page === 1,
    [page, tab]
  );
  const shouldUseInitialCalendar = useMemo(
    () =>
      calendarYear === initialData.initialYear &&
      calendarMonth === initialData.initialMonth,
    [calendarMonth, calendarYear, initialData.initialMonth, initialData.initialYear]
  );

  useEffect(() => {
    if (shouldUseInitialEvents) {
      setEvents(initialData.events.map(deserializeEvent));
      setPagination(initialData.pagination);
      setIsLoading(false);
      setListErrorMessage(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    async function fetchEvents() {
      setIsLoading(true);
      setListErrorMessage(null);
      try {
        const eventsUrl =
          tab === 'upcoming'
            ? `${API_URL}/api/public/events?upcoming=true&excludeWaste=true&page=${page}&limit=10`
            : `${API_URL}/api/public/events?past=true&excludeWaste=true&page=${page}&limit=10`;

        const response = await fetch(eventsUrl, { signal: controller.signal });
        const payload = (await response.json()) as PublicEventsResponse;

        if (!response.ok || !payload.success || !payload.data) {
          setListErrorMessage('Ne možemo trenutno učitati događanja. Pokušajte ponovno.');
          return;
        }

        setEvents(payload.data.events.map(deserializeEvent));
        setPagination(payload.data.pagination);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        setListErrorMessage('Ne možemo trenutno učitati događanja. Pokušajte ponovno.');
      } finally {
        setIsLoading(false);
        window.clearTimeout(timeoutId);
      }
    }

    void fetchEvents();

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [initialData, page, shouldUseInitialEvents, tab]);

  useEffect(() => {
    if (shouldUseInitialCalendar) {
      setCalendarEvents(initialData.calendarEvents.map(deserializeCalendarEvent));
      setCalendarErrorMessage(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    async function fetchCalendar() {
      setCalendarErrorMessage(null);
      try {
        const calendarUrl = `${API_URL}/api/public/events/calendar?year=${calendarYear}&month=${calendarMonth}`;
        const response = await fetch(calendarUrl, { signal: controller.signal });
        const payload = (await response.json()) as PublicCalendarResponse;

        if (!response.ok || !payload.success || !payload.data) {
          setCalendarErrorMessage('Ne možemo trenutno učitati kalendar.');
          return;
        }

        setCalendarEvents(payload.data.events.map(deserializeCalendarEvent));
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        setCalendarErrorMessage('Ne možemo trenutno učitati kalendar.');
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    void fetchCalendar();

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [
    calendarMonth,
    calendarYear,
    initialData,
    shouldUseInitialCalendar,
  ]);

  return (
    <>
      <ContentTypeSwitcher />

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
      <div className="container mx-auto px-4 pb-24 sm:pb-12">
        {/* Tabs */}
        <FadeIn>
          <EventTabs className="mb-6" />
        </FadeIn>

        {/* Calendar */}
        <FadeIn delay={0.1}>
          {calendarErrorMessage ? (
            <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
              {calendarErrorMessage}
            </div>
          ) : (
            <EventCalendar
              events={calendarEvents}
              initialDate={new Date(calendarYear, calendarMonth - 1, 1)}
              className="mb-8 rounded-lg border border-neutral-200 bg-white p-4"
            />
          )}
        </FadeIn>

        {/* Events list */}
        <FadeIn delay={0.2}>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            {tab === 'upcoming' ? 'Nadolazeća događanja' : 'Prošla događanja'}
          </h2>

          {listErrorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              {listErrorMessage}
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-neutral-200" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event, index) => (
                <FadeIn key={event.id} delay={0.1 + index * 0.03}>
                  <EventCard
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    eventDate={event.eventDate}
                    eventTime={event.eventTime}
                    endDate={event.endDate}
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
              <p className="mt-2 text-sm text-neutral-500">
                {tab === 'upcoming' ? (
                  <>
                    Pratite{' '}
                    <Link href="/obavijesti" className="text-primary-600 hover:underline">
                      obavijesti
                    </Link>{' '}
                    za nove termine ili{' '}
                    <Link href="/kontakt" className="text-primary-600 hover:underline">
                      kontaktirajte općinu
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    Vratite se na{' '}
                    <Link href="/dogadanja" className="text-primary-600 hover:underline">
                      nadolazeća događanja
                    </Link>
                    .
                  </>
                )}
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
