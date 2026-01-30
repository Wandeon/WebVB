'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Vote,
  Building2,
  Flag,
  Globe,
  User,
  Calendar,
  FileText,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type ElectionType = 'lokalni' | 'parlamentarni' | 'predsjednicki' | 'eu';

interface Election {
  id: string;
  type: ElectionType;
  year: number;
  title: string;
  date?: string;
  description: string;
  turnout?: string;
  results?: {
    name: string;
    votes: number;
    percentage: number;
  }[];
  documents?: {
    title: string;
    url: string;
  }[];
  externalLinks?: {
    title: string;
    url: string;
  }[];
}

const elections: Election[] = [
  // Lokalni izbori
  {
    id: 'lokalni-2025',
    type: 'lokalni',
    year: 2025,
    title: 'Lokalni izbori 2025',
    date: '18. svibnja 2025.',
    description:
      'Izbori za općinskog načelnika i članove Općinskog vijeća Općine Veliki Bukovec.',
    documents: [
      { title: 'Rješenje o biračkim mjestima', url: '#' },
      { title: 'Kandidacijske liste', url: '#' },
    ],
  },
  {
    id: 'lokalni-2021',
    type: 'lokalni',
    year: 2021,
    title: 'Lokalni izbori 2021',
    date: '16. svibnja 2021.',
    description:
      'Na lokalnim izborima 2021. godine izabran je načelnik i članovi Općinskog vijeća za mandatno razdoblje 2021.-2025.',
    turnout: '58,3%',
    documents: [
      { title: 'Službeni rezultati', url: '#' },
      { title: 'Izvješće o provedbi izbora', url: '#' },
    ],
  },
  {
    id: 'lokalni-2017',
    type: 'lokalni',
    year: 2017,
    title: 'Lokalni izbori 2017',
    date: '21. svibnja 2017.',
    description:
      'Lokalni izbori za mandatno razdoblje 2017.-2021.',
    turnout: '55,1%',
  },
  // Parlamentarni izbori
  {
    id: 'parlamentarni-2024',
    type: 'parlamentarni',
    year: 2024,
    title: 'Parlamentarni izbori 2024',
    date: '17. travnja 2024.',
    description:
      'Izbori za zastupnike u Hrvatski sabor. Općina Veliki Bukovec dio je X. izborne jedinice.',
    turnout: '62,4%',
    externalLinks: [
      { title: 'DIP - Službeni rezultati', url: 'https://www.izbori.hr/' },
    ],
  },
  {
    id: 'parlamentarni-2020',
    type: 'parlamentarni',
    year: 2020,
    title: 'Parlamentarni izbori 2020',
    date: '5. srpnja 2020.',
    description:
      'Prijevremeni parlamentarni izbori održani u srpnju 2020. godine.',
    turnout: '48,7%',
  },
  // Predsjednički izbori
  {
    id: 'predsjednicki-2024',
    type: 'predsjednicki',
    year: 2024,
    title: 'Predsjednički izbori 2024/2025',
    date: '29. prosinca 2024. / 12. siječnja 2025.',
    description:
      'Izbori za Predsjednika Republike Hrvatske. U drugom krugu izabran je novi predsjednik.',
    turnout: '1. krug: 46,2% / 2. krug: 44,8%',
  },
  {
    id: 'predsjednicki-2019',
    type: 'predsjednicki',
    year: 2019,
    title: 'Predsjednički izbori 2019/2020',
    date: '22. prosinca 2019. / 5. siječnja 2020.',
    description:
      'Predsjednički izbori s dva kruga glasovanja.',
    turnout: '1. krug: 51,2% / 2. krug: 54,9%',
  },
  // EU izbori
  {
    id: 'eu-2024',
    type: 'eu',
    year: 2024,
    title: 'Izbori za EU parlament 2024',
    date: '9. lipnja 2024.',
    description:
      'Izbori za zastupnike u Europski parlament iz Republike Hrvatske.',
    turnout: '21,3%',
    externalLinks: [
      { title: 'Europski parlament', url: 'https://www.europarl.europa.eu/' },
    ],
  },
  {
    id: 'eu-2019',
    type: 'eu',
    year: 2019,
    title: 'Izbori za EU parlament 2019',
    date: '26. svibnja 2019.',
    description:
      'Izbori za zastupnike u Europski parlament iz Republike Hrvatske.',
    turnout: '29,8%',
  },
];

