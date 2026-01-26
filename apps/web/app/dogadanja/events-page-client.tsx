'use client';

import {
  EventCalendar,
  EventCard,
  EventTabs,
  FadeIn,
} from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Event {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string | null;
  location: string | null;
  posterImage: string | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InitialEventsData {
  events: Event[];
  calendarEvents: CalendarEvent[];
  pagination: Pagination;
}

interface EventsPageClientProps {
  initialData: InitialEventsData;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function EventsPageClient({ initialData }: EventsPageClientProps) {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>(initialData.events);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialData.calendarEvents);
  const [pagination, setPagination] = useState<Pagination>(initialData.pagination);
  const [isLoading, setIsLoading] = useState(false);

  const tab = searchParams.get('tab') === 'past' ? 'past' : 'upcoming';
  const parsedPage = searchParams.get('stranica') ? parseInt(searchParams.get('stranica') as string, 10) : 1;
  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  // Parse month or default to current
  const now = new Date();
  let calendarYear = now.getFullYear();
  let calendarMonth = now.getMonth() + 1;

  const mjesec = searchParams.get('mjesec');
  if (mjesec) {
    const [y, m] = mjesec.split('-').map(Number);
    if (y && m && m >= 1 && m <= 12) {
      calendarYear = y;
      calendarMonth = m;
    }
  }

  // Only fetch if user navigated away from initial state
  const needsFetch = tab === 'past' || page > 1 || mjesec;

  useEffect(() => {
    if (!needsFetch) {
      setEvents(initialData.events);
      setCalendarEvents(initialData.calendarEvents);
      setPagination(initialData.pagination);
      return;
    }

    async function fetchEvents() {
      setIsLoading(true);
      try {
        const eventsUrl = tab === 'upcoming'
          ? `${API_URL}/api/public/events?upcoming=true&page=${page}&limit=10`
          : `${API_URL}/api/public/events?past=true&page=${page}&limit=10`;
        const calendarUrl = `${API_URL}/api/public/events/calendar?year=${calendarYear}&month=${calendarMonth}`;

        const [eventsRes, calendarRes] = await Promise.all([
          fetch(eventsUrl),
          fetch(calendarUrl),
        ]);

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData.events);
          setPagination(eventsData.pagination);
        }

        if (calendarRes.ok) {
          const calendarData = await calendarRes.json();
          setCalendarEvents(calendarData.events.map((e: { id: string; title: string; eventDate: string }) => ({
            id: e.id,
            title: e.title,
            date: e.eventDate,
          })));
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [tab, page, calendarYear, calendarMonth, needsFetch, initialData]);

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
            events={calendarEvents.map((e) => ({ ...e, date: new Date(e.date) }))}
            initialDate={new Date(calendarYear, calendarMonth - 1, 1)}
            className="mb-8 rounded-lg border border-neutral-200 bg-white p-4"
          />
        </FadeIn>

        {/* Events list */}
        <FadeIn delay={0.2}>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            {tab === 'upcoming' ? 'Nadolazeći događaji' : 'Prošli događaji'}
          </h2>

          {isLoading ? (
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
                    eventDate={new Date(event.eventDate)}
                    eventTime={event.eventTime ? new Date(event.eventTime) : null}
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
