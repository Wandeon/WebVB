import { postsRepository } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { postsLogger } from '@/lib/logger';
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
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const post = await postsRepository.findById(id);

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
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    // Validate request body
    const validationResult = updatePostSchema.safeParse({
      ...(body as Record<string, unknown>),
      id,
    });

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    // Check if post exists
    const existingPost = await postsRepository.findById(id);

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
        while (await postsRepository.slugExists(slug, id)) {
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
    const post = await postsRepository.update(id, updateData);

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

    postsLogger.info({ postId: id }, 'Objava uspješno ažurirana');

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
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    // Check if post exists
    const exists = await postsRepository.exists(id);

    if (!exists) {
      return apiError(ErrorCodes.NOT_FOUND, 'Objava nije pronađena', 404);
    }

    const existingPost = await postsRepository.findById(id);

    if (!existingPost) {
      return apiError(ErrorCodes.NOT_FOUND, 'Objava nije pronađena', 404);
    }

    await postsRepository.delete(id);

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

    postsLogger.info({ postId: id }, 'Objava uspješno obrisana');

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
