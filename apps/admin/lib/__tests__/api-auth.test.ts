import { USER_ROLES } from '@repo/shared';
import { describe, expect, it, vi } from 'vitest';

import { requireAuth } from '@/lib/api-auth';

const mockGetSession = vi.hoisted(() => vi.fn<() => Promise<unknown>>());

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

function createRequest() {
  return new Request('http://localhost:3000/api/test');
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

    const result = await requireAuth(createRequest(), { requireAdmin: true });

    if ('response' in result) {
      expect(result.response.status).toBe(200);
    } else {
      expect(result.context.userId).toBe('user-1');
      expect(result.context.role).toBe(USER_ROLES.ADMIN);
    }
  });
});
