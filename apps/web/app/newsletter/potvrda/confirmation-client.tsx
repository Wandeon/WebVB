// apps/web/app/newsletter/potvrda/confirmation-client.tsx
'use client';

import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ConfirmResponse {
  success: boolean;
  data?: {
    message: string;
    alreadyConfirmed?: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

export function ConfirmationClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Derive initial state from token parameter to avoid setState in effect
  const initialStatus = token ? 'loading' : 'error';
  const initialMessage = token ? '' : 'Nevažeći link za potvrdu.';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(initialStatus);
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (!token) {
      return;
    }

    const confirmSubscription = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/public/newsletter/confirm?token=${encodeURIComponent(token)}`
        );
        const data = (await response.json()) as ConfirmResponse;

        if (data.success && data.data) {
          setStatus('success');
          setMessage(data.data.message);
        } else if (data.error) {
          setStatus('error');
          setMessage(data.error.message);
        }
      } catch {
        setStatus('error');
        setMessage('Došlo je do greške. Pokušajte ponovno.');
      }
    };

    void confirmSubscription();
  }, [token]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary-600" />
            <h1 className="mt-6 font-display text-2xl font-bold text-neutral-900">
              Potvrđujem pretplatu...
            </h1>
            <p className="mt-2 text-neutral-600">
              Molimo pričekajte.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mt-6 font-display text-2xl font-bold text-neutral-900">
              Pretplata potvrđena!
            </h1>
            <p className="mt-2 text-neutral-600">
              {message}
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
            >
              Povratak na naslovnicu
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="mt-6 font-display text-2xl font-bold text-neutral-900">
              Greška pri potvrdi
            </h1>
            <p className="mt-2 text-neutral-600">
              {message}
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
            >
              Povratak na naslovnicu
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
