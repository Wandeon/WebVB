# User Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Admin-only CRUD for managing users with role-based permissions and soft-delete functionality.

**Architecture:** Add `active` field to User model for soft-delete. Create users repository, API routes, and admin UI following existing patterns (posts, documents, galleries). Permission checks ensure admins can only manage users at or below their role level.

**Tech Stack:** Prisma, Better Auth, Next.js API routes, React Hook Form, Zod, TanStack Table, Croatian localization

---

## Task 1: Add Active Field to User Schema

**Files:**
- Modify: `packages/database/prisma/schema.prisma`
- Modify: `packages/shared/src/types/index.ts`

**Step 1: Update Prisma schema**

In `packages/database/prisma/schema.prisma`, add `active` field to User model after `role`:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Custom extension fields
  role          String    @default("staff") // 'super_admin', 'admin', 'staff'
  active        Boolean   @default(true)    // false = soft-deleted, cannot login

  // Relations...
```

**Step 2: Update shared User type**

In `packages/shared/src/types/index.ts`, add `active` to User interface:

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Step 3: Generate Prisma client and push schema**

Run: `cd /mnt/c/VelikiBukovec_web && pnpm db:generate && pnpm db:push`

**Step 4: Commit**

```bash
git add packages/database/prisma/schema.prisma packages/shared/src/types/index.ts
git commit -m "feat(database): add active field to User model for soft-delete"
```

---

## Task 2: User Types and Validation Schemas

**Files:**
- Create: `packages/shared/src/types/user.ts`
- Modify: `packages/shared/src/types/index.ts`
- Create: `apps/admin/lib/validations/user.ts`
- Create: `apps/admin/lib/validations/user.test.ts`

**Step 1: Create user types in shared package**

Create `packages/shared/src/types/user.ts`:

```typescript
import { z } from 'zod';

import { USER_ROLES } from '../constants';

export const userRoleSchema = z.enum([
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.STAFF,
]);

export type UserRole = z.infer<typeof userRoleSchema>;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  staff: 'Osoblje',
};

export const USER_ROLE_OPTIONS = [
  { value: USER_ROLES.STAFF, label: 'Osoblje' },
  { value: USER_ROLES.ADMIN, label: 'Administrator' },
  { value: USER_ROLES.SUPER_ADMIN, label: 'Super Admin' },
] as const;
```

**Step 2: Export from shared types index**

Add to `packages/shared/src/types/index.ts`:

```typescript
export {
  userRoleSchema,
  type UserRole,
  USER_ROLE_LABELS,
  USER_ROLE_OPTIONS,
} from './user';
```

**Step 3: Create validation schemas**

Create `apps/admin/lib/validations/user.ts`:

```typescript
import { z } from 'zod';

