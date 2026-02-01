import { db } from '@repo/database';
import { USER_ROLES, getAdminAuthEnv } from '@repo/shared';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { twoFactor } from 'better-auth/plugins';

const authEnv = getAdminAuthEnv();
const isProduction = authEnv.NODE_ENV === 'production';

export const auth = betterAuth({
  appName: 'Veliki Bukovec Admin',
  baseURL: authEnv.BETTER_AUTH_URL,
  secret: authEnv.BETTER_AUTH_SECRET,

  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: false, // Disable for now, enable in production
    minPasswordLength: 12,
    revokeSessionsOnPasswordReset: true,
  },

  socialProviders: {
    google: {
      clientId: authEnv.GOOGLE_CLIENT_ID ?? '',
      clientSecret: authEnv.GOOGLE_CLIENT_SECRET ?? '',
      enabled: Boolean(authEnv.GOOGLE_CLIENT_ID && authEnv.GOOGLE_CLIENT_SECRET),
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

  rateLimit: {
    enabled: true,
    window: 60,
    max: 120,
    customRules: {
      '/sign-in/*': { window: 60, max: 5 },
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-in/social': { window: 60, max: 10 },
      '/request-password-reset': { window: 60 * 60, max: 3 },
    },
  },

  trustedOrigins: [authEnv.BETTER_AUTH_URL],

  defaultCookieAttributes: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
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

  advanced: {
    useSecureCookies: isProduction,
  },

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
