'use client';

import { ArrowRight, Camera, Landmark, Mountain, Music } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { cn } from '../lib/utils';

export interface ExperienceCardProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  className?: string;
}

const placeholderIcons: Record<string, React.ReactNode> = {
  znamenitosti: <Landmark className="h-12 w-12" />,
  priroda: <Mountain className="h-12 w-12" />,
  kultura: <Music className="h-12 w-12" />,
};

const placeholderGradients: Record<string, string> = {
  znamenitosti: 'from-amber-500 to-orange-600',
  priroda: 'from-emerald-500 to-teal-600',
  kultura: 'from-violet-500 to-purple-600',
};

export function ExperienceCard({
  title,
  description,
  image,
  imageAlt,
  href,
  className,
}: ExperienceCardProps) {
  const [imageError, setImageError] = useState(false);

  // Extract category from href for placeholder styling
  const category = href.split('/').pop() ?? 'default';
  const icon = placeholderIcons[category] ?? <Camera className="h-12 w-12" />;
  const gradient = placeholderGradients[category] ?? 'from-primary-500 to-primary-700';

  return (
    <Link
      href={href}
      className={cn(
        'group block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all',
        'hover:-translate-y-1 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageError ? (
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={cn(
            'flex h-full w-full items-center justify-center bg-gradient-to-br text-white/90',
            gradient
          )}>
            {icon}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
            {title}
          </h3>
          <ArrowRight
            className="mt-1 h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-600"
            aria-hidden="true"
          />
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
          {description}
        </p>
      </div>
    </Link>
  );
}
