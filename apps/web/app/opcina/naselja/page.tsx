'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Users, MapPin, ExternalLink, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface CouncilMember {
  name: string;
  role?: string;
}

interface Settlement {
  id: string;
  name: string;
  heroImage: string;
  tagline: string;
  description: string;
  facts?: { label: string; value: string }[];
  externalLink?: { url: string; label: string };
  council: {
    title: string;
    note?: string;
    members: CouncilMember[];
  };
}

const settlements: Settlement[] = [
  {
    id: 'veliki-bukovec',
    name: 'Veliki Bukovec',
    heroImage: '/images/hero/veliki-bukovec-hero-1.jpg',
    tagline: 'Sjedište općine i dom baroknog dvorca Drašković',
    description: `Veliki Bukovec je najveće i središnje naselje općine, smješteno na ušću rijeke Plitvice u Dravu.

Selo je poznato po baroknom dvorcu obitelji Drašković iz 18. stoljeća, koji je kulturno-povijesni spomenik i ponos našeg kraja. Kroz povijest, Veliki Bukovec se razvio kao središte cvjećarstva - tradicije koja traje više od stoljeća i po kojoj je naš kraj prepoznatljiv diljem Hrvatske.

Danas je Veliki Bukovec moderno selo koje čuva svoju baštinu dok gleda u budućnost. Ovdje se nalazi općinska uprava, osnovna škola, dječji vrtić i većina javnih službi.`,
    facts: [
      { label: 'Stanovništvo', value: '~600' },
      { label: 'Poštanski broj', value: '42231' },
      { label: 'Znamenitost', value: 'Dvorac Drašković' },
    ],
    council: {
      title: 'Mjesni odbor Veliki Bukovec',
      note: 'Od dana raspisivanja izbora za članove vijeća mjesnih odbora do roka za prijavu kandidatura nije pristigla niti jedna pravovaljana kandidatura.',
      members: [],
    },
  },
  {
    id: 'dubovica',
    name: 'Dubovica',
    heroImage: '/images/hero/veliki-bukovec-hero-2.jpg',
    tagline: 'Selo podijeljeno rijekom Plitvica na dva dijela',
    description: `Dubovica je slikovito podravsko selo koje rijeka Plitvica dijeli na dva dijela - Gornju i Donju Dubovicu.

Ova jedinstvena geografska karakteristika daje selu poseban šarm. Mostovi preko Plitvice povezuju dvije strane sela i svakodnevni su dio života mještana. Dubovica je poznata po mirnom, ruralnom načinu života i očuvanoj prirodi uz rijeku.

Selo ima bogatu tradiciju poljoprivrede i stočarstva, a u novije vrijeme sve više se razvija i cvjećarstvo po uzoru na Veliki Bukovec.`,
    facts: [
      { label: 'Stanovništvo', value: '~400' },
      { label: 'Posebnost', value: 'Rijeka Plitvica' },
    ],
    externalLink: {
      url: 'http://www.dubovica.net/',
      label: 'Dubovica Online',
    },
    council: {
      title: 'Mjesni odbor Dubovica',
      members: [
        { name: 'Dragutin Matoša', role: 'predsjednik' },
        { name: 'Josip Pintarić' },
        { name: 'Marijan Špoljar' },
        { name: 'ZdravkoIska' },
        { name: 'Marija Špoljarić' },
      ],
    },
  },
  {
    id: 'kapela-podravska',
    name: 'Kapela Podravska',
    heroImage: '/images/hero/veliki-bukovec-hero-3.jpg',
    tagline: 'Mirno podravsko selo s bogatom poljoprivrednom tradicijom',
    description: `Kapela Podravska je najmanje, ali ne manje važno naselje naše općine. Smješteno u srcu Podravine, ovo mirno selo odlikuje se tradicionalnim načinom života i snažnom zajednicom.

Ime je dobilo po kapeli koja se nekada nalazila u središtu sela. Danas je Kapela Podravska poznata po vrijednim poljoprivrednicima koji obrađuju plodno podravsko tlo i proizvode kvalitetne poljoprivredne proizvode.

Selo njeguje tradiciju i običaje, a mještani su poznati po gostoljubivosti i zajedništvu.`,
    facts: [
      { label: 'Stanovništvo', value: '~350' },
      { label: 'Tradicija', value: 'Poljoprivreda' },
    ],
    council: {
      title: 'Mjesni odbor Kapela Podravska',
      members: [
        { name: 'Mario Mikulčić', role: 'predsjednik' },
        { name: 'Darko Trstenjak' },
        { name: 'Ivica Kranjec' },
        { name: 'Željko Pintarić' },
        { name: 'Marina Pintarić' },
      ],
    },
  },
];

export default function NaseljaPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  // settlements array is always non-empty (3 hardcoded items)
  const activeSettlement = settlements[activeIndex]!;

  return (
    <div className="min-h-screen bg-white">
      {/* Tab Bar - Sticky */}
      <div className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            {settlements.map((settlement, index) => (
              <button
                key={settlement.id}
                onClick={() => setActiveIndex(index)}
                className="relative px-4 py-4 text-sm font-medium transition-colors sm:px-8 sm:text-base"
              >
                <span
                  className={
                    activeIndex === index
                      ? 'text-primary-700'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }
                >
                  {settlement.name}
                </span>
                {activeIndex === index && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden sm:h-[70vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSettlement.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Image
              src={activeSettlement.heroImage}
              alt={activeSettlement.name}
              fill
              className="object-cover"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12 sm:pb-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSettlement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h1 className="font-display text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                  {activeSettlement.name}
                </h1>
                <p className="mt-2 max-w-xl text-lg text-white/90 sm:text-xl">
                  {activeSettlement.tagline}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="h-6 w-6 text-white/60" />
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSettlement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid gap-8 lg:grid-cols-3 lg:gap-12"
          >
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none">
                {activeSettlement.description.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-neutral-700">
                    {paragraph}
                  </p>
                ))}
              </div>

              {activeSettlement.externalLink && (
                <Link
                  href={activeSettlement.externalLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
                >
                  <ExternalLink className="h-4 w-4" />
                  {activeSettlement.externalLink.label}
                </Link>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Facts Card */}
              {activeSettlement.facts && activeSettlement.facts.length > 0 && (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900">
                    <MapPin className="h-5 w-5 text-primary-600" />
                    Informacije
                  </h3>
                  <dl className="space-y-3">
                    {activeSettlement.facts.map((fact) => (
                      <div key={fact.label}>
                        <dt className="text-sm text-neutral-500">{fact.label}</dt>
                        <dd className="font-medium text-neutral-900">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Council Card */}
              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900">
                  <Users className="h-5 w-5 text-primary-600" />
                  {activeSettlement.council.title}
                </h3>

                {activeSettlement.council.note ? (
                  <p className="text-sm text-neutral-600 italic">
                    {activeSettlement.council.note}
                  </p>
                ) : activeSettlement.council.members.length > 0 ? (
                  <ul className="space-y-2">
                    {activeSettlement.council.members.map((member, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between border-b border-neutral-100 pb-2 last:border-0 last:pb-0"
                      >
                        <span className="font-medium text-neutral-900">
                          {member.name}
                        </span>
                        {member.role && (
                          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                            {member.role}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-500">Nema podataka</p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
