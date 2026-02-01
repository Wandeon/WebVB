import { USER_ROLES } from '@repo/shared';
import { z } from 'zod';

export const createUserSchema = z
  .object({
  name: z.string().min(2, 'Ime mora imati najmanje 2 znaka'),
  email: z.string().email('Neispravan format email adrese'),
  password: z
    .string()
    .min(12, 'Lozinka mora imati najmanje 12 znakova')
    .regex(/[a-z]/, 'Lozinka mora sadržavati malo slovo')
    .regex(/[A-Z]/, 'Lozinka mora sadržavati veliko slovo')
    .regex(/\d/, 'Lozinka mora sadržavati broj')
    .regex(/[^A-Za-z0-9]/, 'Lozinka mora sadržavati poseban znak'),
  role: z.enum([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.STAFF], {
    message: 'Odaberite ulogu',
  }),
})
  .strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
  name: z.string().min(2, 'Ime mora imati najmanje 2 znaka').optional(),
  email: z.string().email('Neispravan format email adrese').optional(),
  role: z
    .enum([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.STAFF])
    .optional(),
  active: z.boolean().optional(),
})
  .strict();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userQuerySchema = z
  .object({
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
  })
  .strict();

export type UserQueryInput = z.infer<typeof userQuerySchema>;
