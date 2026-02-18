/* eslint-disable @typescript-eslint/unbound-method */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requireAuth } from '@/lib/api-auth';
import { apiError, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { documentsLogger } from '@/lib/logger';

import { GET, POST } from '../route';

import type { DocumentWithUploader, FindAllDocumentsResult } from '@repo/database';
import type * as SharedModule from '@repo/shared';

// Define types for the mocked schema data
interface QueryData {
  page?: string | null;
  limit?: string | null;
  search?: string | null;
  category?: string | null;
  year?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
}

interface CleanedQueryData {
  page: number;
  limit: number;
  search: string | undefined;
  category: string | undefined;
  year: number | undefined;
  sortBy: string;
  sortOrder: string;
}

// Mock the dependencies before importing the route
vi.mock('@repo/database', () => ({
  documentsRepository: {
    findAll: vi.fn(),
    create: vi.fn(),
  },
  indexDocument: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  documentsLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  logger: {
    child: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
  },
}));

vi.mock('@/lib/api-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/audit-log', () => ({
  createAuditLog: vi.fn(),
}));

// Mock the schemas to handle null values from searchParams.get()
vi.mock('@repo/shared', async () => {
  // Import the real module for createDocumentSchema
  const actual = await vi.importActual<typeof SharedModule>('@repo/shared');
  return {
    ...actual,
    documentQuerySchema: {
      safeParse: vi.fn((data: QueryData) => {
        // Filter out null values and apply defaults
        const cleaned: CleanedQueryData = {
          page: data.page ? Number(data.page) : 1,
          limit: data.limit ? Number(data.limit) : 20,
          search: data.search ?? undefined,
          category: data.category ?? undefined,
          year: data.year ? Number(data.year) : undefined,
          sortBy: data.sortBy ?? 'createdAt',
          sortOrder: data.sortOrder ?? 'desc',
        };

        // Validate page/limit are positive
        if (cleaned.page <= 0 || cleaned.limit <= 0 || cleaned.limit > 100) {
          return { success: false as const, error: { issues: [{ message: 'Invalid params' }] } };
        }

        return { success: true as const, data: cleaned };
      }),
    },
    createDocumentSchema: actual.createDocumentSchema,
  };
});

// Import mocked modules and route handlers
// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { documentsRepository } from '@repo/database';
const mockedFindAll = vi.mocked(documentsRepository.findAll);
const mockedCreate = vi.mocked(documentsRepository.create);
const mockedLoggerError = vi.mocked(documentsLogger.error);
const mockedLoggerInfo = vi.mocked(documentsLogger.info);
const mockedRequireAuth = vi.mocked(requireAuth);
const mockedCreateAuditLog = vi.mocked(createAuditLog);

// Helper to create a mock NextRequest
function createMockNextRequest(
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string }
): NextRequest {
  return new NextRequest(url, init);
}

// Mock document data
const mockDocument: DocumentWithUploader = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Proracun za 2024. godinu',
  fileUrl: 'https://example.com/documents/proracun-2024.pdf',
  fileSize: 1024000,
  category: 'proracun',
  subcategory: null,
  year: 2024,
  uploadedBy: null,
  uploader: null,
  createdAt: new Date('2024-01-15T10:00:00Z'),
};

const mockPaginatedResult: FindAllDocumentsResult = {
  documents: [mockDocument],
  pagination: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  },
};

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

describe('GET /api/documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRequireAuth.mockResolvedValue({
      context: {
        session: { user: { id: 'user-1', role: 'staff' } },
        role: 'staff',
        userId: 'user-1',
      },
    });
  });

  it('returns paginated documents', async () => {
    mockedFindAll.mockResolvedValue(mockPaginatedResult);

    const request = createMockNextRequest('http://localhost:3000/api/documents');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const body = (await response.json()) as ApiSuccessResponse<{
      data: DocumentWithUploader[];
      pagination: FindAllDocumentsResult['pagination'];
    }>;

    expect(body.success).toBe(true);
    // Compare with JSON serialization since dates become strings in response
    expect(body.data.data).toEqual(
      JSON.parse(JSON.stringify([mockDocument])) as DocumentWithUploader[]
    );
    expect(body.data.pagination).toEqual(mockPaginatedResult.pagination);

    expect(mockedFindAll).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      search: undefined,
      category: undefined,
      year: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('filters by category', async () => {
    const filteredResult: FindAllDocumentsResult = {
      documents: [mockDocument],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };
    mockedFindAll.mockResolvedValue(filteredResult);

    const request = createMockNextRequest(
      'http://localhost:3000/api/documents?category=proracun'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);

    const body = (await response.json()) as ApiSuccessResponse<{
      data: DocumentWithUploader[];
      pagination: FindAllDocumentsResult['pagination'];
    }>;

    expect(body.success).toBe(true);
    expect(mockedFindAll).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'proracun',
      })
    );
  });

  it('filters by year', async () => {
    const filteredResult: FindAllDocumentsResult = {
      documents: [mockDocument],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };
    mockedFindAll.mockResolvedValue(filteredResult);

    const request = createMockNextRequest(
      'http://localhost:3000/api/documents?year=2024'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);

    const body = (await response.json()) as ApiSuccessResponse<{
      data: DocumentWithUploader[];
      pagination: FindAllDocumentsResult['pagination'];
    }>;

    expect(body.success).toBe(true);
    expect(mockedFindAll).toHaveBeenCalledWith(
      expect.objectContaining({
        year: 2024,
      })
    );
  });

  it('handles pagination parameters', async () => {
    mockedFindAll.mockResolvedValue({
      documents: [],
      pagination: {
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
    });

    const request = createMockNextRequest(
      'http://localhost:3000/api/documents?page=2&limit=10'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockedFindAll).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 10,
      })
    );
  });

  it('handles database errors gracefully', async () => {
    mockedFindAll.mockRejectedValue(new Error('Database connection failed'));

    const request = createMockNextRequest('http://localhost:3000/api/documents');
    const response = await GET(request);

    expect(response.status).toBe(500);

    const body = (await response.json()) as ApiErrorResponse;

    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INTERNAL_ERROR');

    expect(mockedLoggerError).toHaveBeenCalled();
  });

  it('rejects invalid query parameters', async () => {
    const request = createMockNextRequest(
      'http://localhost:3000/api/documents?page=-1'
    );
    const response = await GET(request);

    expect(response.status).toBe(400);

    const body = (await response.json()) as ApiErrorResponse;

    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects unauthenticated requests', async () => {
    mockedRequireAuth.mockResolvedValue({
      response: apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401),
    });

    const request = createMockNextRequest('http://localhost:3000/api/documents');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});

