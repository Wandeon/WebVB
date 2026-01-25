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
