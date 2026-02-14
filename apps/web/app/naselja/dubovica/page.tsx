// apps/web/app/naselja/dubovica/page.tsx
// Gold standard village profile page following Blueprint B
// Last updated: 2026-01-31
// Sources: DRVB_2.pdf "Dubovica" section, Croatian Census 2021
import {
  Building2,
  Calendar,
  Church,
  Droplets,
  Factory,
  Flame,
  Flower2,
  History,
  Info,
  Landmark,
  Lightbulb,
  MapPin,
  Sparkles,
  TrendingDown,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../../components/page-layout-v2';

import type { PageSection } from '../../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dubovica | Općina Veliki Bukovec',
  description:
    'Dubovica - stara duša općine uz rijeku Plitvicu. Selo s oko 260 stanovnika, bogato poviješću, poznato po cvjećarima i solidarnoj zajednici. DVD osnovan 1928.',
  openGraph: {
    title: 'Dubovica | Općina Veliki Bukovec',
    description:
      'Stara duša općine - mirno selo uz Plitvicu s 500 godina povijesti. Cvjećari, vatrogasci od 1928. i sjećanja na veća vremena.',
    images: ['/images/hero/veliki-bukovec-hero-3.jpg'],
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
  population: '~260',
  populationYear: 2021,
  populationPeak: '~420',
  populationPeakYear: 1971,
  firstMention: '16. stoljeće',
  historicalName: 'Dudowycz',
  dvdFounded: 1928,
  river: 'Plitvica',
  parts: 'Gornja i Donja Dubovica',
};

export default function DubovicaPage() {
  return (
    <PageLayoutV2
      title="Dubovica"
      subtitle="Stara duša općine - mirno selo uz Plitvicu, bogato sjećanjima i tiho u svom dostojanstvu"
      heroImage="/images/hero/veliki-bukovec-hero-3.jpg"
      sections={pageSections}
    >
      {/* O naselju Section */}
      <section id="o-naselju" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary-600" />O naselju
        </h2>

        <p className="text-lg leading-relaxed">
          Dubovica je <strong>stara duša općine</strong> - selo koje je nekad
          bilo veće i življe, danas umanjeno ali bogato sjećanjima. Smješteno uz
          rijeku Plitvicu, Dubovica ima oko <strong>260 stanovnika</strong>, od
          kojih su mnogi stariji. Ovo je mjesto tihih ulica, prostranih polja i
          opipljive povijesti.
        </p>

        {/* TODO: Photo - Panorama Dubovice, pogled na selo uz Plitvicu */}

        <p>
          Prvi put se spominje kao <strong>{`"Dudowycz"`}</strong> u 16. stoljeću, a
          nekad je imala čak i malu <strong>kuriju</strong> (plemićki dvor) unutar
          svojih granica. Društveno, svi se poznaju - zajednica stisnuta iz nužde.
          Postoji poniznost u selu - možda zato što je toliko izgubilo: ljude,
          nogometni klub, svoj nekadašnji značaj.
        </p>

        <p>
          Interna napetost Dubovice ogleda se u sukobu <strong>rezignacije i
          aspiracije</strong>. Neki prihvaćaju da je {`"Dubovica takva kakva je"`},
          dok nekoliko preostalih mladih obitelji želi revitalizaciju -
          plastenici s cvijećem, bolje ceste, možda seoski turizam na Plitvici.
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
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-sm text-neutral-500">Nekad (1971.)</div>
                <div className="font-semibold">{keyFacts.populationPeak}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Prvi spomen</div>
                <div className="font-semibold">{keyFacts.firstMention}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Droplets className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Rijeka</div>
                <div className="font-semibold">{keyFacts.river}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Dijelovi</div>
                <div className="font-semibold">{keyFacts.parts}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">DVD od</div>
                <div className="font-semibold">{keyFacts.dvdFounded}.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Dubovica je imala struju u 1930-ima iz privatnog mlina, desetljećima
            prije državne elektrifikacije! Obitelj Toplak koristila je mlin na
            Plitvici za proizvodnju električne energije dok je ostatak regije
            još uvijek koristio svijeće.
          </p>
        </div>

        {/* Links to related pages */}
        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Link
            href="/opcina"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <MapPin className="h-4 w-4" />O općini
          </Link>
          <Link
            href="/naselja/veliki-bukovec"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Landmark className="h-4 w-4" />
            Veliki Bukovec
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
          Povijest Dubovice je priča o usponu i padu - od živahnog sela s
          vlastitom kurijom i inovativnom obitelji, do tihog mjesta koje čuva
          sjećanja na bolja vremena. Ime možda potječe od staroslavenskog
          {`"dub"`} (hrast), ukazujući na nekadašnje šume.
        </p>

        {/* Timeline */}
        <div className="not-prose mt-8 space-y-8">
          {/* 16th century */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              16. stoljeće
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Prvi spomen kao {`"Dudowycz"`}
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Dubovica se prvi put pojavljuje u pisanim izvorima pod imenom
              {`"Dudowycz"`}. Ime vjerojatno potječe od staroslavenskog {`"dub"`}
              (hrast), ukazujući na nekadašnje hrastove šume u okolici.
            </p>
          </div>

          {/* 18th century */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              Kasno 18. stoljeće
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Velika i Mala Dubovica
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              U ovom razdoblju razlikuju se {`"Velika Dubovica"`} i {`"Mala Dubovica"`}
              - podjela koja se danas odražava u razlikovanju {`"Gornje"`} i {`"Donje"`}
              Dubovice, odvojenih rijekom Plitvica.
            </p>
          </div>

          {/* 19th century - Kukuljević */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              19. stoljeće
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Ivan Kukuljević Sakcinski posjeduje zemlju
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Čuveni hrvatski povjesničar, političar i književnik Ivan
              Kukuljević Sakcinski (1816-1889) nekad je posjedovao zemlju u
              Dubovici - neočekivana veza s hrvatskim preporodom i nacionalnom
              kulturom.
            </p>
          </div>

          {/* 1928 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1928.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Osnivanje DVD-a Dubovica
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Dobrovoljno vatrogasno društvo Dubovica osnovano je gotovo stoljeće
              prije i ostaje {`"vrlo aktivno"`} do danas - simbol zajedničke brige i
              solidarnosti koja definira selo.
            </p>
          </div>

          {/* 1930s */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              1930-te
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Toplaci donose struju iz mlina na Plitvici
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Obitelj Toplak postavlja generator na svoj mlin na Plitvici i
              proizvodi električnu energiju za svoje imanje i susjede -
              desetljećima prije nego što je državna elektromreža stigla u ovaj
              dio Hrvatske. Primjer lokalne inovativnosti koji je danas
              zaboravljen.
            </p>
          </div>

          {/* 1937 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1937.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Agrarna reforma razbija Toplakovsko imanje
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Toplacima je oduzeto <strong>374 jutra (215 hektara)</strong>{' '}
              zemlje i raspodijeljeno u agrarnoj reformi. Gubitak velikog imanja
              označava kraj ekonomske snage koja je poticala inovacije poput
              privatne elektrifikacije.
            </p>
          </div>

          {/* 1971-1981 decline */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-red-500 bg-white" />
            <div className="text-sm font-medium text-red-600">1971.-1981.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Katastrofalni pad stanovništva
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Stanovništvo Dubovice pada s oko <strong>420 (1971.)</strong> na
              otprilike polovicu te brojke - više od polovice sela odlazi u
              potrazi za poslom u gradove ili inozemstvo. Tijekom narednih
              desetljeća brojka se stabilizira na oko 260 stanovnika (2021.),
              ali selo se nikad nije potpuno oporavilo.
            </p>
          </div>

          {/* 1976 - NK Croatia */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1976.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Osnivanje NK {`"Croatia"`} Dubovica
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Nogometni klub osnovan je kao simbol seoskog identiteta i
              zajedništva. Nažalost, klub je kasnije prestao s radom zbog
              {`"nedostatka mladih"`} - bolna ilustracija demografske stvarnosti.
            </p>
          </div>

          {/* Today */}
          <div className="relative pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-600 bg-primary-600" />
            <div className="text-sm font-medium text-primary-600">Danas</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Tiho dostojanstvo i nada u obnovu
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              S oko 260 stanovnika, Dubovica je danas najmanji, ali možda
              najkarakterističniji dio općine. Cvjećari svako jutro kreću prema
              zagrebačkim tržnicama, vatrogasci čuvaju stoljetnu tradiciju, a
              nekoliko mladih obitelji sanja o seoskom turizmu uz Plitvicu.
            </p>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose mt-8 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            NK {`"Croatia"`} Dubovica prestala je s radom zbog nedostatka mladih
            igrača - tužan, ali simboličan znak demografskog pada koji je
            pogodio selo. Klub osnovan 1976. postao je žrtvom istog trenda koji
            prijeti cijeloj ruralnoj Hrvatskoj.
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
          Bez velike tvrtke ili tvornice, Dubovica se gotovo u potpunosti
          oslanja na <strong>poljoprivredu i cvjećarstvo</strong>. Ono što
          nedostaje u industrijskoj snazi, nadoknađuje se poduzetničkim duhom i
          spremnošću na naporan rad.
        </p>

        <h3 className="flex items-center gap-2">
          <Flower2 className="h-5 w-5 text-primary-600" />
          Cvjećarstvo - u 3 ujutro prema Zagrebu
        </h3>
        <p>
          {`"Velik broj cvjećara iz Dubovice može se vidjeti na zagrebačkim
          tržnicama"`} - rečenica koja najbolje opisuje gospodarsku stvarnost sela.
          Obiteljski plastenički uzgoj cvijeća temelj je egzistencije mnogih
          domaćinstava.
        </p>
        <p>
          Cvjećari iz Dubovice ustaju u 3 sata ujutro, tovare kombije
          krizantemama, geranijem i presadnicama, te voze prema zagrebačkim
          tržnicama. Poduzetnički duh s oskudnim resursima - ovo je jedina
          strategija preživljavanja u selu bez industrije.
        </p>

        {/* TODO: Photo - Plastenik s cvijećem u Dubovici ili cvjećar na tržnici */}

        <h3 className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary-600" />
          Tradicionalna poljoprivreda
        </h3>
        <p>
          Mnoga domaćinstva i dalje ovise o poljima - kukuruz, pšenica, povrće.
          Teška glinasto-ilovasta zemlja plodna je, ali zahtijeva naporan rad.
          Obiteljska gospodarstva rade bez potpore kakvu imaju veća sela s
          pristupom opremi i kapitalu.
        </p>

        {/* Strengths and weaknesses box */}
        <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              Podcijenjena snaga
            </p>
            <p className="mt-1 text-sm text-green-700">
              Kohezija zajednice i poznavanje zemlje. Solidarnost teče duboko -
              vatrogasci su primjer, ali i svakodnevna pomoć među susjedima.
              Cvjećari su razvili vještinu trgovanja na tržnicama - znanje koje
              se prenosi generacijama.
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Dugoročna slabost</p>
            <p className="mt-1 text-sm text-red-700">
              Izolacija - i zemljopisna (cesta je slijepa ulica koja završava u
              selu) i generacijska. Odljev mladih znači vakuum vodstva koji se
              nazire. Nema trgovine (zadnja je zatvorena), ovisi se o pokretnoj
              trgovini ili vožnji do Ludbrega.
            </p>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Stara školska zgrada u Dubovici stoji neiskorištena - nekad centar
            obrazovanja sela, danas prazan prostor koji čeka novu namjenu. Možda
            centar za seoski turizam? Možda radionica za cvjećare? Budućnost je
            nepisana.
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
          Dubovica nema dvorac niti muzej, ali ima nešto možda vrednije -
          autentičan krajolik i tragove povijesti utkane u svakodnevicu.
        </p>

        {/* Rijeka Plitvica */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Droplets className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Rijeka Plitvica
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Vodotok koji definira selo
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Plitvica doslovno dijeli Dubovicu na dva dijela - mještani se
                identificiraju kao iz {`"Gornje"`} ili {`"Donje"`} Dubovice. Rijeka je
                nekad pogonila mlin obitelji Toplak koji je proizvodio struju
                desetljećima prije državne elektrifikacije.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Potencijal za seoski turizam - kajaking, ribolov, šetnice uz
                rijeku - tema je rasprava među rijetkim mladim obiteljima koje
                žele revitalizirati selo.
              </p>
              {/* TODO: Photo - Rijeka Plitvica u Dubovici, most ili obala */}
            </div>
          </div>
        </div>

        {/* Kapela Uzvišenja sv. Križa */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Church className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Kapela Uzvišenja svetog Križa
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                1974. • Preč. Ivan Lončar i mještani
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Kapela izgrađena 1974. godine zaslugom preč. Ivana Lončara uz pomoć
                mještana koji su <strong>vlastitim rukama i sredstvima</strong>{' '}
                podigli ovo svetište - primjer zajedničkog rada koji definira
                Dubovicu.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Kapela ostaje mjesto okupljanja zajednice, posebno za Uzvišenje
                svetog Križa (14. rujna) kada se održava tradicionalno slavlje.
              </p>
              {/* TODO: Photo - Kapela Uzvišenja sv. Križa u Dubovici */}
            </div>
          </div>
        </div>

        {/* Mjesto nekadašnje kurije */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Landmark className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Mjesto nekadašnje kurije
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Plemićki dvor • Nije sačuvan
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Dubovica je nekad imala malu kuriju (plemićki dvor) unutar svojih
                granica - rijedak primjer za selo ove veličine. Kroz kuriju su
                prošle obitelji Schmidt, Kukuljević Sakcinski i Toplak. Danas od
                zgrade nema traga, ali sjećanje na nju živi u lokalnoj predaji.
              </p>
              {/* TODO: Historical photo if available - Stara kurija u Dubovici */}
            </div>
          </div>
        </div>

        {/* Mlin Toplak */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Lightbulb className="h-8 w-8 shrink-0 text-amber-500" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Mjesto nekadašnjeg mlina Toplak
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                1930-te • Prva struja u selu
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Na Plitvici je nekad stajao mlin obitelji Toplak koji je u
                1930-ima proizveo nešto nezamislivo za to doba - električnu
                energiju za selo, desetljećima prije nego što je državna mreža
                stigla. Mještani su imali svjetlo dok su susjedi još palili
                svijeće.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Ova priča o lokalnoj inovativnosti danas je gotovo zaboravljena
                - simbol onoga što Dubovica može postići kada ima poduzetnički
                duh i resurse.
              </p>
            </div>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Rijeka Plitvica dijeli selo na dva dijela - mještani se i danas
            identificiraju kao iz {`"Gornje"`} ili {`"Donje"`} Dubovice. Ova podjela
            odražava povijesnu razliku između {`"Velike"`} i {`"Male"`} Dubovice iz
            kasnog 18. stoljeća.
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
          U selu od 260 stanovnika, udruge nisu dodatak životu - one{' '}
          <strong>jesu život</strong>. DVD Dubovica stara je gotovo stoljeće i
          ostaje aktivna, dok je NK Croatia morala prestati s radom. Kontrast
          koji govori o stanju sela.
        </p>

        {/* DVD Dubovica */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Flame className="h-8 w-8 shrink-0 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                DVD Dubovica
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Osnovano 1928. • Gotovo stoljeće aktivnosti
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Dobrovoljno vatrogasno društvo Dubovica osnovano je 1928. godine
                i ostaje <strong>{`"vrlo aktivno"`}</strong> do danas - rijetka
                priča kontinuiteta u selu koje je izgubilo toliko toga.
                Vatrogasci su više od protupožarne službe; oni su simbol
                zajedničke brige i solidarnosti.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                U selu bez puno mladih, DVD okuplja različite generacije i
                održava osjećaj zajedništva. Natjecanja, vježbe i druženja
                ritmiziraju život Dubovice.
              </p>
              {/* TODO: Photo - DVD Dubovica, vatrogasci ili vatrogasno vozilo */}
            </div>
          </div>
        </div>

        {/* NK Croatia Dubovica */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <div className="flex items-start gap-4">
            <Calendar className="h-8 w-8 shrink-0 text-neutral-400" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-600">
                NK {`"Croatia"`} Dubovica
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                1976. - prestanak rada • Nedostatak mladih
              </p>
              <p className="mt-3 text-sm text-neutral-500">
                Nogometni klub osnovan 1976. morao je prestati s radom zbog
                {`"nedostatka mladih"`} - fraza koja bolno sažima demografsku
                stvarnost Dubovice. Klub je nekad bio središte seoskog života,
                mjesto gdje su se susjedstva natjecala i družila.
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Prestanak rada NK Croatia simbol je šire priče o hrvatskom selu
                - mladi odlaze, klubovi gase, zajednice stare. Ali Dubovica se
                nije predala; DVD i cvjećari nastavljaju.
              </p>
            </div>
          </div>
        </div>

        {/* Link to associations page */}
        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Link
            href="/opcina/udruge"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Users className="h-4 w-4" />
            Sve udruge u općini
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
