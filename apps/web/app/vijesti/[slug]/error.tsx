'use client';

import { Button } from '@repo/ui';
import Link from 'next/link';

interface NewsDetailErrorProps {
  error: Error;
  reset: () => void;
}

export default function NewsDetailError({ error, reset }: NewsDetailErrorProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Ne možemo prikazati ovu vijest
        </h1>
        <p className="mt-3 text-sm text-neutral-600">{error.message}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => reset()}>Pokušaj ponovno</Button>
          <Button asChild variant="outline">
            <Link href="/vijesti">Povratak na vijesti</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
