import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@repo/shared', () => ({
  getStalwartEnv: vi.fn(() => ({
    STALWART_API_URL: 'http://127.0.0.1:8080',
    STALWART_API_CREDENTIALS: 'admin:test-password',
  })),
}));

vi.mock('@/lib/logger', () => ({
  mailLogsLogger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

import { requireAuth } from '@/lib/api-auth';

import { GET } from '../route';

const mockedRequireAuth = vi.mocked(requireAuth);

function makeRequest(url = 'http://localhost/api/mail-logs'): NextRequest {
  return new Request(url) as unknown as NextRequest;
}

import type { NextRequest } from 'next/server';

interface MailLogsSuccessResponse {
  success: true;
  data: {
    items: Array<{
      timestamp: string;
      level: string;
      event: string;
      eventId: string;
      category: string;
      details: Record<string, string>;
    }>;
    total: number;
  };
}

interface MailLogsErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type MailLogsResponse = MailLogsSuccessResponse | MailLogsErrorResponse;

const MOCK_STALWART_RESPONSE = [
  {
    timestamp: '2026-02-11T10:00:00Z',
    level: 'info',
    event: 'Authentication successful',
    eventId: 'auth.success',
    details: 'accountName = "mayor@velikibukovec.hr", remoteIp = "10.0.0.1"',
  },
  {
    timestamp: '2026-02-11T10:01:00Z',
    level: 'warn',
    event: 'Authentication failed',
    eventId: 'auth.failed',
    details: 'accountName = "unknown@test.com", remoteIp = "192.168.1.1"',
  },
  {
    timestamp: '2026-02-11T10:02:00Z',
    level: 'info',
    event: 'Message delivered',
    eventId: 'delivery.delivered',
    details: 'from = "mayor@velikibukovec.hr", to = "citizen@example.com"',
  },
  {
    timestamp: '2026-02-11T10:03:00Z',
    level: 'info',
    event: 'Irrelevant event',
    eventId: 'some.other.event',
    details: 'data = "should be filtered out"',
  },
];

function mockAdminAuth() {
  mockedRequireAuth.mockResolvedValue({
    context: {
      session: { user: { id: 'user-1', role: 'admin' } },
      role: 'admin',
      userId: 'user-1',
    },
  } as never);
}

describe('GET /api/mail-logs', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('returns 401 when not authenticated', async () => {
    mockedRequireAuth.mockResolvedValue({
      response: new Response(
        JSON.stringify({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Niste prijavljeni' },
        }),
        { status: 401 }
      ) as never,
    });

    const response = await GET(makeRequest());
    const data = (await response.json()) as MailLogsResponse;

    expect(data.success).toBe(false);
    expect(response.status).toBe(401);
  });

  it('returns 403 when user is staff (not admin)', async () => {
    mockedRequireAuth.mockResolvedValue({
      response: new Response(
        JSON.stringify({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Nemate ovlasti za ovu akciju' },
        }),
        { status: 403 }
      ) as never,
    });

    const response = await GET(makeRequest());
    const data = (await response.json()) as MailLogsResponse;

    expect(data.success).toBe(false);
    expect(response.status).toBe(403);
  });

  it('returns filtered mail logs for admin user', async () => {
    mockAdminAuth();

    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify(MOCK_STALWART_RESPONSE), { status: 200 })
    );

    const response = await GET(makeRequest());
    const data = (await response.json()) as MailLogsSuccessResponse;

    expect(data.success).toBe(true);
    expect(data.data.items).toHaveLength(3);
    expect(data.data.total).toBe(3);
    expect(data.data.items[0]?.category).toBe('auth');
    expect(data.data.items[2]?.category).toBe('delivery');
  });

  it('filters by category query param', async () => {
    mockAdminAuth();

    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify(MOCK_STALWART_RESPONSE), { status: 200 })
    );

    const response = await GET(
      makeRequest('http://localhost/api/mail-logs?category=delivery')
    );
    const data = (await response.json()) as MailLogsSuccessResponse;

    expect(data.success).toBe(true);
    expect(data.data.items).toHaveLength(1);
    expect(data.data.items[0]?.eventId).toBe('delivery.delivered');
  });

  it('handles Stalwart API error (returns 502)', async () => {
    mockAdminAuth();

    vi.mocked(global.fetch).mockResolvedValue(
      new Response('Internal Server Error', { status: 500 })
    );

    const response = await GET(makeRequest());
    const data = (await response.json()) as MailLogsErrorResponse;

    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UPSTREAM_ERROR');
    expect(response.status).toBe(502);
  });

  it('handles Stalwart timeout (returns 502)', async () => {
    mockAdminAuth();

    vi.mocked(global.fetch).mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    const response = await GET(makeRequest());
    const data = (await response.json()) as MailLogsErrorResponse;

    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UPSTREAM_ERROR');
    expect(response.status).toBe(502);
  });

  it('parses details string correctly', async () => {
    mockAdminAuth();

    const itemsWithDetails = [
      {
        timestamp: '2026-02-11T10:00:00Z',
        level: 'info',
        event: 'Authentication successful',
        eventId: 'auth.success',
        details: 'accountName = "mayor@velikibukovec.hr", remoteIp = "10.0.0.1", protocol = "imap"',
      },
    ];

    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify(itemsWithDetails), { status: 200 })
    );

    const response = await GET(makeRequest());
    const data = (await response.json()) as MailLogsSuccessResponse;

    expect(data.success).toBe(true);
    const item = data.data.items[0];
    expect(item?.details).toEqual({
      accountName: 'mayor@velikibukovec.hr',
      remoteIp: '10.0.0.1',
      protocol: 'imap',
    });
  });
});