describe('POST /api/documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRequireAuth.mockResolvedValue({
      context: {
        session: { user: { id: 'user-1', role: 'staff' } },
        role: 'staff',
        userId: 'user-1',
      },
    });
  });

  it('creates document with valid data', async () => {
    const newDocument: DocumentWithUploader = {
      ...mockDocument,
      id: 'new-document-id',
      title: 'Novi dokument',
    };
    mockedCreate.mockResolvedValue(newDocument);

    const request = createMockNextRequest('http://localhost:3000/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Novi dokument',
        category: 'proracun',
        year: 2024,
        fileUrl: 'https://example.com/documents/novi.pdf',
        fileSize: 512000,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);

    const body = (await response.json()) as ApiSuccessResponse<DocumentWithUploader>;

    expect(body.success).toBe(true);
    expect(body.data.title).toBe('Novi dokument');

    expect(mockedCreate).toHaveBeenCalledWith({
      title: 'Novi dokument',
      category: 'proracun',
      subcategory: null,
      year: 2024,
      fileUrl: 'https://example.com/documents/novi.pdf',
      fileSize: 512000,
      uploadedBy: 'user-1',
    });

    expect(mockedCreateAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'create',
        entityType: 'document',
        entityId: 'new-document-id',
      })
    );

    expect(mockedLoggerInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: 'new-document-id',
        category: 'proracun',
        title: 'Novi dokument',
      }),
      'Document created successfully'
    );
  });

  it('rejects invalid category', async () => {
    const request = createMockNextRequest('http://localhost:3000/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Novi dokument',
        category: 'invalid_category',
        fileUrl: 'https://example.com/documents/novi.pdf',
        fileSize: 512000,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = (await response.json()) as ApiErrorResponse;

    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Kategorija je obavezna');

    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('rejects missing title', async () => {
    const request = createMockNextRequest('http://localhost:3000/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'proracun',
        fileUrl: 'https://example.com/documents/novi.pdf',
        fileSize: 512000,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = (await response.json()) as ApiErrorResponse;

    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');

    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('rejects title shorter than 3 characters', async () => {
    const request = createMockNextRequest('http://localhost:3000/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'AB',
        category: 'proracun',
        fileUrl: 'https://example.com/documents/novi.pdf',
        fileSize: 512000,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = (await response.json()) as ApiErrorResponse;

    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Naslov mora imati najmanje 3 znaka');

    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('handles database errors gracefully', async () => {
    mockedCreate.mockRejectedValue(new Error('Database connection failed'));

    const request = createMockNextRequest('http://localhost:3000/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Novi dokument',
        category: 'proracun',
        fileUrl: 'https://example.com/documents/novi.pdf',
        fileSize: 512000,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);

    const body = (await response.json()) as ApiErrorResponse;

    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INTERNAL_ERROR');

    expect(mockedLoggerError).toHaveBeenCalled();
  });

  it('accepts optional subcategory and year', async () => {
    const newDocument: DocumentWithUploader = {
      ...mockDocument,
      id: 'new-doc-id',
      subcategory: 'Rebalans',
      year: 2024,
    };
    mockedCreate.mockResolvedValue(newDocument);

    const request = createMockNextRequest('http://localhost:3000/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Rebalans proracuna 2024',
        category: 'proracun',
        subcategory: 'Rebalans',
        year: 2024,
        fileUrl: 'https://example.com/documents/rebalans.pdf',
        fileSize: 256000,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);

    const body = (await response.json()) as ApiSuccessResponse<DocumentWithUploader>;

    expect(body.success).toBe(true);

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        subcategory: 'Rebalans',
        year: 2024,
      })
    );
  });
});
