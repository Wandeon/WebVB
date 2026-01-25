import { usersRepository } from '@repo/database';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@repo/shared';

import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit-log';
import { usersLogger } from '@/lib/logger';
import { canAssignRole, canManageUser, normalizeRole } from '@/lib/permissions';
import { updateUserSchema } from '@/lib/validations/user';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id] - Get a single user by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    const user = await usersRepository.findById(id);

    if (!user) {
      return apiError(ErrorCodes.NOT_FOUND, 'Korisnik nije pronađen', 404);
    }

    return apiSuccess(user);
  } catch (error) {
    usersLogger.error({ error }, 'Greška prilikom dohvaćanja korisnika');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja korisnika',
      500
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    const userRole = authResult.context.role;

    const existingUser = await usersRepository.findById(id);

    if (!existingUser) {
      return apiError(ErrorCodes.NOT_FOUND, 'Korisnik nije pronađen', 404);
    }

    // Check if actor can manage this user
    const existingUserRole = normalizeRole(existingUser.role);

    if (!canManageUser(userRole, existingUserRole)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za uređivanje ovog korisnika',
        403
      );
    }

    const body: unknown = await request.json();

    const validationResult = updateUserSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { name, email, role, active } = validationResult.data;

    // If role is being changed, check if actor can assign the new role
    if (role !== undefined && !canAssignRole(userRole, role)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za dodjelu ove uloge',
        403
      );
    }

    // Check if email is being changed to one that already exists
    if (email && email !== existingUser.email) {
      const emailTaken = await usersRepository.findByEmail(email);

      if (emailTaken) {
        return apiError(
          ErrorCodes.VALIDATION_ERROR,
          'Korisnik s ovom email adresom već postoji',
          400
        );
      }
    }

    const updateData: Parameters<typeof usersRepository.update>[1] = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (active !== undefined) updateData.active = active;

    const user = await usersRepository.update(id, updateData);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: user.id,
      changes: {
        before: existingUser,
        after: user,
      },
    });

    return apiSuccess(user);
  } catch (error) {
    usersLogger.error({ error }, 'Greška prilikom uređivanja korisnika');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom uređivanja korisnika',
      500
    );
  }
}

// DELETE /api/users/[id] - Deactivate a user (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const authResult = await requireAuth(request, { requireAdmin: true });

    if ('response' in authResult) {
      return authResult.response;
    }

    const userRole = authResult.context.role;

    // Cannot deactivate yourself
    if (authResult.context.userId === id) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Ne možete deaktivirati vlastiti račun',
        403
      );
    }

    const existingUser = await usersRepository.findById(id);

    if (!existingUser) {
      return apiError(ErrorCodes.NOT_FOUND, 'Korisnik nije pronađen', 404);
    }

    // Check if actor can manage this user
    const existingUserRole = normalizeRole(existingUser.role);

    if (!canManageUser(userRole, existingUserRole)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za deaktiviranje ovog korisnika',
        403
      );
    }

    const user = await usersRepository.deactivate(id);

    await createAuditLog({
      request,
      context: authResult.context,
      action: AUDIT_ACTIONS.DELETE,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: user.id,
      changes: {
        before: existingUser,
        after: user,
      },
    });

    return apiSuccess(user);
  } catch (error) {
    usersLogger.error({ error }, 'Greška prilikom deaktiviranja korisnika');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom deaktiviranja korisnika',
      500
    );
  }
}
