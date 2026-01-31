// apps/web/app/naselja/kapela/page.tsx
// Gold standard village profile page following Blueprint B
// Last updated: 2026-01-31
// Sources: DRVB_2.pdf "Kapela Podravska" section, Croatian Census 2021
import {
  AlertTriangle,
  Church,
  Factory,
  Flame,
  Flower2,
  History,
  Info,
  Landmark,
  MapPin,
  Sparkles,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../../components/page-layout-v2';

import type { PageSection } from '../../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kapela Podravska | Općina Veliki Bukovec',
  description:
    'Kapela Podravska - marljivo selo od ~400 stanovnika, središta cvjecarstva i drvne industrije. Pilana Pečenec, obitelj Mađarić, DVD i NK Poljoprivrednik.',
  openGraph: {
    title: 'Kapela Podravska | Općina Veliki Bukovec',
    description:
      'Industrijsko srce općine - pilana Pečenec, najveći cvjećari u Hrvatskoj, i zajednica koja ne čeka pomoc izvana.',
    images: ['/images/hero/veliki-bukovec-hero-2.jpg'],
  },
};

const pageSections: PageSection[] = [
  { id: 'o-naselju', label: 'O naselju' },
  { id: 'povijest', label: 'Povijest' },
  { id: 'gospodarstvo', label: 'Gospodarstvo' },
  { id: 'znamenitosti', label: 'Znamenitosti' },
  { id: 'udruge', label: 'Udruge i društva' },
];

// Key facts from research - single source of truth
const keyFacts = {
  population: '~400',
  populationYear: 2021,
  character: 'Marljivo radilište',
  nameOrigin: '"Kapela" = kapelica',
  mainIndustry: 'Pilana Pečenec',
  flowerProducer: 'Obitelj Mađarić',
  flowerYears: '30+',
  hailstormYear: 2022,
};

