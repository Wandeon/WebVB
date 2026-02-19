import { indexPage, pagesRepository, Prisma, removeFromIndex } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, isReservedPageSlug } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { pagesLogger } from '@/lib/logger';
import { triggerRebuild } from '@/lib/rebuild';
import { parseUuidParam } from '@/lib/request-validation';
import { generateSlug } from '@/lib/utils/slug';
import { updatePageSchema } from '@/lib/validations/page';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const pageId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const page = await pagesRepository.findById(pageId);

    if (!page) {
      return apiError(ErrorCodes.NOT_FOUND, 'Stranica nije pronađena', 404);
    }

    return apiSuccess(page);
  } catch (error) {
    pagesLogger.error({ error }, 'Greška prilikom dohvaćanja stranice');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja stranice',
      500
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const pageId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    const validationResult = updatePageSchema.safeParse({
      ...(body as Record<string, unknown>),
      id: pageId,
    });

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const existingPage = await pagesRepository.findById(pageId);

    if (!existingPage) {
      return apiError(ErrorCodes.NOT_FOUND, 'Stranica nije pronađena', 404);
    }

    const { title, content, parentId, menuOrder } = validationResult.data;

    // Prevent circular reference
    if (parentId === pageId) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Stranica ne može biti vlastiti roditelj',
        400
      );
    }

    // Validate parent exists if provided
    if (parentId) {
      const parentExists = await pagesRepository.exists(parentId);
      if (!parentExists) {
        return apiError(ErrorCodes.NOT_FOUND, 'Nadređena stranica ne postoji', 404);
      }
    }

    // Build update data conditionally
    const updateData: Parameters<typeof pagesRepository.update>[1] = {};

    if (title !== undefined) {
      updateData.title = title;

      // Regenerate slug if title changed (cap to prevent infinite loops)
      if (title !== existingPage.title) {
        const MAX_SLUG_ATTEMPTS = 10;
        let slug = generateSlug(title);
        let slugSuffix = 1;

        if (isReservedPageSlug(slug)) {
          return apiError(
            ErrorCodes.VALIDATION_ERROR,
            'Odabrani naslov koristi rezerviranu adresu. Promijenite naslov stranice.',
            400
          );
        }

        while (await pagesRepository.slugExists(slug, pageId)) {
          if (slugSuffix > MAX_SLUG_ATTEMPTS) {
            return apiError(ErrorCodes.INTERNAL_ERROR, 'Ne mogu generirati jedinstveni slug', 500);
          }
          slug = `${generateSlug(title)}-${slugSuffix}`;
          slugSuffix++;
        }
        updateData.slug = slug;
      }
    }

    if (content !== undefined) updateData.content = content;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (menuOrder !== undefined) updateData.menuOrder = menuOrder;

    // Update page -- handle concurrent slug collision via unique constraint
    let page;
    try {
      page = await pagesRepository.update(pageId, updateData);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Slug collision from concurrent request -- retry with timestamp suffix
        if (updateData.slug) {
          updateData.slug = `${updateData.slug}-${Date.now().toString(36).slice(-4)}`;
        }
        page = await pagesRepository.update(pageId, updateData);
      } else {
        throw error;
      }
    }

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.PAGE,
      entityId: page.id,
      changes: {
        before: existingPage,
        after: page,
      },
    });

    // Update search index (best-effort -- core update must succeed even if indexing fails)
    try {
      await indexPage({
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
      });
    } catch (indexError) {
      pagesLogger.error(
        { pageId: page.id, error: indexError instanceof Error ? indexError.message : 'Unknown error' },
        'Failed to index page, will retry on next update',
      );
    }

    pagesLogger.info({ pageId: page.id, slug: page.slug }, 'Stranica uspješno ažurirana');

    // Only rebuild if visible content changed (#146)
    const contentChanged =
      existingPage.title !== page.title ||
      existingPage.content !== page.content ||
      existingPage.slug !== page.slug ||
      existingPage.parentId !== page.parentId ||
      existingPage.menuOrder !== page.menuOrder;

    if (contentChanged) {
      triggerRebuild(`page-updated:${page.id}`);
    }

    return apiSuccess(page);
  } catch (error) {
    pagesLogger.error({ error }, 'Greška prilikom ažuriranja stranice');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom ažuriranja stranice',
      500
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const pageId = idResult.id;
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    const existingPage = await pagesRepository.findById(pageId);

    if (!existingPage) {
      return apiError(ErrorCodes.NOT_FOUND, 'Stranica nije pronađena', 404);
    }

    // Reassign children to this page's parent (or null for root) to prevent orphans
    await pagesRepository.reassignChildren(pageId, existingPage.parentId ?? null);

    await pagesRepository.delete(pageId);

    // Remove from search index (best-effort -- core delete must succeed even if cleanup fails)
    try {
      await removeFromIndex('page', pageId);
    } catch (indexError) {
      pagesLogger.error(
        { pageId, error: indexError instanceof Error ? indexError.message : 'Unknown error' },
        'Failed to clean search index',
      );
    }

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.DELETE,
      entityType: AUDIT_ENTITY_TYPES.PAGE,
      entityId: existingPage.id,
      changes: {
        before: existingPage,
      },
    });

    pagesLogger.info({ pageId }, 'Stranica uspješno obrisana');

    triggerRebuild(`page-deleted:${existingPage.id}`);

    return apiSuccess({ deleted: true });
  } catch (error) {
    pagesLogger.error({ error }, 'Greška prilikom brisanja stranice');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom brisanja stranice',
      500
    );
  }
}
