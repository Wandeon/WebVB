'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { USER_ROLE_OPTIONS, type UserRole } from '@repo/shared';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { useForm } from 'react-hook-form';


import { getAssignableRoles } from '@/lib/permissions';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/lib/validations/user';

interface BaseUserFormProps {
  actorRole: UserRole;
  isLoading?: boolean;
}

interface CreateUserFormProps extends BaseUserFormProps {
  user?: undefined;
  onSubmit: (data: CreateUserInput) => Promise<void>;
}

interface EditUserFormProps extends BaseUserFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
  };
  onSubmit: (data: UpdateUserInput) => Promise<void>;
}

type UserFormProps = CreateUserFormProps | EditUserFormProps;

export function UserForm({
  user,
  actorRole,
  onSubmit,
  isLoading = false,
}: UserFormProps) {
  const isEditing = Boolean(user);
  const assignableRoles = getAssignableRoles(actorRole);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          role: user.role,
        }
      : {
          name: '',
          email: '',
          password: '',
          role: 'staff' as const,
        },
  });

  const selectedRole = watch('role');

  const roleOptions = USER_ROLE_OPTIONS.filter((option) =>
    assignableRoles.includes(option.value)
  );

  const handleFormSubmit = async (data: CreateUserInput | UpdateUserInput) => {
    // Type assertion is safe here because the form validation ensures correct shape
    await onSubmit(data as CreateUserInput & UpdateUserInput);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Uredi korisnika' : 'Novi korisnik'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Ažurirajte podatke korisnika'
            : 'Unesite podatke za novog korisnika'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Ime i prezime</Label>
            <Input
              id="name"
              placeholder="Ivan Horvat"
              error={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-error">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email adresa</Label>
            <Input
              id="email"
              type="email"
              placeholder="ivan@example.com"
              error={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-error">{errors.email.message}</p>
            )}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>
              <Input
                id="password"
                type="password"
                placeholder="Najmanje 12 znakova"
                error={Boolean((errors as { password?: { message?: string } }).password)}
                {...register('password')}
              />
              {(errors as { password?: { message?: string } }).password && (
                <p className="text-sm text-error">
                  {(errors as { password?: { message?: string } }).password?.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Uloga</Label>
            <Select
              value={selectedRole ?? ''}
              onValueChange={(value) =>
                setValue('role', value as UserRole, { shouldValidate: true })
              }
            >
              <SelectTrigger id="role" className={errors.role ? 'border-error' : ''}>
                <SelectValue placeholder="Odaberite ulogu" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-error">{errors.role.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Spremanje...'
                : isEditing
                  ? 'Spremi promjene'
                  : 'Stvori korisnika'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
