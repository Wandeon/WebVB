import { getPublicEnv } from '@repo/shared';
import { ContactForm, ContactInfo, FadeIn, WorkingHours } from '@repo/ui';
import dynamic from 'next/dynamic';

import type { ContactFormData } from '@repo/shared';
import type { Metadata } from 'next';

// Dynamic import for Leaflet (no SSR)
const LeafletMap = dynamic(
  () => import('@repo/ui').then((mod) => mod.LeafletMap),
  { ssr: false, loading: () => <div className="h-[350px] animate-pulse rounded-lg bg-neutral-200" /> }
);

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

// Veliki Bukovec coordinates (approximate - verify actual location)
const LOCATION = {
  latitude: 46.3456,
  longitude: 16.5789,
  address: 'Trg svetog Franje 425',
  city: 'Veliki Bukovec',
  postalCode: '42231',
  phone: '042 719 001',
  email: 'opcina@velikibukovec.hr',
};

const WORKING_HOURS = [
  { days: 'Ponedjeljak - Petak', hours: '07:00 - 15:00' },
  { days: 'Subota - Nedjelja', hours: 'Zatvoreno' },
];

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktirajte Općinu Veliki Bukovec. Adresa, telefon, email i radno vrijeme.',
  openGraph: {
    title: 'Kontakt - Općina Veliki Bukovec',
    description: 'Kontaktirajte Općinu Veliki Bukovec. Adresa, telefon, email i radno vrijeme.',
    url: `${NEXT_PUBLIC_SITE_URL}/kontakt`,
  },
};

type ContactApiResponse = {
  success: boolean;
  data?: { message?: string };
  error?: { message?: string };
};

async function submitContactForm(data: ContactFormData): Promise<{ success: boolean; message?: string; error?: string }> {
  'use server';
  const response = await fetch(`${NEXT_PUBLIC_SITE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const payload = (await response.json()) as ContactApiResponse;
  const result: { success: boolean; message?: string; error?: string } = {
    success: payload.success,
  };
  if (payload.data?.message) result.message = payload.data.message;
  if (payload.error?.message) result.error = payload.error.message;
  return result;
}

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
                <LeafletMap
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
              <ContactForm onSubmit={submitContactForm} />
            </div>
          </FadeIn>
        </div>
      </div>
    </>
  );
}
