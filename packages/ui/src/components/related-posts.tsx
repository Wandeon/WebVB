import { PostCard } from './post-card';
import { cn } from '../lib/utils';

export interface RelatedPost {
  title: string;
  excerpt: string | null;
  slug: string;
  category: string;
  categoryLabel: string;
  featuredImage: string | null;
  publishedAt: Date | null;
}

export interface RelatedPostsProps {
  posts: RelatedPost[];
  className?: string;
}

export function RelatedPosts({ posts, className }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <aside className={cn('', className)}>
      <h2 className="mb-4 font-display text-lg font-semibold text-neutral-900">
        Povezane vijesti
      </h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.slug}
            title={post.title}
            excerpt={post.excerpt}
            slug={post.slug}
            category={post.categoryLabel}
            featuredImage={post.featuredImage}
            publishedAt={post.publishedAt}
          />
        ))}
      </div>
    </aside>
  );
}
