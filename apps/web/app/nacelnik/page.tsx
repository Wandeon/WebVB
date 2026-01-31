// apps/web/app/nacelnik/page.tsx
// Gold standard page following Blueprint A (About Entity) pattern
// Last updated: 2026-01-31
// Sources: DRVB_2.pdf "Political DNA" section, velikibukovec.hr
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  FileText,
  Handshake,
  Info,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Načelnik | Općina Veliki Bukovec',
  description:
    'Ivan Modrić - Općinski načelnik Općine Veliki Bukovec. Izabran 2025. godine, vodi troselsku zajednicu u Podravini.',
  openGraph: {
    title: 'Načelnik | Općina Veliki Bukovec',
    description:
      'Ivan Modrić - Općinski načelnik Općine Veliki Bukovec od 2025. godine.',
    images: ['/images/hero/veliki-bukovec-hero-1.jpg'],
  },
};

const pageSections: PageSection[] = [
  { id: 'o-nacelniku', label: 'O načelniku' },
  { id: 'uloga-i-ovlasti', label: 'Uloga i ovlasti' },
  { id: 'kontakt', label: 'Kontakt' },
];

// Key facts about the mayor - single source of truth
const mayorFacts = {
  name: 'Ivan Modrić',
  initials: 'IM',
  title: 'Općinski načelnik',
  mandateStart: 2025,
  mandateEnd: 2029,
  birthYear: 2000,
  birthPlace: 'Varaždin',
  residence: 'Veliki Bukovec',
  education: 'Strojarski/računalni tehničar',
  predecessors: [
    { name: 'Franjo Vrbanić', party: 'HSS', years: '2021.-2025.' },
    { name: 'Ivan Samec', party: 'HSS', years: '1997.-2021.' },
  ],
};

