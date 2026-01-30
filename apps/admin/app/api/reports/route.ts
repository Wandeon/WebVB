import { problemReportsRepository } from '@repo/database';
import { z } from 'zod';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { problemReportsLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

// Query parameters validation schema
const reportQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['new', 'in_progress', 'resolved', 'rejected']).optional(),
  problemType: z.string().max(50).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'status', 'problemType']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// GET /api/reports - List problem reports with filtering, pagination, sorting
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);

    const queryResult = reportQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      problemType: searchParams.get('problemType') ?? undefined,
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

    const { page, limit, status, problemType, search, sortBy, sortOrder } =
      queryResult.data;

    const result = await problemReportsRepository.findAll({
      page,
      limit,
      status,
      problemType,
      search,
      sortBy,
      sortOrder,
    });

    return apiSuccess({
      reports: result.reports,
      pagination: result.pagination,
    });
  } catch (error) {
    problemReportsLogger.error({ error }, 'Failed to fetch problem reports');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška servera. Pokušajte ponovno.',
      500
    );
  }
}
