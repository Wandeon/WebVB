import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requireAuth } from '@/lib/api-auth';
import { apiError } from '@/lib/api-response';

import { DELETE, GET, PUT } from './route';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

vi.mock('@repo/database', () => ({
  newsletterDraftRepository: {
    get: vi.fn(),
    updateIntro: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  newsletterLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/api-auth', () => ({
  requireAuth: vi.fn(),
}));

// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { newsletterDraftRepository } from '@repo/database';

const mockedNewsletterDraftRepository = vi.mocked(newsletterDraftRepository);
const mockedRequireAuth = vi.mocked(requireAuth);

describe('Newsletter draft API', () => {
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

  it('returns auth response when unauthorized', async () => {
    mockedRequireAuth.mockResolvedValueOnce({
      response: apiError('UNAUTHORIZED', 'Niste prijavljeni', 401),
    });

    const response = await GET(new Request('http://localhost/api/newsletter/draft') as never);

    expect(response.status).toBe(401);
  });

  it('returns current draft', async () => {
    mockedNewsletterDraftRepository.get.mockResolvedValueOnce({
      id: 'draft-1',
      introText: 'Pozdrav iz newslettera',
      items: [],
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date('2026-02-02'),
    });

    const response = await GET(new Request('http://localhost/api/newsletter/draft') as never);
    const data = (await response.json()) as ApiResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('rejects invalid intro payloads', async () => {
    const request = new Request('http://localhost/api/newsletter/draft', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ introText: 123 }),
    });

    const response = await PUT(request as never);
    const data = (await response.json()) as ApiResponse;

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('VALIDATION_ERROR');
  });

  it('updates intro text', async () => {
    mockedNewsletterDraftRepository.updateIntro.mockResolvedValueOnce({
      id: 'draft-1',
      introText: 'Novi uvod',
      items: [],
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date('2026-02-03'),
    });

    const request = new Request('http://localhost/api/newsletter/draft', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ introText: 'Novi uvod' }),
    });

    const response = await PUT(request as never);
    const data = (await response.json()) as ApiResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toMatchObject({ introText: 'Novi uvod' });
  });

  it('clears the draft', async () => {
    mockedNewsletterDraftRepository.clear.mockResolvedValueOnce();

    const response = await DELETE(new Request('http://localhost/api/newsletter/draft') as never);
    const data = (await response.json()) as ApiResponse<{ cleared: boolean }>;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data?.cleared).toBe(true);
  });
});
