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

// Waste type color mapping
const WASTE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'miješani komunalni otpad': { bg: '#525252', border: '#404040', text: '#ffffff' }, // gray-600
  'biootpad': { bg: '#16a34a', border: '#15803d', text: '#ffffff' }, // green-600
  'plastika': { bg: '#eab308', border: '#ca8a04', text: '#000000' }, // yellow-500
  'papir i karton': { bg: '#2563eb', border: '#1d4ed8', text: '#ffffff' }, // blue-600
  'metal': { bg: '#ea580c', border: '#c2410c', text: '#ffffff' }, // orange-600
  'pelene': { bg: '#a855f7', border: '#9333ea', text: '#ffffff' }, // purple-500
  'staklo': { bg: '#06b6d4', border: '#0891b2', text: '#ffffff' }, // cyan-500
};

// Short labels for calendar display
const WASTE_LABELS: Record<string, string> = {
  'miješani komunalni otpad': 'MKO',
  'biootpad': 'Bio',
  'plastika': 'Plastika',
  'papir i karton': 'Papir',
  'metal': 'Metal',
  'pelene': 'Pelene',
  'staklo': 'Staklo',
};

function getEventDisplayInfo(title: string): { label: string; colors: typeof WASTE_COLORS[string] | null } {
  // Check if it's a waste collection event
  const wasteMatch = title.match(/^Odvoz otpada:\s*(.+)$/i);
  if (wasteMatch) {
    const wasteType = wasteMatch[1]!.toLowerCase().trim();
    const colors = WASTE_COLORS[wasteType] || null;
    const label = WASTE_LABELS[wasteType] || wasteMatch[1]!;
    return { label, colors };
  }

  // Check for recycling yard events
  if (title.toLowerCase().includes('reciklažno dvorište') || title.toLowerCase().includes('mobilno reciklažno')) {
    return {
      label: 'Reciklažno',
      colors: { bg: '#059669', border: '#047857', text: '#ffffff' } // emerald-600
    };
  }

  // Default: first word of title
  return { label: title.split(' ')[0] || title, colors: null };
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
