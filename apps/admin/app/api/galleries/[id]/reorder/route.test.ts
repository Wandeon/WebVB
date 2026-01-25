// apps/admin/app/api/galleries/[id]/reorder/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requireAuth } from '@/lib/api-auth';

import { PUT } from './route';

// Mock repository
vi.mock('@repo/database', () => ({
  galleriesRepository: {
    findById: vi.fn(),
    reorderImages: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  galleriesLogger: {
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

// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { galleriesRepository } from '@repo/database';

const mockedGalleriesRepository = vi.mocked(galleriesRepository);
const mockedRequireAuth = vi.mocked(requireAuth);

const galleryId = '11111111-1111-4111-8111-111111111111';
const imageIds = [
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
];

function createMockImage(id: string, sortOrder: number) {
  return {
    id,
    createdAt: new Date(),
    galleryId,
    imageUrl: `https://r2.example.com/uploads/${id}/large.webp`,
    thumbnailUrl: `https://r2.example.com/uploads/${id}/thumb.webp`,
    caption: null,
    sortOrder,
  };
}

function createMockGallery(images: ReturnType<typeof createMockImage>[]) {
  return {
    id: galleryId,
    name: 'Test Gallery',
    slug: 'test-gallery',
    description: null,
    eventDate: new Date(),
    coverImage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    images,
    _count: { images: images.length },
  };
}

describe('Galleries reorder API', () => {
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

  it('returns 404 when gallery is missing', async () => {
    mockedGalleriesRepository.findById.mockResolvedValue(null);

    const request = new Request(
      `http://localhost/api/galleries/${galleryId}/reorder`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds }),
      }
    );

    const response = await PUT(request as never, {
      params: Promise.resolve({ id: galleryId }),
    });
    const data = (await response.json()) as { success: boolean };

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('rejects duplicate image IDs', async () => {
    mockedGalleriesRepository.findById.mockResolvedValue(
      createMockGallery(imageIds.map((id, idx) => createMockImage(id, idx)))
    );

    const request = new Request(
      `http://localhost/api/galleries/${galleryId}/reorder`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: [imageIds[0], imageIds[0], imageIds[1]] }),
      }
    );

    const response = await PUT(request as never, {
      params: Promise.resolve({ id: galleryId }),
    });
    const data = (await response.json()) as { success: boolean; error?: { message: string } };

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error?.message).toContain('duplicirane');
  });

  it('rejects payloads that do not include all images', async () => {
    mockedGalleriesRepository.findById.mockResolvedValue(
      createMockGallery(imageIds.map((id, idx) => createMockImage(id, idx)))
    );

    const request = new Request(
      `http://localhost/api/galleries/${galleryId}/reorder`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: imageIds.slice(0, 2) }),
      }
    );

    const response = await PUT(request as never, {
      params: Promise.resolve({ id: galleryId }),
    });
    const data = (await response.json()) as { success: boolean; error?: { message: string } };

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error?.message).toContain('sve slike');
  });

  it('rejects image IDs not in the gallery', async () => {
    mockedGalleriesRepository.findById.mockResolvedValue(
      createMockGallery(imageIds.map((id, idx) => createMockImage(id, idx)))
    );

    const request = new Request(
      `http://localhost/api/galleries/${galleryId}/reorder`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageIds: [
            imageIds[0],
            imageIds[1],
            '55555555-5555-4555-8555-555555555555',
          ],
        }),
      }
    );

    const response = await PUT(request as never, {
      params: Promise.resolve({ id: galleryId }),
    });
    const data = (await response.json()) as { success: boolean; error?: { message: string } };

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error?.message).toContain('ne pripadaju ovoj galeriji');
  });

  it('reorders images when payload is valid', async () => {
    mockedGalleriesRepository.findById.mockResolvedValue(
      createMockGallery(imageIds.map((id, idx) => createMockImage(id, idx)))
    );
    mockedGalleriesRepository.reorderImages.mockResolvedValue();

    const request = new Request(
      `http://localhost/api/galleries/${galleryId}/reorder`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds }),
      }
    );

    const response = await PUT(request as never, {
      params: Promise.resolve({ id: galleryId }),
    });
    const data = (await response.json()) as { success: boolean };

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockedGalleriesRepository.reorderImages).toHaveBeenCalledWith(
      galleryId,
      imageIds
    );
  });
});
