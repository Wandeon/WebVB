import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StaticPageNotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Stranica nije pronađena
        </h1>
        <p className="mt-3 text-neutral-600">
          Stranica koju tražite ne postoji ili je uklonjena.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Povratak na početnu stranicu
        </Link>
      </div>
    </div>
  );
}
