'use client';

import { Calendar, Download } from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';

export interface AddToCalendarProps {
  title: string;
  description: string | null;
  startDate: Date;
  startTime?: Date | null;
  endDate: Date | null;
  location: string | null;
  className?: string;
}

const EVENT_TIME_ZONE = 'Europe/Zagreb';

const DATE_PARTS_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: EVENT_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function formatDateParts(date: Date): { year: string; month: string; day: string } {
  const parts = DATE_PARTS_FORMATTER.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return { year, month, day };
}

function getTimeParts(time: Date): { hour: string; minute: string; second: string } {
  const hour = String(time.getUTCHours()).padStart(2, '0');
  const minute = String(time.getUTCMinutes()).padStart(2, '0');
  const second = String(time.getUTCSeconds()).padStart(2, '0');
  return { hour, minute, second };
}

function formatLocalDate(date: Date): string {
  const { year, month, day } = formatDateParts(date);
  return `${year}${month}${day}`;
}

function formatLocalDateTime(date: Date, time: Date): string {
  const { year, month, day } = formatDateParts(date);
  const { hour, minute, second } = getTimeParts(time);
  return `${year}${month}${day}T${hour}${minute}${second}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeICSValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function buildCalendarDates({
  startDate,
  startTime,
  endDate,
}: Pick<AddToCalendarProps, 'startDate' | 'startTime' | 'endDate'>): {
  start: string;
  end: string;
  isAllDay: boolean;
} {
  const isAllDay = !startTime;
  if (isAllDay) {
    const end = endDate ? new Date(endDate) : new Date(startDate);
    end.setDate(end.getDate() + 1);
    return {
      start: formatLocalDate(startDate),
      end: formatLocalDate(end),
      isAllDay,
    };
  }

  const { hour, minute, second } = getTimeParts(startTime);
  const withStartTime = new Date(startDate);
  withStartTime.setUTCHours(Number(hour), Number(minute), Number(second), 0);
  const defaultEndTime = new Date(startTime.getTime() + 60 * 60 * 1000);

  const start = formatLocalDateTime(startDate, startTime);
  const endBase = endDate ? new Date(endDate) : withStartTime;
  const endTime = endDate ? startTime : defaultEndTime;
  const end = formatLocalDateTime(endBase, endTime);
  return { start, end, isAllDay };
}

export function generateICS(props: Omit<AddToCalendarProps, 'className'>): string {
  const { title, description, startDate, startTime, endDate, location } = props;
  const { start, end, isAllDay } = buildCalendarDates({
    startDate,
    startTime: startTime ?? null,
    endDate,
  });
  const safeTitle = escapeICSValue(title);
  const safeDescription = escapeICSValue(description ? stripHtml(description) : '');
  const safeLocation = escapeICSValue(location ?? '');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Opcina Veliki Bukovec//Events//HR
BEGIN:VEVENT
${isAllDay ? `DTSTART;VALUE=DATE:${start}` : `DTSTART;TZID=${EVENT_TIME_ZONE}:${start}`}
${isAllDay ? `DTEND;VALUE=DATE:${end}` : `DTEND;TZID=${EVENT_TIME_ZONE}:${end}`}
SUMMARY:${safeTitle}
DESCRIPTION:${safeDescription}
LOCATION:${safeLocation}
END:VEVENT
END:VCALENDAR`;
}

export function AddToCalendar({
  title,
  description,
  startDate,
  startTime,
  endDate,
  location,
  className,
}: AddToCalendarProps) {
  const normalizedStartTime = startTime ?? null;
  const { start, end, isAllDay } = buildCalendarDates({
    startDate,
    startTime: normalizedStartTime,
    endDate,
  });

  const googleUrl = new URL('https://calendar.google.com/calendar/render');
  googleUrl.searchParams.set('action', 'TEMPLATE');
  googleUrl.searchParams.set('text', title);
  googleUrl.searchParams.set('dates', `${start}/${end}`);
  if (!isAllDay) {
    googleUrl.searchParams.set('ctz', EVENT_TIME_ZONE);
  }
  if (description) {
    googleUrl.searchParams.set('details', stripHtml(description));
  }
  if (location) googleUrl.searchParams.set('location', location);

  const handleDownloadICS = () => {
    const icsContent = generateICS({
      title,
      description,
      startDate,
      startTime: normalizedStartTime,
      endDate,
      location,
    });
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileBase = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    link.download = `${fileBase || 'dogadaj'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row', className)}>
      <Button variant="outline" size="sm" asChild>
        <a
          href={googleUrl.toString()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Dodaj u Google Calendar"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Google Calendar
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownloadICS}>
        <Download className="mr-2 h-4 w-4" />
        Preuzmi ICS
      </Button>
    </div>
  );
}
