'use client';

import { Calendar, Download } from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';

export interface AddToCalendarProps {
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  className?: string;
}

function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function generateICS(props: Omit<AddToCalendarProps, 'className'>): string {
  const { title, description, startDate, endDate, location } = props;
  const start = formatDateForGoogle(startDate);
  const end = formatDateForGoogle(
    endDate || new Date(startDate.getTime() + 60 * 60 * 1000)
  );

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Opcina Veliki Bukovec//Events//HR
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${description || ''}
LOCATION:${location || ''}
END:VEVENT
END:VCALENDAR`;
}

export function AddToCalendar({
  title,
  description,
  startDate,
  endDate,
  location,
  className,
}: AddToCalendarProps) {
  const start = formatDateForGoogle(startDate);
  const end = formatDateForGoogle(
    endDate || new Date(startDate.getTime() + 60 * 60 * 1000)
  );

  const googleUrl = new URL('https://calendar.google.com/calendar/render');
  googleUrl.searchParams.set('action', 'TEMPLATE');
  googleUrl.searchParams.set('text', title);
  googleUrl.searchParams.set('dates', `${start}/${end}`);
  if (description) googleUrl.searchParams.set('details', description);
  if (location) googleUrl.searchParams.set('location', location);

  const handleDownloadICS = () => {
    const icsContent = generateICS({
      title,
      description,
      startDate,
      endDate,
      location,
    });
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.ics`;
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
