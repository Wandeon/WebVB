import { postsRepository } from '@repo/database';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { postsLogger } from '@/lib/logger';
import { generateSlug } from '@/lib/utils/slug';
import { createPostSchema, postQuerySchema } from '@/lib/validations/post';

import type { NextRequest } from 'next/server';

// GET /api/posts - List posts with filtering, pagination, sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const queryResult = postQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      category: searchParams.get('category'),
      status: searchParams.get('status'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { page, limit, search, category, status, sortBy, sortOrder } =
      queryResult.data;

    const result = await postsRepository.findAll({
      page,
      limit,
      search,
      category,
      status,
      sortBy,
      sortOrder,
    });

    return apiSuccess(result);
  } catch (error) {
    postsLogger.error({ error }, 'Greška prilikom dohvaćanja objava');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja objava',
      500
    );
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    // Validate request body
    const validationResult = createPostSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const {
      title,
      content,
      excerpt,
      category,
      isFeatured,
      publishedAt,
      featuredImage,
    } = validationResult.data;

    // Generate unique slug
    let slug = generateSlug(title);
    let slugSuffix = 1;

    // Check for existing slug and make it unique
    while (await postsRepository.slugExists(slug)) {
      slug = `${generateSlug(title)}-${slugSuffix}`;
      slugSuffix++;
    }

    // Create post
    const post = await postsRepository.create({
      title,
      slug,
      content,
      excerpt: excerpt ?? null,
      category,
      isFeatured,
      publishedAt: publishedAt ?? null,
      featuredImage: featuredImage ?? null,
    });

    postsLogger.info({ postId: post.id, slug }, 'Objava uspješno stvorena');

    return apiSuccess(post, 201);
  } catch (error) {
    postsLogger.error({ error }, 'Greška prilikom stvaranja objave');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom stvaranja objave',
      500
    );
  }
}