export default function KapelaPage() {
  return (
    <PageLayoutV2
      title="Kapela Podravska"
      subtitle="Marljivo radilište općine - selo koje ne čeka pomoc izvana, vec gradi samo"
      heroImage="/images/hero/veliki-bukovec-hero-2.jpg"
      sections={pageSections}
    >
      {/* O naselju Section */}
      <section id="o-naselju" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary-600" />O naselju
        </h2>

        <p className="text-lg leading-relaxed">
          Kapela Podravska češto se vidi kao{' '}
          <strong>marljivo radilište općine</strong> - selo srednje veličine od
          oko <strong>400 stanovnika</strong> koje ekonomski nadmašuje svoju
          veličinu. Zajednica ima reputaciju poduzetnosti i otpornosti. Dok
          druga sela čekaju drzavne potpore, Kapela gradi sama.
        </p>

        {/* TODO: Photo - Panorama Kapele Podravske, pogled na selo */}

        <p>
          Povijesno nazvano po kapeli ("Kapela" doslovno znaci kapelica), nekad
          je bilo satelit bukoveckog imanja Drašković. Danas je Kapela poznata
          po obiteljskim tvrtkama - posebno{' '}
          <strong>pilani Pečenec</strong> i brojnim cvjećarnicama. U selu vlada
          praktična, neposredna atmosfera. Drustveno, ljudi se ponose{' '}
          <strong>marljivošću i samopouzdanjem</strong>.
        </p>

        <p>
          Interna napetost Kapele lezi u{' '}
          <strong>ravnotezi ekonomskog uspjeha i kvalitete života</strong>. Selo
          ima neke od najuspješnijih OPG-ova u regiji - poput obitelji Mađarić,
          jednih od najvećih proizvodaca cvijeća u Hrvatskoj. No uspjeh donosi
          izazove: vrhunac sezone znaci rad 24/7, ostavljajuci malo vremena za
          društvene događaje.
        </p>

        {/* Key Facts Utility Container */}
        <div className="not-prose my-8 rounded-xl border border-primary-200 bg-primary-50/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <Sparkles className="h-5 w-5 text-primary-600" />
            Ključne činjenice
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Stanovništvo</div>
                <div className="font-semibold">
                  {keyFacts.population}{' '}
                  <span className="text-sm font-normal text-neutral-500">
                    ({keyFacts.populationYear}.)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Karakter</div>
                <div className="font-semibold">{keyFacts.character}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Church className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Ime</div>
                <div className="font-semibold">{keyFacts.nameOrigin}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Factory className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Industrija</div>
                <div className="font-semibold">{keyFacts.mainIndustry}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Flower2 className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Cvjećarstvo</div>
                <div className="font-semibold">{keyFacts.flowerProducer}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Tradicija cvijeća</div>
                <div className="font-semibold">{keyFacts.flowerYears} godina</div>
              </div>
            </div>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Ime sela "Kapela" upućuje na ranu kapelicu koja je dala naselju
            identitet - no danas nema župne crkve, samo malu putnu kapelicu.
            Vjersko središta je u Velikom Bukovcu, što neki vide kao ironiju:
            "Dajemo toliko gospodarski, a ipak idemo u njihovu crkvu."
          </p>
        </div>

        {/* Links to related pages */}
        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Link
            href="/općina"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <MapPin className="h-4 w-4" />O opčini
          </Link>
          <Link
            href="/naselja/veliki-bukovec"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Landmark className="h-4 w-4" />
            Veliki Bukovec
          </Link>
          <Link
            href="/naselja/dubovica"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Flower2 className="h-4 w-4" />
            Dubovica
          </Link>
        </div>
      </section>

      {/* Povijest Section */}
      <section id="povijest" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary-600" />
          Povijest
        </h2>

        <p className="text-lg leading-relaxed">
          Povijest Kapele Podravske je prica o transformaciji - od malog
          satelita bukoveckog imanja do industrijskog srca općine. Ime čuva
          sjećanje na kapelicu koja je nekad bila središta sela, a danas selo
          gradi novi identitet kroz rad.
        </p>

        {/* Timeline */}
        <div className="not-prose mt-8 space-y-8">
          {/* Name origin */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              Rano razdoblje
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Kapelica daje ime selu
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Selo dobiva ime po maloj kapelici koja je služila kao duhovno
              središta zajednice. "Kapela" doslovno znaci kapelica na hrvatskom
              - jednostavno ime za jednostavne ljude koji su živjeli od zemlje.
            </p>
          </div>

          {/* Part of estate */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              17.-19. stoljeće
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Satelit bukoveckog imanja
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Kapela Podravska dio je širokog posjeda obitelji Drašković koji je
              obuhvaćao sedam sela. Kao manje naselje, Kapela je bila u sjeni
              Velikog Bukovca gdje su bili dvorac, crkva i središta upravljanja.
              Mještani su radili na imanju, ali nisu imali vlastite institucije.
            </p>
          </div>

          {/* End of feudalism */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1848.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Kraj kmetstva - počinje samostalnost
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Ukidanje kmetstva donosi novu eru. Obitelji u Kapeli postaju
              vlasnici vlastite zemlje i počinje se razvijati poduzetnicki duh
              koji definira selo do danas. Bez patronata plemstva, moraju se
              osloniti na vlastite snage.
            </p>
          </div>

          {/* 20th century - sawmill */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              20. stoljeće
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Pilana Pečenec transformira selo
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Obitelj Pečenec pokreće pilanu koja ce postati jedan od glavnih
              poslodavaca općine. Tradicija obrade drva - koja seze do šuma oko
              Drave i šume Križančije - pretvara se u modernu industriju.
              Kapela vise nije samo poljoprivredno selo.
            </p>
          </div>

          {/* Flower boom */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              1990-te - danas
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Boom cvjecarstva - Mađarići predvode
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Obitelj Mađarić počinje s uzgojem cvijeća i tijekom 30+ godina
              prerasta u jednog od najvećih proizvodaca u Hrvatskoj. Njihov
              uspjeh inspirira druge obitelji. Danas je Kapela, zajedno s
              Dubovicom, središta nacionalne proizvodnje cvijeća.
            </p>
          </div>

          {/* 2022 hailstorm */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-red-500 bg-white" />
            <div className="text-sm font-medium text-red-600">Svibanj 2022.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Razorna tuča - zajednica se ujedinjuje
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Tuča uništava 50% hrvatske proizvodnje cvijeća - jer se toliko
              proizvodi upravo ovdje. Staklenici i plastenici sravnjeni su sa
              zemljom u 15 minuta. No susjedi se ujedinjuju da spase što se
              spasiti može - solidarnost u radu pokazuje pravu snagu Kapele.
            </p>
          </div>

          {/* Today */}
          <div className="relative pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-600 bg-primary-600" />
            <div className="text-sm font-medium text-primary-600">Danas</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Obnova i nastavak rasta
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Kapela se oporavlja od tuce i nastavlja graditi. Novi plastenici
              dizu se na mjestu starih, pilana radi punom parom, a "Kapelske
              žene" čuvaju društveni život. Selo koje ne čeka - vec gradi.
            </p>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose mt-8 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Tuča u svibnju 2022. uništila je polovicu hrvatske proizvodnje
            cvijeća - jer se toliko proizvodi upravo ovdje u Kapeli i susjednoj
            Dubovici. "Sve što smo gradili 30 godina uništeno je u 15 minuta",
            rekao je jedan cvjecar.
          </p>
        </div>
      </section>

      {/* Gospodarstvo Section */}
      <section id="gospodarstvo" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Factory className="h-5 w-5 text-primary-600" />
          Gospodarstvo
        </h2>

        <p className="text-lg leading-relaxed">
          Kapela Podravska je <strong>ekonomski motor općine</strong>. Dok
          Veliki Bukovec ima institucije, a Dubovica sjećanja, Kapela ima{' '}
          <strong>rad</strong>. Kombinacija drvne industrije i cvjecarstva čini
          ovo selo jedinstvenim u regiji.
        </p>

        <h3 className="flex items-center gap-2">
          <Factory className="h-5 w-5 text-primary-600" />
          Pilana Pečenec - srce industrije
        </h3>
        <p>
          <strong>Pilana Pečenec</strong> je jedan od dva glavna industrijska
          poslodavca u opčini (uz Pozgaj grupu u Velikom Bukovcu). Obiteljska
          tvrtka prerasla je u modernu proizvodnju koja zaposlava značajan dio
          radne snage.
        </p>
        <p>
          Tradicija obrade drva seze do šuma oko Drave i šume Križančije koja je
          bila vrijedan resurs jos od doba Draškovića. Danas zvuk pile prati
          jutro u Kapeli - znak da selo radi.
        </p>

        {/* TODO: Photo - Pilana Pečenec, proizvodnja ili radnici */}

        <h3 className="flex items-center gap-2">
          <Flower2 className="h-5 w-5 text-primary-600" />
          Cvjećarstvo - nacionalno značenje
        </h3>
        <p>
          Kapela Podravska, zajedno sa susjednom Dubovicom, proizvodi oko{' '}
          <strong>polovicu sveg cvijeća</strong> koje se prodaje na hrvatskim
          tržnicama. Ova koncentracija nije slucajna - rezultat je desetljeca
          ulaganja, znanja i tvrdoglavog rada.
        </p>
        <p>
          <strong>Obitelj Mađarić</strong> predvodi ovu industriju vec 30+
          godina. Njihovo ime sinonim je za kvalitetno cvijece u cijeloj
          Hrvatskoj. Ali nisu sami - deseci obiteljskih gospodarstava (OPG-ova)
          rade s plastenicima, ustaju u 3 ujutro i voze prema zagrebackim
          tržnicama.
        </p>

        {/* TODO: Photo - Plastinik s cvijećem ili obitelj Mađarić */}

        {/* Hailstorm warning box */}
        <div className="not-prose my-8 rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Tuča 2022. - 50% proizvodnje uništeno
              </p>
              <p className="mt-1 text-sm text-red-700">
                U samo 15 minuta tuču je sravnila staklenike i plastike. Šteta je
                bila ogromna jer se toliko hrvatske proizvodnje cvijeća
                koncentrira upravo ovdje. Obnova jos traje.
              </p>
            </div>
          </div>
        </div>

        {/* Strengths and weaknesses box */}
        <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              Podcijenjena snaga
            </p>
            <p className="mt-1 text-sm text-green-700">
              <strong>Solidarnost u radu.</strong> Nakon razorne tuce 2022.,
              susjedi su se ujedinili da spase staklenike. Kultura uzajamne
              pomoci. Prilagodljivost: brzo su presli s tradicionalne
              poljoprivrede na intenzivno cvjećarstvo. Sposobnost da se
              "poguraju rukavi" i riješi problem.
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Dugorocna slabost</p>
            <p className="mt-1 text-sm text-red-700">
              <strong>Nedostatak komunalne infrastrukture.</strong> Nema škole
              (djeca idu u Veliki Bukovec), nema župnog doma, ogranicena mjesta
              za okupljanje. Mladi nemaju gdje se družiti u selu. Ekološki
              pritisak od pilane i transporta cvijeća (buka, prasina).
            </p>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Obitelj Mađarić iz Kapele jedan je od najvećih proizvodaca cvijeća u
            Hrvatskoj, s tradicijom od 30+ godina. Njihovo ime je sinonim za
            kvalitetu na tržnicama od Zagreba do Rijeke.
          </p>
        </div>
      </section>

      {/* Znamenitosti Section */}
      <section id="znamenitosti" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary-600" />
          Znamenitosti
        </h2>

        <p className="text-lg leading-relaxed">
          Kapela Podravska nema dvorac ni muzej - njene znamenitosti su
          praktične: kapelica koja je dala ime selu, plastenici koji hrane
          Hrvatsku, i ljudi koji rade. No i te skromne znamenitosti nose price.
        </p>

        {/* Putna kapelica */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Church className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Putna kapelica
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Izvoriste imena sela
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Mala kapelica koja je dala ime cijelom selu. "Kapela" doslovno
                znaci kapelica, i ova skromna građevina bila je duhovno središta
                zajednice prije nego što je zupna crkva u Velikom Bukovcu
                preuzela tu ulogu.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Ironija nije izgubljena na mještanima: selo koje nosi ime po
                crkvi nema vlastitu zupnu crkvu. "Dajemo toliko gospodarski, a
                ipak idemo u njihovu crkvu" - primjedba koja se čuje u razgovoru.
              </p>
              {/* TODO: Photo - Putna kapelica u Kapeli Podravskoj */}
            </div>
          </div>
        </div>

        {/* Plastenici */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Flower2 className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Plastenici i staklenici
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Moderna "znamenitost" sela
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Desetci plastenika i staklenika protezi se kroz selo - mozda ne
                klasična znamenitost, ali definitivno ono po cemu je Kapela
                prepoznatljiva. Ovo je pejzaz koji hrani Hrvatsku cvijećem.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                U sezoni cvijećari ustaju u 3 ujutro, tovare kombije i voze
                prema zagrebackim tržnicama. Svjetla u plastenicima pale se dok
                je ostatak Hrvatske jos u snu.
              </p>
              {/* TODO: Photo - Plastenici s cvijećem u Kapeli */}
            </div>
          </div>
        </div>

        {/* Pilana */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Factory className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Pilana Pečenec
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Industrijski simbol sela
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Obiteljska pilana koja je prerasla u jedan od glavnih
                poslodavaca općine. Zvuk pile ujutro znak je da Kapela radi.
                Tradicija obrade drva seze do šuma oko Drave, a danas je to
                moderna industrija.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Pilana donosi radna mjesta, ali i izazove: buka, prasina,
                teretni promet. Balans izmedu ekonomije i kvalitete života -
                tema koja se proteže kroz selo.
              </p>
              {/* TODO: Photo - Pilana Pečenec, vanjski pogled */}
            </div>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            "Kapelske žene" (ženska udruga) tiho čuva folklor i drzi zajedno
            društveni život sela. U mjestu bez župnog doma ili društvenog
            centra, ove žene organiziraju događaje koji spajaju zajednicu.
          </p>
        </div>
      </section>

      {/* Udruge i društva Section */}
      <section id="udruge" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary-600" />
          Udruge i društva
        </h2>

        <p className="text-lg leading-relaxed">
          U selu koje cijeni rad, udruge imaju posebnu ulogu - one su mjesta
          gdje se zajednica okuplja izvan radnog vremena. DVD, nogometni klub i
          ženska udruga cine okosnicu društvenog života Kapele.
        </p>

        {/* DVD Kapela Podravska */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Flame className="h-8 w-8 shrink-0 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                DVD Kapela Podravska
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Dobrovoljno vatrogasno društvo
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Vatrogasci su okosnica svakog sela u opčini, a Kapela nije
                iznimka. DVD okuplja aktivne i pricuvne vatrogasce, organizira
                natjecanja i društvene događaje. U selu bez puno javnih mjesta,
                vatrogasni dom jedno je od rijetkih okupljališt.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Vatrogasna natjecanja tradicionalno privlace mjestane svih
                generacija i ostaju jedan od rijetkih događaja koji prekida
                radni ritam sela.
              </p>
              {/* TODO: Photo - DVD Kapela Podravska, vatrogasci ili vozilo */}
            </div>
          </div>
        </div>

        {/* NK Poljoprivrednik */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Trophy className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                NK "Poljoprivrednik"
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Nogometni klub Kapele
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Ime govori sve o karakteru sela -{' '}
                <strong>NK Poljoprivrednik</strong>. Klub okuplja ljubitelje
                nogometa i pruza rijetku priliku za druženje izvan radnog
                konteksta. Utakmice na lokalnom igralistu tradicionalno su
                društveni događaj.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Za razliku od NK Croatia Dubovica koja je prestala s radom zbog
                nedostatka mladih, Poljoprivrednik opstaje - mozda zato što je
                Kapela ekonomski stabilnija i zadrzava vise mladih obitelji.
              </p>
            </div>
          </div>
        </div>

        {/* Kapelske žene */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Users className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Kapelske žene
              </h3>
              <p className="mt-1 text-sm text-neutral-500">Ženska udruga</p>
              <p className="mt-3 text-sm text-neutral-600">
                "Kapelske žene" tiho drze zajedno društveni život sela.
                Organiziraju događaje, čuvaju folklor, i pruza prostor za
                druženje u zajednici koja nema puno javnih mjesta.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                U selu gdje svi rade, ova udruga podsjeca da život nije samo
                posao. Njihov rad češto ostaje neprimijećen, ali bez njega bi
                Kapela bila samo radno mjesto, ne zajednica.
              </p>
            </div>
          </div>
        </div>

        {/* Link to associations page */}
        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Link
            href="/općina/udruge"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Users className="h-4 w-4" />
            Sve udruge u opčini
          </Link>
        </div>
      </section>

      {/* Page metadata footer */}
      <footer className="not-prose mt-12 border-t border-neutral-100 pt-6">
        <p className="text-xs text-neutral-400">
          Posljednja izmjena: 31. siječnja 2026. • Izvori: DRVB_2.pdf, Popis
          stanovništva 2021., velikibukovec.hr
        </p>
      </footer>
    </PageLayoutV2>
  );
}
