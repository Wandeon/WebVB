import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@/lib/auth';

// Note: Env validation happens via @repo/shared/getAdminAuthEnv() which can be
// called in server actions or middleware. The auth config uses process.env
// directly to support Next.js build-time analysis.

export const { GET, POST } = toNextJsHandler(auth);
