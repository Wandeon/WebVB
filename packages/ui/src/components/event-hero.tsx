'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';

import { cn } from '../lib/utils';

export interface EventHeroProps {
  title: string;
  posterImage: string;
  className?: string;
}

export function EventHero({ title, posterImage, className }: EventHeroProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={cn(
        'relative h-64 w-full overflow-hidden rounded-lg md:h-80',
        className
      )}
    >
      {!imageError ? (
        <img
          src={posterImage}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-200">
          <ImageOff className="h-10 w-10" aria-hidden="true" />
          <span className="sr-only">Naslovna fotografija nije dostupna</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}
