
import { postsRepository, type PostWithAuthor } from '@repo/database';
import { POST_CATEGORIES, POST_CATEGORY_OPTIONS } from '@repo/shared';
import {
  CategoryFilter,
  FadeIn,
  HeroSection,
  Pagination,
  PostCard,
  PostCardSkeleton,
  SectionHeader,
} from '@repo/ui';
import { Suspense } from 'react';

export const revalidate = 60;

interface NewsPageProps {
  searchParams: Promise<{
    kategorija?: string;
    stranica?: string;
  }>;
}

async function NewsContent({ category, page }: { category: string | undefined; page: number }) {
  const { posts, pagination } = await postsRepository.findPublished({
    page,
    limit: 12,
    ...(category && { category }),
  });

  const featuredPost = page === 1 && !category ? await postsRepository.getFeaturedPost() : null;
  const gridPosts = featuredPost ? posts.filter((p) => p.id !== featuredPost.id) : posts;

  return (
    <>
      {featuredPost && (
        <FadeIn>
          <HeroSection post={featuredPost} />
        </FadeIn>
      )}

      {gridPosts.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gridPosts.map((post: PostWithAuthor, index: number) => (
              <FadeIn key={post.id} delay={index * 0.05}>
                <PostCard
                  title={post.title}
                  excerpt={post.excerpt}
                  slug={post.slug}
                  category={POST_CATEGORIES[post.category as keyof typeof POST_CATEGORIES] || post.category}
                  featuredImage={post.featuredImage}
                  publishedAt={post.publishedAt}
                />
              </FadeIn>
            ))}
          </div>
          <FadeIn>
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} className="mt-12" />
          </FadeIn>
        </>
      ) : (
        <FadeIn>
          <div className="rounded-lg bg-neutral-100 py-12 text-center">
            <p className="text-neutral-600">
              {category ? 'Nema vijesti u odabranoj kategoriji.' : 'Trenutno nema objavljenih vijesti.'}
            </p>
          </div>
        </FadeIn>
      )}
    </>
  );
}

function NewsContentSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const category = params.kategorija;
  const page = Math.max(1, parseInt(params.stranica || '1', 10));

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <FadeIn>
          <SectionHeader title="Vijesti" description="Pratite sve novosti i događanja iz Općine Veliki Bukovec" />
        </FadeIn>

        <FadeIn>
          <Suspense fallback={null}>
            <CategoryFilter categories={POST_CATEGORY_OPTIONS} allLabel="Sve vijesti" className="mb-8" />
          </Suspense>
        </FadeIn>

        <Suspense fallback={<NewsContentSkeleton />}>
          <NewsContent category={category} page={page} />
        </Suspense>
      </div>
    </div>
  );
}
