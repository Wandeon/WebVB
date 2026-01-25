import { usersRepository } from '@repo/database';
import { USER_ROLES } from '@repo/shared';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { auth } from '@/lib/auth';
import { canAssignRole, canManageUser, isAdmin } from '@/lib/permissions';
import { updateUserSchema } from '@/lib/validations/user';

import type { NextRequest } from 'next/server';

type Role = (typeof USER_ROLES)[keyof typeof USER_ROLES];

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id] - Get a single user by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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

    const user = await usersRepository.findById(id);

    if (!user) {
      return apiError(ErrorCodes.NOT_FOUND, 'Korisnik nije pronađen', 404);
    }

    return apiSuccess(user);
  } catch (error) {
    console.error('Error fetching user:', error);
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
        'Nemate ovlasti za uređivanje korisnika',
        403
      );
    }

    const existingUser = await usersRepository.findById(id);

    if (!existingUser) {
      return apiError(ErrorCodes.NOT_FOUND, 'Korisnik nije pronađen', 404);
    }

    // Check if actor can manage this user
    if (!canManageUser(userRole, existingUser.role as Role)) {
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

    return apiSuccess(user);
  } catch (error) {
    console.error('Error updating user:', error);
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
        'Nemate ovlasti za deaktiviranje korisnika',
        403
      );
    }

    // Cannot deactivate yourself
    if (session.user.id === id) {
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
    if (!canManageUser(userRole, existingUser.role as Role)) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za deaktiviranje ovog korisnika',
        403
      );
    }

    const user = await usersRepository.deactivate(id);

    return apiSuccess(user);
  } catch (error) {
    console.error('Error deactivating user:', error);
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom deaktiviranja korisnika',
      500
    );
  }
}
