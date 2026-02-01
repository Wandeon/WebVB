import { z } from 'zod';

import { apiError, ErrorCodes } from '@/lib/api-response';

import type { NextResponse } from 'next/server';

const uuidSchema = z.string().uuid();

export type UuidParamResult =
  | { success: true; id: string }
  | { success: false; response: NextResponse };

export function parseUuidParam(id: string): UuidParamResult {
  const result = uuidSchema.safeParse(id);

  if (!result.success) {
    return {
      success: false,
      response: apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Neispravan identifikator',
        400
      ),
    };
  }

  return { success: true, id: result.data };
}
