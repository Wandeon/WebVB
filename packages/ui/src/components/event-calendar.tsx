'use client';

import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { cn } from '../lib/utils';

import './event-calendar.css';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
}

export interface EventCalendarProps {
  events: CalendarEvent[];
  initialDate?: Date;
  className?: string;
}

const EVENT_TIME_ZONE = 'Europe/Zagreb';

function getFirstWord(title: string): string {
  return title.split(' ')[0] || title;
}

export function formatCalendarDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

export function formatMonthParam(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  return `${year}-${month}`;
}

export function EventCalendar({
  events,
  initialDate,
  className,
}: EventCalendarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const calendarEvents = events.map((event) => {
    const dateStr = formatCalendarDate(new Date(event.date));
    return {
      id: event.id,
      title: getFirstWord(event.title),
      date: dateStr,
      url: `/dogadanja/${event.id}`,
    };
  });

  return (
    <div className={cn('event-calendar', className)}>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        locale="hr"
        firstDay={1}
        headerToolbar={{
          left: 'prev',
          center: 'title',
          right: 'next',
        }}
        {...(initialDate ? { initialDate } : {})}
        events={calendarEvents}
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          if (info.event.url) {
            router.push(info.event.url);
          }
        }}
        datesSet={(info) => {
          const currentMonth = formatMonthParam(info.view.currentStart);
          const existingMonth = searchParams.get('mjesec');
          if (existingMonth === currentMonth) {
            return;
          }
          const params = new URLSearchParams(searchParams.toString());
          params.set('mjesec', currentMonth);
          const queryString = params.toString();
          const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
          router.replace(nextUrl, { scroll: false });
        }}
        height="auto"
      />
    </div>
  );
}
