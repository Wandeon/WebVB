import { indexPost, postsRepository, removeFromIndex } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { postsLogger } from '@/lib/logger';
import { parseUuidParam } from '@/lib/request-validation';
import { generateSlug } from '@/lib/utils/slug';
import { updatePostSchema } from '@/lib/validations/post';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/posts/[id] - Get single post by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const postId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const post = await postsRepository.findById(postId);

    if (!post) {
      return apiError(ErrorCodes.NOT_FOUND, 'Objava nije pronađena', 404);
    }

    return apiSuccess(post);
  } catch (error) {
    postsLogger.error({ error }, 'Greška prilikom dohvaćanja objave');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja objave',
      500
    );
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const postId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    // Validate request body
    const validationResult = updatePostSchema.safeParse({
      ...(body as Record<string, unknown>),
      id: postId,
    });

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    // Check if post exists
    const existingPost = await postsRepository.findById(postId);

    if (!existingPost) {
      return apiError(ErrorCodes.NOT_FOUND, 'Objava nije pronađena', 404);
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

    // Prepare update data
    const updateData: Parameters<typeof postsRepository.update>[1] = {};

    if (title !== undefined) {
      updateData.title = title;

      // Regenerate slug if title changed
      if (title !== existingPost.title) {
        let slug = generateSlug(title);
        let slugSuffix = 1;

        // Check for existing slug (excluding current post) and make it unique
        while (await postsRepository.slugExists(slug, postId)) {
          slug = `${generateSlug(title)}-${slugSuffix}`;
          slugSuffix++;
        }
        updateData.slug = slug;
      }
    }

    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (category !== undefined) updateData.category = category;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (publishedAt !== undefined) updateData.publishedAt = publishedAt;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;

    // Update post
    const post = await postsRepository.update(postId, updateData);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.POST,
      entityId: post.id,
      changes: {
        before: existingPost,
        after: post,
      },
    });

    // Update search index (handles publish/unpublish)
    await indexPost({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      publishedAt: post.publishedAt,
    });

    postsLogger.info({ postId }, 'Objava uspješno ažurirana');

    return apiSuccess(post);
  } catch (error) {
    postsLogger.error({ error }, 'Greška prilikom ažuriranja objave');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom ažuriranja objave',
      500
    );
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const postId = idResult.id;
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    // Check if post exists
    const exists = await postsRepository.exists(postId);

    if (!exists) {
      return apiError(ErrorCodes.NOT_FOUND, 'Objava nije pronađena', 404);
    }

    const existingPost = await postsRepository.findById(postId);

    if (!existingPost) {
      return apiError(ErrorCodes.NOT_FOUND, 'Objava nije pronađena', 404);
    }

    await postsRepository.delete(postId);

    // Remove from search index
    await removeFromIndex('post', postId);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.DELETE,
      entityType: AUDIT_ENTITY_TYPES.POST,
      entityId: existingPost.id,
      changes: {
        before: existingPost,
      },
    });

    postsLogger.info({ postId }, 'Objava uspješno obrisana');

    return apiSuccess({ deleted: true });
  } catch (error) {
    postsLogger.error({ error }, 'Greška prilikom brisanja objave');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom brisanja objave',
      500
    );
  }
}
