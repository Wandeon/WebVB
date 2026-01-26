'use client';

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
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  category: string;
  featuredImage: string | null;
  publishedAt: Date | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function NewsPageClient() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const categoryParam = searchParams.get('kategorija');
  const category = categoryParam && categoryParam in POST_CATEGORIES ? categoryParam : undefined;
  const pageParam = searchParams.get('stranica');
  const rawPage = pageParam ? parseInt(pageParam, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        params.set('page', String(page));
        params.set('limit', '12');

        const response = await fetch(`${API_URL}/api/public/posts?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          const fetchedPosts = data.posts.map((p: { id: string; title: string; excerpt: string | null; slug: string; category: string; featuredImage: string | null; publishedAt: string | null }) => ({
            ...p,
            publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
          }));
          setPosts(fetchedPosts);
          setPagination(data.pagination);

          // Get featured post only on first page without category filter
          if (page === 1 && !category && data.featuredPost) {
            setFeaturedPost({
              ...data.featuredPost,
              publishedAt: data.featuredPost.publishedAt ? new Date(data.featuredPost.publishedAt) : null,
            });
          } else {
            setFeaturedPost(null);
          }
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [category, page]);

  const gridPosts = featuredPost ? posts.filter((p) => p.id !== featuredPost.id) : posts;

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <FadeIn>
          <SectionHeader title="Vijesti" description="Pratite sve novosti i događanja iz Općine Veliki Bukovec" />
        </FadeIn>

        <FadeIn>
          <CategoryFilter categories={POST_CATEGORY_OPTIONS} allLabel="Sve vijesti" className="mb-8" />
        </FadeIn>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {featuredPost && (
              <FadeIn>
                <HeroSection post={featuredPost} />
              </FadeIn>
            )}

            {gridPosts.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {gridPosts.map((post, index) => (
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
        )}
      </div>
    </div>
  );
}
