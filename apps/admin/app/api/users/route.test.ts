/* eslint-disable @typescript-eslint/unbound-method */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requireAuth } from '@/lib/api-auth';
import { apiError, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';

import { GET, POST } from './route';

import type * as UserValidationModule from '@/lib/validations/user';

// Define types for the mocked schema data
interface QueryData {
  page?: string | null;
  limit?: string | null;
  search?: string | null;
  role?: string | null;
  active?: string | null;
}

interface CleanedQueryData {
  page: number;
  limit: number;
  search: string | undefined;
  role: string | undefined;
  active: boolean | undefined;
}

interface ApiResponse {
  success: boolean;
  data?: {
    data?: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      active: boolean;
    }>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    active?: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Mock the database
vi.mock('@repo/database', () => ({
  usersRepository: {
    findMany: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    createCredentialAccount: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
  },
}));

// Mock better-auth/crypto
vi.mock('better-auth/crypto', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
}));

vi.mock('@/lib/api-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/audit-log', () => ({
  createAuditLog: vi.fn(),
}));

// Mock the validations to handle null values from searchParams.get()
vi.mock('@/lib/validations/user', async () => {
  const actual =
    await vi.importActual<typeof UserValidationModule>(
      '@/lib/validations/user'
    );
  return {
    ...actual,
    userQuerySchema: {
      safeParse: vi.fn((data: QueryData) => {
        // Filter out null values and apply defaults
        const cleaned: CleanedQueryData = {
          page: data.page ? Number(data.page) : 1,
          limit: data.limit ? Number(data.limit) : 10,
          search: data.search ?? undefined,
          role: data.role ?? undefined,
          active: data.active === 'true' ? true : data.active === 'false' ? false : undefined,
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
    createUserSchema: actual.createUserSchema,
    updateUserSchema: actual.updateUserSchema,
  };
});

// Import mocked modules after vi.mock calls
// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { usersRepository } from '@repo/database';

const mockedUsersRepository = vi.mocked(usersRepository);
const mockedRequireAuth = vi.mocked(requireAuth);
const mockedCreateAuditLog = vi.mocked(createAuditLog);

// Helper to create a mock NextRequest
function createMockNextRequest(
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string }
): NextRequest {
  return new NextRequest(url, init);
}

// Mock user data
const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: false,
  image: null,
  role: 'staff' as const,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAdmin = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com',
  emailVerified: true,
  image: null,
  role: 'admin' as const,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSuperAdmin = {
  id: 'super-admin-1',
  name: 'Super Admin',
  email: 'superadmin@example.com',
  emailVerified: true,
  image: null,
  role: 'super_admin' as const,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Users API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('returns 401 when not authenticated', async () => {
      mockedRequireAuth.mockResolvedValue({
        response: apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401),
      });

      const request = createMockNextRequest('http://localhost/api/users');
      const response = await GET(request);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('UNAUTHORIZED');
    });

    it('returns 403 when user is staff', async () => {
      mockedRequireAuth.mockResolvedValue({
        response: apiError(
          ErrorCodes.FORBIDDEN,
          'Nemate ovlasti za ovu akciju',
          403
        ),
      });

      const request = createMockNextRequest('http://localhost/api/users');
      const response = await GET(request);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('FORBIDDEN');
    });

    it('returns users for admin', async () => {
      mockedRequireAuth.mockResolvedValue({
        context: {
          session: { user: { id: mockAdmin.id, role: mockAdmin.role } },
          role: mockAdmin.role,
          userId: mockAdmin.id,
        },
      });

      mockedUsersRepository.findMany.mockResolvedValue({
        users: [mockUser, mockAdmin],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });

      const request = createMockNextRequest('http://localhost/api/users');
      const response = await GET(request);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.data).toHaveLength(2);
    });

    it('returns users for super_admin', async () => {
      mockedRequireAuth.mockResolvedValue({
        context: {
          session: { user: { id: mockSuperAdmin.id, role: mockSuperAdmin.role } },
          role: mockSuperAdmin.role,
          userId: mockSuperAdmin.id,
        },
      });

      mockedUsersRepository.findMany.mockResolvedValue({
        users: [mockUser, mockAdmin, mockSuperAdmin],
        pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
      });

      const request = createMockNextRequest('http://localhost/api/users');
      const response = await GET(request);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.data).toHaveLength(3);
    });

    it('filters by role', async () => {
      mockedRequireAuth.mockResolvedValue({
        context: {
          session: { user: { id: mockAdmin.id, role: mockAdmin.role } },
          role: mockAdmin.role,
          userId: mockAdmin.id,
        },
      });

      mockedUsersRepository.findMany.mockResolvedValue({
        users: [mockUser],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const request = createMockNextRequest('http://localhost/api/users?role=staff');
      await GET(request);

      expect(mockedUsersRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'staff' })
      );
    });

    it('filters by active status', async () => {
      mockedRequireAuth.mockResolvedValue({
        context: {
          session: { user: { id: mockAdmin.id, role: mockAdmin.role } },
          role: mockAdmin.role,
          userId: mockAdmin.id,
        },
      });

      mockedUsersRepository.findMany.mockResolvedValue({
        users: [mockUser],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const request = createMockNextRequest('http://localhost/api/users?active=true');
      await GET(request);

      expect(mockedUsersRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ active: true })
      );
    });
  });

  describe('POST /api/users', () => {
    it('returns 401 when not authenticated', async () => {
      mockedRequireAuth.mockResolvedValue({
        response: apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401),
      });

      const request = createMockNextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
          role: 'staff',
        }),
      });
      const response = await POST(request);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('UNAUTHORIZED');
    });

    it('returns 403 when user is staff', async () => {
      mockedRequireAuth.mockResolvedValue({
        response: apiError(
          ErrorCodes.FORBIDDEN,
          'Nemate ovlasti za ovu akciju',
          403
        ),
      });

      const request = createMockNextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
          role: 'staff',
        }),
      });
      const response = await POST(request);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('FORBIDDEN');
    });

    it('returns 403 when admin tries to create super_admin', async () => {
      mockedRequireAuth.mockResolvedValue({
        context: {
          session: { user: { id: mockAdmin.id, role: mockAdmin.role } },
          role: mockAdmin.role,
          userId: mockAdmin.id,
        },
      });

      const request = createMockNextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Super Admin',
          email: 'newsuperadmin@example.com',
          password: 'password123',
          role: 'super_admin',
        }),
      });
      const response = await POST(request);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('FORBIDDEN');
      expect(data.error?.message).toContain('uloge');
    });

    it('returns 403 when admin tries to create another admin', async () => {
      mockedRequireAuth.mockResolvedValue({
        context: {
          session: { user: { id: mockAdmin.id, role: mockAdmin.role } },
          role: mockAdmin.role,
          userId: mockAdmin.id,
        },
      });

      const request = createMockNextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Admin',
          email: 'newadmin@example.com',
          password: 'password123',
          role: 'admin',
        }),
      });
      const response = await POST(request);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('FORBIDDEN');
      expect(data.error?.message).toContain('uloge');
    });

    it('creates staff user when admin requests', async () => {
      mockedRequireAuth.mockResolvedValue({
        context: {
          session: { user: { id: mockAdmin.id, role: mockAdmin.role } },
          role: mockAdmin.role,
          userId: mockAdmin.id,
        },
      });

      mockedUsersRepository.findByEmail.mockResolvedValue(null);
      mockedUsersRepository.create.mockResolvedValue({
        id: 'new-user-1',
        name: 'New Staff',
        email: 'newstaff@example.com',
        emailVerified: false,
        image: null,
        role: 'staff',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = createMockNextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Staff',
          email: 'newstaff@example.com',
          password: 'password123',
          role: 'staff',
        }),
      });
      const response = await POST(request);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data?.name).toBe('New Staff');
      expect(data.data?.role).toBe('staff');

      expect(mockedUsersRepository.create).toHaveBeenCalledWith({
        name: 'New Staff',
        email: 'newstaff@example.com',
        role: 'staff',
      });

      expect(mockedUsersRepository.createCredentialAccount).toHaveBeenCalledWith({
        userId: 'new-user-1',
        password: 'hashed_password',
      });

      expect(mockedCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'create',
          entityType: 'user',
          entityId: 'new-user-1',
        })
      );
    });

    it('allows super_admin to create any role', async () => {
      mockedRequireAuth.mockResolvedValue({
        context: {
          session: { user: { id: mockSuperAdmin.id, role: mockSuperAdmin.role } },
          role: mockSuperAdmin.role,
          userId: mockSuperAdmin.id,
        },
      });

      mockedUsersRepository.findByEmail.mockResolvedValue(null);
      mockedUsersRepository.create.mockResolvedValue({
        id: 'new-admin-1',
        name: 'New Admin',
        email: 'newadmin@example.com',
        emailVerified: false,
        image: null,
        role: 'admin',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = createMockNextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Admin',
          email: 'newadmin@example.com',
          password: 'password123',
          role: 'admin',
        }),
      });
      const response = await POST(request);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data?.role).toBe('admin');
      expect(mockedCreateAuditLog).toHaveBeenCalled();
    });

    it('rejects duplicate email', async () => {
      mockedRequireAuth.mockResolvedValue({
        context: {
          session: { user: { id: mockAdmin.id, role: mockAdmin.role } },
          role: mockAdmin.role,
          userId: mockAdmin.id,
        },
      });

      mockedUsersRepository.findByEmail.mockResolvedValue(mockUser);

      const request = createMockNextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Duplicate User',
          email: 'test@example.com',
          password: 'password123',
          role: 'staff',
        }),
      });
      const response = await POST(request);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('VALIDATION_ERROR');
      expect(data.error?.message).toContain('email');
    });

    it('validates required fields', async () => {
      mockedRequireAuth.mockResolvedValue({
        context: {
          session: { user: { id: mockAdmin.id, role: mockAdmin.role } },
          role: mockAdmin.role,
          userId: mockAdmin.id,
        },
      });

      const request = createMockNextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'User Without Email',
        }),
      });
      const response = await POST(request);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('VALIDATION_ERROR');
    });

    it('validates password length', async () => {
      mockedRequireAuth.mockResolvedValue({
        context: {
          session: { user: { id: mockAdmin.id, role: mockAdmin.role } },
          role: mockAdmin.role,
          userId: mockAdmin.id,
        },
      });

      const request = createMockNextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Short Password User',
          email: 'shortpass@example.com',
          password: '123',
          role: 'staff',
        }),
      });
      const response = await POST(request);
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('VALIDATION_ERROR');
      expect(data.error?.message).toContain('8');
    });
  });
});
