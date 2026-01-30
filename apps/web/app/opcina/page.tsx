'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  MapPin,
  Mountain,
  Users,
  Flower2,
  Building,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface Section {
  id: string;
  title: string;
  icon: typeof History;
  heroImage: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    id: 'o-nama',
    title: 'O općini',
    icon: Building,
    heroImage: '/images/hero/veliki-bukovec-hero-1.jpg',
    content: (
      <>
        <p className="text-lg leading-relaxed text-neutral-700">
          Općina Veliki Bukovec smještena je u sjeverozapadnom dijelu Hrvatske, u
          Varaždinskoj županiji. Obuhvaća tri naselja:{' '}
          <strong>Veliki Bukovec</strong>, <strong>Dubovicu</strong> i{' '}
          <strong>Kapelu Podravsku</strong>.
        </p>
        <p className="mt-4 text-neutral-600">
          S ukupnom površinom od približno 25 km² i oko 1.400 stanovnika, općina
          predstavlja idiličnu podravsku sredinu s bogatom tradicijom
          cvjećarstva i poljoprivrede.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-primary-50 p-4 text-center">
            <div className="text-2xl font-bold text-primary-700">~1,400</div>
            <div className="text-sm text-neutral-600">Stanovnika</div>
          </div>
          <div className="rounded-xl bg-primary-50 p-4 text-center">
            <div className="text-2xl font-bold text-primary-700">25 km²</div>
            <div className="text-sm text-neutral-600">Površina</div>
          </div>
          <div className="rounded-xl bg-primary-50 p-4 text-center">
            <div className="text-2xl font-bold text-primary-700">3</div>
            <div className="text-sm text-neutral-600">Naselja</div>
          </div>
        </div>
        <div className="mt-8">
          <Link
            href="/opcina/naselja"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <MapPin className="h-4 w-4" />
            Upoznajte naša naselja
          </Link>
        </div>
      </>
    ),
  },
  {
    id: 'turizam',
    title: 'Turizam',
    icon: Mountain,
    heroImage: '/images/hero/veliki-bukovec-hero-2.jpg',
    content: (
      <>
        <p className="text-lg leading-relaxed text-neutral-700">
          Veliki Bukovec poziva posjetitelje da otkriju skrivene ljepote
          Podravine. Ovaj kraj nudi jedinstveni spoj prirodnih ljepota, kulturne
          baštine i autentičnog ruralnog doživljaja.
        </p>

        <h3 className="mt-8 flex items-center gap-2 text-xl font-semibold text-neutral-900">
          <Flower2 className="h-5 w-5 text-primary-600" />
          Cvjećarstvo
        </h3>
        <p className="mt-2 text-neutral-600">
          Naš kraj poznat je po dugoj tradiciji uzgoja cvijeća koja seže više od
          stoljeća unazad. Cvjećari Velikog Bukovca opskrbljuju tržnice diljem
          Hrvatske prekrasnim cvijećem i presadicama.
        </p>

        <h3 className="mt-6 flex items-center gap-2 text-xl font-semibold text-neutral-900">
          <Mountain className="h-5 w-5 text-primary-600" />
          Prirodne ljepote
        </h3>
        <p className="mt-2 text-neutral-600">
          Rijeka Plitvica i okolna priroda pružaju idealne uvjete za šetnje,
          pecanje i odmor u prirodi. Prostranice uz Dravu dom su brojnim vrstama
          ptica i životinja.
        </p>

        <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h4 className="font-semibold text-neutral-900">Što posjetiti?</h4>
          <ul className="mt-3 space-y-2 text-neutral-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
              Barokni dvorac Drašković
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
              Crkva sv. Lovre
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
              Rijeka Plitvica i Drava
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
              Cvjećarski vrtovi
            </li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: 'povijest',
    title: 'Povijest',
    icon: History,
    heroImage: '/images/hero/veliki-bukovec-hero-3.jpg',
    content: (
      <>
        <p className="text-lg leading-relaxed text-neutral-700">
          Povijest Velikog Bukovca seže daleko u prošlost. Prvi pisani spomeni
          ovog kraja datiraju iz srednjeg vijeka, kada je područje bilo dio
          feudalnog sustava pod upravom lokalnog plemstva.
        </p>

        <div className="mt-8 space-y-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <span className="text-sm font-bold">18.</span>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">18. stoljeće</h4>
              <p className="mt-1 text-sm text-neutral-600">
                Izgradnja baroknog dvorca obitelji Drašković, koji do danas
                ostaje najznačajniji arhitektonski spomenik općine.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <span className="text-sm font-bold">19.</span>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">19. stoljeće</h4>
              <p className="mt-1 text-sm text-neutral-600">
                Početak tradicije cvjećarstva koja je obilježila identitet kraja
                i donijela gospodarsku stabilnost.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <span className="text-sm font-bold">20.</span>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">20. stoljeće</h4>
              <p className="mt-1 text-sm text-neutral-600">
                Osnivanje moderne općinske uprave i razvoj infrastrukture.
                Razdoblje industrijalizacije i modernizacije.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <span className="text-sm font-bold">21.</span>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">Danas</h4>
              <p className="mt-1 text-sm text-neutral-600">
                Moderna općina koja čuva tradiciju dok gradi budućnost - digitalna
                transformacija, EU projekti i održivi razvoj.
              </p>
            </div>
          </div>
        </div>
      </>
    ),
  },
];

const quickLinks = [
  {
    title: 'Naselja',
    description: 'Veliki Bukovec, Dubovica, Kapela Podravska',
    href: '/opcina/naselja',
    icon: MapPin,
  },
  {
    title: 'Udruge',
    description: 'DVD-ovi, sportski klubovi, kulturne udruge',
    href: '/opcina/udruge',
    icon: Users,
  },
];

export default function OpcinaPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSection = sections[activeIndex]!;

  return (
    <div className="min-h-screen bg-white">
      {/* Tab Bar - Sticky */}
      <div className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveIndex(index)}
                  className="relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors sm:px-6 sm:text-base"
                >
                  <Icon
                    className={`h-4 w-4 ${
                      activeIndex === index
                        ? 'text-primary-600'
                        : 'text-neutral-400'
                    }`}
                  />
                  <span
                    className={
                      activeIndex === index
                        ? 'text-primary-700'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }
                  >
                    {section.title}
                  </span>
                  {activeIndex === index && (
                    <motion.div
                      layoutId="activeOpcinaTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[350px] overflow-hidden sm:h-[60vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Image
              src={activeSection.heroImage}
              alt={activeSection.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-10 sm:pb-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
                  {activeSection.title}
                </h1>
                <p className="mt-2 max-w-xl text-lg text-white/90">
                  Općina Veliki Bukovec
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
            key={activeSection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-3xl"
          >
            {activeSection.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quick Links */}
      <div className="border-t border-neutral-100 bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-xl font-semibold text-neutral-900">
            Istražite više
          </h2>
          <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">
                      {link.title}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {link.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
