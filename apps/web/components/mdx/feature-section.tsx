'use client';

import { FadeIn } from '@repo/ui';
import Image from 'next/image';

import type { ReactNode } from 'react';

export interface FeatureSectionProps {
  title: string;
  children: ReactNode;
  image?: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right';
  background?: 'white' | 'light' | 'primary';
}

const bgStyles = {
  white: 'bg-white',
  light: 'bg-neutral-50',
  primary: 'bg-primary-50',
};

export function FeatureSection({
  title,
  children,
  image,
  imageAlt = '',
  imagePosition = 'right',
  background = 'white',
}: FeatureSectionProps) {
  const hasImage = !!image;

  return (
    <section className={`-mx-4 px-4 py-12 md:-mx-8 md:px-8 md:py-16 ${bgStyles[background]}`}>
      <div className="mx-auto max-w-6xl">
        <div
          className={`grid items-center gap-8 md:gap-12 ${
            hasImage ? 'lg:grid-cols-2' : ''
          }`}
        >
          {hasImage && imagePosition === 'left' && (
            <FadeIn direction="left">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={image}
                  alt={imageAlt || title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </FadeIn>
          )}

          <FadeIn direction={imagePosition === 'left' ? 'right' : 'left'}>
            <div>
              <h2 className="font-display text-2xl font-bold text-neutral-900 md:text-3xl">
                {title}
              </h2>
              <div className="prose prose-neutral mt-4 max-w-none prose-p:text-neutral-600 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline">
                {children}
              </div>
            </div>
          </FadeIn>

          {hasImage && imagePosition === 'right' && (
            <FadeIn direction="right">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={image}
                  alt={imageAlt || title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </section>
  );
}
