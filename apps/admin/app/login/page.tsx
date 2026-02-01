'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { signIn } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError('Neispravni podaci za prijavu.');
      } else {
        router.push('/');
      }
    } catch {
      setError('Došlo je do greške. Pokušajte ponovo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      await signIn.social({
        provider: 'google',
        callbackURL: '/',
      });
    } catch {
      setError('Google prijava nije uspjela');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Prijava u administraciju</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-error">
              {error}
            </div>
          )}

          <form onSubmit={(e) => void handleEmailLogin(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ime@primjer.hr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Prijava...' : 'Prijavi se'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-neutral-500">ili</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => void handleGoogleLogin()}
            disabled={isLoading}
          >
            Prijavi se s Google računom
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
