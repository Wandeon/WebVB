import { newsletterDraftRepository } from '@repo/database';
import { z } from 'zod';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { newsletterLogger } from '@/lib/logger';

import type { NewsletterItemType } from '@repo/database';
import type { NextRequest } from 'next/server';

const addItemSchema = z.object({
  type: z.enum(['post', 'announcement', 'event']),
  id: z.string().min(1),
});

const removeItemSchema = z.object({
  type: z.enum(['post', 'announcement', 'event']),
  id: z.string().min(1),
});

const reorderSchema = z.object({
  items: z.array(
    z.object({
      type: z.enum(['post', 'announcement', 'event']),
      id: z.string(),
      addedAt: z.string(),
    })
  ),
});

// POST /api/newsletter/draft/items - Add item to draft
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();
    const result = addItemSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani podaci',
        400
      );
    }

    const draft = await newsletterDraftRepository.addItem(
      result.data.type as NewsletterItemType,
      result.data.id
    );

    newsletterLogger.info(
      { type: result.data.type, id: result.data.id },
      'Stavka dodana u nacrt newslettera'
    );

    return apiSuccess(draft);
  } catch (error) {
    newsletterLogger.error({ error }, 'Greska prilikom dodavanja stavke u nacrt newslettera');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greska prilikom dodavanja stavke',
      500
    );
  }
}

// DELETE /api/newsletter/draft/items - Remove item from draft
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();
    const result = removeItemSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani podaci',
        400
      );
    }

    const draft = await newsletterDraftRepository.removeItem(
      result.data.type as NewsletterItemType,
      result.data.id
    );

    newsletterLogger.info(
      { type: result.data.type, id: result.data.id },
      'Stavka uklonjena iz nacrta newslettera'
    );

    return apiSuccess(draft);
  } catch (error) {
    newsletterLogger.error({ error }, 'Greska prilikom uklanjanja stavke iz nacrta newslettera');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greska prilikom uklanjanja stavke',
      500
    );
  }
}

// PUT /api/newsletter/draft/items - Reorder items
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();
    const result = reorderSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani podaci',
        400
      );
    }

    const draft = await newsletterDraftRepository.reorderItems(result.data.items);

    newsletterLogger.info('Stavke newslettera preuredene');

    return apiSuccess(draft);
  } catch (error) {
    newsletterLogger.error({ error }, 'Greska prilikom preuredivanja stavki newslettera');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greska prilikom preuredivanja stavki',
      500
    );
  }
}
