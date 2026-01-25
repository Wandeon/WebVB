'use client';

import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';

import 'yet-another-react-lightbox/styles.css';

import { cn } from '../lib/utils';

export interface PhotoGridImage {
  id: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
}

export interface PhotoGridProps {
  images: PhotoGridImage[];
  className?: string;
}

export function PhotoGrid({ images, className }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const slides = images.map((img) => ({
    src: img.imageUrl,
    alt: img.caption || '',
    title: img.caption || undefined,
  }));

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:gap-3',
          className
        )}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="group aspect-square overflow-hidden rounded-lg bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <img
              src={image.thumbnailUrl || image.imageUrl}
              alt={image.caption || ''}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
        controller={{ closeOnBackdropClick: true }}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
        }}
      />
    </>
  );
}
