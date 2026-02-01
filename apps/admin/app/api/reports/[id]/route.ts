import { problemReportsRepository, type ProblemReportStatus } from '@repo/database';
import { z } from 'zod';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { problemReportsLogger } from '@/lib/logger';
import { parseUuidParam } from '@/lib/request-validation';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Update body validation schema
const updateReportSchema = z
  .object({
    status: z.enum(['new', 'in_progress', 'resolved', 'rejected']).optional(),
    resolutionNotes: z.string().max(5000).optional(),
  })
  .strict();

// GET /api/reports/[id] - Get single problem report by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const reportId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const report = await problemReportsRepository.findById(reportId);

    if (!report) {
      return apiError(ErrorCodes.NOT_FOUND, 'Prijava problema nije pronađena', 404);
    }

    const { ipAddress, ...sanitized } = report;
    return apiSuccess(sanitized);
  } catch (error) {
    problemReportsLogger.error({ error }, 'Failed to fetch problem report');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja prijave problema',
      500
    );
  }
}

// PUT /api/reports/[id] - Update problem report status or add resolution notes
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const reportId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    // Validate request body
    const validationResult = updateReportSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { status, resolutionNotes } = validationResult.data;

    // Check if at least one field is provided
    if (!status && !resolutionNotes) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Potrebno je navesti status ili bilješke rješenja',
        400
      );
    }

    // Check if report exists
    const existingReport = await problemReportsRepository.findById(reportId);

    if (!existingReport) {
      return apiError(ErrorCodes.NOT_FOUND, 'Prijava problema nije pronađena', 404);
    }

    let report;

    // If both status and resolutionNotes are provided, update status first, then add notes
    if (status && resolutionNotes) {
      await problemReportsRepository.updateStatus(
        reportId,
        status as ProblemReportStatus,
        authResult.context.userId
      );
      report = await problemReportsRepository.addResolutionNotes(
        reportId,
        resolutionNotes,
        authResult.context.userId
      );
    } else if (status) {
      report = await problemReportsRepository.updateStatus(
        reportId,
        status as ProblemReportStatus,
        authResult.context.userId
      );
    } else if (resolutionNotes) {
      report = await problemReportsRepository.addResolutionNotes(
        reportId,
        resolutionNotes,
        authResult.context.userId
      );
    }

    problemReportsLogger.info(
      { reportId, status, hasResolutionNotes: !!resolutionNotes },
      'Problem report updated successfully'
    );

    return apiSuccess(report);
  } catch (error) {
    problemReportsLogger.error({ error }, 'Failed to update problem report');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom ažuriranja prijave problema',
      500
    );
  }
}

// DELETE /api/reports/[id] - Delete problem report (GDPR request handling)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const reportId = idResult.id;

    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    const existingReport = await problemReportsRepository.findById(reportId);

    if (!existingReport) {
      return apiError(ErrorCodes.NOT_FOUND, 'Prijava problema nije pronađena', 404);
    }

    await problemReportsRepository.deleteById(reportId);

    problemReportsLogger.info({ reportId }, 'Problem report deleted');

    return apiSuccess({ message: 'Prijava problema je trajno obrisana.' });
  } catch (error) {
    problemReportsLogger.error({ error }, 'Failed to delete problem report');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom brisanja prijave problema',
      500
    );
  }
}
