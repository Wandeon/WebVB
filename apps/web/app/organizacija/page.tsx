'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Users,
  Building2,
  FileText,
  ChevronDown,
  Mail,
  Phone,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface Section {
  id: string;
  title: string;
  icon: typeof User;
  content: React.ReactNode;
}

interface CouncilMember {
  name: string;
  role?: string;
  party?: string;
}

const councilMembers: CouncilMember[] = [
  { name: 'Miran Stjepan Posavec', role: 'Predsjednik', party: 'HDZ' },
  { name: 'Mirko Mikulčić', role: 'Potpredsjednik', party: 'HDZ' },
  { name: 'Darko Trstenjak', party: 'HDZ' },
  { name: 'Željko Pintarić', party: 'HDZ' },
  { name: 'Josip Pintarić', party: 'HDZ' },
  { name: 'Dragutin Matoša', party: 'SDP' },
  { name: 'Marijan Špoljar', party: 'SDP' },
];

const sections: Section[] = [
  {
    id: 'nacelnik',
    title: 'Načelnik',
    icon: User,
    content: (
      <>
        <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100">
            <Image
              src="/images/placeholder-person.jpg"
              alt="Općinski načelnik"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Ivan Modrić
            </h2>
            <p className="mt-1 text-lg text-primary-600">Općinski načelnik</p>
            <p className="mt-1 text-neutral-500">Mandat: 2021. - 2025.</p>
            <div className="mt-4 space-y-2">
              <a
                href="mailto:nacelnik@velikibukovec.hr"
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
              >
                <Mail className="h-4 w-4" />
                nacelnik@velikibukovec.hr
              </a>
              <a
                href="tel:+385914840040"
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
              >
                <Phone className="h-4 w-4" />
                091 4840 040
              </a>
            </div>
          </div>
        </div>

        <div className="prose prose-neutral max-w-none">
          <h3>Ovlasti i odgovornosti</h3>
          <p>
            Općinski načelnik je nositelj izvršne vlasti u općini. Zastupa
            Općinu i odgovoran je za zakonito i pravilno obavljanje poslova iz
            samoupravnog djelokruga Općine.
          </p>
          <ul>
            <li>Priprema prijedloge općih akata koje donosi Općinsko vijeće</li>
            <li>Izvršava i osigurava izvršavanje odluka Općinskog vijeća</li>
            <li>Upravlja nekretninama i pokretninama u vlasništvu Općine</li>
            <li>Odlučuje o stjecanju i otuđivanju pokretnina i nekretnina</li>
            <li>Imenuje i razrješuje pročelnike upravnih tijela</li>
            <li>Obavlja i druge poslove utvrđene zakonom i Statutom</li>
          </ul>
        </div>

        <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <h4 className="font-semibold text-neutral-900">Uredovno vrijeme</h4>
          <p className="mt-2 text-sm text-neutral-600">
            Prijem stranaka kod načelnika moguć je uz prethodnu najavu.
            Kontaktirajte Jedinstveni upravni odjel za dogovor termina.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'vijece',
    title: 'Vijeće',
    icon: Users,
    content: (
      <>
        <div className="prose prose-neutral mb-8 max-w-none">
          <p className="lead">
            Općinsko vijeće je predstavničko tijelo građana i tijelo lokalne
            samouprave koje donosi odluke i akte u okviru prava i dužnosti
            Općine.
          </p>
          <p>
            Vijeće ima 7 članova izabranih na neposrednim izborima. Mandat
            članova traje četiri godine.
          </p>
        </div>

        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Članovi Općinskog vijeća (2021. - 2025.)
        </h3>

        <div className="grid gap-3 sm:grid-cols-2">
          {councilMembers.map((member) => (
            <div
              key={member.name}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div>
                <div className="font-medium text-neutral-900">{member.name}</div>
                {member.role && (
                  <div className="text-sm text-primary-600">{member.role}</div>
                )}
              </div>
              {member.party && (
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                  {member.party}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <h4 className="font-semibold text-neutral-900">Sjednice vijeća</h4>
          <p className="mt-2 text-sm text-neutral-600">
            Sjednice Općinskog vijeća održavaju se prema potrebi, a najmanje
            jednom u tri mjeseca. Zapisnici i odluke dostupni su u arhivi
            dokumenata.
          </p>
          <Link
            href="/dokumenti?kategorija=sjednice"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <FileText className="h-4 w-4" />
            Dokumenti sjednica
          </Link>
        </div>
      </>
    ),
  },
  {
    id: 'uprava',
    title: 'Uprava',
    icon: Building2,
    content: (
      <>
        <div className="prose prose-neutral mb-8 max-w-none">
          <p className="lead">
            Jedinstveni upravni odjel (JUO) obavlja upravne, stručne i
            administrativne poslove iz samoupravnog djelokruga Općine.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-primary-200 bg-primary-50 p-5">
          <h3 className="font-semibold text-primary-900">Jedinstveni upravni odjel</h3>
          <div className="mt-3 space-y-1">
            <a
              href="mailto:opcinavk@gmail.com"
              className="flex items-center gap-2 text-sm text-primary-700 hover:text-primary-900"
            >
              <Mail className="h-4 w-4" />
              opcinavk@gmail.com
            </a>
            <a
              href="tel:+38542840040"
              className="flex items-center gap-2 text-sm text-primary-700 hover:text-primary-900"
            >
              <Phone className="h-4 w-4" />
              042 840 040
            </a>
          </div>
        </div>

        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Djelokrug rada
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: 'Opći poslovi',
              desc: 'Administrativni, pravni i kadrovski poslovi',
            },
            {
              title: 'Financije i proračun',
              desc: 'Planiranje, izvršenje proračuna, računovodstvo',
            },
            {
              title: 'Komunalno gospodarstvo',
              desc: 'Infrastruktura, održavanje, komunalne naknade',
            },
            {
              title: 'Prostorno planiranje',
              desc: 'Izdavanje dozvola, prostorni planovi',
            },
            {
              title: 'Socijalna skrb',
              desc: 'Potpore, stipendije, pomoći građanima',
            },
            {
              title: 'Civilna zaštita',
              desc: 'Vatrogastvo, zaštita i spašavanje',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div className="font-medium text-neutral-900">{item.title}</div>
              <div className="mt-1 text-sm text-neutral-500">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <h4 className="font-semibold text-neutral-900">Radno vrijeme</h4>
          <div className="mt-2 text-sm text-neutral-600">
            <p>Ponedjeljak - Petak: 7:00 - 15:00</p>
            <p className="mt-1">Rad sa strankama: 8:00 - 14:00</p>
          </div>
        </div>
      </>
    ),
  },
];

const quickLinks = [
  {
    title: 'Statut općine',
    description: 'Temeljni akt lokalne samouprave',
    href: '/organizacija/statut',
    icon: FileText,
  },
  {
    title: 'Dokumenti sjednica',
    description: 'Zapisnici i odluke Općinskog vijeća',
    href: '/dokumenti?kategorija=sjednice',
    icon: FileText,
  },
];

export default function OrganizacijaPage() {
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
                      layoutId="activeOrgTab"
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
                Organizacija Općine Veliki Bukovec
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

      {/* Quick Links */}
      <div className="border-t border-neutral-100 bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-xl font-semibold text-neutral-900">
            Povezani dokumenti
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
