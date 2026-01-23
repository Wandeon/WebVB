'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { useSession } from '@/lib/auth-client';

// Use flexible types that match Better Auth's actual return types
interface SessionUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null | undefined;
  role?: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}

interface SessionData {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}

interface SessionContextValue {
  session: SessionData | null;
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, isPending } = useSession();

  // Cast to our types - Better Auth types may not include custom fields
  const session = sessionData?.session as SessionData | undefined;
  const user = sessionData?.user as (SessionUser & Record<string, unknown>) | undefined;

  const value: SessionContextValue = {
    session: session ?? null,
    user: user ? { ...user, role: (user.role as string) ?? 'staff' } : null,
    isLoading: isPending,
    isAuthenticated: !!session,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SessionProvider');
  }
  return context;
}
