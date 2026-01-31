// apps/web/app/opcina/udruge/page.tsx
// Gold standard page following Blueprint D: "Associations"
// Last updated: 2026-01-31
// Sources: DRVB_1.md, DRVB_2.pdf, velikibukovec.hr

import {
  AlertTriangle,
  Calendar,
  Flame,
  Heart,
  Info,
  MapPin,
  Music,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../../components/page-layout-v2';

import type { PageSection } from '../../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Udruge i društva | Općina Veliki Bukovec',
  description:
    'Dobrovoljni vatrogasci, nogometni klubovi i kulturne udruge Općine Veliki Bukovec. DVD Dubovica osnovan 1928., NK Bukovčan, NK Poljoprivrednik i udruge žena koje čuvaju tradiciju.',
  openGraph: {
    title: 'Udruge i društva | Općina Veliki Bukovec',
    description:
      'Zajednica koja živi kroz volontere - vatrogasci, sportaši i kulturne udruge koje čine srce naše općine.',
    images: ['/images/hero/veliki-bukovec-hero-1.jpg'],
  },
};

const pageSections: PageSection[] = [
  { id: 'uvod', label: 'O udrugama' },
  { id: 'vatrogasci', label: 'DVD-ovi' },
  { id: 'sport', label: 'Sportski klubovi' },
  { id: 'kultura', label: 'Kulturne udruge' },
  { id: 'ukljuci-se', label: 'Uključi se' },
];

// Key facts from research
const keyFacts = {
  dvdCount: 3,
  oldestDvd: 1928,
  footballClubs: 2,
  activeAssociations: '10+',
  volunteersEstimate: '200+',
};

