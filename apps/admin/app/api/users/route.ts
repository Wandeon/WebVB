import { usersRepository } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';
import { hashPassword } from 'better-auth/crypto';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { usersLogger } from '@/lib/logger';
import { canAssignRole } from '@/lib/permissions';
import { createUserSchema, userQuerySchema } from '@/lib/validations/user';

import type { NextRequest } from 'next/server';

// GET /api/users - List users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
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
    usersLogger.error({ error }, 'Greška prilikom dohvaćanja korisnika');
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
    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    const userRole = authResult.context.role;

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
    await usersRepository.createCredentialAccount({
      userId: user.id,
      password: hashedPassword,
    });

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.CREATE,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: user.id,
      changes: {
        after: user,
      },
    });

    return apiSuccess(user, 201);
  } catch (error) {
    usersLogger.error({ error }, 'Greška prilikom stvaranja korisnika');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom stvaranja korisnika',
      500
    );
  }
}
