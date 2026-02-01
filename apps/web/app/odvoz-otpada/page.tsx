import { Suspense } from 'react';

import { WasteCalendarClient } from './waste-calendar-client';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Odvoz otpada | Općina Veliki Bukovec',
  description:
    'Raspored odvoza otpada na području Općine Veliki Bukovec. Provjerite kada je sljedeći odvoz i kako pravilno razvrstavati otpad.',
  openGraph: {
    title: 'Odvoz otpada | Općina Veliki Bukovec',
    description: 'Raspored odvoza i upute za razvrstavanje otpada.',
  },
};

export default function OdvozOtpadaPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-b from-green-600 to-green-700 py-12 text-white md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            Odvoz otpada
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-green-100">
            Pregledajte raspored odvoza otpada i saznajte kako pravilno razvrstavati otpad
          </p>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
            </div>
          }
        >
          <WasteCalendarClient />
        </Suspense>
      </section>

      {/* Sorting Guide */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-neutral-900 md:text-3xl">
            Kako razvrstavati otpad
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <WasteTypeCard
              color="blue"
              title="Papir i karton"
              items={['Novine', 'Kutije', 'Časopisi']}
              container="Plava posuda"
            />
            <WasteTypeCard
              color="yellow"
              title="Plastika"
              items={['Boce', 'Folije', 'Ambalaža']}
              container="Žuta posuda"
            />
            <WasteTypeCard
              color="green"
              title="Staklo"
              items={['Boce', 'Staklenke', 'Bez poklopaca']}
              container="Zelena posuda"
            />
            <WasteTypeCard
              color="amber"
              title="Bio otpad"
              items={['Ostaci hrane', 'Vrtni otpad', 'Lišće']}
              container="Smeđa posuda"
            />
            <WasteTypeCard
              color="gray"
              title="Miješani otpad"
              items={['Nereciklabilno', 'Ostalo']}
              container="Crna/siva posuda"
            />
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-neutral-900 md:text-3xl">
          Dokumenti i upute
        </h2>

        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
          <a
            href="https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/Letak-za-razvrstavanje-otpada-u-kučanstvu.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-neutral-900 group-hover:text-green-700">
                Razvrstavanje u kućanstvu
              </div>
              <div className="text-sm text-neutral-500">Letak s uputama (PDF)</div>
            </div>
          </a>

          <a
            href="https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/LETAK-RAZVRSTAVANJE-OTPADA....pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-neutral-900 group-hover:text-green-700">
                Zeleni otoci
              </div>
              <div className="text-sm text-neutral-500">Upute za korištenje (PDF)</div>
            </div>
          </a>

          <a
            href="https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/Plan-gospodarenja-otpadom-u-opcini-veliki-bukovec-za-razdoblje-2017-2023.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-neutral-900 group-hover:text-green-700">
                Plan gospodarenja otpadom
              </div>
              <div className="text-sm text-neutral-500">2017-2023 (PDF)</div>
            </div>
          </a>

          <a
            href="https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/Odluka-o-dodjeli-obavljanja-javne-usluge-prikupljanja-miješanog-komunalnog-otpada-na-području-Općine-Veliki-Bukovec.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-neutral-900 group-hover:text-green-700">
                Odluka o javnoj usluzi
              </div>
              <div className="text-sm text-neutral-500">Prikupljanje otpada (PDF)</div>
            </div>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-xl font-bold text-neutral-900 md:text-2xl">
            Imate pitanja o odvozu otpada?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-neutral-600">
            Kontaktirajte nas za informacije o rasporedu, razvrstavanju ili prijavite problem s
            odvozom.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href="/kontakt"
              className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
            >
              Kontaktirajte nas
            </a>
            <a
              href="/prijava-problema"
              className="rounded-lg border-2 border-green-600 px-6 py-3 font-medium text-green-700 transition-colors hover:bg-green-100"
            >
              Prijavi problem
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function WasteTypeCard({
  color,
  title,
  items,
  container,
}: {
  color: 'blue' | 'yellow' | 'green' | 'amber' | 'gray';
  title: string;
  items: string[];
  container: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 border-blue-300 text-blue-800',
    yellow: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    green: 'bg-green-100 border-green-300 text-green-800',
    amber: 'bg-amber-100 border-amber-300 text-amber-800',
    gray: 'bg-neutral-100 border-neutral-300 text-neutral-800',
  };

  const dotColors = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    gray: 'bg-neutral-500',
  };

  return (
    <div className={`rounded-xl border-2 p-5 ${colorClasses[color]}`}>
      <div className="mb-3 flex items-center gap-2">
        <div className={`h-4 w-4 rounded-full ${dotColors[color]}`} />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <ul className="mb-3 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <div className="text-xs font-medium opacity-80">{container}</div>
    </div>
  );
}
