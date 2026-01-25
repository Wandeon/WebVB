import { pagesRepository } from '@repo/database';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { pagesLogger } from '@/lib/logger';
import { generateSlug } from '@/lib/utils/slug';
import { updatePageSchema } from '@/lib/validations/page';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const page = await pagesRepository.findById(id);

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
    const body: unknown = await request.json();

    const validationResult = updatePageSchema.safeParse({
      ...(body as Record<string, unknown>),
      id,
    });

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const existingPage = await pagesRepository.findById(id);

    if (!existingPage) {
      return apiError(ErrorCodes.NOT_FOUND, 'Stranica nije pronađena', 404);
    }

    const { title, content, parentId, menuOrder } = validationResult.data;

    // Prevent circular reference
    if (parentId === id) {
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

      // Regenerate slug if title changed
      if (title !== existingPage.title) {
        let slug = generateSlug(title);
        let slugSuffix = 1;

        while (await pagesRepository.slugExists(slug, id)) {
          slug = `${generateSlug(title)}-${slugSuffix}`;
          slugSuffix++;
        }
        updateData.slug = slug;
      }
    }

    if (content !== undefined) updateData.content = content;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (menuOrder !== undefined) updateData.menuOrder = menuOrder;

    const page = await pagesRepository.update(id, updateData);

    pagesLogger.info({ pageId: page.id, slug: page.slug }, 'Stranica uspješno ažurirana');

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

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existingPage = await pagesRepository.findById(id);

    if (!existingPage) {
      return apiError(ErrorCodes.NOT_FOUND, 'Stranica nije pronađena', 404);
    }

    await pagesRepository.delete(id);

    pagesLogger.info({ pageId: id }, 'Stranica uspješno obrisana');

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
