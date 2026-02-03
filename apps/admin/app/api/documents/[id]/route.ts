import { documentsRepository, indexDocument, removeFromIndex } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, updateDocumentSchema } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { documentsLogger } from '@/lib/logger';
import { getTextLogFields } from '@/lib/pii';
import { deleteFromR2, getR2KeyFromUrl } from '@/lib/r2';
import { parseUuidParam } from '@/lib/request-validation';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/documents/[id] - Update document metadata
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const documentId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    const validationResult = updateDocumentSchema.safeParse({
      ...(body as Record<string, unknown>),
      id: documentId,
    });

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const existingDocument = await documentsRepository.findById(documentId);

    if (!existingDocument) {
      return apiError(ErrorCodes.NOT_FOUND, 'Dokument nije pronađen', 404);
    }

    const { title, category, subcategory, year } = validationResult.data;

    const updateData: Parameters<typeof documentsRepository.update>[1] = {};

    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (year !== undefined) updateData.year = year;

    const document = await documentsRepository.update(documentId, updateData);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.DOCUMENT,
      entityId: document.id,
      changes: {
        before: existingDocument,
        after: document,
      },
    });

    // Update search index
    await indexDocument({
      id: document.id,
      title: document.title,
      fileUrl: document.fileUrl,
      category: document.category,
      subcategory: document.subcategory,
      year: document.year,
    });

    documentsLogger.info({ documentId }, 'Document updated successfully');

    return apiSuccess(document);
  } catch (error) {
    documentsLogger.error({ error }, 'Failed to update document');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška servera. Pokušajte ponovno.',
      500
    );
  }
}

// DELETE /api/documents/[id] - Delete document
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const documentId = idResult.id;
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    const existingDocument = await documentsRepository.findById(documentId);

    if (!existingDocument) {
      return apiError(
        ErrorCodes.NOT_FOUND,
        'Dokument je već obrisan ili nije pronađen',
        404
      );
    }

    // Delete from DB first
    const deletedDocument = await documentsRepository.delete(documentId);

    // Remove from search index
    await removeFromIndex('document', documentId);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.DELETE,
      entityType: AUDIT_ENTITY_TYPES.DOCUMENT,
      entityId: deletedDocument.id,
      changes: {
        before: existingDocument,
      },
    });

    // Best-effort R2 deletion (log errors but don't fail)
    const r2Key = getR2KeyFromUrl(existingDocument.fileUrl);
    if (r2Key) {
      try {
        await deleteFromR2(r2Key);
        documentsLogger.info(
          { documentId, r2Key: getTextLogFields(r2Key) },
          'Document file deleted from R2'
        );
      } catch (r2Error) {
        documentsLogger.error(
          { documentId, r2Key: getTextLogFields(r2Key), error: r2Error },
          'Failed to delete document file from R2 (DB record already deleted)'
        );
      }
    }

    documentsLogger.info(
      { documentId, title: getTextLogFields(deletedDocument.title) },
      'Document deleted successfully'
    );

    return apiSuccess({ deleted: true });
  } catch (error) {
    documentsLogger.error({ error }, 'Failed to delete document');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška servera. Pokušajte ponovno.',
      500
    );
  }
}
