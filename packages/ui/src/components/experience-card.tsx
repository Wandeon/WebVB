import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '../lib/utils';

export interface ExperienceCardProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  className?: string;
}

export function ExperienceCard({
  title,
  description,
  image,
  imageAlt,
  href,
  className,
}: ExperienceCardProps) {
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
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
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
