'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  toast,
} from '@repo/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { updateUser, useSession } from '@/lib/auth-client';
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/lib/validations/settings';

export function ProfileForm() {
  const { data: session, refetch } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? '',
      image: session?.user?.image ?? null,
    },
  });

  if (!session?.user) {
    return null;
  }

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsLoading(true);

    try {
      const result = await updateUser({
        name: data.name,
        image: data.image,
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Došlo je do greške');
      }

      await refetch();

      toast({
        title: 'Uspjeh',
        description: 'Profil je uspješno ažuriran.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Greška',
        description:
          error instanceof Error ? error.message : 'Došlo je do greške',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Ažurirajte svoje osobne podatke</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={session.user.email}
              disabled
            />
            <p className="text-xs text-neutral-500">
              Email adresa se ne može promijeniti
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Ime</Label>
            <Input
              id="name"
              placeholder="Unesite svoje ime"
              error={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-error">{errors.name.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" disabled={!isDirty || isLoading}>
              {isLoading ? 'Spremanje...' : 'Spremi promjene'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
