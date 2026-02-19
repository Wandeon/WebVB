import { aiQueueRepository } from '@repo/database';
import { z } from 'zod';

import { isSupportedMimeType, parseDocument } from '@/lib/ai';
import { hashText, sanitizeDocumentText, wrapDocumentForPrompt } from '@/lib/ai/prompt-utils';
import { buildGenerateUserPrompt, GENERATE_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { aiLogger } from '@/lib/logger';

import type { AiRequestType } from '@repo/database';
import type { NextRequest } from 'next/server';

// =============================================================================
// Constants
// =============================================================================

const MAX_INSTRUCTIONS_LENGTH = 2000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PROMPT_LENGTH = 16000;
const MAX_DOCUMENT_TEXT_LENGTH = 50_000; // 50K chars -- truncate before sanitization (#151)

// =============================================================================
// Validation
// =============================================================================

const requestSchema = z
  .object({
    instructions: z
      .string()
      .min(1, 'Upute su obavezne')
      .max(MAX_INSTRUCTIONS_LENGTH, `Upute mogu imati maksimalno ${MAX_INSTRUCTIONS_LENGTH} znakova`),
    category: z.string().min(1, 'Kategorija je obavezna'),
  })
  .strict();

// =============================================================================
// POST /api/ai/generate-post - Submit post generation job
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    // Parse multipart form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani format zahtjeva. Očekuje se multipart/form-data.',
        400
      );
    }

    // Extract and validate fields
    const instructions = formData.get('instructions');
    const category = formData.get('category');
    const document = formData.get('document');

    // Validate required fields
    if (typeof instructions !== 'string' || typeof category !== 'string') {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Upute i kategorija su obavezni',
        400
      );
    }

    const validationResult = requestSchema.safeParse({ instructions, category });

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        firstIssue?.message ?? 'Nevaljani podaci',
        400
      );
    }

    let documentText: string | undefined;
    let documentHash: string | null = null;
    let documentRedactions = 0;
    let hasDocument = false;

    // Process document if provided
    if (document && document instanceof File && document.size > 0) {
      hasDocument = true;

      // Validate file size
      if (document.size > MAX_FILE_SIZE) {
        return apiError(
          ErrorCodes.VALIDATION_ERROR,
          `Dokument je prevelik. Maksimalna veličina je ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
          400
        );
      }

      // Validate MIME type
      if (!isSupportedMimeType(document.type)) {
        return apiError(
          ErrorCodes.VALIDATION_ERROR,
          'Nepodržani format dokumenta. Podržani formati: PDF, DOCX, JPEG, PNG.',
          400
        );
      }

      // Parse document
      const buffer = Buffer.from(await document.arrayBuffer());
      const parseResult = await parseDocument(buffer, document.type);

      if (!parseResult.success) {
        aiLogger.warn(
          { error: parseResult.error, mimeType: document.type },
          'Document parsing failed'
        );
        return apiError(
          ErrorCodes.VALIDATION_ERROR,
          `Greška pri obradi dokumenta: ${parseResult.error}`,
          400
        );
      }

      // Truncate before sanitization to prevent regex DoS (#151)
      let rawDocText = parseResult.text;
      if (rawDocText.length > MAX_DOCUMENT_TEXT_LENGTH) {
        aiLogger.warn(
          { originalLength: rawDocText.length, maxLength: MAX_DOCUMENT_TEXT_LENGTH },
          'Document text truncated before sanitization'
        );
        rawDocText = rawDocText.slice(0, MAX_DOCUMENT_TEXT_LENGTH);
      }

      const sanitized = sanitizeDocumentText(rawDocText);
      documentText = sanitized.sanitized;
      documentRedactions = sanitized.redactions;
      documentHash = hashText(documentText);
      aiLogger.info(
        {
          wordCount: parseResult.wordCount,
          mimeType: document.type,
          redactions: documentRedactions,
        },
        'Document parsed successfully'
      );
    }

    // Build prompt with few-shot examples
    const prompt = buildGenerateUserPrompt(
      validationResult.data.instructions,
      validationResult.data.category,
      documentText ? wrapDocumentForPrompt(documentText) : undefined
    );

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Upute i dokument su predugi za obradu. Skraćite sadržaj i pokušajte ponovno.',
        400
      );
    }

    const idempotencyKey = hashText(
      JSON.stringify({
        instructions: validationResult.data.instructions,
        category: validationResult.data.category,
        documentHash,
      })
    );

    const existingJob = await aiQueueRepository.findByIdempotencyKey({
      userId: authResult.context.userId,
      requestType: 'post_generation',
      idempotencyKey,
    });

    if (existingJob) {
      return apiSuccess(
        {
          jobId: existingJob.id,
          deduplicated: true,
          status: existingJob.status,
        },
        200
      );
    }

    // Create AI queue job
    const job = await aiQueueRepository.create({
      userId: authResult.context.userId,
      requestType: 'post_generation' as AiRequestType,
      inputData: {
        prompt,
        system: GENERATE_SYSTEM_PROMPT,
        idempotencyKey,
        metadata: {
          instructions: validationResult.data.instructions,
          category: validationResult.data.category,
          hasDocument,
          documentHash,
          documentRedactions,
        },
      },
    });

    aiLogger.info(
      {
        jobId: job.id,
        category: validationResult.data.category,
        hasDocument,
      },
      'Post generation job created'
    );

    return apiSuccess({ jobId: job.id }, 201);
  } catch (error) {
    aiLogger.error({ error }, 'Greška pri kreiranju zadatka za generiranje objave');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri kreiranju zadatka za generiranje objave',
      500
    );
  }
}
