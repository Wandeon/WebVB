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
  type Disable2FAInput,
  enable2FASchema,
  type Enable2FAInput,
  verify2FASchema,
  type Verify2FAInput,
} from '@/lib/validations/settings';

type Step = 'idle' | 'password' | 'scan' | 'verify' | 'complete';

export function TwoFactorSetup() {
  const { data: session, refetch } = useSession();
  const [step, setStep] = useState<Step>('idle');
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const is2FAEnabled = session?.user?.twoFactorEnabled;

  // Password form for enabling 2FA
  const passwordForm = useForm<Enable2FAInput>({
    resolver: zodResolver(enable2FASchema),
    defaultValues: {
      password: '',
    },
  });

  // Verify form for TOTP code
  const verifyForm = useForm<Verify2FAInput>({
    resolver: zodResolver(verify2FASchema),
    defaultValues: {
      code: '',
      password: '',
    },
  });

  // Disable form
  const disableForm = useForm<Disable2FAInput>({
    resolver: zodResolver(disable2FASchema),
    defaultValues: {
      password: '',
    },
  });

  // Generate QR code when totpUri changes
  const generateQRCode = useCallback(async (uri: string) => {
    try {
      const url = await QRCode.toDataURL(uri, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      toast({
        title: 'Greška',
        description: 'Nije moguće generirati QR kod.',
        variant: 'destructive',
      });
    }
  }, []);

  useEffect(() => {
    if (totpUri) {
      void generateQRCode(totpUri);
    }
  }, [totpUri, generateQRCode]);

  // Extract secret from TOTP URI
  const getSecretFromUri = (uri: string): string => {
    const match = uri.match(/secret=([A-Z2-7]+)/i);
    return match?.[1] ?? '';
  };

  // Handle enable 2FA - step 1: password
  const onEnableSubmit = async (data: Enable2FAInput) => {
    setIsLoading(true);

    try {
      const result = await twoFactor.enable({
        password: data.password,
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Došlo je do greške');
      }

      if (result.data?.totpURI) {
        setTotpUri(result.data.totpURI);
        passwordForm.reset();
        setStep('scan');
      } else {
        throw new Error('TOTP URI nije primljen');
      }
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

  // Handle verify TOTP code - step 2
  const onVerifySubmit = async (data: Verify2FAInput) => {
    setIsLoading(true);

    try {
      const verifyResult = await twoFactor.verifyTotp({
        code: data.code,
      });

      if (verifyResult.error) {
        throw new Error(verifyResult.error.message ?? 'Neispravan kod');
      }

      // Generate backup codes
      try {
        const backupResult = await twoFactor.generateBackupCodes({
          password: data.password,
        });

        if (backupResult.error) {
          throw new Error(
            backupResult.error.message ??
              'Greška pri generiranju rezervnih kodova'
          );
        }

        if (backupResult.data?.backupCodes) {
          setBackupCodes(backupResult.data.backupCodes);
        }
      } catch (backupError) {
        toast({
          title: 'Upozorenje',
          description:
            backupError instanceof Error
              ? backupError.message
              : 'Rezervni kodovi nisu generirani. Možete ih kasnije ponovno stvoriti.',
          variant: 'warning',
        });
      }

      setStep('complete');
      verifyForm.reset();
      await refetch();

      toast({
        title: 'Uspjeh',
        description: 'Dvofaktorska autentifikacija je uspješno omogućena.',
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

  // Handle disable 2FA
  const onDisableSubmit = async (data: Disable2FAInput) => {
    setIsDisabling(true);

    try {
      const result = await twoFactor.disable({
        password: data.password,
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Došlo je do greške');
      }

      disableForm.reset();
      await refetch();

      toast({
        title: 'Uspjeh',
        description: 'Dvofaktorska autentifikacija je onemogućena.',
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
      setIsDisabling(false);
    }
  };

  // Reset flow
  const resetFlow = () => {
    setStep('idle');
    setTotpUri(null);
    setQrCodeUrl(null);
    setBackupCodes(null);
    passwordForm.reset();
    verifyForm.reset();
  };

  // Render based on 2FA status
  if (is2FAEnabled) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-success" />
            <CardTitle>Dvofaktorska autentifikacija</CardTitle>
          </div>
          <CardDescription>
            Dodatni sloj sigurnosti za vaš račun
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status box */}
          <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/10 p-4">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-success">2FA je aktivna</p>
              <p className="text-sm text-neutral-600">
                Vaš račun je zaštićen dvofaktorskom autentifikacijom.
              </p>
            </div>
          </div>

          {/* Disable form */}
          <form
            onSubmit={(e) => void disableForm.handleSubmit(onDisableSubmit)(e)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="disablePassword">
                Lozinka za onemogućavanje 2FA
              </Label>
              <Input
                id="disablePassword"
                type="password"
                placeholder="Unesite lozinku"
                autoComplete="current-password"
                error={Boolean(disableForm.formState.errors.password)}
                {...disableForm.register('password')}
              />
              {disableForm.formState.errors.password && (
                <p className="text-sm text-error">
                  {disableForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" variant="danger" disabled={isDisabling}>
              {isDisabling ? 'Onemogućavanje...' : 'Onemogući 2FA'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldOff className="h-5 w-5 text-neutral-400" />
          <CardTitle>Dvofaktorska autentifikacija</CardTitle>
        </div>
        <CardDescription>Dodatni sloj sigurnosti za vaš račun</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Idle state */}
        {step === 'idle' && (
          <>
            <div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
              <p className="text-sm text-warning-foreground">
                Dvofaktorska autentifikacija nije omogućena. Preporučamo da je
                omogućite radi dodatne sigurnosti vašeg računa.
              </p>
            </div>
            <Button onClick={() => setStep('password')}>Omogući 2FA</Button>
          </>
        )}

        {/* Password step */}
        {step === 'password' && (
          <form
            onSubmit={(e) => void passwordForm.handleSubmit(onEnableSubmit)(e)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="enablePassword">Potvrdite lozinku</Label>
              <Input
                id="enablePassword"
                type="password"
                placeholder="Unesite vašu lozinku"
                autoComplete="current-password"
                error={Boolean(passwordForm.formState.errors.password)}
                {...passwordForm.register('password')}
              />
              {passwordForm.formState.errors.password && (
                <p className="text-sm text-error">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Učitavanje...' : 'Nastavi'}
              </Button>
              <Button type="button" variant="outline" onClick={resetFlow}>
                Odustani
              </Button>
            </div>
          </form>
        )}

        {/* Scan QR code step */}
        {step === 'scan' && totpUri && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">1. Skenirajte QR kod</h3>
              <p className="text-sm text-neutral-600">
                Koristite aplikaciju za autentifikaciju (Google Authenticator,
                Authy, itd.) za skeniranje QR koda.
              </p>
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <div className="rounded-lg border-4 border-white bg-white p-2 shadow-md">
                    <img
                      src={qrCodeUrl}
                      alt="QR kod za 2FA"
                      width={200}
                      height={200}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">
                2. Ili unesite tajni ključ ručno
              </h3>
              <div className="rounded-lg bg-neutral-100 p-3">
                <code className="break-all font-mono text-sm">
                  {getSecretFromUri(totpUri)}
                </code>
              </div>
            </div>

            <form
              onSubmit={(e) => void verifyForm.handleSubmit(onVerifySubmit)(e)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="verifyCode">
                  3. Unesite 6-znamenkasti kod iz aplikacije
                </Label>
                <Input
                  id="verifyCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  autoComplete="one-time-code"
                  error={Boolean(verifyForm.formState.errors.code)}
                  {...verifyForm.register('code')}
                />
                {verifyForm.formState.errors.code && (
                  <p className="text-sm text-error">
                    {verifyForm.formState.errors.code.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="verifyPassword">
                  4. Potvrdite lozinku za stvaranje rezervnih kodova
                </Label>
                <Input
                  id="verifyPassword"
                  type="password"
                  placeholder="Unesite lozinku"
                  autoComplete="current-password"
                  error={Boolean(verifyForm.formState.errors.password)}
                  {...verifyForm.register('password')}
                />
                {verifyForm.formState.errors.password && (
                  <p className="text-sm text-error">
                    {verifyForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Provjera...' : 'Potvrdi'}
                </Button>
                <Button type="button" variant="outline" onClick={resetFlow}>
                  Odustani
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Complete step */}
        {step === 'complete' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/10 p-4">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-success">
                  2FA je uspješno omogućena!
                </p>
                <p className="text-sm text-neutral-600">
                  Vaš račun je sada zaštićen dvofaktorskom autentifikacijom.
                </p>
              </div>
            </div>

            {backupCodes && backupCodes.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Rezervni kodovi</h3>
                  <p className="text-sm text-neutral-600">
                    Spremite ove kodove na sigurno mjesto. Možete ih koristiti
                    za pristup računu ako izgubite pristup aplikaciji za
                    autentifikaciju.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-neutral-100 p-4">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="font-mono text-sm">
                      {code}
                    </code>
                  ))}
                </div>
                <p className="text-xs text-warning-foreground">
                  Važno: Ovi kodovi će biti prikazani samo jednom. Spremite ih
                  odmah!
                </p>
              </div>
            )}

            <Button onClick={resetFlow}>Zatvori</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
