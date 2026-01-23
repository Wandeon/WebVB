'use client';

import { Button } from '@repo/ui';
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
        setError(result.error.message || 'Prijava nije uspjela');
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
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
      }}>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          Prijava u administraciju
        </h1>

        {error && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '4px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={(e) => void handleEmailLogin(e)}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.25rem' }}>
              Lozinka
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
              }}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {isLoading ? 'Prijava...' : 'Prijavi se'}
          </Button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1rem 0',
          gap: '0.5rem',
        }}>
          <hr style={{ flex: 1 }} />
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>ili</span>
          <hr style={{ flex: 1 }} />
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleGoogleLogin()}
          disabled={isLoading}
          style={{ width: '100%' }}
        >
          Prijavi se s Google računom
        </Button>
      </div>
    </main>
  );
}