import { USER_ROLES } from '@repo/shared';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Ime mora imati najmanje 2 znaka'),
  email: z.string().email('Neispravan format email adrese'),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 znakova'),
  role: z.enum([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.STAFF], {
    errorMap: () => ({ message: 'Odaberite ulogu' }),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Ime mora imati najmanje 2 znaka').optional(),
  email: z.string().email('Neispravan format email adrese').optional(),
  role: z
    .enum([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.STAFF])
    .optional(),
  active: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  role: z
    .enum([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.STAFF])
    .optional(),
  active: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export type UserQueryInput = z.infer<typeof userQuerySchema>;
```

**Step 4: Create validation tests**

Create `apps/admin/lib/validations/user.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';

import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
} from './user';

describe('User Validation Schemas', () => {
  describe('createUserSchema', () => {
    it('accepts valid user data', () => {
      const result = createUserSchema.safeParse({
        name: 'Ivan Horvat',
        email: 'ivan@example.com',
        password: 'securepass123',
        role: 'staff',
      });
      expect(result.success).toBe(true);
    });

    it('rejects short name', () => {
      const result = createUserSchema.safeParse({
        name: 'I',
        email: 'ivan@example.com',
        password: 'securepass123',
        role: 'staff',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = createUserSchema.safeParse({
        name: 'Ivan Horvat',
        email: 'not-an-email',
        password: 'securepass123',
        role: 'staff',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = createUserSchema.safeParse({
        name: 'Ivan Horvat',
        email: 'ivan@example.com',
        password: 'short',
        role: 'staff',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid role', () => {
      const result = createUserSchema.safeParse({
        name: 'Ivan Horvat',
        email: 'ivan@example.com',
        password: 'securepass123',
        role: 'invalid_role',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateUserSchema', () => {
    it('accepts partial updates', () => {
      const result = updateUserSchema.safeParse({
        name: 'New Name',
      });
      expect(result.success).toBe(true);
    });

    it('accepts active status change', () => {
      const result = updateUserSchema.safeParse({
        active: false,
      });
      expect(result.success).toBe(true);
    });

    it('accepts empty object', () => {
      const result = updateUserSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('userQuerySchema', () => {
    it('applies defaults', () => {
      const result = userQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it('parses active filter', () => {
      const result = userQuerySchema.safeParse({ active: 'true' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.active).toBe(true);
      }
    });

    it('accepts role filter', () => {
      const result = userQuerySchema.safeParse({ role: 'admin' });
      expect(result.success).toBe(true);
    });
  });
});
```

**Step 5: Run tests**

Run: `cd /mnt/c/VelikiBukovec_web && pnpm test --filter=@repo/admin`
Expected: All new tests pass

**Step 6: Commit**

```bash
git add packages/shared/src/types/user.ts packages/shared/src/types/index.ts apps/admin/lib/validations/user.ts apps/admin/lib/validations/user.test.ts
git commit -m "feat(shared): add user types and validation schemas"
```

---

## Task 3: Users Repository

**Files:**
- Create: `packages/database/src/repositories/users.ts`
- Modify: `packages/database/src/index.ts`

**Step 1: Create users repository**

Create `packages/database/src/repositories/users.ts`:

```typescript
import { Prisma } from '@prisma/client';

import { prisma } from '../client';

export interface UsersQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  active?: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  role: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  active?: boolean;
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const usersRepository = {
  async findMany(options: UsersQueryOptions = {}) {
    const { page = 1, limit = 10, search, role, active } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (active !== undefined) {
      where.active = active;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });
  },

  async create(data: CreateUserData) {
    return prisma.user.create({
      data: {
        ...data,
        emailVerified: false,
        active: true,
      },
      select: userSelect,
    });
  },

  async update(id: string, data: UpdateUserData) {
    return prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  },

  async deactivate(id: string) {
    return prisma.user.update({
      where: { id },
      data: { active: false },
      select: userSelect,
    });
  },

  async activate(id: string) {
    return prisma.user.update({
      where: { id },
      data: { active: true },
      select: userSelect,
    });
  },
};
```

**Step 2: Export from database index**

Add to `packages/database/src/index.ts`:

```typescript
export { usersRepository } from './repositories/users';
```

**Step 3: Commit**

```bash
git add packages/database/src/repositories/users.ts packages/database/src/index.ts
git commit -m "feat(database): add users repository with CRUD operations"
```

---

## Task 4: Permission Helper Utilities

**Files:**
- Create: `apps/admin/lib/permissions.ts`

**Step 1: Create permission helpers**

Create `apps/admin/lib/permissions.ts`:

```typescript
import { USER_ROLES } from '@repo/shared';

type Role = (typeof USER_ROLES)[keyof typeof USER_ROLES];

const ROLE_HIERARCHY: Record<Role, number> = {
  [USER_ROLES.STAFF]: 1,
  [USER_ROLES.ADMIN]: 2,
  [USER_ROLES.SUPER_ADMIN]: 3,
};

/**
 * Check if a user can manage another user based on role hierarchy
 * - super_admin can manage everyone
 * - admin can manage staff only
 * - staff cannot manage anyone
 */
export function canManageUser(actorRole: Role, targetRole: Role): boolean {
  const actorLevel = ROLE_HIERARCHY[actorRole] ?? 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] ?? 0;

  // Must be admin or higher to manage users
  if (actorLevel < ROLE_HIERARCHY[USER_ROLES.ADMIN]) {
    return false;
  }

  // Can only manage users at or below your level
  return actorLevel >= targetLevel;
}

/**
 * Check if a user can assign a specific role
 * - super_admin can assign any role
 * - admin can only assign staff role
 */
export function canAssignRole(actorRole: Role, targetRole: Role): boolean {
  const actorLevel = ROLE_HIERARCHY[actorRole] ?? 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] ?? 0;

  // Must be admin or higher
  if (actorLevel < ROLE_HIERARCHY[USER_ROLES.ADMIN]) {
    return false;
  }

  // Can only assign roles at or below your level
  return actorLevel >= targetLevel;
}

/**
 * Get roles that a user can assign to others
 */
export function getAssignableRoles(actorRole: Role): Role[] {
  if (actorRole === USER_ROLES.SUPER_ADMIN) {
    return [USER_ROLES.STAFF, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN];
  }
  if (actorRole === USER_ROLES.ADMIN) {
    return [USER_ROLES.STAFF];
  }
  return [];
}

/**
 * Check if user has admin access (admin or super_admin)
 */
export function isAdmin(role: Role): boolean {
  return (
    role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN
  );
}
```

**Step 2: Commit**

```bash
git add apps/admin/lib/permissions.ts
git commit -m "feat(admin): add role-based permission helper utilities"
```

---

## Task 5: Users API Routes

**Files:**
- Create: `apps/admin/app/api/users/route.ts`
- Create: `apps/admin/app/api/users/[id]/route.ts`
- Create: `apps/admin/app/api/users/route.test.ts`

**Step 1: Create users list and create endpoint**

Create `apps/admin/app/api/users/route.ts`:

```typescript
import { hash } from 'better-auth/crypto';
import { NextRequest, NextResponse } from 'next/server';

import { usersRepository } from '@repo/database';
import { USER_ROLES } from '@repo/shared';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { auth } from '@/lib/auth';
import { canAssignRole, isAdmin } from '@/lib/permissions';
import { createUserSchema, userQuerySchema } from '@/lib/validations/user';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401);
    }

    if (!isAdmin(session.user.role as string)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za pregled korisnika',
        403
      );
    }

    const { searchParams } = new URL(request.url);
    const queryResult = userQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Neispravni parametri upita',
        400
      );
    }

    const result = await usersRepository.findMany(queryResult.data);

    return apiSuccess(result);
  } catch (error) {
    console.error('Users GET error:', error);
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri dohvaćanju korisnika',
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401);
    }

    const actorRole = session.user.role as string;

    if (!isAdmin(actorRole)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za stvaranje korisnika',
        403
      );
    }

    const body = await request.json();
    const validationResult = createUserSchema.safeParse(body);

    if (!validationResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        validationResult.error.errors[0]?.message ?? 'Neispravni podaci',
        400
      );
    }

    const { name, email, password, role } = validationResult.data;

    // Check if actor can assign this role
    if (!canAssignRole(actorRole, role)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za dodjeljivanje ove uloge',
        403
      );
    }

    // Check if email already exists
    const existing = await usersRepository.findByEmail(email);
    if (existing) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Korisnik s ovom email adresom već postoji',
        400
      );
    }

    // Hash password using Better Auth's hash function
    const hashedPassword = await hash.hash(password);

    // Create user via repository
    const user = await usersRepository.create({
      name,
      email,
      role,
    });

    // Create credential account for the user
    const { prisma } = await import('@repo/database');
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: hashedPassword,
      },
    });

    return apiSuccess({ user }, 201);
  } catch (error) {
    console.error('Users POST error:', error);
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri stvaranju korisnika',
      500
    );
  }
}
```

**Step 2: Create single user endpoint**

Create `apps/admin/app/api/users/[id]/route.ts`:

```typescript
import { NextRequest } from 'next/server';

