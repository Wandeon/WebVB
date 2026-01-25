import { USER_ROLES } from '@repo/shared';

import { apiError, ErrorCodes } from '@/lib/api-response';
import { auth } from '@/lib/auth';
import { isAdmin, normalizeRole } from '@/lib/permissions';

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

  const role = normalizeRole(session.user.role);

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
      userId: session.user.id,
    },
  };
}

export function getAuditMetadata(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0]?.trim();

  return {
    ipAddress: ipAddress ?? request.headers.get('x-real-ip'),
    userAgent: request.headers.get('user-agent'),
  };
}
