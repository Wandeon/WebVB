// apps/web/app/zupa/page.tsx
// Gold standard page following 9-point content quality spec
// Last updated: 2026-01-31
// Sources: DRVB_1.md, DRVB_2.pdf, Varaždinska biskupija, zupa-sv-franje-asiskog.hr
import {
  BookOpen,
  Calendar,
  Church,
  Clock,
  Cross,
  Heart,
  History,
  Info,
  Landmark,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Župa sv. Franje Asiškoga | Općina Veliki Bukovec',
  description:
    'Župa sv. Franje Asiškoga u Velikom Bukovcu - duhovno središte općine od 1820. godine. Župna crkva, kapelice u Dubovici i Kapeli Podravskoj, grobnice obitelji Drašković.',
  openGraph: {
    title: 'Župa sv. Franje Asiškoga | Općina Veliki Bukovec',
    description:
      'Duhovno središte općine od 1820. godine. Crkva s grobnicama obitelji Drašković, kapelice u sva tri naselja.',
    images: ['/images/hero/veliki-bukovec-hero-1.jpg'],
  },
};

const pageSections: PageSection[] = [
  { id: 'o-zupi', label: 'O župi' },
  { id: 'povijest', label: 'Povijest' },
  { id: 'sakralni-objekti', label: 'Sakralni objekti' },
  { id: 'zupni-zivot', label: 'Župni život danas' },
  { id: 'kontakt', label: 'Kontakt' },
];

// Key facts from research - single source of truth
const keyFacts = {
  founded: 1820,
  patron: 'Sv. Franjo Asiški',
  feastDay: '4. listopada',
  diocese: 'Varaždinska biskupija',
  settlements: 3,
  cemeteries: 1, // Municipality manages 1 cemetery (Groblje Veliki Bukovec); parish territory has more
  chapels: 2,
  nepomukYear: 1764,
};

