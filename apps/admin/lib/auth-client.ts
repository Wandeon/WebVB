import { getPublicEnv } from '@repo/shared';
import { createAuthClient } from 'better-auth/react';

const env = getPublicEnv();

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
