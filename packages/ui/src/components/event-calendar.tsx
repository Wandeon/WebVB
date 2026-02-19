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
  endDate?: Date | null;
}

export interface EventCalendarProps {
  events: CalendarEvent[];
  initialDate?: Date;
  className?: string;
}

const EVENT_TIME_ZONE = 'Europe/Zagreb';

interface EventColors { bg: string; border: string; text: string }

function getEventDisplayInfo(title: string): { label: string; colors: EventColors | null } {
  // Check for recycling yard events
  if (title.toLowerCase().includes('reciklažno dvorište') || title.toLowerCase().includes('mobilno reciklažno')) {
    return {
      label: title,
      colors: { bg: '#059669', border: '#047857', text: '#ffffff' } // emerald-600
    };
  }

  // Default: show full title
  return { label: title, colors: null };
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

export function getCalendarEndDate(startDate: Date, endDate?: Date | null): string | null {
  if (!endDate || endDate <= startDate) {
    return null;
  }

  const inclusiveEnd = new Date(endDate);
  inclusiveEnd.setDate(inclusiveEnd.getDate() + 1);
  return formatCalendarDate(inclusiveEnd);
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
    const endDate = getCalendarEndDate(event.date, event.endDate);
    const { label, colors } = getEventDisplayInfo(event.title);
    return {
      id: event.id,
      title: label,
      date: dateStr,
      url: `/dogadanja/${event.id}`,
      ...(endDate ? { end: endDate } : {}),
      ...(colors && {
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text,
      }),
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
        dayMaxEvents={3}
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
