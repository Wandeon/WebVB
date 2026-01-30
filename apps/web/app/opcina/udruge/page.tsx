'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Trophy,
  Heart,
  Users,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface Association {
  id: string;
  name: string;
  shortName: string;
  category: 'vatrogasci' | 'sport' | 'ostalo';
  settlement: string;
  description: string;
  founded?: string;
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  image?: string;
}

const associations: Association[] = [
  // Vatrogasci
  {
    id: 'dvd-veliki-bukovec',
    name: 'Dobrovoljno vatrogasno društvo Veliki Bukovec',
    shortName: 'DVD Veliki Bukovec',
    category: 'vatrogasci',
    settlement: 'Veliki Bukovec',
    description:
      'DVD Veliki Bukovec osnovan je 1929. godine i od tada neprekidno djeluje u zaštiti života i imovine mještana. Društvo broji preko 50 aktivnih članova i sudjeluje na brojnim vatrogasnim natjecanjima.',
    founded: '1929',
  },
  {
    id: 'dvd-dubovica',
    name: 'Dobrovoljno vatrogasno društvo Dubovica',
    shortName: 'DVD Dubovica',
    category: 'vatrogasci',
    settlement: 'Dubovica',
    description:
      'DVD Dubovica aktivno djeluje u zaštiti sela Dubovica i okolice. Članovi društva redovito sudjeluju na vatrogasnim natjecanjima i manifestacijama u općini.',
    founded: '1932',
  },
  {
    id: 'dvd-kapela',
    name: 'Dobrovoljno vatrogasno društvo Kapela Podravska',
    shortName: 'DVD Kapela Podravska',
    category: 'vatrogasci',
    settlement: 'Kapela Podravska',
    description:
      'DVD Kapela Podravska važna je karika u sustavu vatrogastva općine. Društvo organizira brojne manifestacije i okuplja mještane svih generacija.',
    founded: '1935',
  },
  // Sport
  {
    id: 'nk-bukovcan',
    name: 'Nogometni klub Bukovčan',
    shortName: 'NK Bukovčan',
    category: 'sport',
    settlement: 'Veliki Bukovec',
    description:
      'NK Bukovčan je nogometni klub s dugom tradicijom. Klub se natječe u županijskim ligama i okuplja igrače svih uzrasta iz općine i okolice.',
    founded: '1946',
  },
  {
    id: 'nk-poljoprivrednik',
    name: 'Nogometni klub Poljoprivrednik',
    shortName: 'NK Poljoprivrednik',
    category: 'sport',
    settlement: 'Kapela Podravska',
    description:
      'NK Poljoprivrednik Kapela Podravska je nogometni klub koji okuplja sportaše iz Kapele Podravske i okolnih mjesta. Klub aktivno sudjeluje u županijskim natjecanjima.',
  },
  {
    id: 'ld-fazan',
    name: 'Lovačko društvo Fazan',
    shortName: 'LD Fazan',
    category: 'sport',
    settlement: 'Veliki Bukovec',
    description:
      'LD Fazan upravlja lovištem na području općine i brine se za očuvanje divljači i prirode. Društvo organizira tradicionalne lovačke manifestacije.',
  },
  {
    id: 'srk-linjak',
    name: 'Športsko ribolovno klub Linjak',
    shortName: 'ŠRK Linjak',
    category: 'sport',
    settlement: 'Veliki Bukovec',
    description:
      'ŠRK Linjak okuplja ljubitelje sportskog ribolova. Klub upravlja ribolovnim vodama i organizira natjecanja na rijeci Plitvici.',
  },
  // Ostale udruge
  {
    id: 'udruga-zena-vb',
    name: 'Udruga žena Veliki Bukovec',
    shortName: 'Udruga žena VB',
    category: 'ostalo',
    settlement: 'Veliki Bukovec',
    description:
      'Udruga žena Veliki Bukovec aktivno djeluje na očuvanju tradicije i običaja. Članice sudjeluju na brojnim manifestacijama i organiziraju humanitarne akcije.',
  },
  {
    id: 'kapelske-zene',
    name: 'Udruga Kapelske žene',
    shortName: 'Kapelske žene',
    category: 'ostalo',
    settlement: 'Kapela Podravska',
    description:
      'Udruga Kapelske žene okuplja žene iz Kapele Podravske koje zajedno rade na očuvanju tradicije, organiziraju kulturna događanja i humanitarne aktivnosti.',
  },
  {
    id: 'umirovljenici',
    name: 'Udruga umirovljenika Općine Veliki Bukovec',
    shortName: 'Udruga umirovljenika',
    category: 'ostalo',
    settlement: 'Veliki Bukovec',
    description:
      'Udruga okuplja umirovljenike s područja cijele općine. Organizira izlete, druženja i brine se za kvalitetu života umirovljenika.',
  },
];