export default function ZupaPage() {
  return (
    <PageLayoutV2
      title="Župa sv. Franje Asiškoga"
      subtitle="Duhovno središte općine od 1820. godine - crkva, kapelice i dva stoljeća zajedničke vjere"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      {/* TODO: Photo - hero-crkva.jpg - St. Francis church exterior, full view in good light */}

      {/* O župi Section */}
      <section id="o-zupi" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary-600" />O župi
        </h2>

        <p className="text-lg leading-relaxed">
          Župa sv. Franje Asiškoga nije samo mjesto bogoslužja - ona je{' '}
          <strong>infrastruktura zajednice</strong> koja povezuje tri naselja
          općine kroz dva stoljeća. Dok je dvorac Drašković predstavljao svjetovnu
          vlast, župna crkva u Velikom Bukovcu bila je i ostala duhovno srce koje
          kuca u ritmu nedjeljnih misa, krštenja, vjenčanja i sprovoda.
        </p>

        <p>
          Sama struktura župe - jedna središnja crkva u Velikom Bukovcu s
          filijalnim kapelicama u <Link href="/opcina/naselja/dubovica" className="text-primary-600 hover:underline">Dubovici</Link> i{' '}
          <Link href="/opcina/naselja/kapela-podravska" className="text-primary-600 hover:underline">Kapeli Podravskoj</Link> - tiho
          potvrđuje centralnost Velikog Bukovca. Generacije vjernika iz svih
          naselja hodočastile su u župnu crkvu na nedjeljne mise i velike blagdane,
          vezujući općinu zajedno kroz zajedničke vjerske ritmove.
        </p>

        {/* Key Facts Utility Container */}
        <div className="not-prose my-8 rounded-xl border border-primary-200 bg-primary-50/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <Sparkles className="h-5 w-5 text-primary-600" />
            Ključne činjenice
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <Church className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Zaštitnik</div>
                <div className="font-semibold">{keyFacts.patron}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Župni blagdan</div>
                <div className="font-semibold">{keyFacts.feastDay}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Osnovana</div>
                <div className="font-semibold">{keyFacts.founded}.</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Biskupija</div>
                <div className="font-semibold">{keyFacts.diocese}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Cross className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Kapelice</div>
                <div className="font-semibold">{keyFacts.chapels}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Groblja</div>
                <div className="font-semibold">{keyFacts.cemeteries}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Dan općine (4. listopada) podudara se s blagdanom sv. Franje Asiškoga,
            zaštitnika župe. To nije slučajnost - vjerski i svjetovni kalendar
            isprepleteni su u identitetu zajednice već dva stoljeća.
          </p>
        </div>

        {/* Links to related pages */}
        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Link
            href="/opcina"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Landmark className="h-4 w-4" />O općini
          </Link>
          <Link
            href="/skola"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <BookOpen className="h-4 w-4" />
            Osnovna škola
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
          Povijest župe neodvojiva je od povijesti obitelji Drašković. Grofovi nisu
          samo gradili crkve - oni su vjeru doslovno utkali u temelje svoje vlasti,
          birajući župnu crkvu kao posljednje počivalište svoje obitelji.
        </p>

        {/* Timeline */}
        <div className="not-prose mt-8 space-y-8">
          {/* 1764 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1764.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Kip sv. Ivana Nepomuka
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Na raskrižju prema Dravi podignut je kameni stup s kipom sv. Ivana
              Nepomuka, s grbom obitelji Nádasdy. Nepomuk je tradicionalni
              zaštitnik od poplava - postavljanje kipa bilo je čin duhovne zaštite
              naselja od rijeke koja {`"daje i uzima"`}.
            </p>
          </div>

          {/* 1820 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1820.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Grof Karlo Drašković i grofica Elizabeta grade župnu crkvu
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Crkva sv. Franje Asiškoga izgrađena je u klasicističkom stilu kao
              duhovno središte vlastelinstva. Draškovići nisu samo financirali
              gradnju - odabrali su crkvu kao obiteljsku grobnicu, čime je
              plemstvo doslovno utkalo vjeru u temelje svoje vladavine.
            </p>
          </div>

          {/* 1830 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1830.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Draškovići osnivaju školu i grade kapelice
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              U doba bez države, Crkva i plemstvo bili su jedini pružatelji
              obrazovanja i duhovne skrbi. Draškovići su financirali osnovnu{' '}
              <Link href="/skola" className="text-primary-600 hover:underline">školu</Link> i
              nekoliko kapelica, šireći mrežu vjerske infrastrukture po
              vlastelinstvu.
            </p>
          </div>

          {/* 1960s-70s */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              1960-te i 1970-te
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Era župnika-graditelja: prebendár Ivan Lončar
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Prebendar Ivan Lončar nije bio samo liturg - bio je organizator
              zajednice i graditelj. Pod njegovim vodstvom izgrađena je kapelica u
              Dubovici, mobilizirajući vjernike da vlastitim rukama i sredstvima
              pretvaraju {`"šikaru i močvaru"`} u sveto mjesto.
            </p>
          </div>

          {/* 1974 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1974.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Kapelica Uzvišenja sv. Križa u Dubovici
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Mještani Dubovice, predvođeni župnikom Lončarom, grade kapelicu na
              mjestu nekadašnje močvare. Gradnja nije bila samo pobožni čin - bila
              je to socijalna inženjerija koja je razjedinjene poljoprivrednike
              pretvorila u kohezivnu {`"svetu zajednicu"`}.
            </p>
          </div>

          {/* 2024 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">2024.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              50. obljetnica kapelice u Dubovici
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Svečano obilježavanje pola stoljeća filijalne kapelice uz sudjelovanje
              biskupa varaždinskog mons. Bože Radoša. Tom prigodom župnik Lončar
              posthumno je odlikovan priznanjem općine - dokaz da se u Velikom
              Bukovcu doprinosi crkvenih vođa cijene jednako kao i svjetovnih.
            </p>
          </div>

          {/* Today */}
          <div className="relative pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-600 bg-primary-600" />
            <div className="text-sm font-medium text-primary-600">Danas</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Župnik Josip Vidović i živa zajednica
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Pod vodstvom vlč. Josipa Vidovića župa nastavlja služiti zajednici
              kroz redovite mise, sakramente i okupljanja. Župni kalendar obilježen
              je zlatnim i dijamantnim pirama, krštenjima i blagdanima koji
              povezuju generacije.
            </p>
          </div>
        </div>
      </section>

      {/* Sakralni objekti Section */}
      <section id="sakralni-objekti" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Church className="h-5 w-5 text-primary-600" />
          Sakralni objekti
        </h2>

        <p className="text-lg leading-relaxed">
          Vjerska geografija općine govori priču o moći i identitetu. Svako
          naselje ima svoje sveto mjesto - kapelicu ili kip - ali samo Veliki
          Bukovec ima župnu crkvu. Ta struktura nije slučajna; ona odražava
          stoljetnu hijerarhiju koja i danas oblikuje identitet zajednice.
        </p>

        {/* Church Card */}
        <div className="not-prose mt-8 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <Church className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Crkva sv. Franje Asiškoga
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Veliki Bukovec • Župna crkva
                </p>
                <p className="mt-3 text-sm text-neutral-600">
                  Klasicistička crkva iz 1820. godine, izgrađena zalaganjem grofa
                  Karla Draškovića i grofice Elizabete. U crkvi se nalaze grobnice
                  nekoliko generacija obitelji Drašković - plemstvo je doslovno
                  utkalo svoju povijest u temelje ovog svetišta. Jedna od
                  najljepših klasicističkih crkava u Podravini.
                </p>
                {/* TODO: Photo - crkva-interior.jpg - Church interior with altar, Drašković tombs */}
              </div>
            </div>
          </div>

          {/* Chapel Dubovica */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <Cross className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Kapelica Uzvišenja sv. Križa
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Dubovica • Filijalna kapelica
                </p>
                <p className="mt-3 text-sm text-neutral-600">
                  Izgrađena 1974. godine na mjestu nekadašnje {`"šikare i močvare"`},
                  kapelica je rezultat zajedničkog rada mještana pod vodstvom
                  župnika Ivana Lončara. Danas služi kao fokalna točka vjerskog
                  života u Dubovici, s redovitim misama i proslavom blagdana
                  Uzvišenja sv. Križa.
                </p>
                {/* TODO: Photo - kapelica-dubovica.jpg - Chapel of Holy Cross in Dubovica */}
              </div>
            </div>
          </div>

          {/* Chapel Kapela */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <Cross className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Kapelica u Kapeli Podravskoj
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Kapela Podravska • Filijalna kapelica
                </p>
                <p className="mt-3 text-sm text-neutral-600">
                  Sam naziv sela {`"Kapela"`} ukazuje na davnu povijest - selo je
                  vjerojatno dobilo ime po ranoj kapelici koja je bila središte
                  okupljanja još prije formalnih institucija. Današnja kapelica
                  nastavlja tu tradiciju, a mještani je održavaju s posebnom
                  predanošću, slaveći svoj blagdan kao potvrdu lokalnog identiteta.
                </p>
                {/* TODO: Photo - kapelica-kapela.jpg - Chapel in Kapela Podravska */}
              </div>
            </div>
          </div>

          {/* St. John Nepomuk */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <Landmark className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Kip sv. Ivana Nepomuka
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Veliki Bukovec • Kameni stup iz {keyFacts.nepomukYear}.
                </p>
                <p className="mt-3 text-sm text-neutral-600">
                  Kameni stup s kipom sv. Ivana Nepomuka na raskrižju prema Dravi
                  nosi grb obitelji Nádasdy i godinu 1764. Nepomuk je tradicionalni
                  zaštitnik od poplava - postavljanje kipa bilo je čin duhovne
                  zaštite zajednice od rijeke. Lokalna uzrečica kaže: {`"Drava daje,
                  Drava uzima"`} - Nepomuk stoji kao podsjetnik na tu drevnu istinu.
                </p>
                {/* TODO: Photo - nepomuk.jpg - St. John Nepomuk statue from 1764 */}
              </div>
            </div>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose mt-8 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            U šumi Križančija skrivena je {`"Crkvica Križančija"`} - privatna kapelica
            obitelji Drašković. Čak i najudaljeniji kutovi vlastelinstva bili su
            posvećeni, proširujući duhovnu pokrivenost preko cijelog posjeda.
          </p>
        </div>
      </section>

      {/* Župni život danas Section */}
      <section id="zupni-zivot" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary-600" />
          Župni život danas
        </h2>

        <p className="text-lg leading-relaxed">
          Župa nije samo mjesto bogoslužja - ona je operativni sustav zajednice.
          Kroz župni bilten, nedjeljne mise i blagdanske proslave, župa povezuje
          obitelji kroz naselja, generacije i životna razdoblja.
        </p>

        <h3>Redovite mise</h3>
        <p>
          Nedjeljne mise u župnoj crkvi okupljaju vjernike iz sva tri naselja.
          Kapelice u Dubovici i Kapeli Podravskoj imaju povremene mise, posebno
          na lokalne blagdane. Raspored misa objavljuje se u župnom biltenu i na
          oglasnoj ploči crkve.
        </p>

        <h3>Važni blagdani</h3>
        <div className="not-prose mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              <span className="font-semibold">4. listopada</span>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Blagdan sv. Franje Asiškoga - glavni župni blagdan i Dan općine.
              Svečana misa uz sudjelovanje cijele zajednice.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              <span className="font-semibold">14. rujna</span>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Uzvišenje sv. Križa - blagdan kapelice u Dubovici. Posebna misa u
              kapelici uz okupljanje mještana.
            </p>
          </div>
        </div>

        <h3 className="mt-6">Sakramenti i prigode</h3>
        <p>
          Župa bilježi životne prijelaze zajednice - od krštenja do sprovoda.
          Župni kalendar redovito obilježava zlatne (50 godina) i dijamantne (60
          godina) pire, javne liturgijske čine koji slave izdržljivost
          tradicionalne obitelji kao temelj opstanka sela.
        </p>

        {/* Recent events box */}
        <div className="not-prose mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h4 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900">
            <Users className="h-5 w-5 text-primary-600" />
            Iz župnog života
          </h4>
          <ul className="space-y-3 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-primary-500" />
              <span>
                <strong>Siječanj 2026.</strong> - Stjepan i Marija Balaško slave
                60 godina braka
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-primary-500" />
              <span>
                <strong>Prosinac 2025.</strong> - Stjepan i Štefanija Friščić
                slave 50 godina braka
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-primary-500" />
              <span>
                <strong>Jesen 2025.</strong> - Krštenja: Joakim Vrbanić, Ivano
                Rak, Nika Kos
              </span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-neutral-500">
            Unatoč trendovima depopulacije, krsni registar ostaje aktivan - znak
            da mlade obitelji ostaju ili se vraćaju u općinu.
          </p>
        </div>

        <h3 className="mt-6">Župne organizacije</h3>
        <p>
          Katoličke crkvene organizacije - marijanske družbe, crkveni zborovi -
          oduvijek su pružale prostor za mlade i žene kada je ostali građanski
          život bio rijedak. I danas župni zbor i ministrantska služba okupljaju
          aktivne članove zajednice.
        </p>
      </section>

      {/* Kontakt Section */}
      <section id="kontakt" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary-600" />
          Kontakt
        </h2>

        <p className="text-lg leading-relaxed">
          Župni ured nalazi se u Velikom Bukovcu, uz župnu crkvu. Za informacije
          o misama, sakramentima i drugim župnim aktivnostima obratite se
          župniku.
        </p>

        {/* Contact card */}
        <div className="not-prose mt-6 rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900">
            <Church className="h-5 w-5 text-primary-600" />
            Župni ured sv. Franje Asiškoga
          </h3>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-neutral-500">Župnik</dt>
              <dd className="font-medium text-neutral-900">vlč. Josip Vidović</dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Biskupija</dt>
              <dd className="font-medium text-neutral-900">
                {keyFacts.diocese}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Adresa</dt>
              <dd className="font-medium text-neutral-900">
                Veliki Bukovec, 42231 Veliki Bukovec
              </dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Web</dt>
              <dd>
                <a
                  href="https://zupa-sv-franje-asiskog.hr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-600 hover:underline"
                >
                  zupa-sv-franje-asiskog.hr
                </a>
              </dd>
            </div>
          </dl>
        </div>

        {/* Related links */}
        <div className="not-prose mt-8">
          <h3 className="mb-4 text-sm font-medium text-neutral-500">
            Povezane stranice
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/opcina"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <Landmark className="h-4 w-4" />O općini
            </Link>
            <Link
              href="/skola"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <BookOpen className="h-4 w-4" />
              Osnovna škola
            </Link>
            <Link
              href="/opcina/naselja/veliki-bukovec"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <MapPin className="h-4 w-4" />
              Veliki Bukovec
            </Link>
            <Link
              href="/opcina/naselja/dubovica"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <MapPin className="h-4 w-4" />
              Dubovica
            </Link>
            <Link
              href="/opcina/naselja/kapela-podravska"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <MapPin className="h-4 w-4" />
              Kapela Podravska
            </Link>
          </div>
        </div>
      </section>

      {/* Page metadata footer */}
      <footer className="not-prose mt-12 border-t border-neutral-100 pt-6">
        <p className="text-xs text-neutral-400">
          Posljednja izmjena: 31. siječnja 2026. • Izvori: DRVB_2.pdf (Religion as
          Infrastructure), Varaždinska biskupija, zupa-sv-franje-asiskog.hr,
          velikibukovec.hr
        </p>
      </footer>
    </PageLayoutV2>
  );
}
