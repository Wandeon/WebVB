// apps/web/app/vijece/page.tsx
// Gold standard page following Blueprint A (About Entity) pattern
// Last updated: 2026-01-31
// Sources: DRVB_2.pdf "Political DNA" section, velikibukovec.hr
import {
  Award,
  BookOpen,
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
  UserCircle,
  Users,
  Vote,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Obecinsko vijece | Opcina Veliki Bukovec',
  description:
    'Obecinsko vijece Opcine Veliki Bukovec - predstavnicko tijelo gradana koje donosi odluke o svim pitanjima od lokalnog znacaja. 7 clanova, predsjednik Miran Stjepan Posavec.',
  openGraph: {
    title: 'Obecinsko vijece | Opcina Veliki Bukovec',
    description:
      'Obecinsko vijece - predstavnicko tijelo gradana Opcine Veliki Bukovec. Sjednice su javne.',
    images: ['/images/hero/veliki-bukovec-hero-1.jpg'],
  },
};

const pageSections: PageSection[] = [
  { id: 'o-vijecu', label: 'O vijecu' },
  { id: 'clanovi-vijeca', label: 'Clanovi vijeca' },
  { id: 'kako-radi', label: 'Kako radi' },
  { id: 'kontakt', label: 'Kontakt' },
];

// Council data - single source of truth
interface CouncilMember {
  name: string;
  role?: 'Predsjednik' | 'Potpredsjednik';
  party: string;
  village?: string;
  initials: string;
}

const councilFacts = {
  totalMembers: 7,
  president: 'Miran Stjepan Posavec',
  vicePresident: 'Mirko Mikulcic',
  mandateStart: 2021,
  mandateEnd: 2025,
  sessionFrequency: 'prema potrebi, u pravilu mjesecno',
  quorum: 4,
  majorityRule: 'Vecina prisutnih clanova',
};

const councilMembers: CouncilMember[] = [
  {
    name: 'Miran Stjepan Posavec',
    role: 'Predsjednik',
    party: 'HDZ',
    initials: 'MP',
  },
  {
    name: 'Mirko Mikulcic',
    role: 'Potpredsjednik',
    party: 'HDZ',
    initials: 'MM',
  },
  { name: 'Darko Trstenjak', party: 'HDZ', initials: 'DT' },
  { name: 'Zeljko Pintaric', party: 'HDZ', initials: 'ZP' },
  { name: 'Josip Pintaric', party: 'HDZ', initials: 'JP' },
  { name: 'Dragutin Matosa', party: 'SDP', initials: 'DM' },
  { name: 'Marijan Spoljar', party: 'SDP', initials: 'MS' },
];