type Category = 'svi' | 'vatrogasci' | 'sport' | 'ostalo';

const categories: { id: Category; label: string; icon: typeof Users }[] = [
  { id: 'svi', label: 'Sve udruge', icon: Users },
  { id: 'vatrogasci', label: 'Vatrogasci', icon: Flame },
  { id: 'sport', label: 'Sport', icon: Trophy },
  { id: 'ostalo', label: 'Ostale', icon: Heart },
];

const categoryColors: Record<Association['category'], string> = {
  vatrogasci: 'bg-red-100 text-red-700',
  sport: 'bg-green-100 text-green-700',
  ostalo: 'bg-purple-100 text-purple-700',
};

const categoryIcons: Record<Association['category'], typeof Flame> = {
  vatrogasci: Flame,
  sport: Trophy,
  ostalo: Heart,
};

function AssociationCard({ association }: { association: Association }) {
  const Icon = categoryIcons[association.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${categoryColors[association.category]}`}
        >
          <Icon className="h-3 w-3" />
          {association.category === 'vatrogasci' && 'Vatrogasci'}
          {association.category === 'sport' && 'Sport'}
          {association.category === 'ostalo' && 'Udruga'}
        </div>
        {association.founded && (
          <span className="text-xs text-neutral-500">
            Od {association.founded}.
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-neutral-900">
        {association.shortName}
      </h3>

      <div className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
        <MapPin className="h-3.5 w-3.5" />
        {association.settlement}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        {association.description}
      </p>

      {association.contact && (
        <div className="mt-4 space-y-1 border-t border-neutral-100 pt-3">
          {association.contact.phone && (
            <a
              href={`tel:${association.contact.phone}`}
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
            >
              <Phone className="h-3.5 w-3.5" />
              {association.contact.phone}
            </a>
          )}
          {association.contact.email && (
            <a
              href={`mailto:${association.contact.email}`}
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
            >
              <Mail className="h-3.5 w-3.5" />
              {association.contact.email}
            </a>
          )}
          {association.contact.website && (
            <a
              href={association.contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Web stranica
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function UdrugePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('svi');

  const filteredAssociations =
    activeCategory === 'svi'
      ? associations
      : associations.filter((a) => a.category === activeCategory);

  const counts = {
    svi: associations.length,
    vatrogasci: associations.filter((a) => a.category === 'vatrogasci').length,
    sport: associations.filter((a) => a.category === 'sport').length,
    ostalo: associations.filter((a) => a.category === 'ostalo').length,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[280px] overflow-hidden">
        <Image
          src="/images/hero/veliki-bukovec-hero-1.jpg"
          alt="Udruge Općine Veliki Bukovec"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="container relative mx-auto flex h-full items-end px-4 pb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
              Udruge i društva
            </h1>
            <p className="mt-2 max-w-xl text-white/90">
              Aktivna zajednica s bogatom tradicijom volontiranja i udruživanja
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 sm:justify-center sm:gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {counts[cat.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Associations Grid */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredAssociations.map((association) => (
              <AssociationCard key={association.id} association={association} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredAssociations.length === 0 && (
          <div className="py-12 text-center text-neutral-500">
            Nema udruga u ovoj kategoriji.
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="border-t border-neutral-200 bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold text-neutral-900">
            Želite registrirati svoju udrugu?
          </h2>
          <p className="mt-2 text-neutral-600">
            Kontaktirajte općinsku upravu za informacije o registraciji i
            financiranju udruga.
          </p>
          <Link
            href="/kontakt"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            Kontaktirajte nas
          </Link>
        </div>
      </div>
    </div>
  );
}
