// apps/admin/app/api/galleries/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requireAuth } from '@/lib/api-auth';
import { createAuditLog } from '@/lib/audit-log';

import { GET, POST } from './route';

import type * as GalleryValidationModule from '@/lib/validations/gallery';

// Define types for the mocked schema data
interface QueryData {
  page?: string | null;
  limit?: string | null;
  search?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
}

interface CleanedQueryData {
  page: number;
  limit: number;
  search: string | undefined;
  sortBy: string;
  sortOrder: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    data?: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    galleries?: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    name?: string;
    slug?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Mock the repository
vi.mock('@repo/database', () => ({
  galleriesRepository: {
    findAll: vi.fn(),
    slugExists: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/lib/api-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/audit-log', () => ({
  createAuditLog: vi.fn(),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  galleriesLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the validations to handle null values from searchParams.get()
vi.mock('@/lib/validations/gallery', async () => {
  const actual =
    await vi.importActual<typeof GalleryValidationModule>(
      '@/lib/validations/gallery'
    );
  return {
    ...actual,
    galleryQuerySchema: {
      safeParse: vi.fn((data: QueryData) => {
        // Filter out null values and apply defaults
        const cleaned: CleanedQueryData = {
          page: data.page ? Number(data.page) : 1,
          limit: data.limit ? Number(data.limit) : 20,
          search: data.search ?? undefined,
          sortBy: data.sortBy ?? 'createdAt',
          sortOrder: data.sortOrder ?? 'desc',
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
    createGallerySchema: actual.createGallerySchema,
  };
});

// Import mocked modules after vi.mock calls
// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { galleriesRepository } from '@repo/database';

const mockedGalleriesRepository = vi.mocked(galleriesRepository);
const mockedRequireAuth = vi.mocked(requireAuth);
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- available for future audit assertions
const _mockedCreateAuditLog = vi.mocked(createAuditLog);

describe('Galleries API', () => {
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

  describe('GET /api/galleries', () => {
    it('returns paginated galleries', async () => {
      const mockGalleries = [
        {
          id: '1',
          name: 'Dan općine 2026',
          slug: 'dan-opcine-2026',
          description: null,
          eventDate: new Date('2026-02-15'),
          coverImage: null,
          createdAt: new Date(),
          _count: { images: 5 },
        },
      ];

      mockedGalleriesRepository.findAll.mockResolvedValue({
        galleries: mockGalleries,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const request = new Request('http://localhost/api/galleries');
      const response = await GET(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.data).toHaveLength(1);
    });

    it('filters by search term', async () => {
      mockedGalleriesRepository.findAll.mockResolvedValue({
        galleries: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      const request = new Request(
        'http://localhost/api/galleries?search=dan%20opcine'
      );
      await GET(request as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedGalleriesRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'dan opcine',
        })
      );
    });

    it('supports pagination', async () => {
      mockedGalleriesRepository.findAll.mockResolvedValue({
        galleries: [],
        pagination: { page: 2, limit: 10, total: 25, totalPages: 3 },
      });

      const request = new Request(
        'http://localhost/api/galleries?page=2&limit=10'
      );
      await GET(request as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedGalleriesRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 10,
        })
      );
    });

    it('supports sorting', async () => {
      mockedGalleriesRepository.findAll.mockResolvedValue({
        galleries: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      const request = new Request(
        'http://localhost/api/galleries?sortBy=name&sortOrder=asc'
      );
      await GET(request as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedGalleriesRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'name',
          sortOrder: 'asc',
        })
      );
    });
  });

  describe('POST /api/galleries', () => {
    it('creates a new gallery', async () => {
      mockedGalleriesRepository.slugExists.mockResolvedValue(false);
      mockedGalleriesRepository.create.mockResolvedValue({
        id: '1',
        name: 'Nova galerija',
        slug: 'nova-galerija',
        description: null,
        eventDate: null,
        coverImage: null,
        createdAt: new Date(),
        images: [],
        _count: { images: 0 },
      });

      const request = new Request('http://localhost/api/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Nova galerija',
        }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data?.name).toBe('Nova galerija');
    });

    it('creates gallery with all fields', async () => {
      mockedGalleriesRepository.slugExists.mockResolvedValue(false);
      mockedGalleriesRepository.create.mockResolvedValue({
        id: '1',
        name: 'Proslava',
        slug: 'proslava',
        description: 'Opis proslave',
        eventDate: new Date('2026-05-01'),
        coverImage: 'https://example.com/cover.jpg',
        createdAt: new Date(),
        images: [],
        _count: { images: 0 },
      });

      const request = new Request('http://localhost/api/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Proslava',
          description: 'Opis proslave',
          eventDate: '2026-05-01',
          coverImage: 'https://example.com/cover.jpg',
        }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedGalleriesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Proslava',
          description: 'Opis proslave',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          eventDate: expect.any(Date),
          coverImage: 'https://example.com/cover.jpg',
        })
      );
    });

    it('validates required fields', async () => {
      const request = new Request('http://localhost/api/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '' }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('validates name minimum length', async () => {
      const request = new Request('http://localhost/api/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'A' }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.message).toContain('2');
    });

    it('generates unique slug when collision exists', async () => {
      mockedGalleriesRepository.slugExists
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      mockedGalleriesRepository.create.mockResolvedValue({
        id: '1',
        name: 'Nova galerija',
        slug: 'nova-galerija-1',
        description: null,
        eventDate: null,
        coverImage: null,
        createdAt: new Date(),
        images: [],
        _count: { images: 0 },
      });

      const request = new Request('http://localhost/api/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Nova galerija',
        }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedGalleriesRepository.slugExists).toHaveBeenCalledTimes(2);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedGalleriesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'nova-galerija-1',
        })
      );
    });
  });
});
