'use client';

import { useRef, useState } from 'react';

import { ImageOff } from 'lucide-react';
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
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
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

  const handleImageError = (id: string) => {
    setFailedImages((prev) => {
      if (prev.has(id)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(id);
      return next;
    });
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
          const hasError = failedImages.has(image.id);

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
              aria-haspopup="dialog"
              aria-expanded={lightboxIndex === index}
            >
              {hasError ? (
                <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-neutral-500">
                  <ImageOff className="h-6 w-6" aria-hidden="true" />
                  <span className="sr-only">Fotografija nije dostupna</span>
                </div>
              ) : (
                <img
                  src={image.thumbnailUrl || image.imageUrl}
                  alt={altText}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  onError={() => handleImageError(image.id)}
                />
              )}
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
        carousel={{ preload: 1 }}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
        }}
      />
    </>
  );
}
