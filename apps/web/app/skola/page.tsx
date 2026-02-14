// apps/web/app/skola/page.tsx
// Gold standard page - Obrazovanje (Education) covering škola and vrtić
// Last updated: 2026-01-31
// Sources: DRVB_1.md, DRVB_2.pdf, velikibukovec.hr
import {
  Baby,
  BookOpen,
  Building2,
  Bus,
  Calendar,
  Euro,
  GraduationCap,
  Heart,
  History,
  Info,
  Landmark,
  Phone,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Obrazovanje | Općina Veliki Bukovec',
  description:
    'Obrazovanje u općini Veliki Bukovec - OŠ Veliki Bukovec (od 1830.) i Dječji vrtić Krijesnica. Od vrtića do osmog razreda, sve u lokalnoj zajednici.',
  openGraph: {
    title: 'Obrazovanje | Općina Veliki Bukovec',
    description:
      'Škola i vrtić za našu djecu - obrazovna tradicija od gotovo dva stoljeća.',
    images: ['/images/hero/veliki-bukovec-hero-1.jpg'],
  },
};

const pageSections: PageSection[] = [
  { id: 'pregled', label: 'Pregled' },
  { id: 'skola', label: 'Osnovna škola' },
  { id: 'vrtic', label: 'Dječji vrtić' },
  { id: 'kontakt', label: 'Kontakt' },
];

// Key facts from research - single source of truth
const schoolFacts = {
  founded: 1830,
  foundedBy: 'Obitelj Drašković',
  program: '8 razreda',
  settlementsServed: 3,
  location: 'Veliki Bukovec',
};

const kindergartenFacts = {
  name: 'Dječji vrtić Krijesnica',
  type: 'Podružnica',
  mainLocation: 'Mali Bukovec',
  ageRange: '3-6 godina',
  investmentYear: 2026,
};

