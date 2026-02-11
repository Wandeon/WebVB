import { getStalwartEnv } from '@repo/shared';
import { z } from 'zod';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { mailLogsLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

const EVENT_CATEGORIES = {
  auth: ['auth.success', 'auth.failed', 'auth.error', 'auth.too-many-attempts'],
  security: [
    'security.unauthorized',
    'security.ip-blocked',
    'security.abuse-ban',
    'security.authentication-ban',
    'security.scan-ban',
  ],
  smtp: ['smtp.ehlo', 'smtp.mail-from', 'smtp.rcpt-to', 'smtp.spf-ehlo-fail'],
  delivery: [
    'delivery.delivered',
    'delivery.failed',
    'delivery.connect-error',
    'message-ingest.ham',
    'message-ingest.spam',
    'message-ingest.error',
  ],
} as const;

type EventCategory = keyof typeof EVENT_CATEGORIES;

const RELEVANT_EVENT_IDS: Set<string> = new Set(
  Object.values(EVENT_CATEGORIES).flat()
);

const CATEGORY_BY_EVENT_ID = new Map<string, EventCategory>(
  Object.entries(EVENT_CATEGORIES).flatMap(([category, ids]) =>
    ids.map((id) => [id, category as EventCategory])
  )
);

const querySchema = z.object({
  category: z
    .enum(['auth', 'security', 'smtp', 'delivery'])
    .optional(),
});

const DETAILS_REGEX = /(\w+)\s*=\s*"?([^",]*)"?/g;

function parseDetails(details: string): Record<string, string> {
  const result: Record<string, string> = {};
  let match: RegExpExecArray | null;
  while ((match = DETAILS_REGEX.exec(details)) !== null) {
    const key = match[1];
    const value = match[2];
    if (key && value !== undefined) {
      result[key] = value;
    }
  }
  DETAILS_REGEX.lastIndex = 0;
  return result;
}

interface StalwartLogItem {
  timestamp: string;
  level: string;
  event: string;
  event_id: string;
  details: string;
}

interface StalwartApiResponse {
  data: {
    items: StalwartLogItem[];
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);

    const queryResult = querySchema.safeParse({
      category: searchParams.get('category') ?? undefined,
    });

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { category } = queryResult.data;

    const env = getStalwartEnv();
    const credentials = Buffer.from(env.STALWART_API_CREDENTIALS).toString('base64');

    let response: Response;
    try {
      response = await fetch(`${env.STALWART_API_URL}/api/logs/live`, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        signal: AbortSignal.timeout(5000),
      });
    } catch (error) {
      mailLogsLogger.error({ error }, 'Failed to connect to Stalwart');
      return apiError(
        'UPSTREAM_ERROR',
        'Poslužitelj e-pošte nedostupan',
        502
      );
    }

    if (!response.ok) {
      mailLogsLogger.error(
        { status: response.status },
        'Stalwart API returned error'
      );
      return apiError(
        'UPSTREAM_ERROR',
        'Poslužitelj e-pošte nedostupan',
        502
      );
    }

    const body = (await response.json()) as StalwartApiResponse;
    const rawItems = body.data.items;

    const allowedIds: Set<string> = category
      ? new Set(EVENT_CATEGORIES[category])
      : RELEVANT_EVENT_IDS;

    const items = rawItems
      .filter((item) => allowedIds.has(item.event_id))
      .map((item) => ({
        timestamp: item.timestamp,
        level: item.level.toLowerCase(),
        event: item.event,
        eventId: item.event_id,
        category: CATEGORY_BY_EVENT_ID.get(item.event_id) ?? 'auth',
        details: parseDetails(item.details),
      }));

    return apiSuccess({ items, total: items.length });
  } catch (error) {
    mailLogsLogger.error({ error }, 'Failed to fetch mail logs');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja zapisnika e-pošte',
      500
    );
  }
}
