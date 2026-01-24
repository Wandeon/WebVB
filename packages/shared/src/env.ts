import { z } from 'zod';

import { ADMIN_APP_URL_DEFAULT } from './constants';

// Schema definitions - single source of truth for both validation and types
const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const adminAuthEnvSchema = baseEnvSchema
  .extend({
    BETTER_AUTH_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasGoogleId = Boolean(data.GOOGLE_CLIENT_ID);
    const hasGoogleSecret = Boolean(data.GOOGLE_CLIENT_SECRET);

    if (hasGoogleId !== hasGoogleSecret) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Google OAuth requires both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
        path: ['GOOGLE_CLIENT_ID'],
      });
    }
  });

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default(ADMIN_APP_URL_DEFAULT),
});

// Types inferred from schemas - no manual interface duplication
export type NodeEnv = 'development' | 'test' | 'production';
export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type AdminAuthEnv = z.infer<typeof adminAuthEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

// Validated env getters - Zod parse returns the inferred type
export function getBaseEnv(): BaseEnv {
  return baseEnvSchema.parse(process.env);
}

export function getAdminAuthEnv(): AdminAuthEnv {
  return adminAuthEnvSchema.parse(process.env);
}

export function getPublicEnv(): PublicEnv {
  return publicEnvSchema.parse(process.env);
}
