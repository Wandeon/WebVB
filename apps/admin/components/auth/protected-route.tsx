'use client';

import { USER_ROLES, type UserRole } from '@repo/shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/components/providers/session-provider';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  [USER_ROLES.SUPER_ADMIN]: 3,
  [USER_ROLES.ADMIN]: 2,
  [USER_ROLES.STAFF]: 1,
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && requiredRole && user) {
      const userLevel = ROLE_HIERARCHY[user.role as UserRole] ?? 0;
      const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;

      if (userLevel < requiredLevel) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, user, router]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Učitavanje...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