import { usersRepository } from '@repo/database';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { auth } from '@/lib/auth';
import { canAssignRole, canManageUser, isAdmin } from '@/lib/permissions';
import { updateUserSchema } from '@/lib/validations/user';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401);
    }

    if (!isAdmin(session.user.role as string)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za pregled korisnika',
        403
      );
    }

    const { id } = await params;
    const user = await usersRepository.findById(id);

    if (!user) {
      return apiError(ErrorCodes.NOT_FOUND, 'Korisnik nije pronađen', 404);
    }

    return apiSuccess({ user });
  } catch (error) {
    console.error('User GET error:', error);
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri dohvaćanju korisnika',
      500
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401);
    }

    const actorRole = session.user.role as string;

    if (!isAdmin(actorRole)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za uređivanje korisnika',
        403
      );
    }

    const { id } = await params;
    const existingUser = await usersRepository.findById(id);

    if (!existingUser) {
      return apiError(ErrorCodes.NOT_FOUND, 'Korisnik nije pronađen', 404);
    }

    // Check if actor can manage this user
    if (!canManageUser(actorRole, existingUser.role)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za uređivanje ovog korisnika',
        403
      );
    }

    const body = await request.json();
    const validationResult = updateUserSchema.safeParse(body);

    if (!validationResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        validationResult.error.errors[0]?.message ?? 'Neispravni podaci',
        400
      );
    }

    const { role, email, ...updateData } = validationResult.data;

    // If changing role, check permission
    if (role && !canAssignRole(actorRole, role)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za dodjeljivanje ove uloge',
        403
      );
    }

    // If changing email, check uniqueness
    if (email && email !== existingUser.email) {
      const emailExists = await usersRepository.findByEmail(email);
      if (emailExists) {
        return apiError(
          ErrorCodes.VALIDATION_ERROR,
          'Korisnik s ovom email adresom već postoji',
          400
        );
      }
    }

    const user = await usersRepository.update(id, {
      ...updateData,
      ...(role && { role }),
      ...(email && { email }),
    });

    return apiSuccess({ user });
  } catch (error) {
    console.error('User PUT error:', error);
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri ažuriranju korisnika',
      500
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401);
    }

    const actorRole = session.user.role as string;

    if (!isAdmin(actorRole)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za deaktiviranje korisnika',
        403
      );
    }

    const { id } = await params;

    // Cannot deactivate yourself
    if (id === session.user.id) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Ne možete deaktivirati vlastiti račun',
        400
      );
    }

    const existingUser = await usersRepository.findById(id);

    if (!existingUser) {
      return apiError(ErrorCodes.NOT_FOUND, 'Korisnik nije pronađen', 404);
    }

    // Check if actor can manage this user
    if (!canManageUser(actorRole, existingUser.role)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za deaktiviranje ovog korisnika',
        403
      );
    }

    const user = await usersRepository.deactivate(id);

    return apiSuccess({ user });
  } catch (error) {
    console.error('User DELETE error:', error);
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri deaktiviranju korisnika',
      500
    );
  }
}
```

**Step 3: Create API tests**

Create `apps/admin/app/api/users/route.test.ts`:

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET, POST } from './route';

vi.mock('@repo/database', () => ({
  usersRepository: {
    findMany: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
  },
  prisma: {
    account: {
      create: vi.fn(),
    },
  },
}));

vi.mock('better-auth/crypto', () => ({
  hash: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { usersRepository } from '@repo/database';

import { auth } from '@/lib/auth';

const mockedUsersRepository = vi.mocked(usersRepository);
const mockedAuth = vi.mocked(auth);

describe('Users API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/users', () => {
    it('returns 401 when not authenticated', async () => {
      mockedAuth.api.getSession.mockResolvedValue(null);

      const request = new Request('http://localhost/api/users');
      const response = await GET(request as never);
      const data = (await response.json()) as { success: boolean };

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('returns 403 when user is staff', async () => {
      mockedAuth.api.getSession.mockResolvedValue({
        user: { id: '1', role: 'staff' },
        session: {},
      } as never);

      const request = new Request('http://localhost/api/users');
      const response = await GET(request as never);
      const data = (await response.json()) as { success: boolean };

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    it('returns users for admin', async () => {
      mockedAuth.api.getSession.mockResolvedValue({
        user: { id: '1', role: 'admin' },
        session: {},
      } as never);

      mockedUsersRepository.findMany.mockResolvedValue({
        users: [{ id: '2', name: 'Test', email: 'test@example.com', role: 'staff' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      } as never);

      const request = new Request('http://localhost/api/users');
      const response = await GET(request as never);
      const data = (await response.json()) as { success: boolean; data: { users: unknown[] } };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.users).toHaveLength(1);
    });
  });

  describe('POST /api/users', () => {
    it('returns 403 when admin tries to create super_admin', async () => {
      mockedAuth.api.getSession.mockResolvedValue({
        user: { id: '1', role: 'admin' },
        session: {},
      } as never);

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Admin',
          email: 'newadmin@example.com',
          password: '<TEST_PASSWORD>',
          role: 'super_admin',
        }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as { success: boolean };

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    it('creates staff user when admin requests', async () => {
      mockedAuth.api.getSession.mockResolvedValue({
        user: { id: '1', role: 'admin' },
        session: {},
      } as never);

      mockedUsersRepository.findByEmail.mockResolvedValue(null);
      mockedUsersRepository.create.mockResolvedValue({
        id: '2',
        name: 'New Staff',
        email: 'staff@example.com',
        role: 'staff',
      } as never);

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Staff',
          email: 'staff@example.com',
          password: '<TEST_PASSWORD>',
          role: 'staff',
        }),
      });

      const response = await POST(request as never);
      const data = (await response.json()) as { success: boolean };

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });
});
```

