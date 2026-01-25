import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { cn } from '../lib/utils';
import { Badge } from '../primitives/badge';
import { buttonVariants } from '../primitives/button';

export interface HeroPost {
  title: string;
  excerpt: string | null;
  slug: string;
  category: string;
  featuredImage: string | null;
  publishedAt: Date | null;
}

export interface HeroSectionProps {
  post: HeroPost | null;
  fallbackTitle?: string;
  fallbackDescription?: string;
  className?: string;
}

export function HeroSection({
  post,
  fallbackTitle = 'Dobrodošli u Općinu Veliki Bukovec',
  fallbackDescription = 'Službena web stranica Općine Veliki Bukovec - vijesti, dokumenti, događanja i informacije za građane.',
  className,
}: HeroSectionProps) {
  if (!post) {
    return (
      <section className={cn('bg-primary-700 py-16 md:py-24', className)}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold text-white md:text-5xl">
            {fallbackTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            {fallbackDescription}
          </p>
        </div>
      </section>
    );
  }

  const formattedDate = post.publishedAt
    ? new Intl.DateTimeFormat('hr-HR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(post.publishedAt))
    : null;

  return (
    <section className={cn('relative overflow-hidden', className)}>
      {post.featuredImage ? (
        <div className="absolute inset-0">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/50 to-neutral-900/30" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-primary-700" />
      )}
      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <Badge variant="secondary">{post.category}</Badge>
            {formattedDate && (
              <span className="text-sm text-white/80">{formattedDate}</span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold text-white md:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg text-white/90 md:text-xl">{post.excerpt}</p>
          )}
          <Link
            href={`/vijesti/${post.slug}`}
            className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'mt-6')}
          >
            Pročitaj više
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
