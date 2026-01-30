'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Landmark,
  Users2,
  Heart,
  Flame,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  ChevronDown,
  Building,
  Leaf,
  Receipt,
  HandHeart,
  ClipboardList,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface Section {
  id: string;
  title: string;
  icon: typeof Truck;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    id: 'komunalno',
    title: 'Komunalno',
    icon: Truck,
    content: (
      <>
        <p className="text-lg leading-relaxed text-neutral-700">
          Komunalno gospodarstvo brine se za održavanje javnih površina,
          infrastrukture i kvalitetu života u našoj općini.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={Truck}
            title="Odvoz otpada"
            description="Redoviti odvoz komunalnog i reciklabilnog otpada prema rasporedu"
            link="/odvoz-otpada"
            linkText="Raspored odvoza"
          />
          <ServiceCard
            icon={Leaf}
            title="Javne površine"
            description="Održavanje parkova, cesta, javne rasvjete i zelenih površina"
          />
          <ServiceCard
            icon={Flame}
            title="Dimnjačarski poslovi"
            description="Redoviti pregledi i čišćenje dimnjaka za sigurnost građana"
            details="Ovlašteni dimnjačar: Darko Novak, tel: 098 XXX XXXX"
          />
          <ServiceCard
            icon={Building}
            title="Groblja"
            description="Upravljanje i održavanje mjesnih grobalja"
          />
        </div>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h4 className="flex items-center gap-2 font-semibold text-amber-900">
            <Phone className="h-4 w-4" />
            Prijava komunalnog problema
          </h4>
          <p className="mt-2 text-sm text-amber-800">
            Uočili ste oštećenje ceste, problema s rasvjetom ili nelegalno
            odlaganje otpada? Prijavite nam!
          </p>
          <Link
            href="/prijava-problema"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900"
          >
            Prijavite problem →
          </Link>
        </div>
      </>
    ),
  },
  {
    id: 'financije',
    title: 'Financije',
    icon: Landmark,
    content: (
      <>
        <p className="text-lg leading-relaxed text-neutral-700">
          Transparentno upravljanje javnim sredstvima - proračun, izvještaji i
          financijski dokumenti dostupni svim građanima.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={Receipt}
            title="Proračun"
            description="Godišnji proračun općine s detaljnim planiranjem prihoda i rashoda"
            link="/dokumenti?kategorija=proracun"
            linkText="Proračunski dokumenti"
          />
          <ServiceCard
            icon={FileText}
            title="Financijski izvještaji"
            description="Polugodišnji i godišnji izvještaji o izvršenju proračuna"
            link="/dokumenti?kategorija=proracun"
            linkText="Pogledaj izvještaje"
          />
          <ServiceCard
            icon={HandHeart}
            title="Donacije i sponzorstva"
            description="Pregled primljenih donacija i dodijeljenih sponzorstava"
          />
          <ServiceCard
            icon={ClipboardList}
            title="Javna nabava"
            description="Postupci javne nabave objavljuju se na EOJN portalu"
            link="https://eojn.nn.hr/"
            linkText="EOJN portal"
            external
          />
        </div>

        <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <h4 className="font-semibold text-neutral-900">
            Sudjelovanje građana u planiranju proračuna
          </h4>
          <p className="mt-2 text-sm text-neutral-600">
            Pozivamo sve građane da sudjeluju u kreiranju proračuna za sljedeću
            godinu. Svoje prijedloge možete dostaviti putem kontakt obrasca ili
            osobno u općinskoj upravi.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'gradani',
    title: 'Za građane',
    icon: Users2,
    content: (
      <>
        <p className="text-lg leading-relaxed text-neutral-700">
          Sve što vam treba na jednom mjestu - obrasci, zahtjevi i informacije
          za građane.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={FileText}
            title="Obrasci i zahtjevi"
            description="Preuzmite obrasce za različite upravne postupke"
            link="/dokumenti?kategorija=obrasci"
            linkText="Svi obrasci"
          />
          <ServiceCard
            icon={Shield}
            title="Pristup informacijama"
            description="Ostvarite pravo na pristup informacijama sukladno zakonu"
            link="/dokumenti/pravo-na-pristup-informacijama"
            linkText="Više informacija"
          />
          <ServiceCard
            icon={Building}
            title="Društveni domovi"
            description="Rezervacija prostora društvenih domova za događanja"
            details="Kontaktirajte JUO za rezervacije"
          />
          <ServiceCard
            icon={Shield}
            title="Civilna zaštita"
            description="Informacije o sustavu civilne zaštite i postupanju u izvanrednim situacijama"
          />
        </div>

        <div className="mt-8 rounded-xl border border-primary-200 bg-primary-50 p-5">
          <h4 className="flex items-center gap-2 font-semibold text-primary-900">
            <Phone className="h-4 w-4" />
            Radno vrijeme za stranke
          </h4>
          <div className="mt-2 text-sm text-primary-800">
            <p>Ponedjeljak - Petak: 8:00 - 14:00</p>
            <p className="mt-1">Telefon: 042 719 001</p>
            <p>Email: opcina@velikibukovec.hr</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'udruge',
    title: 'Udruge',
    icon: Heart,
    content: (
      <>
        <p className="text-lg leading-relaxed text-neutral-700">
          Općina podržava rad udruga civilnog društva kroz financiranje programa
          i projekata od interesa za opće dobro.
        </p>

        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-900">
              Javni natječaj za udruge
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Svake godine Općina raspisuje javni natječaj za financiranje
              programa i projekata udruga. Natječaj se objavljuje početkom
              godine.
            </p>
            <Link
              href="/obavijesti?kategorija=natjecaj"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Aktualni natječaji →
            </Link>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-900">
              Uvjeti financiranja
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                Udruga mora biti registrirana i djelovati na području općine
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                Program mora biti od interesa za lokalnu zajednicu
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                Uredno izvještavanje o prethodnim projektima
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-900">
              Dokumenti za prijavu
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Potrebni obrasci za prijavu na natječaj dostupni su u sekciji
              dokumenata.
            </p>
            <Link
              href="/dokumenti?kategorija=obrasci"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <FileText className="h-4 w-4" />
              Obrasci za udruge
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/opcina/udruge"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Heart className="h-4 w-4" />
            Pogledaj sve udruge
          </Link>
        </div>
      </>
    ),
  },
];

function ServiceCard({
  icon: Icon,
  title,
  description,
  details,
  link,
  linkText,
  external,
}: {
  icon: typeof Truck;
  title: string;
  description: string;
  details?: string;
  link?: string;
  linkText?: string;
  external?: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600">{description}</p>
      {details && (
        <p className="mt-2 text-xs text-neutral-500">{details}</p>
      )}
      {link && linkText && (
        <Link
          href={link}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          {linkText}
          {external && <ExternalLink className="h-3 w-3" />}
        </Link>
      )}
    </div>
  );
}

export default function UslugePage() {
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
                  className="relative flex items-center gap-2 px-3 py-4 text-sm font-medium transition-colors sm:px-5 sm:text-base"
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
                      layoutId="activeUslugeTab"
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
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900 py-16 sm:py-20">
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
        </div>
        <div className="container relative mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h1 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                {activeSection.title}
              </h1>
              <p className="mt-3 text-lg text-white/80">
                Usluge Općine Veliki Bukovec
              </p>
            </motion.div>
          </AnimatePresence>
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
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-3xl"
          >
            {activeSection.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Contact CTA */}
      <div className="border-t border-neutral-100 bg-neutral-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold text-neutral-900">
            Trebate pomoć?
          </h2>
          <p className="mt-2 text-neutral-600">
            Kontaktirajte nas za sve upite vezane uz usluge općine.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
            >
              <Mail className="h-4 w-4" />
              Kontaktirajte nas
            </Link>
            <Link
              href="/prijava-problema"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Prijava problema
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
