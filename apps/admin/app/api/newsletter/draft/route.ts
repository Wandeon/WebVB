import { newsletterDraftRepository } from '@repo/database';
import { z } from 'zod';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { newsletterLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

const updateIntroSchema = z
  .object({
    introText: z.string().nullable().optional(),
  })
  .strict();

// GET /api/newsletter/draft - Get current draft
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const draft = await newsletterDraftRepository.get();
    return apiSuccess(draft);
  } catch (error) {
    newsletterLogger.error({ error }, 'Greska prilikom dohvacanja nacrta newslettera');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greska prilikom dohvacanja nacrta',
      500
    );
  }
}

// PUT /api/newsletter/draft - Update intro text
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();
    const result = updateIntroSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani podaci',
        400
      );
    }

    const draft = await newsletterDraftRepository.updateIntro(result.data.introText ?? null);
    newsletterLogger.info('Uvodni tekst newslettera azuriran');
    return apiSuccess(draft);
  } catch (error) {
    newsletterLogger.error({ error }, 'Greska prilikom azuriranja nacrta newslettera');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greska prilikom azuriranja nacrta',
      500
    );
  }
}

// DELETE /api/newsletter/draft - Clear draft
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    await newsletterDraftRepository.clear();
    newsletterLogger.info('Nacrt newslettera obrisan');
    return apiSuccess({ cleared: true });
  } catch (error) {
    newsletterLogger.error({ error }, 'Greska prilikom brisanja nacrta newslettera');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greska prilikom brisanja nacrta',
      500
    );
  }
}
