'use client';

import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import { useRouter } from 'next/navigation';

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

function getFirstWord(title: string): string {
  return title.split(' ')[0] || title;
}

export function EventCalendar({
  events,
  initialDate,
  className,
}: EventCalendarProps) {
  const router = useRouter();

  const calendarEvents = events.map((event) => {
    const dateStr = new Date(event.date).toISOString().split('T')[0];
    return {
      id: event.id,
      title: getFirstWord(event.title),
      date: dateStr as string,
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
        height="auto"
      />
    </div>
  );
}
