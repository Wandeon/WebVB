import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';

import { cn } from '../lib/utils';

export interface EventCardProps {
  id: string;
  title: string;
  description: string | null;
  eventDate: Date;
  eventTime?: Date | null;
  location: string | null;
  posterImage: string | null;
  className?: string;
}

const EVENT_TIME_ZONE = 'Europe/Zagreb';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function EventCard({
  id,
  title,
  description,
  eventDate,
  eventTime,
  location,
  posterImage,
  className,
}: EventCardProps) {
  const date = new Date(eventDate);
  const day = new Intl.DateTimeFormat('hr-HR', {
    day: 'numeric',
    timeZone: EVENT_TIME_ZONE,
  }).format(date);
  const month = new Intl.DateTimeFormat('hr-HR', {
    month: 'short',
    timeZone: EVENT_TIME_ZONE,
  }).format(date);
  const dateLabel = new Intl.DateTimeFormat('hr-HR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: EVENT_TIME_ZONE,
  }).format(date);
  const timeLabel = eventTime
    ? new Intl.DateTimeFormat('hr-HR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }).format(eventTime)
    : null;
  const descriptionText = description ? stripHtml(description) : null;

  return (
    <Link
      href={`/dogadanja/${id}`}
      className={cn(
        'group flex gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-primary-50 text-primary-700">
        <span className="text-2xl font-bold leading-none">{day}</span>
        <span className="text-xs uppercase">{month}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <h3 className="font-display font-semibold text-neutral-900 group-hover:text-primary-600">
          {title}
        </h3>
        {descriptionText && (
          <p className="mt-1 line-clamp-1 text-sm text-neutral-600">
            {descriptionText}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {dateLabel}
            {timeLabel ? ` u ${timeLabel}` : ''}
          </span>
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          )}
        </div>
      </div>
      {posterImage && (
        <div className="hidden h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg sm:block">
          <img
            src={posterImage}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </Link>
  );
}
