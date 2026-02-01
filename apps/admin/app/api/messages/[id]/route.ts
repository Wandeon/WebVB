import { contactMessagesRepository, type ContactMessageStatus } from '@repo/database';
import { z } from 'zod';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { contactLogger } from '@/lib/logger';
import { parseUuidParam } from '@/lib/request-validation';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Update body validation schema
const updateMessageSchema = z
  .object({
    status: z.enum(['new', 'read', 'replied', 'archived']),
  })
  .strict();

// GET /api/messages/[id] - Get single contact message by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const messageId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const message = await contactMessagesRepository.findById(messageId);

    if (!message) {
      return apiError(ErrorCodes.NOT_FOUND, 'Poruka nije pronađena', 404);
    }

    return apiSuccess(message);
  } catch (error) {
    contactLogger.error({ error }, 'Failed to fetch contact message');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja poruke',
      500
    );
  }
}

// PUT /api/messages/[id] - Update contact message status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = parseUuidParam(id);
    if (!idResult.success) {
      return idResult.response;
    }
    const messageId = idResult.id;
    const authResult = await requireAuth(request);

    if ('response' in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    // Validate request body
    const validationResult = updateMessageSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { status } = validationResult.data;

    // Check if message exists
    const existingMessage = await contactMessagesRepository.findById(messageId);

    if (!existingMessage) {
      return apiError(ErrorCodes.NOT_FOUND, 'Poruka nije pronađena', 404);
    }

    let message;

    // If status is 'replied', use markReplied to also set repliedAt and repliedBy
    if (status === 'replied') {
      message = await contactMessagesRepository.markReplied(
        messageId,
        authResult.context.userId
      );
    } else {
      message = await contactMessagesRepository.updateStatus(
        messageId,
        status as ContactMessageStatus
      );
    }

    contactLogger.info(
      { messageId, status },
      'Contact message status updated successfully'
    );

    return apiSuccess(message);
  } catch (error) {
    contactLogger.error({ error }, 'Failed to update contact message');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom ažuriranja poruke',
      500
    );
  }
}
