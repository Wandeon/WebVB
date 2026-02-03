// apps/web/app/newsletter/odjava/unsubscribe-client.tsx
'use client';

import { getPublicEnv } from '@repo/shared';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const { NEXT_PUBLIC_API_URL } = getPublicEnv();
const API_URL = NEXT_PUBLIC_API_URL;

interface UnsubscribeResponse {
  success: boolean;
  data?: {
    message: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export function UnsubscribeClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // Derive initial state from id parameter to avoid setState in effect
  const initialStatus = id ? 'loading' : 'error';
  const initialMessage = id ? '' : 'Nevažeći link za odjavu.';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(initialStatus);
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (!id) {
      return;
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/public/newsletter/unsubscribe?id=${encodeURIComponent(id)}`
        );
        const data = (await response.json()) as UnsubscribeResponse;

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

    void unsubscribe();
  }, [id]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary-600" />
            <h1 className="mt-6 font-display text-2xl font-bold text-neutral-900">
              Odjavljujem...
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
              Odjava uspješna
            </h1>
            <p className="mt-2 text-neutral-600">
              {message}
            </p>
            <p className="mt-4 text-sm text-neutral-500">
              Žao nam je što odlazite. Uvijek se možete ponovo pretplatiti.
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
              Greška pri odjavi
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
