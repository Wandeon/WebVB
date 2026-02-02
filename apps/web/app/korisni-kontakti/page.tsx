import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';
import { FadeIn } from '@repo/ui';
import {
  AlertTriangle,
  Building2,
  Church,
  Droplets,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  Truck,
} from 'lucide-react';
import Link from 'next/link';

import type { Metadata } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

export const metadata: Metadata = {
  title: 'Korisni kontakti',
  description: 'Hitne službe, škole, vrtići, zdravstvo, komunalne službe i ostali korisni kontakti za stanovnike Općine Veliki Bukovec.',
  alternates: {
    canonical: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/korisni-kontakti'),
  },
  openGraph: {
    title: 'Korisni kontakti - Općina Veliki Bukovec',
    description: 'Hitne službe, škole, vrtići, zdravstvo, komunalne službe i ostali korisni kontakti za stanovnike Općine Veliki Bukovec.',
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/korisni-kontakti'),
  },
};

// Emergency numbers - always visible at top
const EMERGENCY_NUMBERS = [
  { number: '112', label: 'Opći hitni broj', color: 'bg-red-600' },
  { number: '192', label: 'Policija', color: 'bg-blue-600' },
  { number: '193', label: 'Vatrogasci', color: 'bg-orange-600' },
  { number: '194', label: 'Hitna pomoć', color: 'bg-green-600' },
];

interface ContactItem {
  name: string;
  role?: string;
  address?: string;
  phone?: string | string[];
  email?: string;
  hours?: string;
  note?: string;
  website?: string;
}

interface ContactCategory {
  title: string;
  icon: typeof Building2;
  iconColor: string;
  bgColor: string;
  items: ContactItem[];
}

