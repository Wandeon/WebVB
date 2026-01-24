import { z } from 'zod';

import { ADMIN_APP_URL_DEFAULT } from './constants';

export type NodeEnv = 'development' | 'test' | 'production';

export interface BaseEnv {
  NODE_ENV: NodeEnv;
}

export interface AdminAuthEnv extends BaseEnv {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

export interface PublicEnv {
  NEXT_PUBLIC_APP_URL: string;
}

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

export function getBaseEnv(): BaseEnv {
  return baseEnvSchema.parse(process.env) as BaseEnv;
}

export function getAdminAuthEnv(): AdminAuthEnv {
  return adminAuthEnvSchema.parse(process.env) as AdminAuthEnv;
}

export function getPublicEnv(): PublicEnv {
  return publicEnvSchema.parse(process.env) as PublicEnv;
}
