import { db } from '@repo/database';
import { USER_ROLES } from '@repo/shared';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { twoFactor } from 'better-auth/plugins';

// Note: Using process.env directly here because Better Auth config is evaluated
// at module load time (during Next.js build). Runtime validation of env vars
// happens via getAdminAuthEnv() in API route handlers.
export const auth = betterAuth({
  appName: 'Veliki Bukovec Admin',
  baseURL: process.env.BETTER_AUTH_URL ?? '',
  secret: process.env.BETTER_AUTH_SECRET ?? '',

  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable for now, enable in production
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
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
      active: {
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
    },
  },

  plugins: [twoFactor({ issuer: 'Veliki Bukovec Admin' })],

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Check if user is active before creating session
          const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { active: true },
          });

          if (!user?.active) {
            throw new Error('Vaš račun je deaktiviran. Kontaktirajte administratora.');
          }

          return { data: session };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
