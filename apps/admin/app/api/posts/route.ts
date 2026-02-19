import { indexPost, Prisma, postsRepository } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { postsLogger } from '@/lib/logger';
import { triggerRebuild } from '@/lib/rebuild';
import { generateSlug } from '@/lib/utils/slug';
import { createPostSchema, postQuerySchema } from '@/lib/validations/post';

import type { NextRequest } from 'next/server';

// GET /api/posts - List posts with filtering, pagination, sorting
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const queryResult = postQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? undefined,
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
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

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

    // Generate unique slug with cap to prevent infinite loops
    const MAX_SLUG_ATTEMPTS = 10;
    let slug = generateSlug(title);
    let slugSuffix = 1;

    while (await postsRepository.slugExists(slug)) {
      if (slugSuffix > MAX_SLUG_ATTEMPTS) {
        return apiError(ErrorCodes.INTERNAL_ERROR, 'Ne mogu generirati jedinstveni slug', 500);
      }
      slug = `${generateSlug(title)}-${slugSuffix}`;
      slugSuffix++;
    }

    // Create post -- handle concurrent slug collision via unique constraint
    let post;
    try {
      post = await postsRepository.create({
        title,
        slug,
        content,
        excerpt: excerpt ?? null,
        category,
        isFeatured,
        publishedAt: publishedAt ?? null,
        featuredImage: featuredImage ?? null,
        authorId: authResult.context.userId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Slug collision from concurrent request -- retry with timestamp suffix
        slug = `${generateSlug(title)}-${Date.now().toString(36).slice(-4)}`;
        post = await postsRepository.create({
          title,
          slug,
          content,
          excerpt: excerpt ?? null,
          category,
          isFeatured,
          publishedAt: publishedAt ?? null,
          featuredImage: featuredImage ?? null,
          authorId: authResult.context.userId,
        });
      } else {
        throw error;
      }
    }

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.CREATE,
      entityType: AUDIT_ENTITY_TYPES.POST,
      entityId: post.id,
      changes: {
        after: post,
      },
    });

    // Index for search (best-effort -- core create must succeed even if indexing fails)
    try {
      await indexPost({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        category: post.category,
        publishedAt: post.publishedAt,
      });
    } catch (indexError) {
      postsLogger.error(
        { postId: post.id, error: indexError instanceof Error ? indexError.message : 'Unknown error' },
        'Failed to index post, will retry on next update',
      );
    }

    postsLogger.info({ postId: post.id, slug }, 'Objava uspješno stvorena');

    if (post.publishedAt) {
      triggerRebuild(`post-created:${post.id}`);
    }

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
