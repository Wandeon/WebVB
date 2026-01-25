'use client';

import { Mail } from 'lucide-react';
import { useState } from 'react';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';

export interface NewsletterSignupProps {
  onSubmit?: (email: string) => Promise<void>;
  className?: string;
}

export function NewsletterSignup({ onSubmit, className }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const isSignupAvailable = Boolean(onSubmit);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    if (!onSubmit) {
      setStatus('error');
      setMessage('Prijava na newsletter trenutno nije dostupna.');
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
    <div className={cn('rounded-lg bg-primary-50 p-6 md:p-8', className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
          <Mail className="h-5 w-5 text-primary-600" />
        </div>
        <h3 className="font-display text-lg font-semibold text-neutral-900">
          Pretplatite se na novosti
        </h3>
      </div>
      <p className="mt-2 text-sm text-neutral-600">
        Primajte obavijesti o najnovijim vijestima i događanjima iz Općine Veliki Bukovec.
      </p>
      {status === 'success' ? (
        <p className="mt-4 text-sm font-medium text-green-600" role="status">
          {message}
        </p>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4">
          <fieldset
            className="flex gap-2"
            disabled={!isSignupAvailable || status === 'loading'}
            aria-disabled={!isSignupAvailable || status === 'loading'}
          >
            <Input
              type="email"
              placeholder="Vaša email adresa"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
              aria-label="Email adresa za pretplatu"
            />
            <Button type="submit" variant="primary">
              {status === 'loading' ? 'Šaljem...' : 'Pretplati se'}
            </Button>
          </fieldset>
        </form>
      )}
      {!isSignupAvailable && status !== 'success' && (
        <p className="mt-2 text-sm text-neutral-600" role="status">
          Trenutno ne primamo nove prijave na newsletter.
        </p>
      )}
      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
