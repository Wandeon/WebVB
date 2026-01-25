import { z } from 'zod';

import { ADMIN_APP_URL_DEFAULT, PUBLIC_SITE_URL_DEFAULT } from './constants';

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
  NEXT_PUBLIC_SITE_URL: z.string().url().default(PUBLIC_SITE_URL_DEFAULT),
});

const adminR2EnvSchema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().min(1),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().min(1),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url(),
});

// Types inferred from schemas - no manual interface duplication
export type NodeEnv = 'development' | 'test' | 'production';
export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type AdminAuthEnv = z.infer<typeof adminAuthEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type AdminR2Env = z.infer<typeof adminR2EnvSchema>;

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

export function getAdminR2Env(): AdminR2Env {
  return adminR2EnvSchema.parse(process.env);
}