const electionTypes: { id: ElectionType; label: string; icon: typeof Vote }[] = [
  { id: 'lokalni', label: 'Lokalni', icon: Building2 },
  { id: 'parlamentarni', label: 'Parlamentarni', icon: Flag },
  { id: 'predsjednicki', label: 'Predsjednički', icon: User },
  { id: 'eu', label: 'EU parlament', icon: Globe },
];

const typeColors: Record<ElectionType, string> = {
  lokalni: 'bg-blue-100 text-blue-700 border-blue-200',
  parlamentarni: 'bg-red-100 text-red-700 border-red-200',
  predsjednicki: 'bg-purple-100 text-purple-700 border-purple-200',
  eu: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

function ElectionCard({ election }: { election: Election }) {
  const typeInfo = electionTypes.find((t) => t.id === election.type)!;
  const Icon = typeInfo.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${typeColors[election.type]}`}
        >
          <Icon className="h-3 w-3" />
          {typeInfo.label}
        </div>
        <span className="text-2xl font-bold text-neutral-300">
          {election.year}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-neutral-900">{election.title}</h3>

      {election.date && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-neutral-500">
          <Calendar className="h-3.5 w-3.5" />
          {election.date}
        </div>
      )}

      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        {election.description}
      </p>

      {election.turnout && (
        <div className="mt-4 rounded-lg bg-neutral-50 px-3 py-2">
          <div className="text-xs text-neutral-500">Izlaznost</div>
          <div className="font-semibold text-neutral-900">{election.turnout}</div>
        </div>
      )}

      {election.documents && election.documents.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-neutral-100 pt-3">
          <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Dokumenti
          </div>
          {election.documents.map((doc) => (
            <Link
              key={doc.url}
              href={doc.url}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
            >
              <FileText className="h-3.5 w-3.5" />
              {doc.title}
              <ChevronRight className="ml-auto h-3.5 w-3.5" />
            </Link>
          ))}
        </div>
      )}

      {election.externalLinks && election.externalLinks.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-neutral-100 pt-3">
          {election.externalLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {link.title}
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function IzboriPage() {
  const [activeType, setActiveType] = useState<ElectionType | 'svi'>('svi');

  const filteredElections =
    activeType === 'svi'
      ? elections
      : elections.filter((e) => e.type === activeType);

  // Sort by year descending
  const sortedElections = [...filteredElections].sort((a, b) => b.year - a.year);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[280px] overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900">
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
        </div>
        <div className="container relative mx-auto flex h-full items-end px-4 pb-8">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/90">
              <Vote className="h-4 w-4" />
              Demokratski procesi
            </div>
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
              Izbori
            </h1>
            <p className="mt-2 max-w-xl text-white/80">
              Pregled svih izbora na području Općine Veliki Bukovec
            </p>
          </div>
        </div>
      </section>

      {/* Type Filter */}
      <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 sm:justify-center sm:gap-2">
            <button
              onClick={() => setActiveType('svi')}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeType === 'svi'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Vote className="h-4 w-4" />
              Svi izbori
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  activeType === 'svi'
                    ? 'bg-white/20 text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {elections.length}
              </span>
            </button>
            {electionTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeType === type.id;
              const count = elections.filter((e) => e.type === type.id).length;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {type.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Elections Grid */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {sortedElections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </AnimatePresence>
        </motion.div>

        {sortedElections.length === 0 && (
          <div className="py-12 text-center text-neutral-500">
            Nema izbora u ovoj kategoriji.
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="border-t border-neutral-200 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-xl border border-neutral-200 bg-neutral-50 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <Vote className="h-5 w-5 text-primary-600" />
              Informacije za birače
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Za informacije o biračkim mjestima, popis birača i druge informacije
              vezane uz izbore, posjetite službene stranice Državnog izbornog
              povjerenstva ili kontaktirajte Općinu.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="https://www.izbori.hr/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
              >
                <ExternalLink className="h-4 w-4" />
                DIP - izbori.hr
              </a>
              <Link
                href="/kontakt"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Kontakt općine
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