export default function NacelnikPage() {
  return (
    <PageLayoutV2
      title="Načelnik općine"
      subtitle="Izvršna vlast Općine Veliki Bukovec - izravno izabran od građana"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      {/* O načelniku Section */}
      <section id="o-nacelniku" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary-600" />O načelniku
        </h2>

        {/* Mayor Profile Card */}
        <div className="not-prose mb-8 flex flex-col gap-6 sm:flex-row">
          {/* Photo placeholder */}
          <div className="h-48 w-40 flex-shrink-0 overflow-hidden rounded-xl bg-primary-100">
            <div className="flex h-full items-center justify-center text-3xl font-semibold text-primary-600">
              {mayorFacts.initials}
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-neutral-900">
              {mayorFacts.name}
            </h3>
            <p className="mt-1 text-lg text-primary-600">
              {mayorFacts.title} • Mandat {mayorFacts.mandateStart}.-
              {mayorFacts.mandateEnd}.
            </p>
            <p className="mt-4 text-neutral-700">
              Rođen {mayorFacts.birthYear}. godine u {mayorFacts.birthPlace}u,
              živi u {mayorFacts.residence}u. Po struci {mayorFacts.education}.
              Opisuje se kao radišan, pošten i odgovoran mladi čovjek, uvijek
              spreman pomoći i uključiti se u život zajednice.
            </p>
          </div>
        </div>

        <p className="text-lg leading-relaxed">
          U Općini Veliki Bukovec ljudi ne glasaju samo za stranku - glasaju za
          osobu koju poznaju iz svakodnevnog života. Načelnik je taj kojeg
          susrećete u trgovini, na nedjeljnoj misi, na vatrogasnoj zabavi.{' '}
          <strong>Osobno povjerenje</strong> je temelj lokalne politike.
        </p>

        <p>
          Ova tradicija pragmatičnog lokalnog vodstva seže do samog osnutka
          općine 1997. godine. Umjesto velikih ideologija, građani očekuju
          rješavanje konkretnih problema: održavanje cesta, odvodnjavanja kanala,
          financiranje udruga i škole.
        </p>

        {/* Key Facts Utility Container */}
        <div className="not-prose my-8 rounded-xl border border-primary-200 bg-primary-50/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <Sparkles className="h-5 w-5 text-primary-600" />
            Ključne činjenice
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Aktualni načelnik</div>
                <div className="font-semibold">{mayorFacts.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Mandat</div>
                <div className="font-semibold">
                  {mayorFacts.mandateStart}.-{mayorFacts.mandateEnd}.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Ured</div>
                <div className="font-semibold">Veliki Bukovec 89</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Prethodni načelnik</div>
                <div className="font-semibold">
                  {mayorFacts.predecessors[0]?.name ?? 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Politička tradicija</div>
                <div className="font-semibold">HSS</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Općina osnovana</div>
                <div className="font-semibold">1997.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Ivan Samec bio je načelnik <strong>24 godine</strong> (1997.-2021.) -
            gotovo cijelo postojanje općine. U Velikom Bukovcu ljudi glasaju za
            onoga koga vide u crkvi i na nogometnoj utakmici nedjeljom, a ne samo
            za stranačku oznaku.
          </p>
        </div>

        {/* Previous mayors */}
        <div className="not-prose mt-8">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">
            Prethodni načelnici
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {mayorFacts.predecessors.map((predecessor) => (
              <div
                key={predecessor.name}
                className="rounded-lg border border-neutral-200 bg-white p-4"
              >
                <div className="font-medium text-neutral-900">
                  {predecessor.name}
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                  {predecessor.party} • {predecessor.years}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Uloga i ovlasti Section */}
      <section id="uloga-i-ovlasti" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary-600" />
          Uloga i ovlasti
        </h2>

        <p className="text-lg leading-relaxed">
          Općinski načelnik je <strong>nositelj izvršne vlasti</strong> u općini.
          Građani ga biraju izravno, što mu daje demokratski legitimitet
          neovisan o Općinskom vijeću - ali i odgovornost da zastupa interese
          svih triju naselja.
        </p>

        <h3>Glavne ovlasti</h3>
        <ul>
          <li>
            <strong>Izvršavanje odluka</strong> - provodi odluke Općinskog
            vijeća i osigurava funkcioniranje lokalne samouprave
          </li>
          <li>
            <strong>Proračun</strong> - predlaže proračun i podnosi izvješća o
            izvršenju
          </li>
          <li>
            <strong>Uprava</strong> - upravlja radom Jedinstvenog upravnog odjela
            i donosi pravilnike o unutarnjem ustrojstvu
          </li>
          <li>
            <strong>Zastupanje</strong> - zastupa općinu u pravnom prometu i pred
            tijelima državne vlasti
          </li>
          <li>
            <strong>Imenovanja</strong> - imenuje i razrješuje pročelnike i
            voditelje
          </li>
        </ul>

        <h3>Odnos s Općinskim vijećem</h3>
        <p>
          Načelnik i Općinsko vijeće čine sustav &quot;kočnica i ravnoteža&quot;. Vijeće
          donosi proračun, propise i strateške odluke, a načelnik ih provodi. U
          praksi male općine poput Velikog Bukovca, suradnja je ključna - svi se
          poznaju i moraju zajedno raditi na dobrobit zajednice.
        </p>

        {/* Political culture note */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Načelnik mora balansirati interese triju sela koja svako ima
            različiti identitet. Kada dolazi pritisak izvana, lokalni
            predstavnici se udružuju bez obzira na stranačku pripadnost - u
            Velikom Bukovcu prevladava pragmatizam nad ideologijom.
          </p>
        </div>

        {/* Links to related pages */}
        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Link
            href="/vijece"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Users className="h-4 w-4" />
            Općinsko vijeće
          </Link>
          <Link
            href="/opcina"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Building2 className="h-4 w-4" />O općini
          </Link>
          <Link
            href="/usluge"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Handshake className="h-4 w-4" />
            Usluge građanima
          </Link>
        </div>
      </section>

      {/* Kontakt Section */}
      <section id="kontakt" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary-600" />
          Kontakt
        </h2>

        <p className="text-lg leading-relaxed">
          Načelnik je dostupan građanima osobno u uredu općine te putem telefona
          i e-pošte. Za prijem kod načelnika poželjno je unaprijed najaviti
          dolazak.
        </p>

        {/* Contact info card */}
        <div className="not-prose mt-6 rounded-xl border border-primary-200 bg-primary-50/50 p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Address */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
                <MapPin className="h-4 w-4" />
                Ured načelnika
              </div>
              <div className="mt-2 text-neutral-700">
                <p className="font-medium">Općina Veliki Bukovec</p>
                <p>Veliki Bukovec 89</p>
                <p>42231 Veliki Bukovec</p>
              </div>
            </div>

            {/* Hours */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
                <Clock className="h-4 w-4" />
                Radno vrijeme
              </div>
              <div className="mt-2 text-neutral-700">
                <p>Ponedjeljak - Petak</p>
                <p className="font-medium">07:00 - 15:00</p>
              </div>
            </div>

            {/* Phone */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
                <Phone className="h-4 w-4" />
                Telefon
              </div>
              <div className="mt-2">
                <a
                  href="tel:+38542840040"
                  className="font-medium text-neutral-900 hover:text-primary-600"
                >
                  042/840-040
                </a>
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
                <Mail className="h-4 w-4" />
                E-pošta
              </div>
              <div className="mt-2">
                <a
                  href="mailto:nacelnik@velikibukovec.hr"
                  className="font-medium text-neutral-900 hover:text-primary-600"
                >
                  nacelnik@velikibukovec.hr
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Documents section */}
        <h3>Dokumenti</h3>
        <p>
          Službeni dokumenti vezani uz rad načelnika dostupni su u elektroničkom
          obliku:
        </p>

        <div className="not-prose mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dokumenti"
            className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <FileText className="h-5 w-5 text-primary-600" />
            <div>
              <div className="font-medium text-neutral-900 group-hover:text-primary-600">
                Izjava o imovinskom stanju
              </div>
              <div className="text-sm text-neutral-500">PDF dokument</div>
            </div>
          </Link>
          <Link
            href="/dokumenti"
            className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <FileText className="h-5 w-5 text-primary-600" />
            <div>
              <div className="font-medium text-neutral-900 group-hover:text-primary-600">
                Program rada {mayorFacts.mandateStart}-{mayorFacts.mandateEnd}
              </div>
              <div className="text-sm text-neutral-500">PDF dokument</div>
            </div>
          </Link>
          <Link
            href="/dokumenti"
            className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <FileText className="h-5 w-5 text-primary-600" />
            <div>
              <div className="font-medium text-neutral-900 group-hover:text-primary-600">
                Godišnji plan rada
              </div>
              <div className="text-sm text-neutral-500">PDF dokument</div>
            </div>
          </Link>
          <Link
            href="/dokumenti"
            className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <FileText className="h-5 w-5 text-primary-600" />
            <div>
              <div className="font-medium text-neutral-900 group-hover:text-primary-600">
                Izvješće o radu
              </div>
              <div className="text-sm text-neutral-500">PDF dokument</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Page metadata footer */}
      <footer className="not-prose mt-12 border-t border-neutral-100 pt-6">
        <p className="text-xs text-neutral-400">
          Posljednja izmjena: 31. siječnja 2026. • Izvori: DRVB_2.pdf,
          velikibukovec.hr
        </p>
      </footer>
    </PageLayoutV2>
  );
}