**Step 4: Run tests**

Run: `cd /mnt/c/VelikiBukovec_web && pnpm test --filter=@repo/admin`
Expected: All tests pass

**Step 5: Commit**

```bash
git add apps/admin/app/api/users/route.ts apps/admin/app/api/users/[id]/route.ts apps/admin/app/api/users/route.test.ts
git commit -m "feat(api): add users CRUD endpoints with role-based permissions"
```

---

## Task 6: Block Inactive Users from Login

**Files:**
- Modify: `apps/admin/lib/auth.ts`

**Step 1: Add beforeSession hook to check active status**

In `apps/admin/lib/auth.ts`, add a hook to block inactive users. Find the `betterAuth` config and add:

```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { twoFactor } from 'better-auth/plugins';

import { prisma } from '@repo/database';

import { getAuthEnv } from './env';

const env = getAuthEnv();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'staff',
      },
      active: {
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
    },
  },
  appName: 'Veliki Bukovec Admin',
  plugins: [twoFactor({ issuer: 'Veliki Bukovec Admin' })],
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Check if user is active before creating session
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { active: true },
          });

          if (!user?.active) {
            throw new Error('Vaš račun je deaktiviran. Kontaktirajte administratora.');
          }

          return { data: session };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
```

**Step 2: Commit**

