'use client';

import { useState } from 'react';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';

export interface NewsletterSectionProps {
  onSubmit?: (email: string) => Promise<void>;
  className?: string;
}

export function NewsletterSection({ onSubmit, className }: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    if (!onSubmit) {
      setStatus('success');
      setMessage('Hvala na prijavi! Uskoro ćemo vas kontaktirati.');
      setEmail('');
      return;
    }

    setStatus('loading');
    try {
      await onSubmit(email);
      setStatus('success');
      setMessage('Hvala na prijavi! Provjerite svoj email za potvrdu.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Došlo je do greške. Molimo pokušajte ponovno.');
    }
  }

  return (
    <section className={cn('bg-primary-700 py-16', className)}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-2xl font-semibold text-white">
            Ostanite informirani
          </h2>
          <p className="mt-2 text-primary-100">
            Primajte tjedni pregled najvažnijih vijesti, događanja i dokumenata izravno na email.
          </p>

          {status === 'success' ? (
            <p className="mt-6 font-medium text-white" role="status">
              {message}
            </p>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="mt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email adresa
                </label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="Vaša email adresa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === 'loading'}
                  className="flex-1 bg-white"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={status === 'loading'}
                  className="bg-white text-primary-700 hover:bg-primary-50"
                >
                  {status === 'loading' ? 'Šaljem...' : 'Prijava'}
                </Button>
              </div>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-3 text-sm text-red-200" role="alert">
              {message}
            </p>
          )}

          <p className="mt-4 text-sm text-primary-200">
            Bez spama. Odjava u svakom trenutku.
          </p>
        </div>
      </div>
    </section>
  );
}
