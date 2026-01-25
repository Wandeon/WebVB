'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { toast } from '@repo/ui';
import { type UserRole } from '@repo/shared';

import { useSession } from '@/lib/auth-client';
import { isAdmin } from '@/lib/permissions';
import { type CreateUserInput } from '@/lib/validations/user';

import { UserForm } from '@/components/users/user-form';

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

  if (!session?.user || !isAdmin(session.user.role as string)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <UserForm
        actorRole={session.user.role as UserRole}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
