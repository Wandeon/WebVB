
import { db, usersRepository } from '@repo/database';
import { USER_ROLES } from '@repo/shared';
import { hashPassword } from 'better-auth/crypto';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { auth } from '@/lib/auth';
import { canAssignRole, isAdmin } from '@/lib/permissions';
import { createUserSchema, userQuerySchema } from '@/lib/validations/user';

import type { NextRequest } from 'next/server';

type Role = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// GET /api/users - List users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401);
    }

    const userRole = (session.user.role ?? USER_ROLES.STAFF) as Role;

    // Check authorization - must be admin or super_admin
    if (!isAdmin(userRole)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za pristup korisnicima',
        403
      );
    }

    const { searchParams } = new URL(request.url);

    const queryResult = userQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      role: searchParams.get('role'),
      active: searchParams.get('active'),
    });

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { page, limit, search, role, active } = queryResult.data;

    const result = await usersRepository.findMany({
      page,
      limit,
      ...(search && { search }),
      ...(role && { role }),
      ...(active !== undefined && { active }),
    });

    return apiSuccess({
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja korisnika',
      500
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401);
    }

    const userRole = (session.user.role ?? USER_ROLES.STAFF) as Role;

    // Check authorization - must be admin or super_admin
    if (!isAdmin(userRole)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za stvaranje korisnika',
        403
      );
    }

    const body: unknown = await request.json();

    const validationResult = createUserSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { name, email, password, role } = validationResult.data;

    // Check if actor can assign this role
    if (!canAssignRole(userRole, role)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za dodjelu ove uloge',
        403
      );
    }

    // Check if email already exists
    const existingUser = await usersRepository.findByEmail(email);

    if (existingUser) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Korisnik s ovom email adresom već postoji',
        400
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const user = await usersRepository.create({
      name,
      email,
      role,
    });

    // Create credential account for the user
    await db.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: hashedPassword,
      },
    });

    return apiSuccess(user, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom stvaranja korisnika',
      500
    );
  }
}
