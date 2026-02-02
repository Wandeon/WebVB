import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';
import { ContactInfo, FadeIn, WorkingHours } from '@repo/ui';

import { ContactFormWrapper } from './contact-form-wrapper';
import { LeafletMapWrapper } from './leaflet-map-wrapper';

import type { Metadata } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

// Veliki Bukovec coordinates
const LOCATION = {
  latitude: 46.3210,
  longitude: 16.8440,
  address: 'Dravska 7',
  city: 'Veliki Bukovec',
  postalCode: '42231 Mali Bukovec',
  phone: '042 840 040',
  email: 'opcinavk@gmail.com',
};

const WORKING_HOURS = [
  { days: 'Ponedjeljak - Petak', hours: '07:00 - 15:00' },
  { days: 'Subota - Nedjelja', hours: 'Zatvoreno' },
];

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktirajte Općinu Veliki Bukovec. Adresa, telefon, email i radno vrijeme.',
  alternates: {
    canonical: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/kontakt'),
  },
  openGraph: {
    title: 'Kontakt - Općina Veliki Bukovec',
    description: 'Kontaktirajte Općinu Veliki Bukovec. Adresa, telefon, email i radno vrijeme.',
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/kontakt'),
  },
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <FadeIn>
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-12 text-white md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold md:text-4xl">Kontakt</h1>
            <p className="mt-2 text-primary-100">Kontaktirajte nas s vašim pitanjima i prijedlozima</p>
          </div>
        </section>
      </FadeIn>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Contact Info + Map */}
          <FadeIn direction="left">
            <div className="space-y-8">
              <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Općina Veliki Bukovec</h2>
                <ContactInfo
                  address={LOCATION.address}
                  city={LOCATION.city}
                  postalCode={LOCATION.postalCode}
                  phone={LOCATION.phone}
                  email={LOCATION.email}
                />
                <hr className="my-6 border-neutral-200" />
                <WorkingHours items={WORKING_HOURS} />
              </div>

              <div className="overflow-hidden rounded-lg border border-neutral-200 shadow-sm">
                <LeafletMapWrapper
                  latitude={LOCATION.latitude}
                  longitude={LOCATION.longitude}
                  markerLabel="Općina Veliki Bukovec"
                  className="h-[350px]"
                />
              </div>
            </div>
          </FadeIn>

          {/* Right: Contact Form */}
          <FadeIn direction="right">
            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Pošaljite nam poruku</h2>
              <p className="mb-6 text-neutral-600">Ispunite obrazac i odgovorit ćemo vam u najkraćem mogućem roku.</p>
              <ContactFormWrapper />
            </div>
          </FadeIn>
        </div>
      </div>
    </>
  );
}
