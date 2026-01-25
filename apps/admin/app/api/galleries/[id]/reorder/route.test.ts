// apps/admin/app/api/galleries/[id]/reorder/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { galleriesRepository } from '@repo/database';

const mockedGalleriesRepository = vi.mocked(galleriesRepository);

const galleryId = '11111111-1111-4111-8111-111111111111';
const imageIds = [
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
];

describe('Galleries reorder API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    mockedGalleriesRepository.findById.mockResolvedValue({
      id: galleryId,
      images: imageIds.map((id) => ({ id })),
    });

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
    mockedGalleriesRepository.findById.mockResolvedValue({
      id: galleryId,
      images: imageIds.map((id) => ({ id })),
    });

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
    mockedGalleriesRepository.findById.mockResolvedValue({
      id: galleryId,
      images: imageIds.map((id) => ({ id })),
    });

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
    mockedGalleriesRepository.findById.mockResolvedValue({
      id: galleryId,
      images: imageIds.map((id) => ({ id })),
    });
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
