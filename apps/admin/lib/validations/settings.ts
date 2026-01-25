import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Ime mora imati najmanje 2 znaka')
    .max(100, 'Ime može imati najviše 100 znakova'),
  image: z
    .string()
    .url('Neispravan URL slike')
    .nullable()
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Trenutna lozinka je obavezna'),
    newPassword: z
      .string()
      .min(8, 'Nova lozinka mora imati najmanje 8 znakova')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Lozinka mora sadržavati malo slovo, veliko slovo i broj'
      ),
    confirmPassword: z.string().min(1, 'Potvrda lozinke je obavezna'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Lozinke se ne podudaraju',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const enable2FASchema = z.object({
  password: z.string().min(1, 'Lozinka je obavezna za omogućavanje 2FA'),
});

export type Enable2FAInput = z.infer<typeof enable2FASchema>;

export const verify2FASchema = z.object({
  code: z
    .string()
    .length(6, 'Kod mora imati točno 6 znamenki')
    .regex(/^\d+$/, 'Kod smije sadržavati samo brojeve'),
  password: z.string().min(1, 'Lozinka je obavezna za generiranje rezervnih kodova'),
});

export type Verify2FAInput = z.infer<typeof verify2FASchema>;

export const disable2FASchema = z.object({
  password: z.string().min(1, 'Lozinka je obavezna za onemogućavanje 2FA'),
});

export type Disable2FAInput = z.infer<typeof disable2FASchema>;
