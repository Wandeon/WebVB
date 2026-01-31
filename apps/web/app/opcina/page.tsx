// apps/web/app/opcina/page.tsx
import { Flower2, History, Info, MapPin, Mountain, Users } from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Općina Veliki Bukovec | Dobrodošli u srce Podravine',
  description:
    'Općina Veliki Bukovec smještena je u Varaždinskoj županiji. Saznajte više o našoj općini, turizmu i bogatoj povijesti.',
  openGraph: {
    title: 'Općina Veliki Bukovec',
    description:
      'Dobrodošli u srce Podravine - općina s bogatom tradicijom cvjećarstva i poljoprivrede.',
    images: ['/images/hero/veliki-bukovec-hero-1.jpg'],
  },
};

const pageSections: PageSection[] = [
  { id: 'o-nama', label: 'O nama' },
  { id: 'turizam', label: 'Turizam' },
  { id: 'povijest', label: 'Povijest' },
];

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: typeof MapPin;
}

const quickLinks: QuickLink[] = [
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
  return (
    <PageLayoutV2
      title="Općina Veliki Bukovec"
      subtitle="Dobrodošli u srce Podravine"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      {/* O nama Section */}
      <section id="o-nama" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary-600" />
          O nama
        </h2>
        <p className="text-lg leading-relaxed">
          Općina Veliki Bukovec smještena je u sjeverozapadnom dijelu Hrvatske, u
          Varaždinskoj županiji. Obuhvaća tri naselja:{' '}
          <strong>Veliki Bukovec</strong>, <strong>Dubovica</strong> i{' '}
          <strong>Kapela Podravska</strong>.
        </p>
        <p>
          S ukupnom površinom od približno 25 km² i oko 1.400 stanovnika, općina
          predstavlja idiličnu podravsku sredinu s bogatom tradicijom
          cvjećarstva i poljoprivrede.
        </p>

        <div className="not-prose mt-8 grid gap-4 sm:grid-cols-3">
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

        <div className="not-prose mt-8">
          <Link
            href="/opcina/naselja"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <MapPin className="h-4 w-4" />
            Upoznajte naša naselja
          </Link>
        </div>
      </section>

      {/* Turizam Section */}
      <section id="turizam" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Mountain className="h-5 w-5 text-primary-600" />
          Turizam
        </h2>
        <p className="text-lg leading-relaxed">
          Veliki Bukovec poziva posjetitelje da otkriju skrivene ljepote
          Podravine. Ovaj kraj nudi jedinstveni spoj prirodnih ljepota, kulturne
          baštine i autentičnog ruralnog doživljaja.
        </p>

        <h3 className="flex items-center gap-2">
          <Flower2 className="h-5 w-5 text-primary-600" />
          Cvjećarstvo
        </h3>
        <p>
          Naš kraj poznat je po dugoj tradiciji uzgoja cvijeća koja seže više od
          stoljeća unazad. Cvjećari Velikog Bukovca opskrbljuju tržnice diljem
          Hrvatske prekrasnim cvijećem i presadicama.
        </p>

        <h3 className="flex items-center gap-2">
          <Mountain className="h-5 w-5 text-primary-600" />
          Prirodne ljepote
        </h3>
        <p>
          Rijeka Plitvica i okolna priroda pružaju idealne uvjete za šetnje,
          pecanje i odmor u prirodi. Prostranice uz Dravu dom su brojnim vrstama
          ptica i životinja.
        </p>

        <div className="not-prose mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
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
      </section>

      {/* Povijest Section */}
      <section id="povijest" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary-600" />
          Povijest
        </h2>
        <p className="text-lg leading-relaxed">
          Povijest Velikog Bukovca seže daleko u prošlost. Prvi pisani spomeni
          ovog kraja datiraju iz srednjeg vijeka, kada je područje bilo dio
          feudalnog sustava pod upravom lokalnog plemstva.
        </p>

        <div className="not-prose mt-8 space-y-6">
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
      </section>

      {/* Quick Links Section */}
      <section className="not-prose mt-12 border-t border-neutral-100 pt-12">
        <h2 className="mb-6 text-center text-xl font-semibold text-neutral-900">
          Istražite više
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
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
      </section>
    </PageLayoutV2>
  );
}
