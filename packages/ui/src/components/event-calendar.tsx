'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useRouter } from 'next/navigation';

import { cn } from '../lib/utils';

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

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: getFirstWord(event.title),
    date: new Date(event.date).toISOString().split('T')[0],
    url: `/dogadanja/${event.id}`,
  }));

  return (
    <div className={cn('event-calendar', className)}>
      <style jsx global>{`
        .event-calendar .fc {
          --fc-border-color: rgb(229 231 235);
          --fc-today-bg-color: rgb(254 249 235);
          --fc-event-bg-color: rgb(22 101 52);
          --fc-event-border-color: rgb(22 101 52);
          --fc-event-text-color: white;
          font-family: inherit;
        }
        .event-calendar .fc-toolbar-title {
          font-size: 1.125rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .event-calendar .fc-button-primary {
          background-color: rgb(22 101 52);
          border-color: rgb(22 101 52);
        }
        .event-calendar .fc-button-primary:hover {
          background-color: rgb(21 128 61);
          border-color: rgb(21 128 61);
        }
        .event-calendar .fc-button-primary:disabled {
          background-color: rgb(156 163 175);
          border-color: rgb(156 163 175);
        }
        .event-calendar .fc-daygrid-event {
          font-size: 0.75rem;
          padding: 2px 4px;
          border-radius: 4px;
        }
        .event-calendar .fc-day-today {
          background-color: rgb(254 249 235) !important;
        }
        .event-calendar .fc-col-header-cell-cushion,
        .event-calendar .fc-daygrid-day-number {
          color: rgb(64 64 64);
        }
      `}</style>
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
        initialDate={initialDate}
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
