import Link from 'next/link';

import { cn } from '../lib/utils';

export interface GalleryCardProps {
  name: string;
  slug: string;
  coverImage: string | null;
  imageCount: number;
  eventDate: Date | null;
  className?: string;
}

export function GalleryCard({
  name,
  slug,
  coverImage,
  imageCount,
  eventDate,
  className,
}: GalleryCardProps) {
  const formattedDate = eventDate
    ? new Intl.DateTimeFormat('hr-HR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(eventDate))
    : null;

  return (
    <Link
      href={`/galerija/${slug}`}
      className={cn(
        'group block overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
          {name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
          <span>{imageCount} fotografija</span>
          {formattedDate && (
            <>
              <span>•</span>
              <span>{formattedDate}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
