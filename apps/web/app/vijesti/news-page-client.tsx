'use client';

import { POST_CATEGORIES, POST_CATEGORY_OPTIONS } from '@repo/shared';
import {
  CategoryFilter,
  ContentTypeSwitcher,
  FadeIn,
  HeroSection,
  Pagination,
  PostCard,
  PostCardSkeleton,
  SectionHeader,
} from '@repo/ui';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  category: string;
  featuredImage: string | null;
  publishedAt: Date | null;
}

interface SerializedPost {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  category: string;
  featuredImage: string | null;
  publishedAt: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PublicPostsResponse {
  success: boolean;
  data?: {
    posts: SerializedPost[];
    featuredPost: SerializedPost | null;
    pagination: PaginationData;
  };
  error?: {
    message: string;
  };
}

export interface NewsPageInitialData {
  posts: SerializedPost[];
  featuredPost: SerializedPost | null;
  pagination: PaginationData;
}

interface NewsPageClientProps {
  initialData: NewsPageInitialData;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const FETCH_TIMEOUT_MS = 10_000;

const deserializePost = (post: SerializedPost): Post => ({
  ...post,
  publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
});

export function NewsPageClient({ initialData }: NewsPageClientProps) {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>(
    initialData.posts.map(deserializePost)
  );
  const [featuredPost, setFeaturedPost] = useState<Post | null>(
    initialData.featuredPost ? deserializePost(initialData.featuredPost) : null
  );
  const [pagination, setPagination] = useState<PaginationData>(
    initialData.pagination
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryParam = searchParams.get('kategorija');
  const category = categoryParam && categoryParam in POST_CATEGORIES ? categoryParam : undefined;
  const pageParam = searchParams.get('stranica');
  const rawPage = pageParam ? parseInt(pageParam, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const shouldUseInitialData = useMemo(
    () => page === 1 && !category,
    [category, page]
  );

  useEffect(() => {
    if (shouldUseInitialData) {
      setPosts(initialData.posts.map(deserializePost));
      setFeaturedPost(
        initialData.featuredPost ? deserializePost(initialData.featuredPost) : null
      );
      setPagination(initialData.pagination);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    async function fetchPosts() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        params.set('page', String(page));
        params.set('limit', '12');

        const response = await fetch(
          `${API_URL}/api/public/posts?${params.toString()}`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as PublicPostsResponse;

        if (!response.ok || !payload.success || !payload.data) {
          setErrorMessage('Ne možemo trenutno učitati vijesti. Pokušajte ponovno.');
          return;
        }

        setPosts(payload.data.posts.map(deserializePost));
        setPagination(payload.data.pagination);

        if (page === 1 && !category && payload.data.featuredPost) {
          setFeaturedPost(deserializePost(payload.data.featuredPost));
        } else {
          setFeaturedPost(null);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        setErrorMessage('Ne možemo trenutno učitati vijesti. Pokušajte ponovno.');
      } finally {
        setIsLoading(false);
        window.clearTimeout(timeoutId);
      }
    }

    void fetchPosts();

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [category, page, initialData, shouldUseInitialData]);

  const gridPosts = featuredPost ? posts.filter((p) => p.id !== featuredPost.id) : posts;

  return (
    <>
      {/* Content type switcher - desktop top tabs, mobile bottom bar */}
      <ContentTypeSwitcher />

      <div className="py-8 pb-24 sm:pb-12 md:py-12">
        <div className="container mx-auto px-4">
          <FadeIn>
            <SectionHeader title="Vijesti" description="Pratite sve novosti i događanja iz Općine Veliki Bukovec" />
          </FadeIn>

          {/* Sticky category filter with improved mobile UX */}
          <CategoryFilter categories={POST_CATEGORY_OPTIONS} allLabel="Sve vijesti" className="mb-8" sticky />

        {errorMessage ? (
          <FadeIn>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              {errorMessage}
            </div>
          </FadeIn>
        ) : isLoading ? (
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
                  <p className="mt-2 text-sm text-neutral-500">
                    {category ? (
                      <>
                        Pokušajte s drugom kategorijom ili{' '}
                        <Link href="/vijesti" className="text-primary-600 hover:underline">
                          pogledajte sve vijesti
                        </Link>
                        .
                      </>
                    ) : (
                      <>
                        Provjerite{' '}
                        <Link href="/obavijesti" className="text-primary-600 hover:underline">
                          obavijesti
                        </Link>{' '}
                        ili nas{' '}
                        <Link href="/kontakt" className="text-primary-600 hover:underline">
                          kontaktirajte
                        </Link>
                        .
                      </>
                    )}
                  </p>
                </div>
              </FadeIn>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}
