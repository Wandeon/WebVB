import { contactMessagesRepository } from '@repo/database';
import { z } from 'zod';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { contactLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

// Query parameters validation schema
const messageQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['new', 'read', 'replied', 'archived']).optional(),
    search: z.string().max(200).optional(),
    sortBy: z.enum(['createdAt', 'status', 'name']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

// GET /api/messages - List contact messages with filtering, pagination, sorting
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);

    const queryResult = messageQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? undefined,
    });

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { page, limit, status, search, sortBy, sortOrder } =
      queryResult.data;

    const result = await contactMessagesRepository.findAll({
      page,
      limit,
      status,
      search,
      sortBy,
      sortOrder,
    });

    return apiSuccess({
      messages: result.messages.map(({ ipAddress, ...message }) => message),
      pagination: result.pagination,
    });
  } catch (error) {
    contactLogger.error({ error }, 'Failed to fetch contact messages');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška servera. Pokušajte ponovno.',
      500
    );
  }
}
