# Settings Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a comprehensive settings page with profile management, password change, two-factor authentication (TOTP), and session management.

**Architecture:** Settings page with tabbed sections (Profile, Security, Sessions). Better Auth handles authentication operations via client SDK. Server-side API routes wrap Better Auth methods for custom validation. All forms use react-hook-form with Zod validation and Croatian labels.

**Tech Stack:** Better Auth (twoFactor plugin), react-hook-form, Zod, @repo/ui components, QRCode generation (qrcode library)

---

## Task 1: Enable Better Auth Two-Factor Plugin

**Files:**
- Modify: `apps/admin/lib/auth.ts`
- Modify: `apps/admin/lib/auth-client.ts`

**Step 1: Update server auth configuration**

```typescript
// apps/admin/lib/auth.ts
import { db } from '@repo/database';
import { USER_ROLES } from '@repo/shared';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { twoFactor } from 'better-auth/plugins';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? '',
  secret: process.env.BETTER_AUTH_SECRET ?? '',
  appName: 'Veliki Bukovec Admin',

  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: USER_ROLES.STAFF,
        input: false,
      },
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
    },
  },

  plugins: [
    twoFactor({
      issuer: 'Veliki Bukovec Admin',
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

**Step 2: Update client auth configuration**

```typescript
// apps/admin/lib/auth-client.ts
import { getPublicEnv } from '@repo/shared';
import { createAuthClient } from 'better-auth/react';
import { twoFactorClient } from 'better-auth/client/plugins';