```bash
git add apps/admin/lib/auth.ts
git commit -m "feat(auth): block inactive users from creating sessions"
```

---

## Task 7: Users List Page

**Files:**
- Create: `apps/admin/components/users/columns.tsx`
- Create: `apps/admin/components/users/data-table.tsx`
- Create: `apps/admin/app/(dashboard)/users/page.tsx`

**Step 1: Create table columns**

Create `apps/admin/components/users/columns.tsx`:

```typescript
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { MoreHorizontal, UserCheck, UserX } from 'lucide-react';

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui';
import { USER_ROLE_LABELS, type UserRole } from '@repo/shared';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

interface ColumnsProps {
  onEdit: (user: UserRow) => void;
  onToggleActive: (user: UserRow) => void;
  currentUserId: string;
}

export function getColumns({
  onEdit,
  onToggleActive,
  currentUserId,
}: ColumnsProps): ColumnDef<UserRow>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Ime',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {!row.original.active && (
            <Badge variant="secondary" className="text-xs">
              Neaktivan
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Uloga',
      cell: ({ row }) => (
        <Badge variant="outline">
          {USER_ROLE_LABELS[row.original.role] ?? row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Kreiran',
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), 'd. MMM yyyy.', { locale: hr }),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        const isCurrentUser = user.id === currentUserId;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Akcije">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                Uredi
              </DropdownMenuItem>
              {!isCurrentUser && (
                <DropdownMenuItem onClick={() => onToggleActive(user)}>
                  {user.active ? (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Deaktiviraj
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Aktiviraj
                    </>
                  )}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
```

