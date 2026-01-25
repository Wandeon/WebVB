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
