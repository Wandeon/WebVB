import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';
import { FadeIn } from '@repo/ui';
import { Building2, Clock, Mail, MapPin, Phone, Shield, User, Users } from 'lucide-react';
import Link from 'next/link';

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
};

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktirajte Općinu Veliki Bukovec. Adresa, telefon, email i radno vrijeme svih službi.',
  alternates: {
    canonical: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/kontakt'),
  },
  openGraph: {
    title: 'Kontakt - Općina Veliki Bukovec',
    description: 'Kontaktirajte Općinu Veliki Bukovec. Adresa, telefon, email i radno vrijeme svih službi.',
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/kontakt'),
  },
};

// Contact data
const CONTACTS = {
  opcina: {
    title: 'Općina Veliki Bukovec',
    subtitle: 'Jedinstveni upravni odjel',
    address: 'Dravska 7, Veliki Bukovec, 42231 Mali Bukovec',
    phone: '042 840 040',
    email: 'opcinavk@gmail.com',
    hours: 'Pon - Pet: 07:00 - 15:00',
  },
  nacelnik: {
    name: 'Ivan Modrić',
    title: 'Općinski načelnik',
    phone: '091 4840 040',
    email: 'nacelnik@velikibukovec.hr',
  },
  redar: {
    name: 'Mirjana Zmaić',
    title: 'Komunalni i poljoprivredni redar',
    phone: '042 420 216',
    email: 'zmaic@ludbreg.hr',
  },
  gdpr: {
    name: 'Stjepan Kovaček',
    title: 'Službenik za zaštitu osobnih podataka',
    phone: '091 112 0008',
    email: 'direktor@i-kso.com',
  },
  nepravilnosti: {
    name: 'Jasenka Zdelar, dipl.iur.',
    title: 'Osoba za nepravilnosti',
  },
};

function ContactCard({
  icon: Icon,
  title,
  name,
  subtitle,
  phone,
  email,
  address,
  hours,
  highlight,
}: {
  icon: typeof Building2;
  title: string;
  name?: string;
  subtitle?: string;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? 'border-primary-200 bg-primary-50'
          : 'border-neutral-200 bg-white'
      }`}
    >
      <div className="mb-3 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            highlight ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900">{title}</h3>
          {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
        </div>
      </div>

      {name && (
        <p className="mb-3 text-lg font-medium text-neutral-800">{name}</p>
      )}

      <div className="space-y-2 text-sm">
        {address && (
          <div className="flex items-start gap-2 text-neutral-600">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
            <span>{address}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="text-primary-600 hover:underline"
            >
              {phone}
            </a>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            <a
              href={`mailto:${email}`}
              className="text-primary-600 hover:underline"
            >
              {email}
            </a>
          </div>
        )}
        {hours && (
          <div className="flex items-center gap-2 text-neutral-600">
            <Clock className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            <span>{hours}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <FadeIn>
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-12 text-white md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold md:text-4xl">Kontakt</h1>
            <p className="mt-2 text-primary-100">
              Svi kontakti Općine Veliki Bukovec na jednom mjestu
            </p>
          </div>
        </section>
      </FadeIn>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Main Office Card */}
        <FadeIn>
          <div className="mb-8 rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm md:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      {CONTACTS.opcina.title}
                    </h2>
                    <p className="text-sm text-neutral-500">
                      {CONTACTS.opcina.subtitle}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-500" />
                    <span className="text-neutral-700">{CONTACTS.opcina.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 flex-shrink-0 text-primary-500" />
                    <a
                      href={`tel:${CONTACTS.opcina.phone.replace(/\s/g, '')}`}
                      className="text-lg font-semibold text-primary-600 hover:underline"
                    >
                      {CONTACTS.opcina.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 flex-shrink-0 text-primary-500" />
                    <a
                      href={`mailto:${CONTACTS.opcina.email}`}
                      className="text-primary-600 hover:underline"
                    >
                      {CONTACTS.opcina.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 flex-shrink-0 text-primary-500" />
                    <span className="text-neutral-700">{CONTACTS.opcina.hours}</span>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
                <LeafletMapWrapper
                  latitude={LOCATION.latitude}
                  longitude={LOCATION.longitude}
                  markerLabel="Općina Veliki Bukovec"
                  className="h-[200px] md:h-full"
                />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Officials Grid */}
        <FadeIn delay={0.1}>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Službenici i kontakti
          </h2>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ContactCard
              icon={User}
              title={CONTACTS.nacelnik.title}
              name={CONTACTS.nacelnik.name}
              phone={CONTACTS.nacelnik.phone}
              email={CONTACTS.nacelnik.email}
              highlight
            />
            <ContactCard
              icon={Users}
              title={CONTACTS.redar.title}
              name={CONTACTS.redar.name}
              phone={CONTACTS.redar.phone}
              email={CONTACTS.redar.email}
            />
            <ContactCard
              icon={Shield}
              title={CONTACTS.gdpr.title}
              name={CONTACTS.gdpr.name}
              phone={CONTACTS.gdpr.phone}
              email={CONTACTS.gdpr.email}
            />
            <ContactCard
              icon={Shield}
              title={CONTACTS.nepravilnosti.title}
              name={CONTACTS.nepravilnosti.name}
            />
          </div>
        </FadeIn>

        {/* Useful Contacts Link */}
        <FadeIn delay={0.15}>
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="mb-2 font-semibold text-amber-900">
              Tražite druge kontakte?
            </h3>
            <p className="mb-3 text-sm text-amber-700">
              Za hitne slučajeve, komunalne službe, školu, vrtić, vatrogasce i
              druge lokalne službe posjetite stranicu s korisnim kontaktima.
            </p>
            <Link
              href="/korisni-kontakti"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
            >
              <Phone className="h-4 w-4" />
              Korisni kontakti
            </Link>
          </div>
        </FadeIn>

        {/* Contact Form */}
        <FadeIn delay={0.2}>
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Pošaljite nam poruku</h2>
            <p className="mb-6 text-neutral-600">
              Ispunite obrazac i odgovorit ćemo vam u najkraćem mogućem roku.
            </p>
            <ContactFormWrapper />
          </div>
        </FadeIn>
      </div>
    </>
  );
}
