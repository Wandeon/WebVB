'use client';

import { useRef, useState } from 'react';
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
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lastFocusedIndex = useRef<number | null>(null);

  const slides = images.map((img, index) => {
    const trimmedCaption = img.caption?.trim();
    const altText = trimmedCaption ? trimmedCaption : `Fotografija ${index + 1}`;

    return {
      src: img.imageUrl,
      alt: altText,
      title: trimmedCaption || undefined,
    };
  });

  const handleOpen = (index: number) => {
    lastFocusedIndex.current = index;
    setLightboxIndex(index);
  };

  const handleClose = () => {
    setLightboxIndex(-1);
    if (lastFocusedIndex.current !== null) {
      const indexToFocus = lastFocusedIndex.current;
      lastFocusedIndex.current = null;
      requestAnimationFrame(() => {
        buttonRefs.current[indexToFocus]?.focus();
      });
    }
  };

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:gap-3',
          className
        )}
      >
        {images.map((image, index) => {
          const trimmedCaption = image.caption?.trim();
          const altText = trimmedCaption ? trimmedCaption : `Fotografija ${index + 1}`;

          return (
          <button
            key={image.id}
            type="button"
            onClick={() => handleOpen(index)}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            className="group aspect-square overflow-hidden rounded-lg bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={altText}
          >
            <img
              src={image.thumbnailUrl || image.imageUrl}
              alt={altText}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </button>
          );
        })}
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={handleClose}
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
