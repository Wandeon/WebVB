import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-neutral-900">404</h1>
      <p className="mt-4 text-lg text-neutral-600">Stranica nije pronađena</p>
      <p className="mt-2 text-neutral-500">
        Stranica koju tražite ne postoji ili je premještena.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 text-primary-600 hover:underline"
      >
        Povratak na naslovnicu
      </Link>
    </main>
  );
}
