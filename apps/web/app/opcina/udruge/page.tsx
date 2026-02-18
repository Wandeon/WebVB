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

        <div className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AssociationCard
            icon={<Flame className="h-5 w-5 text-red-600" />}
            iconBg="bg-red-100"
            name="DVD Veliki Bukovec"
            settlement="Veliki Bukovec"
            description="Koordinacijska uloga u zaštiti cijele općine. Preko 50 aktivnih članova, natjecateljske sekcije na županijskim natjecanjima."
          />
          <AssociationCard
            icon={<Flame className="h-5 w-5 text-red-600" />}
            iconBg="bg-red-100"
            name="DVD Dubovica"
            settlement="Dubovica"
            description="Najstarije vatrogasno društvo u općini, osnovano 1928. godine. Gotovo stoljeće kontinuiranog djelovanja."
            badge="Osnovano 1928."
          />
          <AssociationCard
            icon={<Flame className="h-5 w-5 text-red-600" />}
            iconBg="bg-red-100"
            name="DVD Kapela Podravska"
            settlement="Kapela Podravska"
            description="Zaštita plastenika i staklenika vitalnih za lokalno gospodarstvo. Organizator društvenih događaja u selu."
          />
        </div>
      </section>

      {/* Sportski klubovi Section */}
      <section id="sport" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-green-600" />
          Sportski klubovi
        </h2>

        <div className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AssociationCard
            icon={<Trophy className="h-5 w-5 text-green-600" />}
            iconBg="bg-green-100"
            name="NK Bukovčan"
            settlement="Veliki Bukovec"
            description="Županijska nogometna natjecanja od 1946. godine. Aktivna rad s mlađim uzrastima."
            badge="Osnovano 1946."
          />
          <AssociationCard
            icon={<Trophy className="h-5 w-5 text-green-600" />}
            iconBg="bg-green-100"
            name="NK Poljoprivrednik"
            settlement="Kapela Podravska"
            description="Nogometni klub koji nosi ime prema poljoprivrednoj tradiciji kraja. Natječe se u županijskim ligama."
          />
          <AssociationCard
            icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
            iconBg="bg-amber-100"
            name="NK Croatia Dubovica"
            settlement="Dubovica"
            description="Osnovan 1976. godine, prestao s radom zbog nedostatka mladih igrača."
            badge="Neaktivan"
            inactive
          />
          <AssociationCard
            icon={<Shield className="h-5 w-5 text-green-700" />}
            iconBg="bg-green-100"
            name={'Lovačko društvo "Fazan"'}
            description="Upravljanje lovištem, očuvanje divljači i organizacija tradicionalnih lovačkih manifestacija."
          />
          <AssociationCard
            icon={<Shield className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-100"
            name={'ŠRK "Linjak"'}
            description="Športsko ribolovni klub. Upravljanje ribolovnim vodama na rijeci Plitvici i organizacija natjecanja."
          />
        </div>
      </section>

      {/* Kulturne udruge Section */}
      <section id="kultura" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-purple-600" />
          Kulturne i ostale udruge
        </h2>

        <div className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AssociationCard
            icon={<Heart className="h-5 w-5 text-purple-600" />}
            iconBg="bg-purple-100"
            name="Udruga žena Veliki Bukovec"
            settlement="Veliki Bukovec"
            description="Očuvanje tradicije i običaja, organizacija humanitarnih akcija i kulinarskog nasljeđa. Nezaobilazna u organizaciji svih većih događanja."
          />
          <AssociationCard
            icon={<Heart className="h-5 w-5 text-purple-600" />}
            iconBg="bg-purple-100"
            name={'Udruga "Kapelske žene"'}
            settlement="Kapela Podravska"
            description="Očuvanje folklora i tradicijskih vrijednosti. Kulturna događanja, tradicijski recepti i ručni radovi."
          />
          <AssociationCard
            icon={<Music className="h-5 w-5 text-primary-600" />}
            iconBg="bg-primary-100"
            name="Marijansko društvo"
            description="Organizacija hodočašća, molitvenih susreta i uređenje crkve za blagdane."
          />
          <AssociationCard
            icon={<Music className="h-5 w-5 text-primary-600" />}
            iconBg="bg-primary-100"
            name="Župni zbor"
            description="Pjevanje na nedjeljnim misama i većim blagdanima u sklopu župe sv. Franje Asiškog."
          />
          <AssociationCard
            icon={<Heart className="h-5 w-5 text-rose-600" />}
            iconBg="bg-rose-100"
            name="Karitativna skupina"
            description="Pomoć potrebitima unutar župe, posebno starijim i bolesnima."
          />
          <AssociationCard
            icon={<Users className="h-5 w-5 text-primary-600" />}
            iconBg="bg-primary-100"
            name="Udruga umirovljenika"
            description="Organizacija izleta, druženja i zajedničkih aktivnosti za umirovljenike iz sva tri naselja."
          />
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

function AssociationCard({
  icon,
  iconBg,
  name,
  settlement,
  description,
  badge,
  inactive,
}: {
  icon: React.ReactNode;
  iconBg: string;
  name: string;
  settlement?: string;
  description: string;
  badge?: string;
  inactive?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white p-5 shadow-sm ${inactive ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-neutral-900">{name}</h4>
          {settlement && (
            <p className="flex items-center gap-1 text-sm text-neutral-500">
              <MapPin className="h-3 w-3" />
              {settlement}
            </p>
          )}
        </div>
        {badge && (
          <span
            className={`ml-auto flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              inactive
                ? 'bg-amber-100 text-amber-700'
                : 'bg-primary-100 text-primary-700'
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-neutral-600">{description}</p>
    </div>
  );
}