export default function ObrazovanjePage() {
  return (
    <PageLayoutV2
      title="Obrazovanje"
      subtitle="Od vrtića do osmog razreda - obrazovna tradicija od 1830. godine u srcu Podravine"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      {/* Pregled Section */}
      <section id="pregled" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary-600" />
          Pregled
        </h2>

        <p className="text-lg leading-relaxed">
          Općina Veliki Bukovec osigurava <strong>cjelovito obrazovanje</strong> za
          svoju djecu - od predškolskog odgoja u vrtiću do završetka osnovne škole.
          Obje institucije djeluju u samom selu, što znači da djeca ne moraju putovati
          u grad za osnovno obrazovanje.
        </p>

        <p>
          Obrazovna tradicija seže do <strong>1830. godine</strong>, kada je obitelj
          Drašković osnovala školu - čineći je jednom od najstarijih u Varaždinskoj
          županiji. Danas ta tradicija živi kroz modernu osnovnu školu i nedavno
          obnovljenu podružnicu dječjeg vrtića.
        </p>

        {/* Key Facts for both institutions */}
        <div className="not-prose my-8 rounded-xl border border-primary-200 bg-primary-50/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <Sparkles className="h-5 w-5 text-primary-600" />
            Obrazovne ustanove
          </h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-primary-200 bg-white p-4">
              <div className="flex items-center gap-2 text-primary-600">
                <GraduationCap className="h-5 w-5" />
                <span className="font-semibold">Osnovna škola</span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-neutral-600">
                <li>• Osnovana: {schoolFacts.founded}.</li>
                <li>• Program: 1.-8. razred</li>
                <li>• Služi sva 3 naselja</li>
                <li>• Tradicija: {new Date().getFullYear() - schoolFacts.founded} godina</li>
              </ul>
            </div>
            <div className="rounded-lg border border-amber-200 bg-white p-4">
              <div className="flex items-center gap-2 text-amber-600">
                <Baby className="h-5 w-5" />
                <span className="font-semibold">Dječji vrtić</span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-neutral-600">
                <li>• {kindergartenFacts.name}</li>
                <li>• Podružnica u Velikom Bukovcu</li>
                <li>• Dob: {kindergartenFacts.ageRange}</li>
                <li>• Obnovljeno: {kindergartenFacts.investmentYear}.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Did you know? */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Postojanje škole i župe bilo je ključni argument kada se 1997. općina
            odvajala od Mali Bukovca. &quot;U našem selu su škola i župa - što vi imate?&quot;
            - rečenica koja je ušla u lokalnu povijest.
          </p>
        </div>
      </section>

      {/* Osnovna škola Section */}
      <section id="skola" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary-600" />
          Osnovna škola Veliki Bukovec
        </h2>

        {/* TODO: Photo - hero-skola.jpg - School building exterior, main entrance */}

        <p className="text-lg leading-relaxed">
          Osnovna škola Veliki Bukovec jedna je od{' '}
          <strong>najstarijih škola u Varaždinskoj županiji</strong>. Osnovana
          1830. godine zaslugom obitelji{' '}
          <Link href="/opcina" className="text-primary-600 hover:underline">
            Drašković
          </Link>
          , škola je gotovo dva stoljeća neprekidno obrazovala generacije djece
          iz sva tri naselja općine -{' '}
          <Link
            href="/opcina/naselja/veliki-bukovec"
            className="text-primary-600 hover:underline"
          >
            Velikog Bukovca
          </Link>
          ,{' '}
          <Link
            href="/opcina/naselja/dubovica"
            className="text-primary-600 hover:underline"
          >
            Dubovice
          </Link>{' '}
          i{' '}
          <Link
            href="/opcina/naselja/kapela-podravska"
            className="text-primary-600 hover:underline"
          >
            Kapele Podravske
          </Link>
          .
        </p>

        <p>
          U doba kada država nije pružala obrazovanje, upravo su{' '}
          <strong>Crkva i plemstvo</strong> bili jedini koji su seljačkoj djeci
          otvarali vrata pismenosti. Grofovi Drašković, koji su deset godina
          ranije sagradili i{' '}
          <Link href="/zupa" className="text-primary-600 hover:underline">
            župnu crkvu sv. Franje Asiškog
          </Link>
          , financirali su i osnivanje škole - time utirući put obrazovanju
          koji traje do danas. Ta tradicija obrazovanja bila je ključna za
          identitet sela: kada se 1997. godine općina odvajala od Mali Bukovca,
          jedan od najjačih argumenata bio je upravo: &quot;U našem selu su škola i
          župa - što vi imate?&quot;
        </p>

        {/* Did you know? Box */}
        <div className="not-prose my-6 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Škola u Velikom Bukovcu osnovana je samo deset godina nakon župne
            crkve (1820.), što pokazuje koliko je obrazovanje bilo važno
            obitelji Drašković. U to doba, pismena djeca bila su rijetkost u
            Podravini - većina seljaka nikada nije naučila čitati ni pisati.
          </p>
        </div>

        <h3 className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary-600" />
          Povijest škole
        </h3>

        <p className="text-lg leading-relaxed">
          Povijest škole u Velikom Bukovcu neodvojiva je od povijesti plemićkog
          posjeda i župe. U doba feudalizma, obrazovanje je bilo privilegija -
          a obitelj Drašković odlučila je tu privilegiju proširiti i na svoju
          podložnu djecu.
        </p>

        {/* TODO: Photo - skola-historic.jpg - Historic school photo if available from archives */}

        {/* Timeline */}
        <div className="not-prose mt-8 space-y-8">
          {/* 1820 - Church built */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1820.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Grof Karlo Drašković gradi župnu crkvu
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Izgradnjom crkve sv. Franje Asiškog, Draškovići postavljaju
              temelje duhovne i obrazovne infrastrukture posjeda. Crkva postaje
              središte zajednice i administrativno sjedište za buduće školovanje.
            </p>
          </div>

          {/* 1830 - School founded */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1830.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Osnivanje škole
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Obitelj Drašković financira osnivanje pučke škole u Velikom
              Bukovcu. U doba kada država ne pruža obrazovanje, plemstvo i Crkva
              preuzimaju ulogu pružatelja pismenosti. Škola postaje jedna od
              najstarijih u Varaždinskoj županiji.
            </p>
          </div>

          {/* 1848 - End of feudalism */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1848.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Ukidanje kmetstva
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Kraj feudalizma donosi promjene u upravljanju školom. Postupno,
              država preuzima odgovornost za obrazovanje, ali škola u Velikom
              Bukovcu nastavlja kontinuirano djelovati.
            </p>
          </div>

          {/* Early 20th century */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              Početak 20. stoljeća
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Širenje mreže škola
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              U doba demografskog vrhunca (općina tada ima preko 2.100
              stanovnika), i okolna sela dobivaju manje škole. Dubovica i Kapela
              Podravska imaju vlastite razredne odjele za najmlađe učenike.
            </p>
          </div>

          {/* Socialist period */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              1945.-1990.
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Socijalističko razdoblje
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Škola se modernizira i proširuje na osmogodišnji program.
              Međutim, demografski trendovi već pokazuju znakove pada - mladi
              odlaze na rad u Njemačku i Austriju (gastarbajteri), a ruralno
              stanovništvo se smanjuje.
            </p>
          </div>

          {/* School closures */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              1970-te - 1990-te
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Zatvaranje područnih škola
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Zbog pada broja djece, manje škole u Dubovici i Kapeli Podravskoj
              postupno se zatvaraju. Sva djeca iz općine sada pohađaju
              centraliziranu školu u Velikom Bukovcu, kamo putuju školskim
              autobusom.
            </p>
          </div>

          {/* 1997 split */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1997.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Škola kao argument za samostalnost
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Kada se tri sela odvajaju od Mali Bukovca i osnivaju vlastitu
              općinu, postojanje škole i župe u Velikom Bukovcu ključni su
              argumenti za legitimitet. &quot;U našem selu su škola i župa&quot; - rečenica
              koja je ušla u lokalnu povijest.
            </p>
          </div>

          {/* Today */}
          <div className="relative pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-600 bg-primary-600" />
            <div className="text-sm font-medium text-primary-600">Danas</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Obrazovanje za novu generaciju
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Škola nastavlja djelovati s osmogodišnjim programom, obrazujući
              djecu iz sva tri naselja općine te dijelom i iz susjedne općine
              Mali Bukovec. Demografski izazovi ostaju, ali tradicija od gotovo
              dva stoljeća ne prekida se.
            </p>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose mt-8 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Zatvaranje NK Croatia Dubovica zbog &quot;nedostatka mladih&quot; bio je
            jasan pokazatelj demografske situacije. Ista priča prijeti i drugim
            institucijama - bez kritične mase mladih obitelji, teško je održati
            školski razred, nogometnu ekipu ili dobrovoljno vatrogasno društvo.
          </p>
        </div>

        <h3 className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary-600" />
          Škola danas
        </h3>

        <p>
          Danas OŠ Veliki Bukovec pruža cjelovito osmogodišnje osnovno
          obrazovanje. Škola okuplja djecu iz sva tri naselja općine te
          dijelom služi i susjednu općinu Mali Bukovec - čime se osigurava
          dovoljan broj učenika za održavanje nastave.
        </p>

        {/* TODO: Photo - skola-djeca.jpg - Students in activities (with parental permission) */}

        <h3>Centralna škola za tri sela</h3>
        <p>
          Djeca iz <strong>Dubovice</strong> i <strong>Kapele Podravske</strong>{' '}
          svakodnevno putuju školskim autobusom do Velikog Bukovca. Ono što je
          nekad bio pješački put od nekoliko kilometara, danas je kratka vožnja
          - ali ta centralizacija odražava širi trend ruralnog prostora: manja
          sela gube vlastite škole, a djeca se koncentriraju u općinskom
          središtu.
        </p>

        <p>
          Za razliku od mnogih ruralnih općina koje su potpuno izgubile škole,
          Veliki Bukovec uspijeva održati puni osmogodišnji program. Škola nije
          samo obrazovna institucija - ona je <strong>sidro zajednice</strong>,
          mjesto gdje se susreću generacije i gdje se prenosi lokalni identitet.
        </p>

        {/* School life cards */}
        <div className="not-prose mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Bus className="h-6 w-6 text-primary-600" />
              <h4 className="font-semibold text-neutral-900">
                Školski prijevoz
              </h4>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Organizirani prijevoz za djecu iz Dubovice i Kapele Podravske.
              Autobusna linija povezuje sva tri naselja sa školom u Velikom
              Bukovcu.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-primary-600" />
              <h4 className="font-semibold text-neutral-900">
                Osmogodišnji program
              </h4>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Potpuni program od 1. do 8. razreda. Djeca ne moraju putovati u
              grad za osnovno obrazovanje - sve se odvija u lokalnoj zajednici.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary-600" />
              <h4 className="font-semibold text-neutral-900">
                Suradnja s Mali Bukovcom
              </h4>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Škola prima i učenike iz susjedne općine Mali Bukovec, što
              pomaže održati dovoljan broj učenika za kvalitetnu nastavu.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Landmark className="h-6 w-6 text-primary-600" />
              <h4 className="font-semibold text-neutral-900">
                Očuvanje tradicije
              </h4>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Kroz školske aktivnosti djeca upoznaju lokalnu povijest, baštinu
              i tradiciju - od Draškovića do suvremenog cvjećarstva.
            </p>
          </div>
        </div>

        <h3>Demografski izazovi</h3>
        <p>
          Kao i cijela općina, škola se suočava s demografskim izazovima.
          Mladih obitelji je sve manje, a broj novorođenih nekih godina može
          se izbrojiti na prste jedne ruke. Ipak, škola opstaje zahvaljujući:
        </p>

        <ul>
          <li>
            <strong>Regionalnoj ulozi</strong> - služi šire područje, uključujući
            dio Mali Bukovca
          </li>
          <li>
            <strong>Tradiciji</strong> - gotovo dva stoljeća kontinuiranog rada
            stvara institucionalnu stabilnost
          </li>
          <li>
            <strong>Lokalnoj podršci</strong> - zajednica prepoznaje školu kao
            ključnu instituciju za opstanak sela
          </li>
        </ul>

        {/* Quote box */}
        <div className="not-prose mt-8 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Ironija: {`"Mali"`} Bukovec (susjedna općina) zapravo ima više
            stanovnika (~1.800) nego {`"Veliki"`} Bukovec (~1.325). Imena potječu
            iz doba kada su se odnosila na veličinu posjeda, a ne broj
            stanovnika. Ipak, Veliki Bukovec ima ono što Mali nema - školu i
            župu.
          </p>
        </div>

      </section>

      {/* Dječji vrtić Section */}
      <section id="vrtic" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Baby className="h-5 w-5 text-primary-600" />
          Dječji vrtić Krijesnica
        </h2>

        <p className="text-lg leading-relaxed">
          Za najmlađe stanovnike općine, u Velikom Bukovcu djeluje{' '}
          <strong>podružnica Dječjeg vrtića &quot;Krijesnica&quot;</strong>. Glavni vrtić
          nalazi se u susjednoj općini Mali Bukovec, ali podružnica osigurava da
          djeca iz Velikog Bukovca ne moraju putovati daleko za predškolski odgoj.
        </p>

        {/* TODO: Photo - vrtic.jpg - Kindergarten building or children at play */}

        <p>
          Vrtić prima djecu od <strong>3 do 6 godina</strong> starosti. Program
          predškolskog odgoja priprema djecu za polazak u osnovnu školu, razvijajući
          socijalne vještine, kreativnost i temeljne obrazovne kompetencije kroz
          igru i strukturirane aktivnosti.
        </p>

        {/* Recent investment highlight */}
        <div className="not-prose my-6 rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-start gap-3">
            <Euro className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900">
                Ulaganje u kvalitetu (2026.)
              </h4>
              <p className="mt-2 text-sm text-green-800">
                Prema podacima općinske uprave, podružnica vrtića u Velikom Bukovcu
                dobila je značajna ulaganja u okviru projekta poboljšanja uvjeta za
                predškolski odgoj, uz potporu Ministarstva demografije i useljeništva.
              </p>
              <p className="mt-2 text-sm text-green-700">
                Cilj: poboljšati materijalne uvjete stvarajući sigurno, poticajno i
                edukativno okruženje za djecu.
              </p>
            </div>
          </div>
        </div>

        {/* Kindergarten info cards */}
        <div className="not-prose mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-amber-600" />
              <h4 className="font-semibold text-neutral-900">Lokacija</h4>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Podružnica u Velikom Bukovcu. Glavni vrtić &quot;Krijesnica&quot; u Mali Bukovcu.
              Djeca iz svih naselja općine mogu pohađati.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-amber-600" />
              <h4 className="font-semibold text-neutral-900">Upisi</h4>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Upisi se provode svake godine u proljeće za sljedeću pedagošku godinu.
              Oglas se objavljuje na web stranici općine.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-amber-600" />
              <h4 className="font-semibold text-neutral-900">Dob</h4>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Djeca od 3 godine (navršenih do 1. rujna) do polaska u školu.
              Redoviti program predškolskog odgoja.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-amber-600" />
              <h4 className="font-semibold text-neutral-900">Program</h4>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Cjelodnevni program s naglaskom na igru, socijalizaciju i pripremu
              za školu. Uključuje tjelesne aktivnosti i kreativno izražavanje.
            </p>
          </div>
        </div>

        {/* Did you know? */}
        <div className="not-prose mt-6 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Ulaganje u vrtić dio je šire strategije ulaganja u mlade obitelji.
            Kvalitetan predškolski odgoj u samom selu smanjuje potrebu za
            svakodnevnim putovanjem u grad - što je posebno važno za roditelje
            koji rade u cvjećarstvu ili poljoprivredi.
          </p>
        </div>
      </section>

      {/* Kontakt Section */}
      <section id="kontakt" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary-600" />
          Kontakt i upisi
        </h2>

        <p className="text-lg leading-relaxed">
          Za sve informacije o upisu u školu ili vrtić, obratite se općinskoj
          upravi u Velikom Bukovcu. Oglasi za upis objavljuju se na web stranici
          i oglasnoj ploči općine.
        </p>

        <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
          {/* School contact */}
          <div className="rounded-xl border border-primary-200 bg-primary-50/30 p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900">
              <GraduationCap className="h-5 w-5 text-primary-600" />
              Osnovna škola
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-neutral-500">Lokacija</dt>
                <dd className="font-medium text-neutral-900">Veliki Bukovec, 42231</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Upis</dt>
                <dd className="font-medium text-neutral-900">Veljača/ožujak svake godine</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Informacije</dt>
                <dd className="font-medium text-neutral-900">Općinska uprava</dd>
              </div>
            </dl>
          </div>

          {/* Kindergarten contact */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900">
              <Baby className="h-5 w-5 text-amber-600" />
              Dječji vrtić Krijesnica
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-neutral-500">Podružnica</dt>
                <dd className="font-medium text-neutral-900">Veliki Bukovec</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Upis</dt>
                <dd className="font-medium text-neutral-900">Travanj/svibanj svake godine</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Dob za upis</dt>
                <dd className="font-medium text-neutral-900">3+ godine (do 1. rujna)</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Related links */}
        <div className="not-prose mt-8">
          <h3 className="mb-4 font-semibold text-neutral-900">
            Povezane stranice
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/kontakt"
              className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
            >
              <Phone className="h-5 w-5 text-primary-600" />
              <div>
                <div className="font-medium text-neutral-900">Kontakt</div>
                <div className="text-sm text-neutral-500">Općinska uprava</div>
              </div>
            </Link>
            <Link
              href="/usluge"
              className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
            >
              <Info className="h-5 w-5 text-primary-600" />
              <div>
                <div className="font-medium text-neutral-900">Usluge</div>
                <div className="text-sm text-neutral-500">Za roditelje</div>
              </div>
            </Link>
            <Link
              href="/zupa"
              className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
            >
              <Landmark className="h-5 w-5 text-primary-600" />
              <div>
                <div className="font-medium text-neutral-900">Župa</div>
                <div className="text-sm text-neutral-500">Sv. Franje Asiškoga</div>
              </div>
            </Link>
            <Link
              href="/opcina"
              className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
            >
              <Building2 className="h-5 w-5 text-primary-600" />
              <div>
                <div className="font-medium text-neutral-900">Općina</div>
                <div className="text-sm text-neutral-500">O Velikom Bukovcu</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Page metadata footer */}
      <footer className="not-prose mt-12 border-t border-neutral-100 pt-6">
        <p className="text-xs text-neutral-400">
          Posljednja izmjena: 31. siječnja 2026. • Izvori: DRVB_1.md, DRVB_2.pdf,
          velikibukovec.hr, Varaždinska biskupija
        </p>
      </footer>
    </PageLayoutV2>
  );
}
