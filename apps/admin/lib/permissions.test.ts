import { USER_ROLES } from '@repo/shared';
import { describe, expect, it } from 'vitest';

import {
  canAssignRole,
  canManageUser,
  getAssignableRoles,
} from './permissions';

describe('permissions', () => {
  describe('canManageUser', () => {
    it('allows super_admin to manage any role', () => {
      expect(canManageUser(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN)).toBe(true);
      expect(canManageUser(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)).toBe(true);
      expect(canManageUser(USER_ROLES.SUPER_ADMIN, USER_ROLES.STAFF)).toBe(true);
    });

    it('allows admin to manage staff only', () => {
      expect(canManageUser(USER_ROLES.ADMIN, USER_ROLES.STAFF)).toBe(true);
      expect(canManageUser(USER_ROLES.ADMIN, USER_ROLES.ADMIN)).toBe(false);
      expect(canManageUser(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)).toBe(false);
    });

    it('prevents staff from managing anyone', () => {
      expect(canManageUser(USER_ROLES.STAFF, USER_ROLES.STAFF)).toBe(false);
      expect(canManageUser(USER_ROLES.STAFF, USER_ROLES.ADMIN)).toBe(false);
      expect(canManageUser(USER_ROLES.STAFF, USER_ROLES.SUPER_ADMIN)).toBe(false);
    });
  });

  describe('canAssignRole', () => {
    it('allows super_admin to assign any role', () => {
      expect(canAssignRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN)).toBe(true);
      expect(canAssignRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)).toBe(true);
      expect(canAssignRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.STAFF)).toBe(true);
    });

    it('allows admin to assign staff only', () => {
      expect(canAssignRole(USER_ROLES.ADMIN, USER_ROLES.STAFF)).toBe(true);
      expect(canAssignRole(USER_ROLES.ADMIN, USER_ROLES.ADMIN)).toBe(false);
      expect(canAssignRole(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)).toBe(false);
    });

    it('prevents staff from assigning roles', () => {
      expect(canAssignRole(USER_ROLES.STAFF, USER_ROLES.STAFF)).toBe(false);
      expect(canAssignRole(USER_ROLES.STAFF, USER_ROLES.ADMIN)).toBe(false);
    });
  });

  describe('getAssignableRoles', () => {
    it('returns all roles for super_admin', () => {
      expect(getAssignableRoles(USER_ROLES.SUPER_ADMIN)).toEqual([
        USER_ROLES.STAFF,
        USER_ROLES.ADMIN,
        USER_ROLES.SUPER_ADMIN,
      ]);
    });

    it('returns staff only for admin', () => {
      expect(getAssignableRoles(USER_ROLES.ADMIN)).toEqual([
        USER_ROLES.STAFF,
      ]);
    });

    it('returns empty list for staff', () => {
      expect(getAssignableRoles(USER_ROLES.STAFF)).toEqual([]);
    });
  });
});
