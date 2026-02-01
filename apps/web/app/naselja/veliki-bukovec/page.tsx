// apps/web/app/naselja/veliki-bukovec/page.tsx
// Gold standard village profile page following Blueprint B
// Last updated: 2026-01-31
// Sources: DRVB_2.pdf "Veliki Bukovec (Municipal Seat)" section, Croatian Census 2021
import {
  Building2,
  Church,
  Factory,
  Flower2,
  GraduationCap,
  History,
  Info,
  Landmark,
  MapPin,
  Sparkles,
  TreeDeciduous,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../../components/page-layout-v2';

import type { PageSection } from '../../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Veliki Bukovec | Općina Veliki Bukovec',
  description:
    'Veliki Bukovec - administrativno središte općine s ~660 stanovnika, dvorcem Drašković, župnom crkvom sv. Franje Asiškog i stoljetnom školom. Srce i glava općine.',
  openGraph: {
    title: 'Veliki Bukovec | Općina Veliki Bukovec',
    description:
      'Administrativno središte općine - ovdje su dvorac Drašković (1745-1755), župna crkva, škola iz 1830. i općinska uprava.',
    images: ['/images/hero/veliki-bukovec-hero-1.jpg'],
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
  population: '~660',
  populationYear: 2021,
  role: 'Sjedište općine',
  castle: 'Dvorac Drašković (1745-1755)',
  church: 'Crkva sv. Franje Asiškog (1820)',
  park: '11 ha zaštićenog parka',
  schoolFounded: 1830,
};

export default function VelikiBukovecPage() {
  return (
    <PageLayoutV2
      title="Veliki Bukovec"
      subtitle="Srce i glava općine - administrativno središte s dvorcem, crkvom i stoljetnom školom"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      {/* O naselju Section */}
      <section id="o-naselju" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary-600" />O naselju
        </h2>

        <p className="text-lg leading-relaxed">
          Veliki Bukovec je srce i glava općine - selo koje se nosi s osjećajem
          skromnog ponosa. Kao najveće naselje s oko <strong>660 stanovnika</strong>{' '}
          i administrativno središte, ima dojam malog gradskog centra - ovdje su{' '}
          <strong>općinska uprava</strong>, <strong>pošta</strong>,{' '}
          <strong>osnovna škola</strong> i <strong>župna crkva</strong>.
        </p>

        {/* TODO: Photo - Panorama Velikog Bukovca s dronom, pogled na selo */}

        <p>
          Stanovnici sebe vide kao čuvare lokalne baštine. Prisutnost impozantne
          crkve sv. Franje Asiškog i dvorca Drašković (iako zatvorenog za javnost)
          ulijeva tihi ponos. U selu se isprepliće <strong>napetost između
          tradicije i modernosti</strong> - stare obitelji i običaji (kalendar
          vezan uz crkvu, konzervativne vrijednosti) s jedne strane, a s druge
          nastojanja da se bude napredni (nova industrija, digitalizacija općine).
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
              <Building2 className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Uloga</div>
                <div className="font-semibold">{keyFacts.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Dvorac</div>
                <div className="font-semibold">{keyFacts.castle}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Church className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Župna crkva</div>
                <div className="font-semibold">{keyFacts.church}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TreeDeciduous className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Park</div>
                <div className="font-semibold">{keyFacts.park}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Škola od</div>
                <div className="font-semibold">{keyFacts.schoolFounded}.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Unatoč imenu {`"Veliki"`}, selo ima manje stanovnika od susjednog {`"Mali"`}
            Bukovca (~1.800). Imena potječu iz doba kada su se odnosila na
            površinu plemićkog posjeda, ne broj stanovnika.
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
            href="/zupa"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Church className="h-4 w-4" />
            Župa sv. Franje
          </Link>
          <Link
            href="/skola"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <GraduationCap className="h-4 w-4" />
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
          Povijest Velikog Bukovca neodvojiva je od povijesti posjeda Drašković -
          plemićke obitelji koja je oblikovala selo, sagradila dvorac, crkvu i
          školu, te ostavila nasljeđe koje definira identitet mjesta do danas.
        </p>

        {/* Timeline */}
        <div className="not-prose mt-8 space-y-8">
          {/* 1643 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1643.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Draškovići dobivaju posjed
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Car Ferdinand III. daruje Veliki Bukovec grofu Ivanu Draškoviću
              nakon izumiranja obitelji Sekelj. Draškovići konsolidiraju sedam
              sela i veliku šumu Križančiju u privatni posjed.
            </p>
          </div>

          {/* 1745-1755 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              1745.-1755.
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Gradnja dvorca i parka
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Grof Josip Kazimir Drašković gradi barokni dvorac okružen parkom
              od 11 hektara u engleskom stilu. Park je od 1963. zaštićeni
              hortikulturni spomenik nacionalnog značaja.
            </p>
          </div>

          {/* 1820 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1820.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Grof Karlo Drašković gradi župnu crkvu
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Crkva sv. Franje Asiškog postaje duhovno središte posjeda.
              Nekoliko generacija Draškovića pokopano je u crkvi. Dan župe,
              4. listopada, postaje i dan općine.
            </p>
          </div>

          {/* 1830 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1830.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Draškovići osnivaju školu
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Osnovna škola u Velikom Bukovcu jedna je od najstarijih u regiji.
              U doba prije moderne države, plemstvo i Crkva bili su jedini
              pružatelji obrazovanja.
            </p>
          </div>

          {/* 1963 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1963.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Park dvorca postaje zaštićeni spomenik
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Engleski perivoj od 11 hektara proglašen je hortikulturnim
              spomenikom nacionalnog značaja. Paradoksalno, većina mještana
              nikad nije prošetala parkom - nalazi se na privatnom posjedu.
            </p>
          </div>

          {/* 1997 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1997.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Veliki Bukovec postaje sjedište nove općine
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Nakon odvajanja od Mali Bukovca, Veliki Bukovec postaje
              administrativno središte novoosnovane općine. Ključan argument:
              {`"U našem selu su škola i župa - što vi imate?"`}
            </p>
          </div>

          {/* 1990s restitution */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              1990-te
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Restitucija dvorca
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Dvorac Drašković vraćen je potomcima obitelji nakon restitucije
              nacionalizirane imovine. Dvorac ostaje zatvoren za javnost,
              jedan od neiskorištenih kulturnih potencijala područja.
            </p>
          </div>

          {/* Today */}
          <div className="relative pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-600 bg-primary-600" />
            <div className="text-sm font-medium text-primary-600">Danas</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Centar općine u digitalnoj transformaciji
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Veliki Bukovec ostaje administrativno, obrazovno i duhovno
              središte općine. Općinska uprava vodi projekte digitalizacije
              i EU sufinanciranja, nastojeći zadržati mlade u mjestu.
            </p>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose mt-8 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Škola osnovana 1830. starija je od moderne hrvatske države. U doba
            kada nije postojala javna uprava, plemstvo je bilo jedini izvor
            obrazovanja za seljačku djecu.
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
          Snaga Velikog Bukovca leži u <strong>diverzifikaciji</strong> - selo
          nije ovisno o jednom izvoru prihoda. Kombinacija industrije,
          poljoprivrede i javnog sektora daje otpornost koju susjedna sela nemaju.
        </p>

        <h3 className="flex items-center gap-2">
          <TreeDeciduous className="h-5 w-5 text-primary-600" />
          Drvna industrija - Požgaj
        </h3>
        <p>
          <strong>Požgaj grupa</strong> je najveći poslodavac u selu i jedan od
          ključnih poslodavaca u cijeloj općini. Tvrtka za preradu drva izrađuje
          namještaj i drvene proizvode, zapošljavajući značajan dio radne snage.
          Tradicija obrade drva seže do vremena šume Križančije koja je bila
          vrijedan resurs još od doba Draškovića.
        </p>

        {/* TODO: Photo - Požgaj tvornica, radnici ili proizvodnja */}

        <h3 className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary-600" />
          Javni sektor
        </h3>
        <p>
          Kao administrativno središte, Veliki Bukovec pruža radna mjesta u{' '}
          <strong>općinskoj upravi</strong>, <strong>školi</strong>,{' '}
          <strong>pošti</strong> i povezanim službama. Za razliku od čisto
          poljoprivrednih sela, ova radna mjesta donose stabilnost i redovita
          primanja koja ne ovise o vremenskim prilikama ili tržišnim cijenama.
        </p>

        <h3 className="flex items-center gap-2">
          <Flower2 className="h-5 w-5 text-primary-600" />
          Poljoprivreda
        </h3>
        <p>
          Obiteljska gospodarstva bave se uzgojem kukuruza, pšenice i povrća.
          Iako cvjećarstvo dominira u susjednim selima (Dubovica, Kapela
          Podravska), i ovdje postoje plastenički uzgoji. Plodna
          glinasto-ilovasta zemlja pogodna je za raznovrsnu proizvodnju.
        </p>

        {/* Strengths and weaknesses box */}
        <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              Podcijenjena snaga
            </p>
            <p className="mt-1 text-sm text-green-700">
              Neformalna suradnja institucija. Voditelji škole, crkve, općine i
              vatrogasaca često su susjedi koji koordiniraju neformalno. Ta
              mreža povjerenja omogućuje brže rješavanje problema nego u većim
              sredinama.
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Dugoročna slabost</p>
            <p className="mt-1 text-sm text-red-700">
              Ovisnost o malom broju poslodavaca (Požgaj) i neiskorišteni
              kulturni potencijali (dvorac zatvoren). Mladi i dalje odlaze
              u veće gradove zbog manjka mogućnosti za napredovanje.
            </p>
          </div>
        </div>
      </section>

      {/* Znamenitosti Section */}
      <section id="znamenitosti" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary-600" />
          Znamenitosti
        </h2>

        <p className="text-lg leading-relaxed">
          Veliki Bukovec ima najznačajnije kulturno-povijesne spomenike u
          općini - nasljeđe triju stoljeća plemićkog upravljanja krajem.
        </p>

        {/* Dvorac Drašković */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Landmark className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Dvorac Drašković
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Barokno-klasicistički dvorac • 1745.-1755.
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Impozantni dvorac grafa Josipa Kazimira Draškovića jedan je od
                najznačajnijih primjera barokne arhitekture u Podravini.
                Izgrađen sredinom 18. stoljeća, dvorac je bio središte
                upravljanja posjedom koji je obuhvaćao sedam sela.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Nakon restitucije 1990-ih dvorac je vraćen potomcima obitelji
                Drašković. Nažalost, <strong>dvorac je zatvoren za javnost</strong>{' '}
                i nije turistički valoriziran, što predstavlja jedan od
                neiskorištenih potencijala područja.
              </p>
              {/* TODO: Photo - Dvorac Drašković, pročelje ili pogled iz parka */}
            </div>
          </div>
        </div>

        {/* Park dvorca */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <TreeDeciduous className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Engleski perivoj
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Zaštićeni hortikulturni spomenik • 11 hektara • od 1963.
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Park oko dvorca Drašković uređen je u engleskom krajobraznom
                stilu, s vijugavim stazama, skupinama stabala i otvorenim
                travnatim površinama. Od 1963. godine zaštićen je kao
                hortikulturni spomenik nacionalnog značaja.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Paradoksalno, većina mještana nikad nije prošetala parkom jer
                se nalazi na privatnom posjedu.
              </p>
              {/* TODO: Photo - Park dvorca Drašković, stara stabla ili staze */}
            </div>
          </div>
        </div>

        {/* Crkva sv. Franje */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Church className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Crkva sv. Franje Asiškog
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Župna crkva • 1820. • Grof Karlo Drašković
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Župna crkva posvećena sv. Franji Asiškom duhovno je središte
                cijele općine. Sagrađena 1820. zalaganjem grofa Karla
                Draškovića, crkva čuva grobnice nekoliko generacija obitelji
                Drašković.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Dan župe, <strong>4. listopada</strong> (blagdan sv. Franje),
                ujedno je i Dan općine Veliki Bukovec. Crkva ostaje aktivno
                središte zajednice - nedjeljne mise, vjenčanja i sprovodi
                ritmiziraju život sela.
              </p>
              {/* TODO: Photo - Crkva sv. Franje Asiškog, eksterijer */}
              <div className="mt-4">
                <Link
                  href="/zupa"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Više o župi sv. Franje Asiškog →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Škola */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <GraduationCap className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Osnovna škola Veliki Bukovec
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Osnovana 1830. • 8-godišnji program
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Jedna od najstarijih škola u regiji, osnovana od strane obitelji
                Drašković gotovo dva stoljeća prije. U doba kada nije postojala
                obvezna državna edukacija, plemstvo je bilo jedini izvor
                obrazovanja za seljačku djecu.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Danas škola provodi osmogodišnji program i služi djecu iz svih
                naselja općine.
              </p>
              {/* TODO: Photo - Osnovna škola Veliki Bukovec, zgrada */}
              <div className="mt-4">
                <Link
                  href="/skola"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Više o osnovnoj školi →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Park dvorca Drašković zaštićen je kao nacionalni hortikulturni
            spomenik od 1963. godine, ali većina mještana nikad nije prošetala
            njime jer se nalazi na privatnom posjedu.
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
          Društveni život Velikog Bukovca organiziran je kroz udruge koje
          povezuju mještane - od vatrogasaca do sportskih klubova. Neformalna
          suradnja voditelja ovih organizacija čini jednu od ključnih snaga
          sela.
        </p>

        {/* DVD */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-neutral-900">
            Dobrovoljno vatrogasno društvo Veliki Bukovec
          </h3>
          <p className="mt-3 text-sm text-neutral-600">
            DVD Veliki Bukovec središnja je udruga u selu, okupljajući aktivne
            i pričuvne vatrogasce iz cijelog naselja. Osim vatrogasne djelatnosti,
            DVD organizira društvene događaje i natjecanja koja okupljaju
            mještane svih generacija.
          </p>
          {/* TODO: Photo - DVD Veliki Bukovec, vatrogasci ili vatrogasno vozilo */}
        </div>

        {/* Sportski klubovi */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-neutral-900">
            NK Bukovčan
          </h3>
          <p className="mt-3 text-sm text-neutral-600">
            Nogometni klub koji okuplja ljubitelje sporta iz Velikog Bukovca.
            Utakmice na lokalnom igralištu tradicionalno su društveni događaji
            koji privlače navijače svih uzrasta.
          </p>
        </div>

        {/* Župne grupe */}
        <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-neutral-900">
            Župne zajednice i udruge
          </h3>
          <p className="mt-3 text-sm text-neutral-600">
            Crkva sv. Franje Asiškog organizira različite župne aktivnosti -
            zbor, karitativne aktivnosti i okupljanja vjernika. Crkveni
            kalendar (blagdani, mise, procesije) ritmizira društveni život
            sela kroz cijelu godinu.
          </p>
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
