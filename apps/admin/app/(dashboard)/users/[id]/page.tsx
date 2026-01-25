'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Card, CardContent, toast } from '@repo/ui';
import { USER_ROLES, type UserRole } from '@repo/shared';

import { useSession } from '@/lib/auth-client';
import { isAdmin } from '@/lib/permissions';
import { type UpdateUserInput } from '@/lib/validations/user';

import { UserForm } from '@/components/users/user-form';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const userId = params.id as string;

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = (await response.json()) as {
        success: boolean;
        data?: { user: UserData };
      };

      if (data.success && data.data) {
        setUser(data.data.user);
      } else {
        toast({
          title: 'Greška',
          description: 'Korisnik nije pronađen',
          variant: 'destructive',
        });
        router.push('/users');
      }
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće učitati korisnika',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const handleSubmit = async (data: UpdateUserInput) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
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
          description: 'Korisnik je uspješno ažuriran',
          variant: 'success',
        });
        router.push('/users');
      } else {
        throw new Error(result.error?.message ?? 'Greška pri ažuriranju');
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description:
          error instanceof Error ? error.message : 'Nije moguće ažurirati korisnika',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const sessionUser = session?.user as SessionUser | undefined;
  const userRole = (sessionUser?.role ?? USER_ROLES.STAFF) as UserRole;

  if (!sessionUser || !isAdmin(userRole)) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-neutral-500">Učitavanje...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <UserForm
        user={user}
        actorRole={userRole}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />
    </div>
  );
}