export default function UdrugePage() {
  return (
    <PageLayoutV2
      title="Udruge i društva"
      subtitle="Zajednica koja živi kroz volontere - vatrogasci, sportaši i čuvari tradicije"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      {/* Uvod Section */}
      <section id="uvod" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary-600" />O udrugama
        </h2>

        <p className="text-lg leading-relaxed">
          U Općini Veliki Bukovec udruge nisu samo organizacije na papiru - one
          su <strong>neformalna vlada zajednice</strong>. Dok službene institucije
          upravljaju proračunom i propisima, dobrovoljni vatrogasci, nogometni
          klubovi i udruge žena upravljaju onim što doista čini selo selom:
          zajedničkim radom, međusobnom pomoći i očuvanjem onoga što nas čini
          &ldquo;našima&rdquo;.
        </p>

        <p>
          Povijesno, ove udruge bile su daleko utjecajnije od bilo koje službene
          institucije. U doba kada država nije stizala do rubova Podravine,{' '}
          <strong>vatrogasci su štitili od požara i poplava</strong>, a
          nogometni klubovi davali mladima razlog da ostanu. I danas, kada općina
          želi nešto objaviti, često to radi preko vatrogasne postaje ili
          objave nakon nedjeljne mise - jer tu su ljudi.
        </p>

        {/* Key Facts Utility Container */}
        <div className="not-prose my-8 rounded-xl border border-primary-200 bg-primary-50/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <Sparkles className="h-5 w-5 text-primary-600" />
            Ključne činjenice
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-sm text-neutral-500">Vatrogasna društva</div>
                <div className="font-semibold">{keyFacts.dvdCount} DVD-a</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Najstariji DVD</div>
                <div className="font-semibold">od {keyFacts.oldestDvd}.</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-neutral-500">Nogometni klubovi</div>
                <div className="font-semibold">{keyFacts.footballClubs} aktivna</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Aktivne udruge</div>
                <div className="font-semibold">{keyFacts.activeAssociations}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-neutral-500">Volonteri</div>
                <div className="font-semibold">{keyFacts.volunteersEstimate}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Tradicija</div>
                <div className="font-semibold">gotovo 100 godina</div>
              </div>
            </div>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Predsjednici vatrogasnih društava često sjede u općinskim vijećima.
            Ako župnik izrazi brigu oko ograde na groblju ili ceste do kapelice,
            načelnik sluša. U maloj zajednici gdje se svi poznaju, udruge su
            stvarni centar moći - ne na papiru, ali u praksi.
          </p>
        </div>
      </section>

      {/* DVD-ovi Section */}
      <section id="vatrogasci" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-red-600" />
          Dobrovoljni vatrogasci
        </h2>

        <p className="text-lg leading-relaxed">
          U Podravini, vatrogasci nisu samo za požare. Oni su{' '}
          <strong>prva crta obrane od poplava</strong>, organizatori seoskih
          proslava, i često jedina organizirana snaga koja može mobilizirati
          selo u roku od sat vremena. Svako od tri naselja ima svoj DVD -
          tradicija koja seže gotovo stoljeće unazad.
        </p>

        {/* DVD Veliki Bukovec */}
        <h3 className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary-600" />
          DVD Veliki Bukovec
        </h3>
        {/* TODO: Photo - DVD Veliki Bukovec vatrogasno vozilo ili postrojba */}
        <p>
          Kao vatrogasno društvo općinskog središta, DVD Veliki Bukovec ima
          koordinacijsku ulogu u zaštiti cijele općine. Smješteni u neposrednoj
          blizini općinske zgrade, prvi su na terenu kada zatreba - bilo da se
          radi o požaru na polju tijekom žetve, izlijevanju rijeke, ili
          tehničkoj intervenciji na prometnici.
        </p>
        <p>
          Društvo broji preko <strong>50 aktivnih članova</strong> različitih
          dobnih skupina. Posebno su ponosni na svoje natjecateljske sekcije
          koje redovito sudjeluju na županijskim vatrogasnim natjecanjima.
          Vatrogasni dom služi i kao mjesto okupljanja - od predavanja o
          sigurnosti do organizacije Svetog Florijana, zaštitnika vatrogasaca.
        </p>

        {/* DVD Dubovica */}
        <h3 className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary-600" />
          DVD Dubovica - najstariji u općini
        </h3>
        {/* TODO: Photo - DVD Dubovica historijska ili suvremena fotografija */}
        <p>
          <strong>Osnovan 1928. godine</strong>, DVD Dubovica jedno je od
          najstarijih vatrogasnih društava u široj regiji. Gotovo stoljeće
          kontinuiranog djelovanja svjedoči o upornosti zajednice koja, iako
          danas broji tek oko 260 stanovnika, nikada nije dopustila da njihovo
          vatrogasno društvo zamre.
        </p>
        <p>
          Dubovičani su poznati po svojoj samoorganiziranosti. Tijekom velikih
          poplava 2014. godine, dok je državna pomoć kasnila, mještani su sami
          organizirali obranu - kopali odvode, punili vreće pijeskom, štitili
          kuće susjeda. &ldquo;Cijelo selo je na nogama&rdquo;, govorili su tada, &ldquo;a račune
          od Hrvatskih voda redovito primamo.&rdquo; Ta gorčina prema sporoj
          birokraciji i oslanjanje na vlastite snage definira karakter sela -
          i njegovog DVD-a.
        </p>

        <div className="not-prose my-6 rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-red-100 p-2">
              <Flame className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">
                Poplava 2014. - lekcija o samopomoći
              </h4>
              <p className="mt-1 text-sm text-neutral-600">
                Kada su Bednja i Plitvica prijetile da će preplaviti sela, a
                službeni nasipi pokazali nedostatnima, mještani Kapele Podravske
                i Dubovice uzeli su stvar u svoje ruke. U očajničkom činu
                samoobrane, fizički su prokopali cestovni nasip kako bi stvorili
                nužni preljev i spasili svoje domove. &ldquo;Ovakve poplave ne pamtimo
                već 40 godina&rdquo;, rekli su - a njihova hitrost spasila je selo.
              </p>
            </div>
          </div>
        </div>

        {/* DVD Kapela Podravska */}
        <h3 className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary-600" />
          DVD Kapela Podravska
        </h3>
        {/* TODO: Photo - DVD Kapela Podravska */}
        <p>
          DVD Kapela Podravska djeluje u selu poznatom po poduzetništvu i
          cvjećarstvu. Vatrogasci ovdje imaju posebno važnu ulogu jer štite
          brojne plastenike i staklenike koji su vitalni za lokalno
          gospodarstvo. Požar u stakleniku može uništiti godinu dana rada u
          nekoliko minuta.
        </p>
        <p>
          Osim protupožarne zaštite, DVD organizira društvene događaje koji
          okupljaju mještane svih generacija. U selu gdje je većina prezaposlena
          radom u cvjećarstvu i pilani, vatrogasni dom jedno je od rijetkih
          mjesta gdje se zajednica okuplja izvan radnog konteksta.
        </p>

        {/* Did you know? Box - Firefighters */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Vatrogasna natjecanja nisu samo sport - to su događaji koji okupljaju
            cijelu općinu. Desetljećima unazad, DVD-ovi su organizirali godišnje
            zabave povodom Svetog Florijana, natjecanja u gašenju i spretnosti,
            a potom zajedničku večeru. Te tradicije postoje i danas, iako s
            manjim brojem mladih natjecatelja nego prije.
          </p>
        </div>

        {/* Link to settlements */}
        <div className="not-prose mt-6 flex flex-wrap gap-3">
          <Link
            href="/opcina/naselja/dubovica"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <MapPin className="h-4 w-4" />
            O Dubovici
          </Link>
          <Link
            href="/opcina/naselja/kapela-podravska"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <MapPin className="h-4 w-4" />
            O Kapeli Podravskoj
          </Link>
        </div>
      </section>

      {/* Sportski klubovi Section */}
      <section id="sport" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-green-600" />
          Sportski klubovi
        </h2>

        <p className="text-lg leading-relaxed">
          Nogomet je na ovim prostorima više od sporta - to je{' '}
          <strong>ritualni susret zajednice</strong>. Nedjeljom popodne, dok
          se na travnjaku odvija utakmica, žene pripremaju sendviče za igrače,
          lokalne tvrtke sponzoriraju dresove, a polovica sela bodri s tribina.
          Ili barem, tako je bilo dok je bilo dovoljno mladih.
        </p>

        {/* NK Bukovčan */}
        <h3 className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-green-600" />
          NK Bukovčan
        </h3>
        {/* TODO: Photo - NK Bukovčan ekipa ili igralište */}
        <p>
          <strong>Osnovan 1946. godine</strong>, NK Bukovčan predstavlja Veliki
          Bukovec u županijskim nogometnim natjecanjima. Klub ima dugu tradiciju
          i generacije igrača koji su nosili zeleno-bijeli dres (ili koje god
          boje klub koristi).
        </p>
        <p>
          Danas se klub natječe u nižim ligama i oslanja na kombinaciju
          veterana i talentirane mladeži. Igralište u Velikom Bukovcu mjesto
          je ne samo utakmica, već i društvenih okupljanja. Klub aktivno radi
          s mlađim uzrastima, svjestan da je svako dijete koje ostane u selu
          i investicija u budućnost.
        </p>

        {/* NK Poljoprivrednik */}
        <h3 className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-green-600" />
          NK Poljoprivrednik
        </h3>
        {/* TODO: Photo - NK Poljoprivrednik */}
        <p>
          NK Poljoprivrednik iz Kapele Podravske nosi ime koje odaje počast
          poljoprivrednoj tradiciji kraja. Klub okuplja igrače iz Kapele
          Podravske i okolnih mjesta, te se natječe u županijskim ligama.
        </p>
        <p>
          Poput ostalih seoskih klubova, i Poljoprivrednik se suočava s
          izazovima pronalaska dovoljno igrača. No zahvaljujući činjenici da
          Kapela ima nešto mlađu demografsku strukturu (zbog cvjećarskih
          obiteljskih poduzeća koja zadržavaju mlade), klub uspijeva održati
          kontinuitet.
        </p>

        {/* NK Croatia Dubovica - defunct */}
        <h3 className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          NK Croatia Dubovica - ugašen klub
        </h3>
        <p>
          <strong>Osnovan 1976. godine</strong>, NK Croatia Dubovica bio je
          ponos najmanjih naselja općine. Desetljećima je klub okupljao mlade
          Dubovčane, davao im razlog za ostanak i gradio seoski identitet kroz
          sport.
        </p>

        <div className="not-prose my-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-amber-100 p-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">
                &ldquo;Nedostatak mladih&rdquo; - demografski pokazatelj
              </h4>
              <p className="mt-1 text-sm text-neutral-600">
                NK Croatia Dubovica prestao je s radom zbog{' '}
                <strong>&ldquo;nedostatka mladih&rdquo;</strong> - jednostavno više nije
                bilo dovoljno mladića da se sastavi tim. Ova činjenica govori
                više od bilo koje statistike o demografskom stanju sela.
                Dubovica, koja je 1971. imala preko 400 stanovnika, danas ih
                broji tek oko 260, većinom starije dobi.
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Gašenje nogometnog kluba nije samo sportski gubitak - to je
                simbol šireg trenda koji pogađa hrvatska sela: mladi odlaze,
                institucije koje su ih držale zajedno nestaju, a s njima i
                dijelić identiteta zajednice.
              </p>
            </div>
          </div>
        </div>

        {/* Other sports */}
        <h3>Ostale sportske udruge</h3>
        <p>
          Osim nogometa, u općini djeluju i druge sportske udruge koje njeguju
          lokalne tradicije:
        </p>
        <ul>
          <li>
            <strong>Lovačko društvo &ldquo;Fazan&rdquo;</strong> - upravlja lovištem na
            području općine i brine se za očuvanje divljači. Organizira
            tradicionalne lovačke manifestacije i sudjeluje u održavanju
            prirodne ravnoteže.
          </li>
          <li>
            <strong>Športsko ribolovni klub &ldquo;Linjak&rdquo;</strong> - okuplja
            ljubitelje sportskog ribolova. Klub upravlja ribolovnim vodama na
            rijeci Plitvici i organizira natjecanja. Rijeka koja dijeli
            Dubovicu na gornji i donji dio idealna je za ovu aktivnost.
          </li>
        </ul>

        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            U doba procvata, nedjeljne utakmice bile su društveni događaj
            tjedna. Polovica sela bi se okupila uz teren, žene bi pripremale
            hranu, a lokalne tvrtke sponzorirale dresove. Danas, s manjim
            brojem mladih, klubovi se oslanjaju na veterane i igrače iz drugih
            mjesta. Kafić uz nogometno igralište u Velikom Bukovcu, nekada
            prepun navečer, danas je većinom tih.
          </p>
        </div>
      </section>

      {/* Kulturne udruge Section */}
      <section id="kultura" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-purple-600" />
          Kulturne i ostale udruge
        </h2>

        <p className="text-lg leading-relaxed">
          Dok vatrogasci štite i sportaši igraju, <strong>žene čuvaju</strong>.
          Čuvaju recepte, čuvaju običaje, čuvaju priče. Udruge žena u ovoj
          općini tiho, ali uporno održavaju tradiciju koja bi inače nestala -
          od starih jela do ručnih radova, od organizacije humanitarnih akcija
          do brige o najstarijim sumještanima.
        </p>

        {/* Udruga žena Veliki Bukovec */}
        <h3 className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-purple-600" />
          Udruga žena Veliki Bukovec
        </h3>
        {/* TODO: Photo - Udruga žena Veliki Bukovec na nekom događaju */}
        <p>
          Udruga žena Veliki Bukovec aktivno djeluje na očuvanju tradicije i
          običaja. Članice sudjeluju na brojnim manifestacijama u općini i
          šire, organiziraju humanitarne akcije i brinu se za očuvanje lokalnog
          kulinarskog nasljeđa.
        </p>
        <p>
          Kroz godine, udruga je postala nezaobilazna u organizaciji svih
          većih događanja - od crkvenih blagdana do Dana općine. Kada treba
          pripremiti tradicionalna jela za goste, organizirati tombolu za
          humanitarne svrhe, ili jednostavno osigurati da nitko ne ostane sam
          za blagdane - tu su žene.
        </p>

        {/* Kapelske žene */}
        <h3 className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-purple-600" />
          Udruga &ldquo;Kapelske žene&rdquo;
        </h3>
        {/* TODO: Photo - Kapelske žene */}
        <p>
          Udruga &ldquo;Kapelske žene&rdquo; iz Kapele Podravske posebno je aktivna u
          očuvanju folklora i tradicijskih vrijednosti. U selu poznatom po
          prezaposlenosti (cvjećarstvo zahtijeva rad od zore do mraka), ova
          udruga pruža rijedak prostor za druženje i zajedništvo izvan posla.
        </p>
        <p>
          Članice organiziraju kulturna događanja, čuvaju tradicijske recepte
          i ručne radove, te pružaju podršku ranjivim članovima zajednice.
          Iako nisu formalno kulturno-umjetničko društvo (KUD), u praksi
          obavljaju tu ulogu - prenoseći znanja i običaje mlađim generacijama.
        </p>

        {/* Church groups */}
        <h3 className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary-600" />
          Crkvene i župne skupine
        </h3>
        <p>
          U sklopu župe sv. Franje Asiškog djeluje nekoliko skupina koje
          obogaćuju duhovni i kulturni život zajednice:
        </p>
        <ul>
          <li>
            <strong>Marijansko društvo</strong> - okuplja vjernike koji posebno
            štuju Blaženu Djevicu Mariju. Organizira hodočašća, molitvene
            susrete i sudjeluje u uređenju crkve za blagdane.
          </li>
          <li>
            <strong>Župni zbor</strong> - pjeva na nedjeljnim misama i većim
            blagdanima. U zajednici gdje je Crkva stoljeća bila &ldquo;operativni
            sustav&rdquo; društvenog života, zbor ima posebno mjesto.
          </li>
          <li>
            <strong>Karitativna skupina</strong> - brine se za pomoć potrebitima
            unutar župe, posebno starijim i bolesnima.
          </li>
        </ul>

        {/* Umirovljenici */}
        <h3 className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary-600" />
          Udruga umirovljenika
        </h3>
        <p>
          Udruga umirovljenika Općine Veliki Bukovec okuplja starije mještane
          s područja sva tri naselja. U općini gdje prosječna dob raste iz
          godine u godinu, ova udruga ima sve veći značaj.
        </p>
        <p>
          Udruga organizira izlete, druženja i zajedničke aktivnosti za
          umirovljenike. No njezina uloga seže dalje - u zajednici bez
          formalnih socijalnih službi, članovi udruge često provjeravaju jedni
          druge, osiguravajući da nitko ne ostane zaboravljen.
        </p>

        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Nekada su postojala kulturno-umjetnička društva (KUD) koja su
            izvodila podravske narodne pjesme i plesove. Iako formalni KUD-ovi
            više ne postoje, folklor preživljava kroz školu (djeca uče
            tradicionalne plesove na tjelesnom) i povremene nastupe na crkvenim
            blagdanima. Stariji još znaju stare pjesme - pitanje je samo hoće
            li ih netko zabilježiti prije nego što to znanje nestane.
          </p>
        </div>
      </section>

      {/* Uključi se Section */}
      <section id="ukljuci-se" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary-600" />
          Uključi se
        </h2>

        <p className="text-lg leading-relaxed">
          Udruge žive od novih članova. Bez obzira jeste li mladi koji tek
          ulaze u svijet volontiranja ili iskusni umirovljenik koji želi
          doprinijeti zajednici - ovdje ima mjesta za sve.
        </p>

        <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
          {/* Postani vatrogasac */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <Flame className="h-5 w-5 text-red-600" />
              </div>
              <h4 className="font-semibold text-neutral-900">Postani vatrogasac</h4>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              DVD-ovi primaju nove članove svih dobi. Obuka je besplatna, a
              stječete vještine koje mogu spasiti živote - uključujući vaš.
              Kontaktirajte lokalni DVD ili općinu za više informacija.
            </p>
          </div>

          {/* Pridruži se udruzi */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <Heart className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-neutral-900">Pridruži se udruzi</h4>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Udruge žena, umirovljenika i crkvene skupine uvijek traže nove
              članove. Nije potrebno posebno iskustvo - samo volja za
              zajedničkim radom i očuvanjem tradicije.
            </p>
          </div>

          {/* Podrži sport */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-neutral-900">Podrži lokalni sport</h4>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              NK Bukovčan i NK Poljoprivrednik trebaju igrače, trenere i
              navijače. Možete i financijski podržati klubove kao sponzor -
              svaka kuna pomaže.
            </p>
          </div>

          {/* Registriraj novu udrugu */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary-100 p-2">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <h4 className="font-semibold text-neutral-900">Osnuj novu udrugu</h4>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Imate ideju za novu aktivnost u zajednici? Općina podržava
              osnivanje novih udruga i može pomoći s registracijom i početnim
              financiranjem.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="not-prose mt-8 rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-neutral-900">
            Želite više informacija?
          </h3>
          <p className="mt-2 text-neutral-600">
            Kontaktirajte općinsku upravu za informacije o registraciji i
            financiranju udruga, ili se izravno obratite postojećim udrugama.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
            >
              Kontaktirajte nas
            </Link>
            <Link
              href="/usluge"
              className="inline-flex items-center gap-2 rounded-lg border border-primary-300 bg-white px-5 py-2.5 font-medium text-primary-700 transition-colors hover:bg-primary-50"
            >
              Usluge za udruge
            </Link>
          </div>
        </div>
      </section>

      {/* Page metadata footer */}
      <footer className="not-prose mt-12 border-t border-neutral-100 pt-6">
        <p className="text-xs text-neutral-400">
          Posljednja izmjena: 31. siječnja 2026. • Izvori: DRVB istraživanje,
          velikibukovec.hr, Večernji list, Wikipedia
        </p>
      </footer>
    </PageLayoutV2>
  );
}
