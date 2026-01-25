import { USER_ROLES } from '@repo/shared';

type Role = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Check if a user can manage another user based on role hierarchy
 * - super_admin can manage everyone
 * - admin can manage staff only
 * - staff cannot manage anyone
 */
export function canManageUser(actorRole: Role, targetRole: Role): boolean {
  if (actorRole === USER_ROLES.SUPER_ADMIN) {
    return true;
  }

  if (actorRole === USER_ROLES.ADMIN) {
    return targetRole === USER_ROLES.STAFF;
  }

  return false;
}

/**
 * Check if a user can assign a specific role
 * - super_admin can assign any role
 * - admin can only assign staff role
 */
export function canAssignRole(actorRole: Role, targetRole: Role): boolean {
  if (actorRole === USER_ROLES.SUPER_ADMIN) {
    return true;
  }

  if (actorRole === USER_ROLES.ADMIN) {
    return targetRole === USER_ROLES.STAFF;
  }

  return false;
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
