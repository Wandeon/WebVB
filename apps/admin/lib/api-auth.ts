import { usersRepository } from '@repo/database';
import { USER_ROLES } from '@repo/shared';

import { apiError, ErrorCodes } from '@/lib/api-response';
import { auth } from '@/lib/auth';
import { isAdmin, normalizeRole } from '@/lib/permissions';
import { anonymizeIp, hashValue } from '@/lib/pii';

type Role = (typeof USER_ROLES)[keyof typeof USER_ROLES];

interface SessionUser {
  id: string;
  role?: string | null;
}

interface AuthSession {
  user?: SessionUser | null;
}

export interface AuthContext {
  session: AuthSession;
  role: Role;
  userId: string;
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function isSafeMethod(method: string): boolean {
  return SAFE_METHODS.has(method.toUpperCase());
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');

  if (origin) {
    if (origin === 'null') {
      return false;
    }

    const requestOrigin = new URL(request.url).origin;
    return origin === requestOrigin;
  }

  const fetchSite = request.headers.get('sec-fetch-site');

  if (fetchSite) {
    return fetchSite === 'same-origin' || fetchSite === 'same-site';
  }

  return true;
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'user' in value;
}

export async function requireAuth(
  request: Request,
  options: { requireAdmin?: boolean; requireSuperAdmin?: boolean } = {}
): Promise<{ context: AuthContext } | { response: ReturnType<typeof apiError> }> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!isAuthSession(session) || !session.user) {
    return {
      response: apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401),
    };
  }

  if (!isSafeMethod(request.method) && !isSameOriginRequest(request)) {
    return {
      response: apiError(
        ErrorCodes.FORBIDDEN,
        'Neispravan zahtjev',
        403
      ),
    };
  }

  const user = await usersRepository.findById(session.user.id);

  if (!user) {
    return {
      response: apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401),
    };
  }

  if (!user.active) {
    return {
      response: apiError(
        ErrorCodes.FORBIDDEN,
        'Vaš račun je deaktiviran. Kontaktirajte administratora.',
        403
      ),
    };
  }

  const role = normalizeRole(user.role);

  if (options.requireSuperAdmin && role !== USER_ROLES.SUPER_ADMIN) {
    return {
      response: apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za ovu akciju',
        403
      ),
    };
  }

  if (options.requireAdmin && !isAdmin(role)) {
    return {
      response: apiError(
        ErrorCodes.FORBIDDEN,
        'Nemate ovlasti za ovu akciju',
        403
      ),
    };
  }

  return {
    context: {
      session,
      role,
      userId: user.id,
    },
  };
}

export function getAuditMetadata(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = anonymizeIp(
    forwardedFor?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip')
  );
  const rawUserAgent = request.headers.get('user-agent');
  const userAgent = rawUserAgent ? hashValue(rawUserAgent) : null;

  return {
    ipAddress,
    userAgent,
  };
}
