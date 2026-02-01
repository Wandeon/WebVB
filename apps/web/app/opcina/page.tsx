// apps/web/app/opcina/page.tsx
// Gold standard page following 9-point content quality spec
// Last updated: 2026-01-31
// Sources: DRVB_1.md, DRVB_2.pdf, Croatian Census 2021, velikibukovec.hr
import {
  Building2,
  Calendar,
  Factory,
  Flower2,
  History,
  Info,
  Landmark,
  MapPin,
  Mountain,
  Sparkles,
  TreeDeciduous,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Općina Veliki Bukovec | Cvjetno središte Hrvatske',
  description:
    'Općina Veliki Bukovec u Varaždinskoj županiji - troselska zajednica s 500 godina povijesti, nacionalno središte cvjećarstva i drvne industrije. 1.325 stanovnika, 23 km².',
  openGraph: {
    title: 'Općina Veliki Bukovec | Cvjetno središte Hrvatske',
    description:
      'Troselska općina u Podravini s 500 godina povijesti. Nacionalno središte cvjećarstva - 50% hrvatskog cvijeća dolazi odavde.',
    images: ['/images/hero/veliki-bukovec-hero-1.jpg'],
  },
};

const pageSections: PageSection[] = [
  { id: 'o-opcini', label: 'O općini' },
  { id: 'zemljopis', label: 'Zemljopis' },
  { id: 'povijest', label: 'Povijest' },
  { id: 'gospodarstvo', label: 'Gospodarstvo' },
  { id: 'naselja', label: 'Naselja' },
];

// Key facts from research - single source of truth
const keyFacts = {
  population: '1.325',
  populationYear: 2021,
  area: '23,42',
  settlements: 3,
  founded: 1997,
  county: 'Varaždinska',
  municipalityDay: '4. listopada',
  patron: 'Sv. Franjo Asiški',
  elevation: '140-150',
  flowerShare: '~50%',
};

