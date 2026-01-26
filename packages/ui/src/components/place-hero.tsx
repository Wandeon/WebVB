'use client';

import { Clock, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '../lib/utils';
import { buttonVariants } from '../primitives/button';

export interface PlaceHeroProps {
  imageSrc: string;
  videoSrc?: string;
  videoSrcFallback?: string;
  videoPosterSrc?: string;
  priority?: boolean;
  headline?: string;
  subline?: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  trustLine?: {
    hours: string;
    hoursHref: string;
    address: string;
    addressHref: string;
  };
  className?: string;
}

function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

function shouldEnhanceToVideo(): boolean {
  if (typeof window === 'undefined') return false;

  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;

  if (connection?.saveData) return false;
  if (connection?.effectiveType && !['4g'].includes(connection.effectiveType)) return false;

  return true;
}

export function PlaceHero({
  imageSrc,
  videoSrc,
  videoSrcFallback,
  videoPosterSrc,
  priority = true,
  headline = 'Dobro došli u Općinu Veliki Bukovec',
  subline = 'Sve informacije, događanja i usluge na jednom mjestu',
  primaryCta,
  secondaryCta,
  trustLine,
  className,
}: PlaceHeroProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  useEffect(() => {
    if (!imageLoaded || !videoSrc || reducedMotion) return;

    const shouldEnhance = shouldEnhanceToVideo();
    if (!shouldEnhance) return;

    // Use requestIdleCallback for non-critical video enhancement
    const enhance = () => {
      setShowVideo(true);
    };

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(enhance, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    } else {
      const id = setTimeout(enhance, 100);
      return () => clearTimeout(id);
    }
  }, [imageLoaded, videoSrc, reducedMotion]);

  return (
    <section className={cn('relative h-[70vh] min-h-[500px] overflow-hidden', className)}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority={priority}
          className="object-cover"
          sizes="100vw"
          onLoad={handleImageLoad}
        />
      </div>

      {/* Video Enhancement */}
      {showVideo && videoSrc && (
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000',
            showVideo ? 'opacity-100' : 'opacity-0'
          )}
          autoPlay
          muted
          loop
          playsInline
          poster={videoPosterSrc || imageSrc}
          aria-hidden="true"
          style={{ pointerEvents: 'none' }}
        >
          {videoSrc && <source src={videoSrc} type="video/webm" />}
          {videoSrcFallback && <source src={videoSrcFallback} type="video/mp4" />}
        </video>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-transparent" />

      {/* Content */}
      <div className="container relative mx-auto flex h-full flex-col justify-end px-4 pb-12 md:pb-16">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-white md:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mt-4 text-lg text-white/90 md:text-xl">
            {subline}
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={primaryCta.href}
              className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}
            >
              {primaryCta.label}
            </Link>
            <Link
              href={secondaryCta.href}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
              )}
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>

        {/* Trust Line */}
        {trustLine && (
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-white/70">
            <a
              href={trustLine.hoursHref}
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{trustLine.hours}</span>
            </a>
            <a
              href={trustLine.addressHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{trustLine.address}</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
