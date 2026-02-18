'use client';

import { motion, useAnimationControls } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '../lib/utils';

export interface GalleryShowcaseItem {
  name: string;
  slug: string;
  coverImage: string;
  imageCount: number;
  eventDate?: Date | null;
}

export interface GalleryShowcaseProps {
  galleries: GalleryShowcaseItem[];
  className?: string;
}

interface ScrollingRowProps {
  items: GalleryShowcaseItem[];
  direction: 'left' | 'right';
  speed?: number;
}

function ScrollingRow({ items, direction, speed = 30 }: ScrollingRowProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const [contentWidth, setContentWidth] = useState(0);
  const manualOffsetRef = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items, ...items];

  useEffect(() => {
    if (containerRef.current) {
      const singleSetWidth = containerRef.current.scrollWidth / 3;
      setContentWidth(singleSetWidth);
    }
  }, [items]);

  useEffect(() => {
    if (contentWidth === 0) return;

    const duration = contentWidth / speed;
    const endX = direction === 'left' ? -contentWidth : 0;

    if (!isPaused) {
      void controls.start({
        x: endX,
        transition: {
          duration,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        },
      });
    } else {
      controls.stop();
    }

    return () => controls.stop();
  }, [contentWidth, direction, speed, isPaused, controls]);

  useEffect(() => {
    if (contentWidth > 0) {
      const startX = direction === 'left' ? 0 : -contentWidth;
      manualOffsetRef.current = startX;
      controls.set({ x: startX });
    }
  }, [contentWidth, direction, controls]);

  const nudge = useCallback((dir: 'prev' | 'next') => {
    if (contentWidth === 0) return;
    // Card width + gap (approximate)
    const cardStep = Math.min(contentWidth / items.length, 400);
    const delta = dir === 'next' ? -cardStep : cardStep;

    setIsPaused(true);

    // Get current computed x from the animated element
    if (containerRef.current) {
      const style = window.getComputedStyle(containerRef.current);
      const matrix = new DOMMatrix(style.transform);
      manualOffsetRef.current = matrix.m41 + delta;
    }

    void controls.start({
      x: manualOffsetRef.current,
      transition: { duration: 0.4, ease: 'easeOut' },
    });

    // Resume auto-scroll after 3 seconds
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), 3000);
  }, [contentWidth, items.length, controls]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  return (
    <div className="group/row relative">
      <div
        className="overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          setHoveredIndex(null);
          if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        }}
      >
        <motion.div
          ref={containerRef}
          animate={controls}
          className="flex gap-4"
        >
          {duplicatedItems.map((gallery, index) => (
            <Link
              key={`${gallery.slug}-${index}`}
              href={`/galerija/${gallery.slug}`}
              className="group relative shrink-0"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.div
                className="relative h-40 w-60 overflow-hidden rounded-xl shadow-lg sm:h-48 sm:w-72 md:h-56 md:w-80 lg:h-64 lg:w-96"
                animate={{
                  scale: hoveredIndex === index ? 1.05 : 1,
                  rotateY: hoveredIndex === index ? 5 : 0,
                  rotateX: hoveredIndex === index ? -5 : 0,
                  z: hoveredIndex === index ? 50 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img
                  src={gallery.coverImage}
                  alt={gallery.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Gradient overlay */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent",
                  "opacity-60 transition-opacity duration-300 group-hover:opacity-90"
                )} />

                {/* Content overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <h3 className="font-display text-sm font-semibold text-white drop-shadow-lg sm:text-base lg:text-lg line-clamp-1">
                    {gallery.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-white/80 sm:text-sm">
                    {gallery.eventDate && (
                      <>
                        <span>
                          {new Date(gallery.eventDate).toLocaleDateString('hr-HR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-white/50">•</span>
                      </>
                    )}
                    <span>{gallery.imageCount} foto</span>
                  </div>
                </div>

                {/* Shine effect on hover */}
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{
                    x: hoveredIndex === index ? '100%' : '-100%',
                    opacity: hoveredIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Arrow buttons */}
      <button
        type="button"
        onClick={() => nudge('prev')}
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md opacity-0 transition-opacity hover:bg-white group-hover/row:opacity-100 sm:left-4 sm:p-2.5"
        aria-label="Prethodno"
      >
        <ChevronLeft className="h-4 w-4 text-neutral-700 sm:h-5 sm:w-5" />
      </button>
      <button
        type="button"
        onClick={() => nudge('next')}
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md opacity-0 transition-opacity hover:bg-white group-hover/row:opacity-100 sm:right-4 sm:p-2.5"
        aria-label="Sljedeće"
      >
        <ChevronRight className="h-4 w-4 text-neutral-700 sm:h-5 sm:w-5" />
      </button>
    </div>
  );
}

export function GalleryShowcase({ galleries, className }: GalleryShowcaseProps) {
  if (galleries.length === 0) return null;

  // Split galleries into two rows
  const midpoint = Math.ceil(galleries.length / 2);
  const topRow = galleries.slice(0, midpoint);
  const bottomRow = galleries.slice(midpoint);

  // If we don't have enough for two rows, duplicate
  const topItems = topRow.length >= 3 ? topRow : [...topRow, ...topRow, ...topRow].slice(0, 6);
  const bottomItems = bottomRow.length >= 3 ? bottomRow : [...bottomRow, ...galleries].slice(0, 6);

  return (
    <div className={cn('relative overflow-hidden py-8', className)}>
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent sm:w-16 md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent sm:w-16 md:w-24" />

      <div className="space-y-4">
        <ScrollingRow items={topItems} direction="left" speed={25} />
        <ScrollingRow items={bottomItems} direction="right" speed={20} />
      </div>
    </div>
  );
}
