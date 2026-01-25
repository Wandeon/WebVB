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

import { changePassword } from '@/lib/auth-client';
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from '@/lib/validations/settings';

export function PasswordForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true);

    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: false,
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Došlo je do greške');
      }

      reset();

      toast({
        title: 'Uspjeh',
        description: 'Lozinka je uspješno promijenjena.',
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
          <CardTitle>Promjena lozinke</CardTitle>
          <CardDescription>
            Redovito mijenjajte lozinku radi sigurnosti
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Trenutna lozinka</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Unesite trenutnu lozinku"
              autoComplete="current-password"
              error={Boolean(errors.currentPassword)}
              {...register('currentPassword')}
            />
            {errors.currentPassword && (
              <p className="text-sm text-error">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova lozinka</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Unesite novu lozinku"
              autoComplete="new-password"
              aria-describedby="new-password-help"
              error={Boolean(errors.newPassword)}
              {...register('newPassword')}
            />
            {errors.newPassword ? (
              <p className="text-sm text-error">{errors.newPassword.message}</p>
            ) : (
              <p id="new-password-help" className="text-xs text-neutral-500">
                Najmanje 8 znakova, mora sadržavati malo slovo, veliko slovo i
                broj
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potvrda lozinke</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Ponovite novu lozinku"
              autoComplete="new-password"
              error={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Spremanje...' : 'Promijeni lozinku'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