const CONTACT_CATEGORIES: ContactCategory[] = [
  {
    title: 'Sigurnost i hitne službe',
    icon: ShieldCheck,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    items: [
      {
        name: 'Policijska postaja Ludbreg',
        address: 'Koprivnička 15, 42230 Ludbreg',
        phone: ['042 373 239', '042 373 290'],
        hours: '0-24 sata',
        note: 'Nadležna za Općinu Veliki Bukovec',
      },
      {
        name: 'DVD Dubovica',
        role: 'Dobrovoljno vatrogasno društvo',
        address: 'Dubovica 46, 42231 Mali Bukovec',
        note: 'Osnovano 1928. godine',
      },
      {
        name: 'DVD Kapela Podravska',
        role: 'Dobrovoljno vatrogasno društvo',
        address: 'Kapela Podravska 114a, 42231 Mali Bukovec',
      },
    ],
  },
  {
    title: 'Zdravstvo',
    icon: Stethoscope,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
    items: [
      {
        name: 'Dom zdravlja Ludbreg',
        address: 'Vinogradska 1, 42230 Ludbreg',
        phone: '042 819 622',
        hours: 'Prema rasporedu liječnika',
      },
      {
        name: 'Ljekarna Ludbreg',
        role: 'Ljekarna Varaždinske županije',
        address: 'Gundulićeva 1, 42230 Ludbreg',
        phone: '042 810 750',
        email: 'ludbreg@ljekarna-vzz.hr',
        hours: 'Pon-Pet: 07-20, Sub: 07-14',
      },
      {
        name: 'Ljekarna Herenčić',
        role: 'Privatna ljekarna',
        address: 'Vinogradska 1, 42230 Ludbreg',
        phone: '042 819 520',
        hours: 'Pon-Pet: 07-20, Sub: 07:30-15',
      },
      {
        name: 'Dežurna ljekarna Varaždin',
        address: 'Zagrebačka 13, 42000 Varaždin',
        phone: '042 212 399',
        hours: 'Noćna i praznična dežurstva',
      },
      {
        name: 'Veterinarska stanica Ludbreg',
        address: 'Ljudevita Gaja 47, 42230 Ludbreg',
        phone: '042 810 566',
        email: 'vs.ludbreg@vz.htnet.hr',
        hours: 'Pon-Pet: 08-20, Sub: 08-13',
      },
      {
        name: 'Veterinarska ambulanta Veliki Bukovec',
        address: 'Dravska 13, Veliki Bukovec',
        phone: '042 840 122',
        email: 'vs.ludbreg@vz.htnet.hr',
      },
    ],
  },
  {
    title: 'Obrazovanje',
    icon: GraduationCap,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    items: [
      {
        name: 'OŠ Veliki Bukovec',
        role: 'Osnovna škola',
        address: 'Dravska 42, Veliki Bukovec, 42231 Mali Bukovec',
        phone: '042 840 224',
        email: 'ured@os-bukovec.hr',
        website: 'os-bukovec.hr',
      },
      {
        name: 'Dječji vrtić "Krijesnica"',
        role: 'Predškolska ustanova',
        address: 'Vladimira Nazora 3a, 42231 Mali Bukovec',
        phone: '042 843 277',
      },
    ],
  },
  {
    title: 'Župni ured',
    icon: Church,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    items: [
      {
        name: 'Župa sv. Franje Asiškog',
        role: 'Župnik: vlč. Josip Vidović',
        address: 'Dravska 44, Veliki Bukovec, 42231 Mali Bukovec',
        phone: '042 840 310',
        website: 'zupa-sv-franje-asiskog.hr',
        note: 'Varaždinska biskupija, Ludbreški dekanat',
      },
    ],
  },
  {
    title: 'Komunalne usluge',
    icon: Truck,
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-50',
    items: [
      {
        name: 'LUKOM d.o.o.',
        role: 'Odvoz otpada',
        address: 'Koprivnička 17, 42230 Ludbreg',
        phone: '042 819 106',
        email: 'lukom@lukom.hr',
        website: 'lukom.hr',
        note: 'Komunalno poduzeće za Općinu Veliki Bukovec',
      },
      {
        name: 'LUKOM - Dimnjačarska služba',
        role: 'Čišćenje dimnjaka',
        phone: ['042 811 422', '099 422 3017'],
        hours: 'Pon-Pet: 07-15',
        note: 'Kontakt: Tomislav Bunić',
      },
      {
        name: 'LUKOM - Javna rasvjeta',
        role: 'Prijava kvarova rasvjete',
        phone: '042 811 422',
        note: 'Dojava kvarova radnim danom',
      },
    ],
  },
  {
    title: 'Voda i struja',
    icon: Droplets,
    iconColor: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    items: [
      {
        name: 'VARKOM - Vodovod',
        role: 'Prijava kvarova na vodovodu',
        address: 'J. Jurkovića 68, 42000 Varaždin',
        phone: '042 262 262',
        email: 'dispecer@varkom.com',
        hours: '0-24 sata',
        website: 'varkom.hr',
      },
      {
        name: 'VARKOM - Kanalizacija',
        role: 'Prijava kvarova na odvodnji',
        phone: '042 350 660',
        hours: '0-24 sata',
      },
      {
        name: 'HEP - Prijava kvarova',
        role: 'Distribucija električne energije',
        phone: '0800 300 401',
        hours: '0-24 sata (besplatni poziv)',
        website: 'hep.hr',
      },
      {
        name: 'HEP - Informacije',
        role: 'Opskrba i podrška kupcima',
        phone: '0800 5255',
        hours: 'Pon-Pet: 08-20, Sub: 08-15',
      },
    ],
  },
  {
    title: 'Pošta',
    icon: Mail,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    items: [
      {
        name: 'Poštanski ured Mali Bukovec',
        address: 'Vladimira Nazora 3, 42231 Mali Bukovec',
        phone: '072 303 304',
        hours: 'Pon: 08-17, Uto-Pet: 08-14:30',
        note: 'HP kontakt centar',
        website: 'posta.hr',
      },
    ],
  },
  {
    title: 'Pogrebne usluge',
    icon: Heart,
    iconColor: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
    items: [
      {
        name: 'Međimurka BS - Ludbreg',
        role: 'Pogrebna služba',
        address: 'Petra Zrinskog 39, 42230 Ludbreg',
        phone: '042 811 113',
        hours: '0-24 sata',
      },
      {
        name: 'Međimurka BS - Varaždin',
        role: 'Pogrebna služba',
        address: 'Kukuljevićeva 41, 42000 Varaždin',
        phone: ['042 232 887', '098 473 267'],
        email: 'ured@medjimurka-bs.hr',
        hours: '0-24 sata',
      },
    ],
  },
];

