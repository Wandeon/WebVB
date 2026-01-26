// apps/admin/app/api/public/galleries/route.test.ts
import { describe, expect, it, vi } from 'vitest';

import { GET } from './route';

import type { GalleryWithCount } from '@repo/database';

interface GalleriesResponse {
  success: boolean;
  data?: {
    galleries: Array<{ id: string }>;
  };
  error?: {
    message: string;
  };
}

vi.mock('@repo/database', () => ({
  galleriesRepository: {
    findPublished: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  galleriesLogger: {
    error: vi.fn(),
  },
}));

// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { galleriesRepository } from '@repo/database';

const mockedGalleriesRepository = vi.mocked(galleriesRepository);

describe('Public Galleries API', () => {
  it('returns published galleries', async () => {
    const mockGallery = {
      id: 'gallery-1',
      name: 'Galerija',
      slug: 'galerija',
      description: null,
      eventDate: new Date('2026-01-01'),
      coverImage: null,
      createdAt: new Date('2026-01-01'),
      _count: { images: 5 },
    } satisfies GalleryWithCount;

    mockedGalleriesRepository.findPublished.mockResolvedValue({
      galleries: [mockGallery],
      pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
    });

    const response = await GET(
      new Request('http://localhost/api/public/galleries') as never
    );
    const data = (await response.json()) as GalleriesResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    if (!data.data) {
      throw new Error('Missing response data');
    }
    expect(data.data.galleries).toHaveLength(1);
  });
});