export default function VjecePage() {
  return (
    <PageLayoutV2
      title="Obecinsko vijece"
      subtitle="Predstavnicko tijelo gradana Opcine Veliki Bukovec - zakonodavna vlast"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      {/* O vijecu Section */}
      <section id="o-vijecu" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary-600" />O vijecu
        </h2>

        <p className="text-lg leading-relaxed">
          Obecinsko vijece je <strong>predstavnicko tijelo gradana</strong> i
          nositelj zakonodavne vlasti u opcini. Vijece donosi odluke o svim
          pitanjima od lokalnog znacaja: od proracuna i prostornog uredenja do
          komunalnih naknada i financiranja udruga.
        </p>

        <p>
          U Velikom Bukovcu lokalna politika pociva na{' '}
          <strong>osobnim vezama i povjerenju</strong>. Ista prezimena pojavljuju
          se u vijecima kroz desetljeca - nije rijec o nepotizmu, vec o dubokoj
          ukorijenjenosti obitelji u zivot zajednice. Gradani glasaju za osobu
          koju poznaju iz svakodnevnog zivota, ne samo za stranacku oznaku.
        </p>

        <p>
          Vijece predstavlja sva tri naselja opcine:{' '}
          <strong>Veliki Bukovec, Dubovicu i Kapelu</strong>. Odluke zahtijevaju
          konsenzus jer svako selo ima specificne potrebe - od odrzavanja
          odvodnih kanala do traktorskih putova. Kada dolazi pritisak izvana,
          vijecnici se udruzuju bez obzira na stranacku pripadnost.
        </p>

        {/* Key Facts Utility Container */}
        <div className="not-prose my-8 rounded-xl border border-primary-200 bg-primary-50/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <Sparkles className="h-5 w-5 text-primary-600" />
            Kljucne cinjenice
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Broj clanova</div>
                <div className="font-semibold">{councilFacts.totalMembers}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Predsjednik</div>
                <div className="font-semibold">{councilFacts.president}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Mandat</div>
                <div className="font-semibold">
                  {councilFacts.mandateStart}.-{councilFacts.mandateEnd}.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Sjednice</div>
                <div className="font-semibold">Mjesecno</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Vote className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Kvorum</div>
                <div className="font-semibold">
                  {councilFacts.quorum} clana (vecina)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Predstavlja</div>
                <div className="font-semibold">3 naselja</div>
              </div>
            </div>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Predsjednici dobrovoljnih vatrogasnih drustava cesto sjede u
            opcinskomu vijecu. Obitelji poput <strong>Pozgaja</strong> (drvna
            industrija) i <strong>Peceneca</strong> (pilana) imaju utjecaj koji
            nadilazi formalnu politiku. I glas zupnika ima tezinu u odlukama
            zajednice.
          </p>
        </div>
      </section>

      {/* Clanovi vijeca Section */}
      <section id="clanovi-vijeca" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-primary-600" />
          Clanovi vijeca
        </h2>

        <p className="text-lg leading-relaxed">
          Obecinsko vijece broji <strong>{councilFacts.totalMembers} clanova</strong>{' '}
          izabranih na lokalnim izborima. Mandat traje cetiri godine. Vijecnici
          zastupaju interese gradana i donose odluke o svim pitanjima u
          nadleznosti opcine.
        </p>

        {/* President highlight card */}
        <div className="not-prose mb-6 rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Photo placeholder */}
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-primary-100">
              <div className="flex h-full items-center justify-center text-2xl font-semibold text-primary-600">
                {councilMembers[0]?.initials}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-primary-600">
                Predsjednik vijeca
              </div>
              <h3 className="mt-1 text-xl font-bold text-neutral-900">
                {councilFacts.president}
              </h3>
              <p className="mt-2 text-neutral-600">
                Predsjednik vodi sjednice vijeca, potpisuje akte i predstavlja
                vijece. Bira se vecinom glasova svih clanova vijeca na
                konstituirajucoj sjednici.
              </p>
            </div>
          </div>
        </div>

        {/* Council members grid */}
        <div className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {councilMembers.map((member) => (
            <div
              key={member.name}
              className={`rounded-xl border p-4 transition-colors ${
                member.role
                  ? 'border-primary-200 bg-primary-50/30 hover:border-primary-300'
                  : 'border-neutral-200 bg-white hover:border-primary-300'
              }`}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <span className="font-semibold text-primary-600">
                  {member.initials}
                </span>
              </div>
              <div className="font-medium text-neutral-900">{member.name}</div>
              {member.role && (
                <div className="mt-1 text-sm font-medium text-primary-600">
                  {member.role}
                </div>
              )}
              <div className="mt-1 text-sm text-neutral-500">{member.party}</div>
            </div>
          ))}
        </div>

        {/* Party composition */}
        <div className="not-prose mt-6 rounded-lg bg-neutral-50 p-4">
          <h4 className="text-sm font-medium text-neutral-700">
            Stranacki sastav vijeca
          </h4>
          <div className="mt-2 flex gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm text-neutral-600">
                HDZ:{' '}
                {councilMembers.filter((m) => m.party === 'HDZ').length} mjesta
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm text-neutral-600">
                SDP:{' '}
                {councilMembers.filter((m) => m.party === 'SDP').length} mjesta
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Kako radi Section */}
      <section id="kako-radi" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary-600" />
          Kako radi vijece
        </h2>

        <p className="text-lg leading-relaxed">
          Vijece odrzava <strong>redovite sjednice</strong> prema godisnjem planu
          rada. Sve sjednice su javne - gradani mogu prisustvovati uz prethodnu
          najavu. Odluke se donose vecinom glasova prisutnih clanova, pod uvjetom
          da je prisutna vecina od ukupnog broja clanova (kvorum).
        </p>

        <h3>Nadleznosti vijeca</h3>
        <ul>
          <li>
            <strong>Proracun</strong> - donosi godisnji proracun i zavrsni racun
            opcine
          </li>
          <li>
            <strong>Propisi</strong> - donosi Statut, Poslovnik, odluke i druge
            opce akte
          </li>
          <li>
            <strong>Komunalno</strong> - odlucuje o komunalnim naknadama,
            odrzavanju cesta i javnih povrsina
          </li>
          <li>
            <strong>Financije</strong> - raspolaze imovinom opcine, odlucuje o
            zaduživanju
          </li>
          <li>
            <strong>Imenovanja</strong> - bira predsjednika vijeca, osniva radna
            tijela
          </li>
          <li>
            <strong>Nadzor</strong> - kontrolira rad nacelnika i upravnih tijela
          </li>
        </ul>

        <h3>Odnos s nacelnikom</h3>
        <p>
          Vijece i nacelnik cine sustav{' '}
          <strong>&quot;kocnica i ravnoteza&quot;</strong>. Vijece je zakonodavna
          vlast - donosi propise, proracun i strateske odluke. Nacelnik je
          izvrsna vlast - provodi odluke vijeca i upravlja opcinom. U praksi male
          opcine, suradnja je nuzna jer se svi poznaju i moraju zajedno raditi za
          dobrobit zajednice.
        </p>

        {/* Session info box */}
        <div className="not-prose my-6 rounded-xl bg-primary-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
              <Calendar className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <div className="font-medium text-neutral-900">Sjednice vijeca</div>
              <p className="mt-1 text-neutral-600">
                Sjednice se odrzavaju {councilFacts.sessionFrequency}. Pozivi i
                dnevni red objavljuju se na oglasnoj ploci i web stranici opcine
                najmanje 3 dana prije sjednice. Zapisnici su dostupni u arhivi
                dokumenata.
              </p>
            </div>
          </div>
        </div>

        {/* Political culture note */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Lokalna politika u Velikom Bukovcu dominirana je{' '}
            <strong>pragmatizmom</strong>, ne ideologijom. Vijece se bavi
            konkretnimproblema: odvodnjavanjem kanala, odvozom otpada,
            financiranjem traktorskih putova. Kada zajednica osjeti pritisak
            izvana, vijecnici se udruzuju bez obzira na stranku.
          </p>
        </div>

        {/* Links to related pages */}
        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Link
            href="/nacelnik"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Award className="h-4 w-4" />
            Nacelnik opcine
          </Link>
          <Link
            href="/opcina"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Building2 className="h-4 w-4" />O opcini
          </Link>
          <Link
            href="/usluge"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Handshake className="h-4 w-4" />
            Usluge gradanima
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
          Sjednice vijeca su javne. Gradani koji zele prisustvovati trebaju se
          najaviti u Jedinstvenom upravnom odjelu. Za pitanja i predstavke
          gradani se mogu obratiti predsjedniku vijeca ili bilo kojem vijecniku.
        </p>

        {/* Contact info card */}
        <div className="not-prose mt-6 rounded-xl border border-primary-200 bg-primary-50/50 p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Address */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
                <MapPin className="h-4 w-4" />
                Sjediste vijeca
              </div>
              <div className="mt-2 text-neutral-700">
                <p className="font-medium">Opcina Veliki Bukovec</p>
                <p>Veliki Bukovec 89</p>
                <p>42231 Veliki Bukovec</p>
              </div>
            </div>

            {/* Session location */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
                <Building2 className="h-4 w-4" />
                Mjesto odrzavanja sjednica
              </div>
              <div className="mt-2 text-neutral-700">
                <p>Vijećnica Opcine Veliki Bukovec</p>
                <p className="text-sm text-neutral-500">
                  (zgrada Jedinstvenog upravnog odjela)
                </p>
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
                E-posta
              </div>
              <div className="mt-2">
                <a
                  href="mailto:opcina@velikibukovec.hr"
                  className="font-medium text-neutral-900 hover:text-primary-600"
                >
                  opcina@velikibukovec.hr
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* How to attend */}
        <h3>Kako prisustvovati sjednici</h3>
        <ol>
          <li>
            Provjerite datum i vrijeme sjednice na{' '}
            <Link href="/obavijesti" className="text-primary-600 hover:underline">
              stranici obavijesti
            </Link>
          </li>
          <li>
            Najavite dolazak telefonom ili e-postom najkasnije dan prije sjednice
          </li>
          <li>Dodite na vrijeme - sjednice pocinju tocno</li>
          <li>
            Gradani mogu postavljati pitanja u dijelu sjednice predvidenom za
            raspravu
          </li>
        </ol>

        {/* Documents section */}
        <h3>Dokumenti</h3>
        <p>
          Sluzbeni dokumenti Opcinskogu vijeca dostupni su u elektronickom obliku:
        </p>

        <div className="not-prose mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dokumenti?kategorija=sjednice"
            className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <FileText className="h-5 w-5 text-primary-600" />
            <div>
              <div className="font-medium text-neutral-900 group-hover:text-primary-600">
                Zapisnici sjednica
              </div>
              <div className="text-sm text-neutral-500">
                Zapisnici i odluke sa sjednica
              </div>
            </div>
          </Link>
          <Link
            href="/dokumenti?kategorija=statut"
            className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <BookOpen className="h-5 w-5 text-primary-600" />
            <div>
              <div className="font-medium text-neutral-900 group-hover:text-primary-600">
                Statut opcine
              </div>
              <div className="text-sm text-neutral-500">
                Temeljni akt o ustrojstvu i djelovanju
              </div>
            </div>
          </Link>
          <Link
            href="/dokumenti?kategorija=sjednice"
            className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <FileText className="h-5 w-5 text-primary-600" />
            <div>
              <div className="font-medium text-neutral-900 group-hover:text-primary-600">
                Poslovnik vijeca
              </div>
              <div className="text-sm text-neutral-500">
                Pravila o radu vijeca
              </div>
            </div>
          </Link>
          <Link
            href="/dokumenti"
            className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <FileText className="h-5 w-5 text-primary-600" />
            <div>
              <div className="font-medium text-neutral-900 group-hover:text-primary-600">
                Svi dokumenti
              </div>
              <div className="text-sm text-neutral-500">
                Pregled svih sluzbenih dokumenata
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Page metadata footer */}
      <footer className="not-prose mt-12 border-t border-neutral-100 pt-6">
        <p className="text-xs text-neutral-400">
          Posljednja izmjena: 31. sijecnja 2026. - Izvori: DRVB_2.pdf,
          velikibukovec.hr
        </p>
      </footer>
    </PageLayoutV2>
  );
}