function ContactCard({ item }: { item: ContactItem }) {
  const phones = Array.isArray(item.phone) ? item.phone : item.phone ? [item.phone] : [];

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md">
      <h4 className="font-semibold text-neutral-900">{item.name}</h4>
      {item.role && (
        <p className="mt-0.5 text-sm text-neutral-500">{item.role}</p>
      )}

      <div className="mt-3 space-y-2 text-sm">
        {item.address && (
          <div className="flex items-start gap-2 text-neutral-600">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
            <span>{item.address}</span>
          </div>
        )}

        {phones.map((phone) => (
          <div key={phone} className="flex items-center gap-2">
            <Phone className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="font-medium text-primary-600 hover:underline"
            >
              {phone}
            </a>
          </div>
        ))}

        {item.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            <a
              href={`mailto:${item.email}`}
              className="text-primary-600 hover:underline"
            >
              {item.email}
            </a>
          </div>
        )}

        {item.hours && (
          <div className="flex items-start gap-2 text-neutral-600">
            <span className="mt-0.5 h-4 w-4 flex-shrink-0 text-center text-xs">🕐</span>
            <span>{item.hours}</span>
          </div>
        )}

        {item.note && (
          <p className="mt-2 text-xs text-neutral-500 italic">{item.note}</p>
        )}

        {item.website && (
          <a
            href={`https://${item.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs text-primary-600 hover:underline"
          >
            {item.website} ↗
          </a>
        )}
      </div>
    </div>
  );
}

function CategorySection({ category, delay }: { category: ContactCategory; delay: number }) {
  const Icon = category.icon;

  return (
    <FadeIn delay={delay}>
      <div className="mb-8">
        <div className={`mb-4 flex items-center gap-3 rounded-lg ${category.bgColor} px-4 py-3`}>
          <Icon className={`h-6 w-6 ${category.iconColor}`} />
          <h2 className="text-lg font-bold text-neutral-900">{category.title}</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.items.map((item) => (
            <ContactCard key={item.name} item={item} />
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

export default function UsefulContactsPage() {
  return (
    <>
      {/* Hero */}
      <FadeIn>
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-12 text-white md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold md:text-4xl">Korisni kontakti</h1>
            <p className="mt-2 text-primary-100">
              Sve važne službe i kontakti za stanovnike Općine Veliki Bukovec
            </p>
          </div>
        </section>
      </FadeIn>

      {/* Emergency Numbers Banner */}
      <FadeIn delay={0.1}>
        <section className="border-b border-red-200 bg-red-50 py-6">
          <div className="container mx-auto px-4">
            <div className="mb-4 flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="font-bold">Hitni brojevi</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {EMERGENCY_NUMBERS.map((item) => (
                <a
                  key={item.number}
                  href={`tel:${item.number}`}
                  className={`flex flex-col items-center rounded-xl ${item.color} p-4 text-white shadow-lg transition-transform hover:scale-105`}
                >
                  <span className="text-3xl font-bold">{item.number}</span>
                  <span className="mt-1 text-sm opacity-90">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Link to Općina contact */}
        <FadeIn delay={0.15}>
          <div className="mb-8 rounded-xl border border-primary-200 bg-primary-50 p-5">
            <h3 className="mb-2 font-semibold text-primary-900">
              Općina Veliki Bukovec
            </h3>
            <p className="mb-3 text-sm text-primary-700">
              Za kontakt s općinskom upravom, načelnikom i službama posjetite službenu kontakt stranicu.
            </p>
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              <Building2 className="h-4 w-4" />
              Kontakt Općine
            </Link>
          </div>
        </FadeIn>

        {/* Contact Categories */}
        {CONTACT_CATEGORIES.map((category, index) => (
          <CategorySection
            key={category.title}
            category={category}
            delay={0.2 + index * 0.05}
          />
        ))}

        {/* Footer Note */}
        <FadeIn delay={0.6}>
          <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-center">
            <p className="text-sm text-neutral-600">
              Informacije su prikupljene iz javno dostupnih izvora.
              Ako primijetite netočnost, molimo javite nam na{' '}
              <a href="mailto:opcinavk@gmail.com" className="text-primary-600 hover:underline">
                opcinavk@gmail.com
              </a>
            </p>
          </div>
        </FadeIn>
      </div>
    </>
  );
}