export default function OpcinaPage() {
  return (
    <PageLayoutV2
      title="Općina Veliki Bukovec"
      subtitle="Troselska zajednica u Podravini s 500 godina povijesti i nacionalno središte cvjećarstva"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      {/* O općini Section */}
      <section id="o-opcini" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary-600" />O općini
        </h2>

        <p className="text-lg leading-relaxed">
          Općina Veliki Bukovec nalazi se na krajnjem istoku Varaždinske
          županije, na ušću rijeka <strong>Bednje</strong> i{' '}
          <strong>Plitvice</strong> u <strong>Dravu</strong>. Obuhvaća tri
          naselja koja zajedno čine zajednicu gdje svaki stanovnik poznaje
          svakog susjeda - a upravo ta bliskost definira karakter ovog kraja.
        </p>

        <p>
          Ovo je mjesto gdje se <strong>50% hrvatskog cvijeća</strong> uzgaja u
          obiteljskim staklenicima, gdje drvna industrija zapošljava većinu
          radno sposobnog stanovništva, i gdje se tradicija čuva ne kroz muzeje,
          već kroz svakodnevni život - od nedjeljne mise u baroknoj crkvi do
          vatrogasnih natjecanja koja okupljaju cijelu općinu.
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
              <MapPin className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Površina</div>
                <div className="font-semibold">{keyFacts.area} km²</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Naselja</div>
                <div className="font-semibold">{keyFacts.settlements}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Dan općine</div>
                <div className="font-semibold">{keyFacts.municipalityDay}</div>
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
              <Mountain className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Nadmorska visina</div>
                <div className="font-semibold">{keyFacts.elevation} m</div>
              </div>
            </div>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Ironija imena: &quot;Mali&quot; Bukovec (susjed) ima oko 1.800 stanovnika -
            više nego &quot;Veliki&quot; Bukovec. Imena potječu iz doba kada su se odnosila
            na površinu posjeda, ne broj stanovnika.
          </p>
        </div>

        {/* Links to governance */}
        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Link
            href="/nacelnik"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Users className="h-4 w-4" />
            Načelnik
          </Link>
          <Link
            href="/vijece"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Building2 className="h-4 w-4" />
            Općinsko vijeće
          </Link>
          <Link
            href="/usluge"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Info className="h-4 w-4" />
            Usluge građanima
          </Link>
        </div>
      </section>

      {/* Zemljopis Section */}
      <section id="zemljopis" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary-600" />
          Zemljopis
        </h2>

        <p className="text-lg leading-relaxed">
          Općina leži u <strong>Podravskoj nizini</strong>, na aluvijalnoj
          ravnici gdje se susreću tri rijeke. Ova geografska posebnost -
          plodna zemlja uz stalnu prijetnju poplava - oblikovala je karakter
          zajednice kroz stoljeća.
        </p>

        <h3>Tri rijeke, jedan krajolik</h3>
        <p>
          <strong>Drava</strong> čini južnu granicu općine - divlja rijeka koja
          &quot;daje i uzima&quot;, kako kaže lokalna uzrečica. <strong>Plitvica</strong>{' '}
          teče kroz Dubovicu, dijeleći selo na gornji i donji dio. A{' '}
          <strong>Bednja</strong> prolazi nedaleko, doprinoseći sustavu odvodnje
          koji je stoljećima zahtijevao kolektivni rad na održavanju kanala.
        </p>

        <h3>Tlo i klima</h3>
        <p>
          Teška glinasto-ilovasta zemlja iznimno je plodna za kukuruz, pšenicu
          i - što je ključno za lokalnu ekonomiju - za uzgoj cvijeća u
          plastenicima. Umjerena kontinentalna klima s obiljem sunčanih dana u
          proljeće daje prednost lokalnim cvjećarima pred konkurencijom.
        </p>

        {/* Climate warning box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Kip Sv. Ivana Nepomuka iz 1764. na raskrižju prema Dravi nije samo
            pobožni spomenik - Nepomuk je zaštitnik od poplava, a postavljanje
            kipa bilo je čin zaštite zajednice od rijeke.
          </p>
        </div>

        <h3>Lokacija i povezanost</h3>
        <p>
          Općina se nalazi <strong>10 km</strong> od Ludbrega,{' '}
          <strong>25 km</strong> od Varaždina i <strong>95 km</strong> od
          Zagreba. Graniči s Međimurskom i Koprivničko-križevačkom županijom.
          Položaj na rubu županije dugo je stvarao osjećaj zapostavljenosti,
          ali je istovremeno očuvao autentičnost koju susjedne općine bliže
          gradu gube.
        </p>
      </section>

      {/* Povijest Section */}
      <section id="povijest" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary-600" />
          Povijest
        </h2>

        <p className="text-lg leading-relaxed">
          Povijest Velikog Bukovca nije niz datuma - to je priča o preživljavanju
          na granici, prosperitetu pod plemićkom zaštitom, i upornosti zajednice
          koja je izgubila sve osim volje da nastavi.
        </p>

        {/* Timeline */}
        <div className="not-prose mt-8 space-y-8">
          {/* 16th century */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              Sredina 16. stoljeća
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Pogranična utvrda protiv Osmanlija
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Veliki Bukovec nastaje kao mala utvrda koja pruža sklonište
              stanovništvu od osmanskih provala. Tek nakon pobjede Habsburgovaca
              kod Siska 1593. počinje stabilno naseljavanje.
            </p>
          </div>

          {/* 1643 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1643.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Car Ferdinand III. daruje posjed Draškovićima
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Nakon izumiranja obitelji Sekelj, car daruje Veliki Bukovec grofu
              Ivanu Draškoviću. Draškovići konsolidiraju sedam sela i veliku
              šumu Križančiju u privatni posjed - ova odluka oblikovat će
              područje sljedeća tri stoljeća.
            </p>
          </div>

          {/* 1745-1755 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              1745.-1755.
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Grof Josip Kazimir gradi dvorac
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Izgradnja baroknog dvorca Drašković okruženog parkom od 11
              hektara u engleskom stilu - danas zaštićeni hortikulturni
              spomenik (od 1963.). Dvorac je nakon restitucije 1990-ih vraćen
              obitelji, ali ostaje zatvoren za javnost.
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
              Crkva sv. Franje Asiškog postaje duhovno središte posjeda. Nekoliko
              generacija Draškovića pokopano je u crkvi - plemstvo je doslovno
              utkalo vjeru u temelje svog vladanja. Dan župe, 4. listopada,
              postaje i dan općine.
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
              U doba bez države, Crkva i plemstvo bili su jedini pružatelji
              obrazovanja - tradicija koja traje do danas.
            </p>
          </div>

          {/* 1848 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1848.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Kraj feudalizma
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Ukidanje kmetstva postupno erodira plemićku moć. Nove obitelji
              počinju kupovati dijelove posjeda - u Dubovici se smjenjuju
              Schmidti, Kukuljevići Sakcinski, i naposljetku Toplaci.
            </p>
          </div>

          {/* 1930s */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">
              1930-te
            </div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Toplaci donose struju u Dubovicu
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Desetljećima prije državne elektrifikacije, obitelj Toplak koristi
              mlin na Plitvici za proizvodnju struje. Njihovo imanje i susjedi
              imaju svjetlo dok ostatak regije još koristi svijeće - primjer
              lokalne inovativnosti koji je zaboravljen nakon nacionalizacije.
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
              374 jutra (215 hektara) zemlje oduzeto je i raspodijeljeno. Jedno od
              posljednjih velikih imanja nestaje - nijedna ekonomska snaga neće
              zamijeniti tu ulogu do današnjeg dana.
            </p>
          </div>

          {/* 1997 */}
          <div className="relative border-l-2 border-primary-200 pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
            <div className="text-sm font-medium text-primary-600">1997.</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Odvajanje od Mali Bukovca
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Nakon godina trvenja, Veliki Bukovec, Kapela Podravska i Dubovica
              osnivaju vlastitu općinu. Argument koji je prešao vagu: &quot;U našem
              selu su škola i župa - što vi imate?&quot; Lokalni ponos pobijedio je
              nad praktičnošću.
            </p>
          </div>

          {/* Today */}
          <div className="relative pl-6">
            <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border-2 border-primary-600 bg-primary-600" />
            <div className="text-sm font-medium text-primary-600">Danas</div>
            <h4 className="mt-1 font-semibold text-neutral-900">
              Digitalna transformacija ruralne zajednice
            </h4>
            <p className="mt-2 text-sm text-neutral-600">
              Općina s 1.325 stanovnika gradi digitalnu infrastrukturu,
              prijavljuje EU projekte i nastoji zadržati mlade. Priča nije
              završena - pišete je vi koji ovo čitate.
            </p>
          </div>
        </div>

        {/* Learn more link */}
        <div className="not-prose mt-8">
          <Link
            href="/zupa"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Saznajte više o župi sv. Franje Asiškog →
          </Link>
        </div>
      </section>

      {/* Gospodarstvo Section */}
      <section id="gospodarstvo" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Factory className="h-5 w-5 text-primary-600" />
          Gospodarstvo
        </h2>

        <p className="text-lg leading-relaxed">
          Ekonomija Velikog Bukovca ne može se svesti na &quot;poljoprivredu&quot; - to je
          priča o prilagodbi: od kmetstva, preko gastarbajtera, do današnje
          kombinacije drvne industrije i cvjećarstva koja je jedinstvena u
          Hrvatskoj.
        </p>

        <h3 className="flex items-center gap-2">
          <Flower2 className="h-5 w-5 text-primary-600" />
          Cvjećarstvo - nacionalno središte
        </h3>
        <p>
          Općina Veliki Bukovec proizvodi{' '}
          <strong>oko polovice sveg cvijeća</strong> koje se prodaje na
          hrvatskim tržnicama. Obiteljske cvjećarije u Dubovici i Kapeli
          Podravskoj svako jutro šalju kamione krizantema, geranija i presadnica
          prema Zagrebu, Varaždinu i dalje.
        </p>
        <p>
          Ova koncentracija nije slučajna: tradicija seže u kasno jugoslavensko
          razdoblje, a eksplodirala je 2000-ih kada su obitelji poput{' '}
          <strong>Mađarića</strong> iz Kapele Podravske prerasle u jedne od
          najvećih proizvođača u zemlji. Danas deseci obiteljskih poljoprivrednih
          gospodarstava (OPG-ova) rade s plastenicima - investicija u sjeme,
          grijanje i uvoznu zemlju (čak iz Litve!) dio je svakodnevice.
        </p>

        {/* Hailstorm warning */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Tuča u svibnju 2022. uništila je 50% hrvatske proizvodnje cvijeća -
            jer se toliko proizvodi upravo ovdje. &quot;Sve što smo gradili 30 godina
            uništeno je u 15 minuta&quot;, rekao je jedan cvjećar za Večernji list.
          </p>
        </div>

        <h3 className="flex items-center gap-2">
          <TreeDeciduous className="h-5 w-5 text-primary-600" />
          Drvna industrija
        </h3>
        <p>
          Drugi stup gospodarstva je prerada drva.{' '}
          <strong>Požgaj grupa</strong> u Velikom Bukovcu i{' '}
          <strong>Pilana Pečenec</strong> u Kapeli Podravskoj zapošljavaju
          većinu radne snage općine. Ovo nije slučajnost - šuma Križančija bila
          je vrijedan resurs još od doba Draškovića, a lokalna tradicija obrade
          drva prerasla je u modernu industriju.
        </p>
        <p>
          Za razliku od mnogih ruralnih općina koje nemaju nijednu tvornicu,
          Veliki Bukovec ima pravu industrijsku bazu. Ujutro možete vidjeti
          radnike kako biciklima idu prema pilani - prizor nezamisliv
          generaciju ranije.
        </p>

        <h3>Ostale djelatnosti</h3>
        <p>
          Uz cvjećarstvo i drvo, opstaju obiteljska gospodarstva koja uzgajaju
          kukuruz, pšenicu i povrće. Transport šljunka (Smontara), uzgoj pataka
          (PG Orehovec), i brojni obrtnici dopunjuju ekonomsku sliku. Siva
          ekonomija - domaća rakija, sezonski rad - također igra ulogu koju
          statistika ne bilježi.
        </p>

        {/* Economic links */}
        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Link
            href="/opcina/udruge"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Users className="h-4 w-4" />
            Udruge i klubovi
          </Link>
        </div>
      </section>

      {/* Naselja Section */}
      <section id="naselja" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary-600" />
          Naselja
        </h2>

        <p className="text-lg leading-relaxed">
          Tri sela, tri karaktera. Iako ih dijeli samo nekoliko kilometara,
          svako ima vlastitu osobnost oblikovanu poviješću i okolnostima.
        </p>

        <div className="not-prose mt-8 grid gap-4">
          {/* Veliki Bukovec */}
          <Link
            href="/opcina/naselja/veliki-bukovec"
            className="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
                  Veliki Bukovec
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  ~660 stanovnika • Sjedište općine
                </p>
              </div>
              <Landmark className="h-5 w-5 text-primary-600" />
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Srce i glava općine - ovdje su škola, crkva, općinska uprava i
              dvorac Drašković. Najraznolikija ekonomija: tvornica, poljoprivreda,
              javni sektor. Stanovnici sebe vide kao čuvare lokalne baštine.
            </p>
          </Link>

          {/* Kapela Podravska */}
          <Link
            href="/opcina/naselja/kapela-podravska"
            className="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
                  Kapela Podravska
                </h3>
                <p className="mt-1 text-sm text-neutral-500">~400 stanovnika</p>
              </div>
              <Factory className="h-5 w-5 text-primary-600" />
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Radilište općine - pilana Pečenec i najveće cvjećarije. Ime dolazi
              od kapele koja je nekad davala selu identitet. Reputacija:
              marljivi, samouvjereni, ne čekaju pomoć izvana.
            </p>
          </Link>

          {/* Dubovica */}
          <Link
            href="/opcina/naselja/dubovica"
            className="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
                  Dubovica
                </h3>
                <p className="mt-1 text-sm text-neutral-500">~260 stanovnika</p>
              </div>
              <Flower2 className="h-5 w-5 text-primary-600" />
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Stara duša općine - selo koje je nekad bilo veće, danas mirno i
              pretežno starije. Plitvica ga dijeli na gornji i donji dio. Poznato
              po cvjećarima koji rano ujutro kreću prema zagrebačkim tržnicama.
            </p>
          </Link>
        </div>

        <div className="not-prose mt-8">
          <Link
            href="/opcina/naselja"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <MapPin className="h-4 w-4" />
            Detaljnije o naseljima
          </Link>
        </div>
      </section>

      {/* Page metadata footer */}
      <footer className="not-prose mt-12 border-t border-neutral-100 pt-6">
        <p className="text-xs text-neutral-400">
          Posljednja izmjena: 31. siječnja 2026. • Izvori: Popis stanovništva
          2021., SECAP Općina Veliki Bukovec, Večernji list, Wikipedia
        </p>
      </footer>
    </PageLayoutV2>
  );
}
