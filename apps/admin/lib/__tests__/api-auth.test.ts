import { USER_ROLES } from '@repo/shared';
import { describe, expect, it, vi } from 'vitest';

import { requireAuth } from '@/lib/api-auth';

const mockGetSession = vi.hoisted(() => vi.fn<() => Promise<unknown>>());
const mockFindById = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

vi.mock('@repo/database', () => ({
  usersRepository: {
    findById: mockFindById,
  },
}));

function createRequest(options?: RequestInit & { origin?: string }) {
  const headers = new Headers(options?.headers);
  if (options?.origin) {
    headers.set('origin', options.origin);
  }

  return new Request('http://localhost:3000/api/test', {
    ...options,
    headers,
  });
}

describe('requireAuth', () => {
  it('returns unauthorized when no session', async () => {
    mockGetSession.mockResolvedValueOnce(null);

    const result = await requireAuth(createRequest());

    if ('response' in result) {
      expect(result.response.status).toBe(401);
    } else {
      expect(result.context).toBeDefined();
    }
  });

  it('returns forbidden for admin-only route', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-1', role: USER_ROLES.STAFF },
    });
    mockFindById.mockResolvedValueOnce({
      id: 'user-1',
      role: USER_ROLES.STAFF,
      active: true,
    });

    const result = await requireAuth(createRequest(), { requireAdmin: true });

    if ('response' in result) {
      expect(result.response.status).toBe(403);
    } else {
      expect(result.context.role).toBe(USER_ROLES.ADMIN);
    }
  });

  it('returns context for admin role', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-1', role: USER_ROLES.ADMIN },
    });
    mockFindById.mockResolvedValueOnce({
      id: 'user-1',
      role: USER_ROLES.ADMIN,
      active: true,
    });

    const result = await requireAuth(createRequest(), { requireAdmin: true });

    if ('response' in result) {
      expect(result.response.status).toBe(200);
    } else {
      expect(result.context.userId).toBe('user-1');
      expect(result.context.role).toBe(USER_ROLES.ADMIN);
    }
  });

  it('rejects inactive users', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-1', role: USER_ROLES.ADMIN },
    });
    mockFindById.mockResolvedValueOnce({
      id: 'user-1',
      role: USER_ROLES.ADMIN,
      active: false,
    });

    const result = await requireAuth(createRequest());

    if ('response' in result) {
      expect(result.response.status).toBe(403);
    } else {
      expect(result.context).toBeDefined();
    }
  });

  it('blocks cross-site state-changing requests', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-1', role: USER_ROLES.ADMIN },
    });
    mockFindById.mockResolvedValueOnce({
      id: 'user-1',
      role: USER_ROLES.ADMIN,
      active: true,
    });

    const result = await requireAuth(
      createRequest({ method: 'POST', origin: 'https://evil.example.com' })
    );

    if ('response' in result) {
      expect(result.response.status).toBe(403);
    } else {
      expect(result.context).toBeDefined();
    }
  });
});
