import Link from 'next/link';

import { cn } from '../lib/utils';
import { Badge } from '../primitives/badge';

export interface PostCardProps {
  title: string;
  excerpt: string | null;
  slug: string;
  category: string;
  featuredImage: string | null;
  publishedAt: Date | null;
  className?: string;
}

export function PostCard({
  title,
  excerpt,
  slug,
  category,
  featuredImage,
  publishedAt,
  className,
}: PostCardProps) {
  const formattedDate = publishedAt
    ? new Intl.DateTimeFormat('hr-HR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(publishedAt))
    : null;

  return (
    <Link
      href={`/vijesti/${slug}`}
      className={cn(
        'group block overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      {featuredImage && (
        <div className="aspect-video overflow-hidden">
          <img
            src={featuredImage}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          {formattedDate && (
            <span className="text-xs text-neutral-500">
              Objavljeno {formattedDate}
            </span>
          )}
        </div>
        <h3 className="font-display text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{excerpt}</p>
        )}
      </div>
    </Link>
  );
}