**Step 2: Create data table component**

Create `apps/admin/components/users/data-table.tsx`:

```typescript
'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';

import { getColumns, type UserRow } from './columns';

interface DataTableProps {
  data: UserRow[];
  onEdit: (user: UserRow) => void;
  onToggleActive: (user: UserRow) => void;
  currentUserId: string;
}

export function DataTable({
  data,
  onEdit,
  onToggleActive,
  currentUserId,
}: DataTableProps) {
  const columns = getColumns({ onEdit, onToggleActive, currentUserId });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Nema korisnika za prikaz.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Step 3: Create users list page**

Create `apps/admin/app/(dashboard)/users/page.tsx`:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@repo/ui';
import { USER_ROLE_OPTIONS } from '@repo/shared';
import { Plus, Search } from 'lucide-react';

import { useSession } from '@/lib/auth-client';
import { isAdmin } from '@/lib/permissions';

import { DataTable } from '@/components/users/data-table';
import { type UserRow } from '@/components/users/columns';

interface UsersResponse {
  success: boolean;
  data: {
    users: UserRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export default function UsersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter);

      const response = await fetch(`/api/users?${params.toString()}`);
      const data = (await response.json()) as UsersResponse;

      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description: 'Nije moguće učitati korisnike',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user: UserRow) => {
    router.push(`/users/${user.id}`);
  };

  const handleToggleActive = async (user: UserRow) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      });

      const data = (await response.json()) as { success: boolean };

      if (data.success) {
        toast({
          title: 'Uspjeh',
          description: user.active
            ? 'Korisnik je deaktiviran'
            : 'Korisnik je aktiviran',
          variant: 'success',
        });
        void fetchUsers();
      } else {
        throw new Error('Failed to update user');
      }
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće promijeniti status korisnika',
        variant: 'destructive',
      });
    }
  };

  // Check permissions
  if (session?.user && !isAdmin(session.user.role as string)) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-neutral-500">
            Nemate ovlasti za pregled ove stranice.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Korisnici</h1>
          <p className="text-neutral-500">Upravljanje korisnicima sustava</p>
        </div>
        <Button onClick={() => router.push('/users/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Novi korisnik
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popis korisnika</CardTitle>
          <CardDescription>
            Pregledajte i upravljajte korisnicima administratorskog sučelja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Pretraži po imenu ili emailu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sve uloge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve uloge</SelectItem>
                {USER_ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <p className="py-10 text-center text-neutral-500">Učitavanje...</p>
          ) : (
            <DataTable
              data={users}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
              currentUserId={session?.user?.id ?? ''}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add apps/admin/components/users/columns.tsx apps/admin/components/users/data-table.tsx apps/admin/app/\(dashboard\)/users/page.tsx
git commit -m "feat(admin): add users list page with search and filtering"
```

---

## Task 8: User Form Component

**Files:**
- Create: `apps/admin/components/users/user-form.tsx`

**Step 1: Create user form component**

Create `apps/admin/components/users/user-form.tsx`:

