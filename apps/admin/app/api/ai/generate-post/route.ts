import { aiQueueRepository } from '@repo/database';
import { z } from 'zod';

import { isSupportedMimeType, parseDocument } from '@/lib/ai';
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

// System prompt for Croatian municipality journalist
const SYSTEM_PROMPT = `Ti si profesionalni novinar koji piše članke za web stranicu Općine Veliki Bukovec.

PRAVILA:
- Piši isključivo na hrvatskom jeziku
- Koristi formalan ali pristupačan ton
- Članci trebaju biti informativni i relevantni za lokalno stanovništvo
- Izbjegavaj nepotrebne anglizme
- Koristi pravilnu hrvatsku gramatiku i pravopis

FORMAT ODGOVORA:
Odgovori ISKLJUČIVO u JSON formatu s ovim poljima:
{
  "title": "Naslov članka (max 100 znakova)",
  "content": "Sadržaj članka u HTML formatu (koristi <p>, <h2>, <h3>, <ul>, <li> tagove)",
  "excerpt": "Kratki sažetak članka za prikaz na listi (max 200 znakova)"
}

VAŽNO: Ne dodaj nikakav tekst prije ili nakon JSON objekta.`;

// =============================================================================
// Validation
// =============================================================================

const requestSchema = z.object({
  instructions: z
    .string()
    .min(1, 'Upute su obavezne')
    .max(MAX_INSTRUCTIONS_LENGTH, `Upute mogu imati maksimalno ${MAX_INSTRUCTIONS_LENGTH} znakova`),
  category: z.string().min(1, 'Kategorija je obavezna'),
});

// =============================================================================
// Helpers
// =============================================================================

function buildPrompt(
  instructions: string,
  category: string,
  documentText?: string
): string {
  let prompt = `UPUTE: ${instructions}\n\nKATEGORIJA: ${category}`;

  if (category) {
    prompt += `\n\nTON PISANJA: Prilagodi ton kategoriji "${category}".`;
  }

  if (documentText) {
    prompt += `\n\nDOKUMENT ZA REFERENCU:\n${documentText}`;
  }

  return prompt;
}

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

      documentText = parseResult.text;
      aiLogger.info(
        { wordCount: parseResult.wordCount, mimeType: document.type },
        'Document parsed successfully'
      );
    }

    // Build prompt
    const prompt = buildPrompt(
      validationResult.data.instructions,
      validationResult.data.category,
      documentText
    );

    // Create AI queue job
    const job = await aiQueueRepository.create({
      userId: authResult.context.userId,
      requestType: 'post_generation' as AiRequestType,
      inputData: {
        prompt,
        system: SYSTEM_PROMPT,
        metadata: {
          instructions: validationResult.data.instructions,
          category: validationResult.data.category,
          hasDocument,
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
