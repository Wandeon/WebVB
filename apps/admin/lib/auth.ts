import { db } from '@repo/database';
import { USER_ROLES, getAdminAuthEnv } from '@repo/shared';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- validated env helper enforces schema at runtime.
const env = getAdminAuthEnv();

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- prismaAdapter expects PrismaClient; db is PrismaClient.
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable for now, enable in production
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? '',
      enabled: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: USER_ROLES.STAFF,
        input: false, // Don't allow setting via signup
      },
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