```typescript
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { USER_ROLE_OPTIONS, type UserRole } from '@repo/shared';

import { getAssignableRoles } from '@/lib/permissions';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/lib/validations/user';

interface UserFormProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
  };
  actorRole: UserRole;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<void>;
  isLoading?: boolean;
}

export function UserForm({
  user,
  actorRole,
  onSubmit,
  isLoading = false,
}: UserFormProps) {
  const isEditing = Boolean(user);
  const assignableRoles = getAssignableRoles(actorRole);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          role: user.role,
        }
      : {
          name: '',
          email: '',
          password: '',
          role: 'staff' as const,
        },
  });

  const selectedRole = watch('role');

  const roleOptions = USER_ROLE_OPTIONS.filter((option) =>
    assignableRoles.includes(option.value as UserRole)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Uredi korisnika' : 'Novi korisnik'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Ažurirajte podatke korisnika'
            : 'Unesite podatke za novog korisnika'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Ime i prezime</Label>
            <Input
              id="name"
              placeholder="Ivan Horvat"
              error={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-error">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email adresa</Label>
            <Input
              id="email"
              type="email"
              placeholder="ivan@example.com"
              error={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-error">{errors.email.message}</p>
            )}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>
              <Input
                id="password"
                type="password"
                placeholder="Najmanje 8 znakova"
                error={Boolean((errors as { password?: { message?: string } }).password)}
                {...register('password')}
              />
              {(errors as { password?: { message?: string } }).password && (
                <p className="text-sm text-error">
                  {(errors as { password?: { message?: string } }).password?.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Uloga</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setValue('role', value as UserRole, { shouldValidate: true })
              }
            >
              <SelectTrigger id="role" error={Boolean(errors.role)}>
                <SelectValue placeholder="Odaberite ulogu" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-error">{errors.role.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Spremanje...'
                : isEditing
                  ? 'Spremi promjene'
                  : 'Stvori korisnika'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Commit**

```bash
git add apps/admin/components/users/user-form.tsx
git commit -m "feat(admin): add UserForm component with role restrictions"
```

---

## Task 9: Create and Edit User Pages

**Files:**
- Create: `apps/admin/app/(dashboard)/users/new/page.tsx`
- Create: `apps/admin/app/(dashboard)/users/[id]/page.tsx`

**Step 1: Create new user page**

Create `apps/admin/app/(dashboard)/users/new/page.tsx`:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { toast } from '@repo/ui';
import { type UserRole } from '@repo/shared';

import { useSession } from '@/lib/auth-client';
import { isAdmin } from '@/lib/permissions';
import { type CreateUserInput } from '@/lib/validations/user';

import { UserForm } from '@/components/users/user-form';

export default function NewUserPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateUserInput) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message: string };
      };

      if (result.success) {
        toast({
          title: 'Uspjeh',
          description: 'Korisnik je uspješno stvoren',
          variant: 'success',
        });
        router.push('/users');
      } else {
        throw new Error(result.error?.message ?? 'Greška pri stvaranju');
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description:
          error instanceof Error ? error.message : 'Nije moguće stvoriti korisnika',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user || !isAdmin(session.user.role as string)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <UserForm
        actorRole={session.user.role as UserRole}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
```

**Step 2: Create edit user page**

Create `apps/admin/app/(dashboard)/users/[id]/page.tsx`:

```typescript
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Card, CardContent, toast } from '@repo/ui';
import { type UserRole } from '@repo/shared';

import { useSession } from '@/lib/auth-client';
import { isAdmin } from '@/lib/permissions';
import { type UpdateUserInput } from '@/lib/validations/user';

import { UserForm } from '@/components/users/user-form';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const userId = params.id as string;

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = (await response.json()) as {
        success: boolean;
        data?: { user: UserData };
      };

      if (data.success && data.data) {
        setUser(data.data.user);
      } else {
        toast({
          title: 'Greška',
          description: 'Korisnik nije pronađen',
          variant: 'destructive',
        });
        router.push('/users');
      }
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće učitati korisnika',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const handleSubmit = async (data: UpdateUserInput) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message: string };
      };

      if (result.success) {
        toast({
          title: 'Uspjeh',
          description: 'Korisnik je uspješno ažuriran',
          variant: 'success',
        });
        router.push('/users');
      } else {
        throw new Error(result.error?.message ?? 'Greška pri ažuriranju');
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description:
          error instanceof Error ? error.message : 'Nije moguće ažurirati korisnika',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!session?.user || !isAdmin(session.user.role as string)) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-neutral-500">Učitavanje...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <UserForm
        user={user}
        actorRole={session.user.role as UserRole}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add apps/admin/app/\(dashboard\)/users/new/page.tsx apps/admin/app/\(dashboard\)/users/\[id\]/page.tsx
git commit -m "feat(admin): add create and edit user pages"
```

