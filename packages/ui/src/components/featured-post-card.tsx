import Link from 'next/link';

import { POST_CATEGORIES, type PostCategory } from '@repo/shared';

import { cn } from '../lib/utils';
import { Badge } from '../primitives/badge';

export interface FeaturedPostCardProps {
  title: string;
  excerpt: string | null;
  slug: string;
  category: string;
  featuredImage: string | null;
  publishedAt: Date | null;
  className?: string;
}

export function FeaturedPostCard({
  title,
  excerpt,
  slug,
  category,
  featuredImage,
  publishedAt,
  className,
}: FeaturedPostCardProps) {
  const formattedDate = publishedAt
    ? new Intl.DateTimeFormat('hr-HR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(publishedAt))
    : null;

  const categoryLabel =
    POST_CATEGORIES[category as PostCategory] ?? category;

  return (
    <Link
      href={`/vijesti/${slug}`}
      className={cn(
        'group relative block overflow-hidden rounded-xl bg-neutral-900',
        className
      )}
    >
      {/* Image */}
      <div className="aspect-[16/9] w-full overflow-hidden md:aspect-[2/1]">
        {featuredImage ? (
          <img
            src={featuredImage}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary-600 to-primary-800" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
        <div className="mb-3 flex items-center gap-3">
          <Badge variant="default" className="text-xs">
            {categoryLabel}
          </Badge>
          {formattedDate && (
            <span className="text-xs text-neutral-300">{formattedDate}</span>
          )}
        </div>
        <h3 className="font-display text-xl font-bold text-white md:text-2xl lg:text-3xl">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-neutral-300 md:text-base">
            {excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