const env = getPublicEnv();

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [
    twoFactorClient(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  updateUser,
  changePassword,
  listSessions,
  revokeSession,
  revokeOtherSessions,
  twoFactor,
} = authClient;
```

**Step 3: Verify type-check passes**

Run: `pnpm type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add apps/admin/lib/auth.ts apps/admin/lib/auth-client.ts
git commit -m "feat(auth): enable two-factor authentication plugin

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Settings Types and Validation Schemas

**Files:**
- Create: `apps/admin/lib/validations/settings.ts`

**Step 1: Create validation schemas**

```typescript
// apps/admin/lib/validations/settings.ts
import { z } from 'zod';

// Profile update schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Ime mora imati najmanje 2 znaka')
    .max(100, 'Ime može imati najviše 100 znakova'),
  image: z.string().url('Neispravan URL slike').nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Password change schema
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Trenutna lozinka je obavezna'),
    newPassword: z
      .string()
      .min(8, 'Nova lozinka mora imati najmanje 8 znakova')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Lozinka mora sadržavati malo slovo, veliko slovo i broj'
      ),
    confirmPassword: z.string().min(1, 'Potvrda lozinke je obavezna'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Lozinke se ne podudaraju',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// 2FA enable schema
export const enable2FASchema = z.object({
  password: z.string().min(1, 'Lozinka je obavezna za omogućavanje 2FA'),
});

export type Enable2FAInput = z.infer<typeof enable2FASchema>;

// 2FA verify schema
export const verify2FASchema = z.object({
  code: z
    .string()
    .length(6, 'Kod mora imati točno 6 znamenki')
    .regex(/^\d+$/, 'Kod smije sadržavati samo brojeve'),
});

export type Verify2FAInput = z.infer<typeof verify2FASchema>;

// 2FA disable schema
export const disable2FASchema = z.object({
  password: z.string().min(1, 'Lozinka je obavezna za onemogućavanje 2FA'),
});

export type Disable2FAInput = z.infer<typeof disable2FASchema>;
```

**Step 2: Verify type-check passes**

Run: `pnpm type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/admin/lib/validations/settings.ts
git commit -m "feat(admin): add settings validation schemas

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create ProfileForm Component

**Files:**
- Create: `apps/admin/components/settings/profile-form.tsx`

**Step 1: Create the ProfileForm component**

```typescript
// apps/admin/components/settings/profile-form.tsx
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

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsLoading(true);
    try {
      const result = await updateUser({
        name: data.name,
        image: data.image ?? undefined,
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Greška pri ažuriranju profila');
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
        description: error instanceof Error ? error.message : 'Greška pri ažuriranju profila',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Ažurirajte svoje osobne podatke</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={session.user.email}
              disabled
              className="bg-neutral-50"
            />
            <p className="text-xs text-neutral-500">
              Email adresa se ne može promijeniti
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Ime i prezime</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Vaše ime"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-error">{errors.name.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !isDirty}>
              {isLoading ? 'Spremanje...' : 'Spremi promjene'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Verify type-check passes**

Run: `pnpm type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/admin/components/settings/profile-form.tsx
git commit -m "feat(admin): add ProfileForm component

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create PasswordForm Component

**Files:**
- Create: `apps/admin/components/settings/password-form.tsx`

**Step 1: Create the PasswordForm component**

```typescript
// apps/admin/components/settings/password-form.tsx
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
        throw new Error(result.error.message ?? 'Greška pri promjeni lozinke');
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
        description: error instanceof Error ? error.message : 'Greška pri promjeni lozinke',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Promjena lozinke</CardTitle>
        <CardDescription>
          Redovito mijenjajte lozinku radi sigurnosti
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Trenutna lozinka</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register('currentPassword')}
              placeholder="Unesite trenutnu lozinku"
              disabled={isLoading}
            />
            {errors.currentPassword && (
              <p className="text-sm text-error">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova lozinka</Label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword')}
              placeholder="Unesite novu lozinku"
              disabled={isLoading}
            />
            {errors.newPassword && (
              <p className="text-sm text-error">{errors.newPassword.message}</p>
            )}
            <p className="text-xs text-neutral-500">
              Najmanje 8 znakova, mora sadržavati malo slovo, veliko slovo i broj
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potvrda nove lozinke</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="Ponovite novu lozinku"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Spremanje...' : 'Promijeni lozinku'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Verify type-check passes**

Run: `pnpm type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/admin/components/settings/password-form.tsx
git commit -m "feat(admin): add PasswordForm component

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create TwoFactorSetup Component

**Files:**
- Create: `apps/admin/components/settings/two-factor-setup.tsx`

**Step 1: Install qrcode package**

Run: `cd /mnt/c/VelikiBukovec_web && pnpm add qrcode @types/qrcode -F @repo/admin`

**Step 2: Create the TwoFactorSetup component**

```typescript
// apps/admin/components/settings/two-factor-setup.tsx
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
import { CheckCircle, Shield, ShieldOff } from 'lucide-react';
import QRCode from 'qrcode';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { twoFactor, useSession } from '@/lib/auth-client';
import {
  disable2FASchema,
  enable2FASchema,
  verify2FASchema,
  type Disable2FAInput,
  type Enable2FAInput,
  type Verify2FAInput,
} from '@/lib/validations/settings';

type SetupStep = 'idle' | 'password' | 'scan' | 'verify' | 'complete';

export function TwoFactorSetup() {
  const { data: session, refetch } = useSession();
  const [step, setStep] = useState<SetupStep>('idle');
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  // Check if 2FA is enabled
  const is2FAEnabled = session?.user?.twoFactorEnabled ?? false;

  // Password form for enabling 2FA
  const passwordForm = useForm<Enable2FAInput>({
    resolver: zodResolver(enable2FASchema),
    defaultValues: { password: '' },
  });

  // Verify form for TOTP code
  const verifyForm = useForm<Verify2FAInput>({
    resolver: zodResolver(verify2FASchema),
    defaultValues: { code: '' },
  });

  // Disable form
  const disableForm = useForm<Disable2FAInput>({
    resolver: zodResolver(disable2FASchema),
    defaultValues: { password: '' },
  });

  // Generate QR code from TOTP URI
  const generateQRCode = useCallback(async (uri: string) => {
    try {
      const url = await QRCode.toDataURL(uri, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrCodeUrl(url);
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće generirati QR kod',
        variant: 'destructive',
      });
    }
  }, []);

  useEffect(() => {
    if (totpUri) {
      void generateQRCode(totpUri);
    }
  }, [totpUri, generateQRCode]);

  // Step 1: Enter password to get TOTP URI
  const handlePasswordSubmit = async (data: Enable2FAInput) => {
    setIsLoading(true);
    try {
      const result = await twoFactor.enable({
        password: data.password,
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Greška pri omogućavanju 2FA');
      }

      if (result.data?.totpURI) {
        setTotpUri(result.data.totpURI);
        setStep('scan');
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description: error instanceof Error ? error.message : 'Neispravna lozinka',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify TOTP code
  const handleVerifySubmit = async (data: Verify2FAInput) => {
    setIsLoading(true);
    try {
      const result = await twoFactor.verifyTotp({
        code: data.code,
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Neispravan kod');
      }

      // Generate backup codes
      const backupResult = await twoFactor.generateBackupCodes({
        password: passwordForm.getValues('password'),
      });

      if (backupResult.data?.backupCodes) {
        setBackupCodes(backupResult.data.backupCodes);
      }

      await refetch();
      setStep('complete');
      toast({
        title: 'Uspjeh',
        description: 'Dvofaktorska autentifikacija je omogućena.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Greška',
        description: error instanceof Error ? error.message : 'Neispravan kod',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable = async (data: Disable2FAInput) => {
    setIsDisabling(true);
    try {
      const result = await twoFactor.disable({
        password: data.password,
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Greška pri onemogućavanju 2FA');
      }

      await refetch();
      disableForm.reset();
      toast({
        title: 'Uspjeh',
        description: 'Dvofaktorska autentifikacija je onemogućena.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Greška',
        description: error instanceof Error ? error.message : 'Neispravna lozinka',
        variant: 'destructive',
      });
    } finally {
      setIsDisabling(false);
    }
  };

  // Reset setup flow
  const resetSetup = () => {
    setStep('idle');
    setTotpUri(null);
    setQrCodeUrl(null);
    setBackupCodes(null);
    passwordForm.reset();
    verifyForm.reset();
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {is2FAEnabled ? (
            <Shield className="h-5 w-5 text-green-600" />
          ) : (
            <ShieldOff className="h-5 w-5 text-neutral-400" />
          )}
          Dvofaktorska autentifikacija (2FA)
        </CardTitle>
        <CardDescription>
          {is2FAEnabled
            ? 'Vaš račun je zaštićen dvofaktorskom autentifikacijom'
            : 'Dodajte dodatni sloj sigurnosti svom računu'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {is2FAEnabled ? (
          // 2FA is enabled - show disable option
          <form onSubmit={disableForm.handleSubmit(handleDisable)} className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">2FA je aktivna</span>
              </div>
              <p className="mt-1 text-sm text-green-700">
                Pri svakoj prijavi trebat ćete unijeti kod iz autentifikacijske aplikacije.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disablePassword">Lozinka za onemogućavanje</Label>
              <Input
                id="disablePassword"
                type="password"
                {...disableForm.register('password')}
                placeholder="Unesite lozinku"
                disabled={isDisabling}
              />
              {disableForm.formState.errors.password && (
                <p className="text-sm text-error">
                  {disableForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="danger" disabled={isDisabling}>
                {isDisabling ? 'Onemogućavanje...' : 'Onemogući 2FA'}
              </Button>
            </div>
          </form>
        ) : step === 'idle' ? (
          // Initial state - show enable button
          <div className="space-y-4">
            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                Dvofaktorska autentifikacija dodaje dodatni sloj sigurnosti zahtijevajući
                jednokratni kod iz aplikacije poput Google Authenticator ili Authy.
              </p>
            </div>
            <Button onClick={() => setStep('password')}>Omogući 2FA</Button>
          </div>
        ) : step === 'password' ? (
          // Step 1: Enter password
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="enablePassword">Potvrdite lozinku</Label>
              <Input
                id="enablePassword"
                type="password"
                {...passwordForm.register('password')}
                placeholder="Unesite trenutnu lozinku"
                disabled={isLoading}
                autoFocus
              />
              {passwordForm.formState.errors.password && (
                <p className="text-sm text-error">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={resetSetup}>
                Odustani
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Učitavanje...' : 'Nastavi'}
              </Button>
            </div>
          </form>
        ) : step === 'scan' ? (
          // Step 2: Scan QR code
          <div className="space-y-4">
            <div className="text-center">
              <p className="mb-4 text-sm text-neutral-600">
                Skenirajte QR kod pomoću autentifikacijske aplikacije
                (Google Authenticator, Authy, itd.)
              </p>
              {qrCodeUrl && (
                <div className="inline-block rounded-lg border p-4 bg-white">
                  <img src={qrCodeUrl} alt="2FA QR kod" className="mx-auto" />
                </div>
              )}
              {totpUri && (
                <div className="mt-4">
                  <p className="text-xs text-neutral-500 mb-1">
                    Ili ručno unesite ključ:
                  </p>
                  <code className="text-xs bg-neutral-100 px-2 py-1 rounded break-all">
                    {totpUri.match(/secret=([^&]+)/)?.[1] ?? ''}
                  </code>
                </div>
              )}
            </div>

            <form onSubmit={verifyForm.handleSubmit(handleVerifySubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verifyCode">Unesite kod iz aplikacije</Label>
                <Input
                  id="verifyCode"
                  {...verifyForm.register('code')}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
                {verifyForm.formState.errors.code && (
                  <p className="text-sm text-error">
                    {verifyForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetSetup}>
                  Odustani
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Provjera...' : 'Potvrdi'}
                </Button>
              </div>
            </form>
          </div>
        ) : step === 'complete' && backupCodes ? (
          // Step 3: Show backup codes
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">2FA je uspješno omogućena!</span>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">Rezervni kodovi</h4>
              <p className="text-sm text-neutral-600 mb-3">
                Spremite ove kodove na sigurno mjesto. Možete ih koristiti za pristup
                računu ako izgubite pristup autentifikacijskoj aplikaciji.
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-neutral-100 px-3 py-2 rounded">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={resetSetup}>Gotovo</Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
```

**Step 3: Verify type-check passes**

Run: `pnpm type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add apps/admin/components/settings/two-factor-setup.tsx apps/admin/package.json pnpm-lock.yaml
git commit -m "feat(admin): add TwoFactorSetup component with QR code

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create SessionsList Component

**Files:**
- Create: `apps/admin/components/settings/sessions-list.tsx`

**Step 1: Create the SessionsList component**

```typescript
// apps/admin/components/settings/sessions-list.tsx
'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
} from '@repo/ui';
import { formatDistanceToNow } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Laptop, Monitor, Smartphone, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  listSessions,
  revokeOtherSessions,
  revokeSession,
  useSession,
} from '@/lib/auth-client';

interface SessionData {
  token: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

function parseUserAgent(ua: string | null | undefined): {
  browser: string;
  device: 'desktop' | 'mobile' | 'tablet';
} {
  if (!ua) return { browser: 'Nepoznat preglednik', device: 'desktop' };

  const browser = ua.includes('Chrome')
    ? 'Chrome'
    : ua.includes('Firefox')
      ? 'Firefox'
      : ua.includes('Safari')
        ? 'Safari'
        : ua.includes('Edge')
          ? 'Edge'
          : 'Nepoznat preglednik';

  const device = ua.includes('Mobile')
    ? 'mobile'
    : ua.includes('Tablet')
      ? 'tablet'
      : 'desktop';

  return { browser, device };
}

function DeviceIcon({ device }: { device: 'desktop' | 'mobile' | 'tablet' }) {
  switch (device) {
    case 'mobile':
      return <Smartphone className="h-5 w-5" />;
    case 'tablet':
      return <Laptop className="h-5 w-5" />;
    default:
      return <Monitor className="h-5 w-5" />;
  }
}

export function SessionsList() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const result = await listSessions();
      if (result.data) {
        setSessions(result.data as SessionData[]);
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description: 'Nije moguće učitati sesije',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async (token: string) => {
    setRevokingToken(token);
    try {
      const result = await revokeSession({ token });
      if (result.error) {
        throw new Error(result.error.message);
      }

      setSessions((prev) => prev.filter((s) => s.token !== token));
      toast({
        title: 'Uspjeh',
        description: 'Sesija je opozvana.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Greška',
        description: error instanceof Error ? error.message : 'Greška pri opozivanju sesije',
        variant: 'destructive',
      });
    } finally {
      setRevokingToken(null);
    }
  };

  const handleRevokeAllOther = async () => {
    setIsRevokingAll(true);
    try {
      const result = await revokeOtherSessions();
      if (result.error) {
        throw new Error(result.error.message);
      }

      await fetchSessions();
      toast({
        title: 'Uspjeh',
        description: 'Sve ostale sesije su opozvane.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Greška',
        description: error instanceof Error ? error.message : 'Greška pri opozivanju sesija',
        variant: 'destructive',
      });
    } finally {
      setIsRevokingAll(false);
    }
  };

  const currentToken = session?.session?.token;
  const otherSessions = sessions.filter((s) => s.token !== currentToken);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivne sesije</CardTitle>
        <CardDescription>
          Pregledajte i upravljajte uređajima na kojima ste prijavljeni
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-neutral-500">Učitavanje...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            Nema aktivnih sesija
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current session */}
            {sessions
              .filter((s) => s.token === currentToken)
              .map((s) => {
                const { browser, device } = parseUserAgent(s.userAgent);
                return (
                  <div
                    key={s.token}
                    className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-green-600">
                        <DeviceIcon device={device} />
                      </div>
                      <div>
                        <div className="font-medium text-green-800">
                          {browser}
                          <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">
                            Trenutna sesija
                          </span>
                        </div>
                        <div className="text-sm text-green-600">
                          {s.ipAddress ?? 'Nepoznata IP adresa'} ·{' '}
                          {formatDistanceToNow(new Date(s.createdAt), {
                            addSuffix: true,
                            locale: hr,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Other sessions */}
            {otherSessions.map((s) => {
              const { browser, device } = parseUserAgent(s.userAgent);
              const isRevoking = revokingToken === s.token;

              return (
                <div
                  key={s.token}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-neutral-400">
                      <DeviceIcon device={device} />
                    </div>
                    <div>
                      <div className="font-medium">{browser}</div>
                      <div className="text-sm text-neutral-500">
                        {s.ipAddress ?? 'Nepoznata IP adresa'} ·{' '}
                        {formatDistanceToNow(new Date(s.createdAt), {
                          addSuffix: true,
                          locale: hr,
                        })}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSession(s.token)}
                    disabled={isRevoking}
                    className="text-error hover:text-error"
                  >
                    {isRevoking ? (
                      'Opozivanje...'
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Opozovi
                      </>
                    )}
                  </Button>
                </div>
              );
            })}

            {/* Revoke all button */}
            {otherSessions.length > 0 && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleRevokeAllOther}
                  disabled={isRevokingAll}
                  className="w-full text-error hover:text-error"
                >
                  {isRevokingAll
                    ? 'Opozivanje svih sesija...'
                    : `Opozovi sve ostale sesije (${otherSessions.length})`}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 2: Install date-fns if not present**

Run: `cd /mnt/c/VelikiBukovec_web && pnpm add date-fns -F @repo/admin`

**Step 3: Verify type-check passes**

Run: `pnpm type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add apps/admin/components/settings/sessions-list.tsx apps/admin/package.json pnpm-lock.yaml
git commit -m "feat(admin): add SessionsList component

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create Settings Components Index

**Files:**
- Create: `apps/admin/components/settings/index.ts`

**Step 1: Create the index file**

```typescript
// apps/admin/components/settings/index.ts
export { PasswordForm } from './password-form';
export { ProfileForm } from './profile-form';
export { SessionsList } from './sessions-list';
export { TwoFactorSetup } from './two-factor-setup';
```

**Step 2: Commit**

```bash
git add apps/admin/components/settings/index.ts
git commit -m "feat(admin): add settings components index

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Update Settings Page

**Files:**
- Modify: `apps/admin/app/(dashboard)/settings/page.tsx`

**Step 1: Update the settings page with all components**

```typescript
// apps/admin/app/(dashboard)/settings/page.tsx
import { Toaster } from '@repo/ui';

import { Breadcrumbs } from '@/components/layout';
import {
  PasswordForm,
  ProfileForm,
  SessionsList,
  TwoFactorSetup,
} from '@/components/settings';

export const metadata = {
  title: 'Postavke | Admin',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Postavke
        </h1>
        <Breadcrumbs items={[{ label: 'Postavke' }]} className="mt-1" />
      </div>

      {/* Profile Section */}
      <section aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="sr-only">
          Profil
        </h2>
        <ProfileForm />
      </section>

      {/* Security Section */}
      <section aria-labelledby="security-heading" className="space-y-6">
        <h2 id="security-heading" className="text-lg font-semibold text-neutral-900">
          Sigurnost
        </h2>
        <PasswordForm />
        <TwoFactorSetup />
      </section>

      {/* Sessions Section */}
      <section aria-labelledby="sessions-heading">
        <h2 id="sessions-heading" className="sr-only">
          Sesije
        </h2>
        <SessionsList />
      </section>

      <Toaster />
    </div>
  );
}
```

**Step 2: Verify type-check passes**

Run: `pnpm type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/admin/app/\(dashboard\)/settings/page.tsx
git commit -m "feat(admin): update settings page with all components

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Add Settings API Route Tests

**Files:**
- Create: `apps/admin/lib/validations/settings.test.ts`

**Step 1: Create validation tests**

```typescript
// apps/admin/lib/validations/settings.test.ts
import { describe, expect, it } from 'vitest';

import {
  changePasswordSchema,
  disable2FASchema,
  enable2FASchema,
  updateProfileSchema,
  verify2FASchema,
} from './settings';

describe('Settings Validation Schemas', () => {
  describe('updateProfileSchema', () => {
    it('accepts valid profile data', () => {
      const result = updateProfileSchema.safeParse({
        name: 'Ivan Horvat',
        image: 'https://example.com/avatar.jpg',
      });
      expect(result.success).toBe(true);
    });

    it('accepts name without image', () => {
      const result = updateProfileSchema.safeParse({
        name: 'Ivan Horvat',
      });
      expect(result.success).toBe(true);
    });

    it('rejects name shorter than 2 characters', () => {
      const result = updateProfileSchema.safeParse({
        name: 'I',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid image URL', () => {
      const result = updateProfileSchema.safeParse({
        name: 'Ivan Horvat',
        image: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('accepts valid password change', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'NewPass123',
        confirmPassword: 'DifferentPass123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('confirmPassword');
      }
    });

    it('rejects weak password without uppercase', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects weak password without number', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'NewPassword',
        confirmPassword: 'NewPassword',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 8 characters', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'New1',
        confirmPassword: 'New1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('enable2FASchema', () => {
    it('accepts valid password', () => {
      const result = enable2FASchema.safeParse({
        password: 'mypassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty password', () => {
      const result = enable2FASchema.safeParse({
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('verify2FASchema', () => {
    it('accepts valid 6-digit code', () => {
      const result = verify2FASchema.safeParse({
        code: '123456',
      });
      expect(result.success).toBe(true);
    });

    it('rejects code with less than 6 digits', () => {
      const result = verify2FASchema.safeParse({
        code: '12345',
      });
      expect(result.success).toBe(false);
    });

    it('rejects code with more than 6 digits', () => {
      const result = verify2FASchema.safeParse({
        code: '1234567',
      });
      expect(result.success).toBe(false);
    });

    it('rejects code with non-numeric characters', () => {
      const result = verify2FASchema.safeParse({
        code: '12345a',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('disable2FASchema', () => {
    it('accepts valid password', () => {
      const result = disable2FASchema.safeParse({
        password: 'mypassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty password', () => {
      const result = disable2FASchema.safeParse({
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
```

**Step 2: Run tests**

Run: `pnpm test`
Expected: All tests pass

**Step 3: Commit**

```bash
git add apps/admin/lib/validations/settings.test.ts
git commit -m "test(admin): add settings validation tests

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Update CHANGELOG and ROADMAP

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`

**Step 1: Update CHANGELOG**

Add under `## Unreleased`:
```markdown
## Sprint 1.10 - Settings Page (Completed)

### Added
- ProfileForm component for updating user name
- PasswordForm component with password strength validation
- TwoFactorSetup component with QR code generation and backup codes
- SessionsList component for viewing and revoking active sessions
- Settings validation schemas with Croatian error messages
- Better Auth twoFactor plugin integration
- Settings page combining all security components
- Validation tests for settings schemas
- Gate: Update profile, change password, enable/disable 2FA, manage sessions
```

**Step 2: Update ROADMAP**

- Change `| 1.10 ⬜ |` to `| 1.10 ✅ |`
- Update `**Progress:** 9/12` to `**Progress:** 10/12`
- Add to Recent updates: `- Sprint 1.10 completed: Settings page with profile, password, 2FA, and sessions management.`

**Step 3: Commit**

```bash
git add CHANGELOG.md ROADMAP.md
git commit -m "docs: update CHANGELOG and ROADMAP for Sprint 1.10

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Final Verification

**Step 1: Run all checks**

```bash
pnpm test
pnpm type-check
pnpm lint
pnpm build
```

Expected: All pass

**Step 2: Manual verification checklist**

- [ ] Settings page loads at /settings
- [ ] Profile form shows current user data
- [ ] Profile name can be updated
- [ ] Password can be changed with validation
- [ ] 2FA can be enabled with QR code
- [ ] 2FA codes can be verified
- [ ] Backup codes are displayed after 2FA setup
- [ ] 2FA can be disabled
- [ ] Sessions list shows all active sessions
- [ ] Current session is highlighted
- [ ] Other sessions can be revoked
- [ ] All sessions except current can be revoked at once

---

## Dependencies

Install these packages:
```bash
pnpm add qrcode @types/qrcode date-fns -F @repo/admin
```

## Files Created/Modified Summary

**Created:**
- `apps/admin/lib/validations/settings.ts`
- `apps/admin/lib/validations/settings.test.ts`
- `apps/admin/components/settings/profile-form.tsx`
- `apps/admin/components/settings/password-form.tsx`
- `apps/admin/components/settings/two-factor-setup.tsx`
- `apps/admin/components/settings/sessions-list.tsx`
- `apps/admin/components/settings/index.ts`

**Modified:**
- `apps/admin/lib/auth.ts` (add twoFactor plugin)
- `apps/admin/lib/auth-client.ts` (add twoFactorClient plugin and exports)
- `apps/admin/app/(dashboard)/settings/page.tsx` (full implementation)
- `CHANGELOG.md`
- `ROADMAP.md`
