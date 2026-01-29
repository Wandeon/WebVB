'use client';

import { FadeIn } from '@repo/ui';
import Image from 'next/image';

export interface PhotoShowcaseProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  layout?: 'grid' | 'masonry' | 'featured';
}

export function PhotoShowcase({ images, layout = 'grid' }: PhotoShowcaseProps) {
  if (layout === 'featured' && images.length >= 3) {
    const first = images[0]!;
    const second = images[1]!;
    const third = images[2]!;
    return (
      <div className="my-8 grid gap-4 md:grid-cols-2">
        <FadeIn className="md:row-span-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-lg md:h-full">
            <Image
              src={first.src}
              alt={first.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {first.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-sm text-white">{first.caption}</p>
              </div>
            )}
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
            <Image
              src={second.src}
              alt={second.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            {second.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-sm text-white">{second.caption}</p>
              </div>
            )}
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
            <Image
              src={third.src}
              alt={third.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            {third.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-sm text-white">{third.caption}</p>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image, index) => (
        <FadeIn key={image.src} delay={index * 0.1}>
          <div className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-lg">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
                <p className="text-sm text-white">{image.caption}</p>
              </div>
            )}
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
