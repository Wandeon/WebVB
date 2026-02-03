import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requireAuth } from '@/lib/api-auth';
import { apiError } from '@/lib/api-response';

import { GET } from './route';

interface ApiResponse {
  success: boolean;
  data?: {
    count?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

vi.mock('@repo/database', () => ({
  newsletterDraftRepository: {
    getItemCount: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  newsletterLogger: {
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

describe('Newsletter count API', () => {
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

    const response = await GET(new Request('http://localhost/api/newsletter/count') as never);

    expect(response.status).toBe(401);
  });

  it('returns draft item count', async () => {
    mockedNewsletterDraftRepository.getItemCount.mockResolvedValueOnce(3);

    const response = await GET(new Request('http://localhost/api/newsletter/count') as never);
    const data = (await response.json()) as ApiResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data?.count).toBe(3);
  });

  it('returns 500 when repository throws', async () => {
    mockedNewsletterDraftRepository.getItemCount.mockRejectedValueOnce(
      new Error('DB error')
    );

    const response = await GET(new Request('http://localhost/api/newsletter/count') as never);
    const data = (await response.json()) as ApiResponse;

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('INTERNAL_ERROR');
  });
});
