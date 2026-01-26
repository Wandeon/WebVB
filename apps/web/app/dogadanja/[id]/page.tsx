import { eventsRepository } from '@repo/database';
import { AddToCalendar, ArticleContent, EventHero, FadeIn } from '@repo/ui';
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

export const revalidate = 60;

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

const EVENT_TIME_ZONE = 'Europe/Zagreb';
const META_DESCRIPTION_MAX_LENGTH = 160;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await eventsRepository.findById(id);

  if (!event) {
    return { title: 'Događanje nije pronađeno' };
  }

  const description = event.description
    ? truncate(stripHtml(event.description), META_DESCRIPTION_MAX_LENGTH)
    : 'Događanje u Općini Veliki Bukovec';

  return {
    title: event.title,
    description,
    openGraph: {
      title: `${event.title} - Događanja - Općina Veliki Bukovec`,
      description,
      type: 'article',
      ...(event.posterImage && { images: [event.posterImage] }),
    },
  };
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const event = await eventsRepository.findById(id);

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.eventDate);
  const day = new Intl.DateTimeFormat('hr-HR', {
    day: 'numeric',
    timeZone: EVENT_TIME_ZONE,
  }).format(eventDate);
  const month = new Intl.DateTimeFormat('hr-HR', {
    month: 'short',
    timeZone: EVENT_TIME_ZONE,
  }).format(eventDate);

  const formattedDate = new Intl.DateTimeFormat('hr-HR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: EVENT_TIME_ZONE,
  }).format(eventDate);

  const formattedTime = event.eventTime
    ? new Intl.DateTimeFormat('hr-HR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }).format(event.eventTime)
    : null;

  const googleMapsUrl = event.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null;

  return (
    <>
      {/* Back link */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/dogadanja"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Povratak na događanja
        </Link>
      </div>

      {/* Hero image */}
      {event.posterImage && (
        <div className="container mx-auto px-4 pb-6">
          <FadeIn>
            <EventHero title={event.title} posterImage={event.posterImage} />
          </FadeIn>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-3xl">
          {/* Title with date badge */}
          <FadeIn>
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <span className="text-2xl font-bold leading-none">{day}</span>
                <span className="text-xs uppercase">{month}</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-neutral-900 md:text-3xl">
                {event.title}
              </h1>
            </div>
          </FadeIn>

          {/* Date and location */}
          <FadeIn delay={0.1}>
            <div className="mb-6 space-y-2 text-neutral-600">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-neutral-400" />
                <span>
                  {formattedDate}
                  {formattedTime && ` u ${formattedTime}`}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-neutral-400" />
                  <span>{event.location}</span>
                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline"
                    >
                      Prikaži na karti →
                    </a>
                  )}
                </div>
              )}
            </div>
          </FadeIn>

          {/* Add to calendar */}
          <FadeIn delay={0.2}>
            <div className="mb-8 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <p className="mb-3 text-sm font-medium text-neutral-700">
                Dodaj u kalendar
              </p>
              <AddToCalendar
                title={event.title}
                description={event.description}
                startDate={eventDate}
                startTime={event.eventTime}
                endDate={event.endDate}
                location={event.location}
              />
            </div>
          </FadeIn>

          {/* Description */}
          {event.description && (
            <FadeIn delay={0.3}>
              <div>
                <h2 className="font-display text-xl font-semibold text-neutral-900">
                  Opis događanja
                </h2>
                <ArticleContent content={event.description} className="mt-4" />
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </>
  );
}
