'use client';

import { useState } from 'react';
import Link from 'next/link';

import { ImageOff } from 'lucide-react';

import { cn } from '../lib/utils';

export interface GalleryCardProps {
  name: string;
  slug: string;
  coverImage: string | null;
  imageCount: number;
  eventDate: Date | null;
  className?: string;
}

export function GalleryCard({
  name,
  slug,
  coverImage,
  imageCount,
  eventDate,
  className,
}: GalleryCardProps) {
  const [imageError, setImageError] = useState(false);
  const formattedDate = eventDate
    ? new Intl.DateTimeFormat('hr-HR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Zagreb',
      }).format(new Date(eventDate))
    : null;

  return (
    <Link
      href={`/galerija/${slug}`}
      className={cn(
        'group block overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
        {coverImage && !imageError ? (
          <img
            src={coverImage}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <ImageOff className="h-12 w-12" aria-hidden="true" />
            <span className="sr-only">Naslovna fotografija nije dostupna</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
          {name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
          <span>{imageCount} fotografija</span>
          {formattedDate && (
            <>
              <span>•</span>
              <span>{formattedDate}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
