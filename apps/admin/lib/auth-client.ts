import { twoFactorClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// Use process.env directly so Next.js can inline at build time
const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

export const authClient = createAuthClient({
  baseURL,
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