---

## Task 10: Add Users Link to Sidebar Navigation

**Files:**
- Modify: `apps/admin/components/layout/sidebar.tsx`

**Step 1: Add Users navigation item**

In `apps/admin/components/layout/sidebar.tsx`, find the `navItems` array and add Users after Settings:

```typescript
import {
  CalendarDays,
  FileText,
  Home,
  Images,
  LayoutDashboard,
  Newspaper,
  Settings,
  Users,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Nadzorna ploča', icon: LayoutDashboard },
  { href: '/posts', label: 'Vijesti', icon: Newspaper },
  { href: '/documents', label: 'Dokumenti', icon: FileText },
  { href: '/pages', label: 'Stranice', icon: Home },
  { href: '/events', label: 'Događanja', icon: CalendarDays },
  { href: '/galleries', label: 'Galerije', icon: Images },
  { href: '/settings', label: 'Postavke', icon: Settings },
  { href: '/users', label: 'Korisnici', icon: Users },
];
```

**Step 2: Commit**

```bash
git add apps/admin/components/layout/sidebar.tsx
git commit -m "feat(admin): add Users link to sidebar navigation"
```

---

## Task 11: Update CHANGELOG and ROADMAP

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`

**Step 1: Update CHANGELOG**

Add to the `## Unreleased` section at the top:

```markdown
## Sprint 1.11 - User Management (Completed)

### Added
- User management page for admin-only CRUD operations
- Users repository in @repo/database with list, create, update, deactivate
- User validation schemas with Croatian error messages
- Role-based permission system (super_admin > admin > staff)
- Soft-delete via active field - deactivated users cannot log in
- DataTable with search and role filtering
- UserForm component with role restrictions
- Create/edit user pages
- Users link in admin sidebar navigation
- Gate: Create user, change role, deactivate, verify login blocked
```

**Step 2: Update ROADMAP**

Change Sprint 1.11 status from ⬜ to ✅ and update progress:

```markdown
| 1.11 ✅ | User management | 🔀 | 1.10 | CRUD users (admin only) |
```

Update the Recent updates section:

```markdown
Recent updates:
- Sprint 1.11 completed: User management with CRUD, role-based permissions, and soft-delete.
- Sprint 1.10 completed: Settings page with profile, password change, 2FA setup, and sessions management.
```

Update Active Sprint to 1.12:

```markdown
**Active Sprint:** 1.12 - Admin integration test
```

**Step 3: Commit**

```bash
git add CHANGELOG.md ROADMAP.md
git commit -m "docs: update CHANGELOG and ROADMAP for Sprint 1.11"
```

---

## Task 12: Final Verification

**Step 1: Run all checks**

```bash
cd /mnt/c/VelikiBukovec_web
pnpm type-check
pnpm lint
pnpm test
pnpm build
```

All should pass.

**Step 2: Manual gate verification**

1. Login as super_admin
2. Navigate to /users
3. Create a new staff user
4. Edit the user's name
5. Deactivate the user
6. Try logging in as deactivated user - should fail

**Step 3: Final commit if any fixes needed**

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add active field to schema | schema.prisma, types/index.ts |
| 2 | User types and validation | types/user.ts, validations/user.ts |
| 3 | Users repository | repositories/users.ts |
| 4 | Permission helpers | permissions.ts |
| 5 | Users API routes | api/users/route.ts, api/users/[id]/route.ts |
| 6 | Block inactive login | auth.ts |
| 7 | Users list page | users/page.tsx, columns.tsx, data-table.tsx |
| 8 | User form component | user-form.tsx |
| 9 | Create/edit pages | users/new/page.tsx, users/[id]/page.tsx |
| 10 | Sidebar navigation | sidebar.tsx |
| 11 | Documentation | CHANGELOG.md, ROADMAP.md |
| 12 | Final verification | All checks pass |
