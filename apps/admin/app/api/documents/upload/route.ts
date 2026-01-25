import { randomUUID } from 'crypto';

import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  DOCUMENT_MAX_SIZE_BYTES,
  DOCUMENT_MAX_SIZE_MB,
} from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { documentsLogger } from '@/lib/logger';
import { uploadToR2 } from '@/lib/r2';

const PDF_SIGNATURE = '%PDF-';

function isPdfFile(buffer: Buffer): boolean {
  const header = buffer.subarray(0, 5).toString('ascii');
  return header === PDF_SIGNATURE;
}

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Datoteka nije odabrana',
        400
      );
    }

    // Validate file size
    if (file.size > DOCUMENT_MAX_SIZE_BYTES) {
      documentsLogger.warn(
        { size: file.size, maxSize: DOCUMENT_MAX_SIZE_BYTES },
        'File too large'
      );
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        `Datoteka je prevelika (max ${DOCUMENT_MAX_SIZE_MB}MB)`,
        400
      );
    }

    // Validate MIME type
    if (file.type !== 'application/pdf') {
      documentsLogger.warn({ mimeType: file.type, filename: file.name }, 'Invalid MIME type');
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Datoteka nije valjani PDF',
        400
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate PDF signature
    if (!isPdfFile(buffer)) {
      documentsLogger.warn({ filename: file.name }, 'Invalid PDF file');
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Datoteka nije valjani PDF',
        400
      );
    }

    const id = randomUUID();
    const key = `documents/${id}.pdf`;

    const fileUrl = await uploadToR2(key, buffer, 'application/pdf');

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.CREATE,
      entityType: AUDIT_ENTITY_TYPES.DOCUMENT,
      entityId: id,
      changes: {
        after: {
          id,
          fileUrl,
          fileSize: file.size,
        },
      },
    });

    documentsLogger.info({ documentId: id, size: file.size }, 'Document uploaded successfully');

    return apiSuccess({
      id,
      fileUrl,
      fileSize: file.size,
    });
  } catch (error) {
    documentsLogger.error({ error }, 'Failed to upload document');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri spremanju. Pokušajte ponovno.',
      500
    );
  }
}
