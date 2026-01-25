import { cn } from '../lib/utils';
import { Badge } from '../primitives/badge';

export interface ArticleHeroProps {
  title: string;
  category: string;
  categoryLabel: string;
  publishedAt: Date;
  featuredImage: string | null;
  className?: string;
}

export function ArticleHero({
  title,
  category: _category,
  categoryLabel,
  publishedAt,
  featuredImage,
  className,
}: ArticleHeroProps) {
  const formattedDate = new Intl.DateTimeFormat('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(publishedAt));

  return (
    <div
      className={cn(
        'relative flex min-h-[300px] items-end bg-primary-900 md:min-h-[400px]',
        className
      )}
    >
      {featuredImage && (
        <img
          src={featuredImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="relative z-10 w-full px-4 pb-8 pt-16 md:pb-12">
        <div className="container mx-auto">
          <div className="mb-4 flex items-center gap-3">
            <Badge variant="secondary">{categoryLabel}</Badge>
            <span className="text-sm text-white/80">{formattedDate}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}
