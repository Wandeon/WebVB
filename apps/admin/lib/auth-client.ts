import { getPublicEnv } from '@repo/shared';
import { twoFactorClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

const env = getPublicEnv();

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [twoFactorClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  updateUser,
  changePassword,
  listSessions,
  revokeSession,
  revokeOtherSessions,
  twoFactor,
} = authClient;
