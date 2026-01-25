'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { toast } from '@repo/ui';
import { USER_ROLES, type UserRole } from '@repo/shared';

import { useSession } from '@/lib/auth-client';
import { isAdmin } from '@/lib/permissions';
import { type CreateUserInput } from '@/lib/validations/user';

import { UserForm } from '@/components/users/user-form';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export default function NewUserPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateUserInput) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message: string };
      };

      if (result.success) {
        toast({
          title: 'Uspjeh',
          description: 'Korisnik je uspješno stvoren',
          variant: 'success',
        });
        router.push('/users');
      } else {
        throw new Error(result.error?.message ?? 'Greška pri stvaranju');
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description:
          error instanceof Error ? error.message : 'Nije moguće stvoriti korisnika',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const user = session?.user as SessionUser | undefined;
  const userRole = (user?.role ?? USER_ROLES.STAFF) as UserRole;

  if (!user || !isAdmin(userRole)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <UserForm
        actorRole={userRole}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
