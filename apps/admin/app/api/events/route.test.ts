// apps/admin/app/api/events/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requireAuth } from '@/lib/api-auth';

import { GET, POST } from './route';

import type * as EventValidationModule from '@/lib/validations/event';

// Define types for the mocked schema data
interface QueryData {
  page?: string | null;
  limit?: string | null;
  search?: string | null;
  from?: string | null;
  to?: string | null;
  upcoming?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
}

interface CleanedQueryData {
  page: number;
  limit: number;
  search: string | undefined;
  from: string | undefined;
  to: string | undefined;
  upcoming: boolean | undefined;
  sortBy: string;
  sortOrder: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    events?: Array<{
      id: string;
      title: string;
      eventDate: Date;
    }>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    title?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Mock the repository
vi.mock('@repo/database', () => ({
  eventsRepository: {
    findAll: vi.fn(),
    create: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  eventsLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/api-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/audit-log', () => ({
  createAuditLog: vi.fn(),
}));

// Mock the validations to handle null values from searchParams.get()
vi.mock('@/lib/validations/event', async () => {
  const actual =
    await vi.importActual<typeof EventValidationModule>(
      '@/lib/validations/event'
    );
  return {
    ...actual,
    eventQuerySchema: {
      safeParse: vi.fn((data: QueryData) => {
        // Filter out null values and apply defaults
        const cleaned: CleanedQueryData = {
          page: data.page ? Number(data.page) : 1,
          limit: data.limit ? Number(data.limit) : 20,
          search: data.search ?? undefined,
          from: data.from ?? undefined,
          to: data.to ?? undefined,
          upcoming: data.upcoming === 'true' ? true : undefined,
          sortBy: data.sortBy ?? 'eventDate',
          sortOrder: data.sortOrder ?? 'asc',
        };

        // Validate page/limit are positive
        if (cleaned.page <= 0 || cleaned.limit <= 0 || cleaned.limit > 100) {
          return {
            success: false as const,
            error: { issues: [{ message: 'Invalid params' }] },
          };
        }

        return { success: true as const, data: cleaned };
      }),
    },
    createEventSchema: actual.createEventSchema,
  };
});

// Import mocked modules after vi.mock calls
// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { eventsRepository } from '@repo/database';

const mockedEventsRepository = vi.mocked(eventsRepository);
const mockedRequireAuth = vi.mocked(requireAuth);

describe('Events API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRequireAuth.mockResolvedValue({
      context: {
        session: { user: { id: 'user-1', role: 'admin' } },
        role: 'admin',
        userId: 'user-1',
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/events', () => {
    it('returns paginated events', async () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Dan općine',
          description: '<p>Opis</p>',
          eventDate: new Date('2026-02-15'),
          eventTime: null,
          endDate: null,
          location: 'Trg',
          posterImage: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockedEventsRepository.findAll.mockResolvedValue({
        events: mockEvents,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const request = new Request('http://localhost/api/events');
      const response = await GET(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.events).toHaveLength(1);
    });

    it('filters by date range', async () => {
      mockedEventsRepository.findAll.mockResolvedValue({
        events: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      const request = new Request(
        'http://localhost/api/events?from=2026-01-01&to=2026-12-31'
      );
      await GET(request as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedEventsRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          from: expect.any(Date),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          to: expect.any(Date),
        })
      );
    });

    it('filters upcoming events', async () => {
      mockedEventsRepository.findAll.mockResolvedValue({
        events: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      const request = new Request('http://localhost/api/events?upcoming=true');
      await GET(request as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedEventsRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          upcoming: true,
        })
      );
    });
  });

  describe('POST /api/events', () => {
    it('creates a new event', async () => {
      mockedEventsRepository.create.mockResolvedValue({
        id: '1',
        title: 'Novo događanje',
        description: '<p>Opis</p>',
        eventDate: new Date('2026-03-01'),
        eventTime: null,
        endDate: null,
        location: 'Dom kulture',
        posterImage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request('http://localhost/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Novo događanje',
          description: '<p>Opis</p>',
          eventDate: '2026-03-01',
          location: 'Dom kulture',
        }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data?.title).toBe('Novo događanje');
    });

    it('validates required fields', async () => {
      const request = new Request('http://localhost/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('validates end date is after start date', async () => {
      const request = new Request('http://localhost/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Događanje',
          eventDate: '2026-03-15',
          endDate: '2026-03-01',
        }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.message).toContain('Datum završetka');
    });
  });
});
