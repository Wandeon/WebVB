'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useSession } from '@/lib/auth-client';
import type { Session, User } from '@/lib/auth';

interface SessionContextValue {
  session: Session | null;
  user: User | null;
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

  const value: SessionContextValue = {
    session: sessionData?.session ?? null,
    user: sessionData?.user ?? null,
    isLoading: isPending,
    isAuthenticated: !!sessionData?.session,
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
