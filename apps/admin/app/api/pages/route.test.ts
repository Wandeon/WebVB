// apps/admin/app/api/pages/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requireAuth } from '@/lib/api-auth';

import { GET, POST } from './route';

import type * as PageValidationModule from '@/lib/validations/page';

// Define types for the mocked schema data
interface QueryData {
  page?: string | null;
  limit?: string | null;
  search?: string | null;
  parentId?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
}

interface CleanedQueryData {
  page: number;
  limit: number;
  search: string | undefined;
  parentId: string | null | undefined;
  sortBy: string;
  sortOrder: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    pages?: Array<{
      id: string;
      title: string;
      slug: string;
    }>;
    title?: string;
    slug?: string;
  };
  error?: string;
}

// Mock the repository
vi.mock('@repo/database', () => ({
  pagesRepository: {
    findAll: vi.fn(),
    slugExists: vi.fn(),
    exists: vi.fn(),
    create: vi.fn(),
  },
  indexPage: vi.fn(),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  pagesLogger: {
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
vi.mock('@/lib/validations/page', async () => {
  const actual = await vi.importActual<typeof PageValidationModule>('@/lib/validations/page');
  return {
    ...actual,
    pageQuerySchema: {
      safeParse: vi.fn((data: QueryData) => {
        // Filter out null values and apply defaults
        const cleaned: CleanedQueryData = {
          page: data.page ? Number(data.page) : 1,
          limit: data.limit ? Number(data.limit) : 20,
          search: data.search ?? undefined,
          parentId: data.parentId ?? undefined,
          sortBy: data.sortBy ?? 'menuOrder',
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
    createPageSchema: actual.createPageSchema,
  };
});

// Import mocked modules after vi.mock calls
// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { pagesRepository } from '@repo/database';

const mockedPagesRepository = vi.mocked(pagesRepository);
const mockedRequireAuth = vi.mocked(requireAuth);

describe('Pages API', () => {
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

  describe('GET /api/pages', () => {
    it('returns paginated pages', async () => {
      const mockPages = [
        {
          id: '1',
          title: 'O Općini',
          slug: 'o-opcini',
          content: '<p>Sadržaj</p>',
          parentId: null,
          menuOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          parent: null,
          children: [],
        },
      ];

      mockedPagesRepository.findAll.mockResolvedValue({
        pages: mockPages,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const request = new Request('http://localhost/api/pages');
      const response = await GET(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.pages).toHaveLength(1);
    });
  });

  describe('POST /api/pages', () => {
    it('creates a new page', async () => {
      mockedPagesRepository.slugExists.mockResolvedValue(false);
      mockedPagesRepository.create.mockResolvedValue({
        id: '1',
        title: 'Nova stranica',
        slug: 'nova-stranica',
        content: '<p>Sadržaj</p>',
        parentId: null,
        menuOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
        children: [],
      });

      const request = new Request('http://localhost/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Nova stranica',
          content: '<p>Sadržaj</p>',
          menuOrder: 0,
        }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data?.title).toBe('Nova stranica');
    });

    it('rejects reserved slugs', async () => {
      const request = new Request('http://localhost/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Galerija',
          content: '<p>Sadržaj</p>',
          menuOrder: 0,
        }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('validates required fields', async () => {
      const request = new Request('http://localhost/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('validates parent exists', async () => {
      mockedPagesRepository.exists.mockResolvedValue(false);

      const request = new Request('http://localhost/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Nova stranica',
          content: '<p>Sadržaj</p>',
          parentId: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
});
