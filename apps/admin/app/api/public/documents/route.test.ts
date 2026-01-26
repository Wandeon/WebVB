// apps/admin/app/api/public/documents/route.test.ts
import { describe, expect, it, vi } from 'vitest';

import { GET } from './route';

import type { DocumentWithUploader } from '@repo/database';

interface DocumentsResponse {
  success: boolean;
  data?: {
    documents: Array<{ id: string }>;
    years: number[];
  };
  error?: {
    message: string;
  };
}

vi.mock('@repo/database', () => ({
  documentsRepository: {
    findAll: vi.fn(),
    getDistinctYears: vi.fn(),
    getCategoryCounts: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  documentsLogger: {
    error: vi.fn(),
  },
}));

// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { documentsRepository } from '@repo/database';

const mockedDocumentsRepository = vi.mocked(documentsRepository);

describe('Public Documents API', () => {
  it('returns documents with metadata', async () => {
    const mockDocument = {
      id: 'doc-1',
      title: 'Dokument',
      fileUrl: 'https://example.com/doc.pdf',
      fileSize: 1024,
      category: 'ostalo',
      subcategory: null,
      year: 2026,
      uploadedBy: null,
      createdAt: new Date('2026-01-01'),
      uploader: null,
    } satisfies DocumentWithUploader;

    mockedDocumentsRepository.findAll.mockResolvedValue({
      documents: [mockDocument],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    mockedDocumentsRepository.getDistinctYears.mockResolvedValue([2026]);
    mockedDocumentsRepository.getCategoryCounts.mockResolvedValue({ ostalo: 1 });

    const response = await GET(
      new Request('http://localhost/api/public/documents') as never
    );
    const data = (await response.json()) as DocumentsResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    if (!data.data) {
      throw new Error('Missing response data');
    }
    expect(data.data.documents).toHaveLength(1);
    expect(data.data.years).toContain(2026);
  });

  it('accepts year and category filters', async () => {
    mockedDocumentsRepository.findAll.mockResolvedValue({
      documents: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    mockedDocumentsRepository.getDistinctYears.mockResolvedValue([]);
    mockedDocumentsRepository.getCategoryCounts.mockResolvedValue({});

    const response = await GET(
      new Request('http://localhost/api/public/documents?year=2026&category=ostalo') as never
    );
    const data = (await response.json()) as DocumentsResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method -- Mock is safe to assert.
    expect(mockedDocumentsRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ year: 2026, category: 'ostalo' })
    );
  });
});
