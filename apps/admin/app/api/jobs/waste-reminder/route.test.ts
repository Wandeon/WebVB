// apps/admin/app/api/jobs/waste-reminder/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

interface ApiResponse {
  success: boolean;
  data?: {
    configured?: boolean;
    status?: string;
  };
  error?: {
    message: string;
  };
}

vi.mock('@repo/database', () => ({
  eventsRepository: {
    getWasteEventsForDate: vi.fn(),
  },
  pushSubscriptionsRepository: {
    hasRecentSend: vi.fn(),
    findForTopic: vi.fn(),
    createNotificationSend: vi.fn(),
  },
  isInQuietHours: vi.fn(),
}));

vi.mock('@repo/shared', () => ({
  isPushConfigured: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  contactLogger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/web-push', () => ({
  isWebPushError: vi.fn(),
  webpush: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { isPushConfigured } from '@repo/shared';

const mockedIsPushConfigured = vi.mocked(isPushConfigured);
const originalEnv = process.env;

describe('Waste reminder job status', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, CRON_SECRET: 'test-secret' };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('rejects status checks without cron secret', async () => {
    const response = await GET(
      new Request('http://localhost/api/jobs/waste-reminder') as never
    );
    const data = (await response.json()) as ApiResponse;

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('returns configuration status for authorized checks', async () => {
    mockedIsPushConfigured.mockReturnValue(true);

    const response = await GET(
      new Request('http://localhost/api/jobs/waste-reminder', {
        headers: { 'x-cron-secret': 'test-secret' },
      }) as never
    );
    const data = (await response.json()) as ApiResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data?.configured).toBe(true);
    expect(data.data?.status).toBe('ready');
    expect(data.data && 'hasCronSecret' in data.data).toBe(false);
  });
});
