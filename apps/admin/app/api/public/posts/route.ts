import { postsRepository, type PostWithAuthor } from '@repo/database';
import { POST_CATEGORIES } from '@repo/shared';
import { z } from 'zod';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { postsLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

const categoryKeys = Object.keys(POST_CATEGORIES) as [
  keyof typeof POST_CATEGORIES,
  ...Array<keyof typeof POST_CATEGORIES>,
];

const publicPostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  category: z.enum(categoryKeys).optional(),
});

const mapPost = (post: PostWithAuthor) => ({
  id: post.id,
  title: post.title,
  excerpt: post.excerpt,
  slug: post.slug,
  category: post.category,
  featuredImage: post.featuredImage,
  publishedAt: post.publishedAt,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryResult = publicPostsQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      category: searchParams.get('category') ?? undefined,
    });

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { page, limit, category } = queryResult.data;
    const result = await postsRepository.findPublished({
      page,
      limit,
      ...(category ? { category } : {}),
    });
    const featuredPost =
      page === 1 && !category ? await postsRepository.getFeaturedPost() : null;

    return apiSuccess({
      posts: result.posts.map(mapPost),
      featuredPost: featuredPost ? mapPost(featuredPost) : null,
      pagination: result.pagination,
    });
  } catch (error) {
    postsLogger.error({ error }, 'Greška prilikom dohvaćanja javnih vijesti');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja vijesti',
      500
    );
  }
}
