import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';
import { FadeIn } from '@repo/ui';

import { ProblemReportFormWrapper } from './problem-report-form-wrapper';

import type { Metadata } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

export const metadata: Metadata = {
  title: 'Prijava problema',
  description: 'Prijavite komunalni problem u Općini Veliki Bukovec - oštećenja cesta, javne rasvjete, odlaganja otpada.',
  alternates: {
    canonical: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/prijava-problema'),
  },
  openGraph: {
    title: 'Prijava problema - Općina Veliki Bukovec',
    description: 'Prijavite komunalni problem u Općini Veliki Bukovec.',
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/prijava-problema'),
  },
};

export default function ProblemReportPage() {
  return (
    <>
      {/* Hero */}
      <FadeIn>
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-12 text-white md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold md:text-4xl">Prijava problema</h1>
            <p className="mt-2 text-primary-100">Prijavite komunalni problem u našoj općini</p>
          </div>
        </section>
      </FadeIn>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          <FadeIn>
            <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h2 className="font-semibold text-amber-800">Što možete prijaviti?</h2>
              <ul className="mt-2 list-inside list-disc text-sm text-amber-700">
                <li>Oštećenja cesta i nogostupa</li>
                <li>Kvarove javne rasvjete</li>
                <li>Ilegalno odlaganje otpada</li>
                <li>Probleme s komunalnom infrastrukturom</li>
                <li>Ostale komunalne probleme</li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <ProblemReportFormWrapper />
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-6 text-center text-sm text-neutral-500">
              Za hitne slučajeve nazovite{' '}
              <a href="tel:042719001" className="font-medium text-primary-600 hover:underline">
                042 719 001
              </a>
            </p>
          </FadeIn>
        </div>
      </div>
    </>
  );
}
