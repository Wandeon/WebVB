// apps/web/app/usluge/page.tsx
// Gold standard page following Blueprint C: "Services" Page
// Last updated: 2026-01-31
// Sources: velikibukovec.hr, DRVB_1.md, DRVB_2.pdf
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Droplets,
  ExternalLink,
  FileText,
  Flame,
  HandHeart,
  Heart,
  HelpCircle,
  Landmark,
  Leaf,
  Lightbulb,
  MapPin,
  Phone,
  Receipt,
  Recycle,
  Shield,
  Sparkles,
  Trash2,
  Truck,
  Users2,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Usluge građanima | Općina Veliki Bukovec',
  description:
    'Sve usluge Općine Veliki Bukovec na jednom mjestu - komunalno gospodarstvo, financije, dokumenti, podrška udrugama. Saznajte što vam treba i kako do toga.',
  openGraph: {
    title: 'Usluge građanima | Općina Veliki Bukovec',
    description:
      'Komunalne usluge, financije, dokumenti i podrška za građane i udruge Općine Veliki Bukovec.',
    images: ['/images/hero/veliki-bukovec-hero-1.jpg'],
  },
};

const pageSections: PageSection[] = [
  { id: 'pregled', label: 'Pregled' },
  { id: 'komunalno', label: 'Komunalno' },
  { id: 'financije', label: 'Financije' },
  { id: 'gradani', label: 'Za građane' },
  { id: 'udruge', label: 'Udruge' },
];

// Key service facts
const serviceFacts = {
  wastePickupDays: 2,
  officeHours: '8:00 - 14:00',
  phone: '042 840 040',
  email: 'opcinavk@gmail.com',
  responseTime: '3-5 dana',
  budgetYear: 2026,
};

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  details?: string;
  documents?: string[];
  link?: string;
  linkText?: string;
  external?: boolean;
}

function ServiceCard({
  icon: Icon,
  title,
  description,
  details,
  documents,
  link,
  linkText,
  external,
}: ServiceCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600">{description}</p>
      {details && <p className="mt-2 text-xs text-neutral-500">{details}</p>}
      {documents && documents.length > 0 && (
        <div className="mt-3 border-t border-neutral-100 pt-3">
          <p className="text-xs font-medium text-neutral-500">
            Potrebni dokumenti:
          </p>
          <ul className="mt-1 space-y-1">
            {documents.map((doc, index) => (
              <li
                key={index}
                className="flex items-start gap-1.5 text-xs text-neutral-600"
              >
                <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary-500" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}
      {link && linkText && (
        <Link
          href={link}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          {linkText}
          {external && <ExternalLink className="h-3 w-3" />}
        </Link>
      )}
    </div>
  );
}

interface InfoBoxProps {
  type: 'warning' | 'info' | 'tip';
  title: string;
  children: React.ReactNode;
  link?: { href: string; text: string };
}

function InfoBox({ type, title, children, link }: InfoBoxProps) {
  const styles = {
    warning: {
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      title: 'text-amber-900',
      text: 'text-amber-800',
      link: 'text-amber-700 hover:text-amber-900',
      icon: AlertTriangle,
    },
    info: {
      border: 'border-primary-200',
      bg: 'bg-primary-50',
      title: 'text-primary-900',
      text: 'text-primary-800',
      link: 'text-primary-700 hover:text-primary-900',
      icon: HelpCircle,
    },
    tip: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      title: 'text-green-900',
      text: 'text-green-800',
      link: 'text-green-700 hover:text-green-900',
      icon: Lightbulb,
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-5`}>
      <h4 className={`flex items-center gap-2 font-semibold ${style.title}`}>
        <Icon className="h-4 w-4" />
        {title}
      </h4>
      <div className={`mt-2 text-sm ${style.text}`}>{children}</div>
      {link && (
        <Link
          href={link.href}
          className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium ${style.link}`}
        >
          {link.text} →
        </Link>
      )}
    </div>
  );
}

export default function UslugePage() {
  return (
    <PageLayoutV2
      title="Usluge građanima"
      subtitle="Što općina radi za vas - od odvoza otpada do potpore udrugama"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      {/* Pregled Section */}
      <section id="pregled" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-600" />
          Pregled usluga
        </h2>

        <p className="text-lg leading-relaxed">
          Jedinstveni upravni odjel (JUO) Općine Veliki Bukovec pruža sve
          administrativne usluge za <strong>1.325 stanovnika</strong> tri
          naselja. Ovdje ćete pronaći praktične informacije o tome{' '}
          <strong>što vam treba</strong>, <strong>gdje se obratiti</strong> i{' '}
          <strong>koje dokumente pripremiti</strong>.
        </p>

        <p>
          U maloj općini poput naše, odnos s građanima je osoban - ne morate
          čekati u redovima niti puniti formulare online. Dođite u ured, recite
          što vam treba, i riješit ćemo zajedno.
        </p>

        {/* Key Facts Utility Container */}
        <div className="not-prose my-8 rounded-xl border border-primary-200 bg-primary-50/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <Sparkles className="h-5 w-5 text-primary-600" />
            Brzi pregled
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Radno vrijeme</div>
                <div className="font-semibold">Pon-Pet {serviceFacts.officeHours}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Telefon</div>
                <div className="font-semibold">{serviceFacts.phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Adresa</div>
                <div className="font-semibold">Veliki Bukovec 53</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Odvoz otpada</div>
                <div className="font-semibold">
                  {serviceFacts.wastePickupDays}x mjesečno
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Vrijeme obrade</div>
                <div className="font-semibold">{serviceFacts.responseTime}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary-600" />
              <div>
                <div className="text-sm text-neutral-500">Email</div>
                <div className="font-semibold text-sm">{serviceFacts.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Did you know? Box */}
        <div className="not-prose rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Općina Veliki Bukovec ima samo{' '}
            <strong>2 zaposlenika u JUO</strong> koji pokrivaju sve
            administrativne potrebe tri naselja. Za usporedbu, gradska uprava
            Varaždina ima preko 200 zaposlenika. Kod nas znate tko rješava vaš
            predmet - i on zna vas.
          </p>
        </div>

        {/* Quick links */}
        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Phone className="h-4 w-4" />
            Kontaktirajte nas
          </Link>
          <Link
            href="/prijava-problema"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <AlertTriangle className="h-4 w-4" />
            Prijavite problem
          </Link>
          <Link
            href="/dokumenti?kategorija=obrasci"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <FileText className="h-4 w-4" />
            Obrasci
          </Link>
        </div>
      </section>

      {/* Komunalno Section */}
      <section id="komunalno" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary-600" />
          Komunalno gospodarstvo
        </h2>
        <p className="text-lg leading-relaxed">
          Održavanje javnih površina, cesta, rasvjete i upravljanje otpadom -
          sve što čini vaš svakodnevni život ugodnijim i sigurnijim.
        </p>

        <h3>Odvoz otpada</h3>
        <p>
          Odvoz komunalnog i reciklabilnog otpada obavlja se prema utvrđenom
          rasporedu za sva tri naselja. Miješani komunalni otpad odvozi se{' '}
          <strong>dva puta mjesečno</strong>, dok se reciklabilni otpad (papir,
          plastika, staklo) prikuplja <strong>jednom mjesečno</strong>.
        </p>

        <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={Trash2}
            title="Miješani komunalni otpad"
            description="Odvoz svakog drugog tjedna prema rasporedu za vaše naselje"
            details="Kante se postavljaju na rub parcele večer prije odvoza"
            link="/odvoz-otpada"
            linkText="Pogledaj raspored"
          />
          <ServiceCard
            icon={Recycle}
            title="Reciklabilni otpad"
            description="Papir, plastika, staklo i metal - jednom mjesečno"
            details="Posebne vreće dobivaju se u općinskoj upravi"
          />
          <ServiceCard
            icon={Leaf}
            title="Zeleni otpad"
            description="Biootpad i zeleni otpad iz vrtova"
            details="Kompostiranje na vlastitoj parceli ili odvoz na zahtjev"
          />
          <ServiceCard
            icon={AlertTriangle}
            title="Glomazni otpad"
            description="Namještaj, bijela tehnika, građevinski otpad"
            details="Potrebna najava 7 dana unaprijed"
            link="/kontakt"
            linkText="Najavite odvoz"
          />
        </div>

        <div className="not-prose mt-6">
          <InfoBox
            type="tip"
            title="Savjet za recikliranje"
            link={{ href: '/odvoz-otpada', text: 'Više o sortiranju' }}
          >
            <p>
              Plastiku isperite prije odlaganja - jedna masna boca može
              kontaminirati cijelu seriju za reciklažu. Staklo ne ide s
              keramikom!
            </p>
          </InfoBox>
        </div>

        <h3>Infrastruktura i održavanje</h3>
        <p>
          Općina održava <strong>oko 25 km</strong> nerazvrstanih cesta, javnu
          rasvjetu u sva tri naselja, te zelene površine i parkove. U zimskim
          mjesecima organizira se čišćenje snijega i posipanje soli.
        </p>

        <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={Wrench}
            title="Održavanje cesta"
            description="Popravak udarnih rupa, asfaltiranje, odvodnja"
            details="Prijavite oštećenje putem obrasca ili telefonom"
            link="/prijava-problema"
            linkText="Prijavi oštećenje"
          />
          <ServiceCard
            icon={Lightbulb}
            title="Javna rasvjeta"
            description="Održavanje i zamjena rasvjetnih tijela"
            details="Prijava neispravne rasvjete: 042 840 040"
          />
          <ServiceCard
            icon={Droplets}
            title="Vodoopskrba"
            description="Priključci na vodovodnu mrežu i kvaliteta vode"
            details="Koncesionar: Varkom d.d. Varaždin"
            link="https://varkom.hr"
            linkText="Varkom web"
            external
          />
          <ServiceCard
            icon={Leaf}
            title="Zelene površine"
            description="Košnja trave, obrezivanje drveća, parkovi"
            details="Sezonsko održavanje proljeće-jesen"
          />
        </div>

        <h3>Dimnjačarski poslovi</h3>
        <p>
          Redoviti pregledi i čišćenje dimnjaka obavezni su za sigurnost
          građana. Općina ima ugovor s ovlaštenim dimnjačarom koji pokriva sva
          tri naselja.
        </p>

        <div className="not-prose mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <div className="flex items-start gap-4">
            <Flame className="h-8 w-8 flex-shrink-0 text-orange-500" />
            <div>
              <h4 className="font-semibold text-neutral-900">
                Ovlašteni dimnjačar
              </h4>
              <p className="mt-1 text-sm text-neutral-600">
                Pregled dimnjaka obavezan je jednom godišnje za sva kućanstva
                koja koriste čvrsta goriva (drvo, ugljen).
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                <strong>Kontakt:</strong> Dimnjačarski obrt Novak
                <br />
                <strong>Telefon:</strong> 098 XXX XXXX
              </p>
            </div>
          </div>
        </div>

        <h3>Groblja</h3>
        <p>
          Općina upravlja s <strong>dva groblja</strong> - u Velikom Bukovcu
          (uz crkvu sv. Franje Asiškog) i u Dubovici. Za dodjelu grobnog mjesta
          ili produženje zakupa obratite se u općinsku upravu.
        </p>

        <div className="not-prose mt-4 rounded-xl border border-neutral-200 bg-white p-5">
          <h4 className="font-semibold text-neutral-900">
            Potrebni dokumenti za grobno mjesto
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
              Zahtjev za dodjelu/produženje (obrazac u upravi)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
              Preslika osobne iskaznice
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
              Dokaz o prebivalištu na području općine
            </li>
          </ul>
        </div>

        <div className="not-prose mt-8">
          <InfoBox
            type="warning"
            title="Prijava komunalnog problema"
            link={{ href: '/prijava-problema', text: 'Prijavite problem' }}
          >
            <p>
              Uočili ste oštećenje ceste, problem s rasvjetom ili nelegalno
              odlaganje otpada? Prijavite nam putem online obrasca ili
              telefonom. Reagiramo unutar 48 sati za hitne slučajeve.
            </p>
          </InfoBox>
        </div>
      </section>

      {/* Financije Section */}
      <section id="financije" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary-600" />
          Financije i proračun
        </h2>
        <p className="text-lg leading-relaxed">
          Transparentno upravljanje javnim sredstvima - proračun, porezi,
          naknade i izvještaji dostupni svim građanima. Vaš novac, vaše pravo na
          informacije.
        </p>

        <h3>Općinski proračun</h3>
        <p>
          Proračun Općine Veliki Bukovec za {serviceFacts.budgetYear}. godinu
          iznosi oko <strong>3,5 milijuna kuna</strong>. Glavnina sredstava
          usmjerena je na komunalnu infrastrukturu, obrazovanje (sufinanciranje
          škole i vrtića) te potpore udrugama i poljoprivrednicima.
        </p>

        <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={Receipt}
            title="Proračun i rebalans"
            description="Godišnji proračun s detaljnim planiranjem prihoda i rashoda"
            link="/dokumenti?kategorija=proracun"
            linkText="Proračunski dokumenti"
          />
          <ServiceCard
            icon={FileText}
            title="Financijski izvještaji"
            description="Polugodišnji i godišnji izvještaji o izvršenju proračuna"
            link="/dokumenti?kategorija=proracun"
            linkText="Pogledaj izvještaje"
          />
        </div>

        {/* Did you know? */}
        <div className="not-prose mt-6 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            Proračun po stanovniku u Velikom Bukovcu iznosi oko{' '}
            <strong>2.640 kuna godišnje</strong>. Za usporedbu, u Gradu Varaždinu
            taj iznos je preko 6.000 kuna - ali zato kod nas svatko može doći
            načelniku i reći što mu treba.
          </p>
        </div>

        <h3>Porezi i naknade</h3>
        <p>
          Općina ubire lokalne poreze sukladno zakonu. Glavni izvor prihoda su
          porez na dohodak (dio koji pripada općini), komunalna naknada i
          komunalni doprinos.
        </p>

        <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={Building}
            title="Komunalna naknada"
            description="Naknada za korištenje komunalne infrastrukture"
            details="Plaća se prema m² nekretnine, rješenje izdaje JUO"
            documents={[
              'Dokaz o vlasništvu nekretnine',
              'Podaci o površini objekta',
            ]}
          />
          <ServiceCard
            icon={Landmark}
            title="Komunalni doprinos"
            description="Jednokratna naknada pri gradnji ili rekonstrukciji"
            details="Obračunava se prema m³ građevine"
            documents={[
              'Građevinska dozvola ili prijava',
              'Projektna dokumentacija',
            ]}
          />
        </div>

        <h3>Javna nabava</h3>
        <p>
          Svi postupci javne nabave provode se transparentno i objavljuju na
          Elektroničkom oglasniku javne nabave (EOJN). Općina primjenjuje načela
          ekonomičnosti, učinkovitosti i jednakog tretmana.
        </p>

        <div className="not-prose mt-4 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={ClipboardList}
            title="Javna nabava"
            description="Postupci javne nabave objavljuju se na EOJN portalu"
            link="https://eojn.nn.hr/"
            linkText="EOJN portal"
            external
          />
          <ServiceCard
            icon={HandHeart}
            title="Donacije i sponzorstva"
            description="Pregled primljenih donacija i dodijeljenih sponzorstava"
            details="Transparentno izvještavanje u godišnjem izvještaju"
          />
        </div>

        <div className="not-prose mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <h4 className="font-semibold text-neutral-900">
            Sudjelovanje građana u planiranju proračuna
          </h4>
          <p className="mt-2 text-sm text-neutral-600">
            Svake jeseni organiziramo javno savjetovanje o prijedlogu proračuna
            za sljedeću godinu. Pozivamo vas da predložite projekte i prioritete
            za vašu ulicu ili naselje.
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            <strong>Kako sudjelovati:</strong> Pošaljite prijedlog emailom,
            osobno u uredu ili na sjednici općinskog vijeća (sjednice su javne).
          </p>
          <Link
            href="/kontakt"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Pošaljite prijedlog →
          </Link>
        </div>
      </section>

      {/* Za građane Section */}
      <section id="gradani" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Users2 className="h-5 w-5 text-primary-600" />
          Za građane
        </h2>
        <p className="text-lg leading-relaxed">
          Sve što vam treba na jednom mjestu - obrasci, zahtjevi, informacije o
          pravima i kako ih ostvariti. Bez birokracije, s osobnim pristupom.
        </p>

        <h3>Obrasci i zahtjevi</h3>
        <p>
          Za većinu usluga potrebno je ispuniti obrazac zahtjeva. Obrasce možete
          preuzeti online ili dobiti u uredu. Za jednostavnije stvari, dovoljno
          je usmeno objasniti što vam treba.
        </p>

        <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={FileText}
            title="Uvjerenja i potvrde"
            description="Potvrde o prebivalištu, o nekažnjavanju, itd."
            details="Izdaju se isti dan ili sljedeći radni dan"
            documents={['Osobna iskaznica', 'Zahtjev (usmeni ili pisani)']}
            link="/dokumenti?kategorija=obrasci"
            linkText="Preuzmi obrasce"
          />
          <ServiceCard
            icon={Shield}
            title="Pristup informacijama"
            description="Pravo na pristup informacijama sukladno zakonu"
            details="Odgovor u roku 15 dana"
            documents={['Zahtjev za pristup informacijama']}
            link="/dokumenti/pravo-na-pristup-informacijama"
            linkText="Više informacija"
          />
        </div>

        <h3>Društveni domovi</h3>
        <p>
          Općina upravlja s društvenim domovima u Velikom Bukovcu, Dubovici i
          Kapeli Podravskoj. Prostori se mogu koristiti za obiteljske proslave,
          skupove udruga i druge prigode.
        </p>

        <div className="not-prose mt-4 rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-start gap-4">
            <Building className="h-8 w-8 flex-shrink-0 text-primary-600" />
            <div>
              <h4 className="font-semibold text-neutral-900">
                Rezervacija društvenog doma
              </h4>
              <p className="mt-1 text-sm text-neutral-600">
                Za rezervaciju kontaktirajte JUO najmanje 14 dana unaprijed.
                Naknada se naplaćuje prema cjeniku za privatne i komercijalne
                događaje. Udruge s područja općine imaju povlaštene uvjete.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-neutral-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
                  Veliki Bukovec - glavni dom (kapacitet do 100 osoba)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
                  Kapela Podravska - vatrogasni dom
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
                  Dubovica - društveni dom
                </li>
              </ul>
            </div>
          </div>
        </div>

        <h3>Civilna zaštita</h3>
        <p>
          Sustav civilne zaštite koordinira odgovor na izvanredne situacije -
          poplave, požare, vremenske nepogode. U slučaju opasnosti, aktiviraju
          se dobrovoljni vatrogasci i stožer civilne zaštite.
        </p>

        {/* Did you know? */}
        <div className="not-prose mt-4 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            DVD Dubovica osnovan je <strong>1928. godine</strong> i još uvijek
            je aktivan! Općina ima tri dobrovoljna vatrogasna društva koja čine
            okosnicu civilne zaštite. Kada su 2014. poplave prijetile Kapeli
            Podravskoj, mještani su sami prokopali nasip da spase svoje kuće -
            jer su znali da pomoć izvana neće stići na vrijeme.
          </p>
        </div>

        <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={Shield}
            title="Stožer civilne zaštite"
            description="Koordinacija u izvanrednim situacijama"
            details="Zapovjednik: načelnik općine"
          />
          <ServiceCard
            icon={Phone}
            title="Hitni brojevi"
            description="Vatrogasci: 193 | Hitna: 194 | Policija: 192"
            details="Europski broj za hitne službe: 112"
          />
        </div>

        <div className="not-prose mt-8">
          <InfoBox type="info" title="Radno vrijeme za stranke">
            <div className="space-y-1">
              <p>
                <strong>Ponedjeljak - Petak:</strong> 8:00 - 14:00
              </p>
              <p>
                <strong>Telefon:</strong> {serviceFacts.phone}
              </p>
              <p>
                <strong>Email:</strong> {serviceFacts.email}
              </p>
              <p className="mt-2 text-xs">
                Za hitne slučajeve izvan radnog vremena kontaktirajte načelnika
                ili dežurnog vijećnika.
              </p>
            </div>
          </InfoBox>
        </div>
      </section>

      {/* Udruge Section */}
      <section id="udruge" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary-600" />
          Podrška udrugama
        </h2>
        <p className="text-lg leading-relaxed">
          Udruge su srce naše zajednice - od vatrogasaca do sportskih klubova,
          od udruga žena do lovačkih društava. Općina podržava njihov rad kroz
          financiranje programa i projekata od interesa za opće dobro.
        </p>

        <h3>Javni natječaj za udruge</h3>
        <p>
          Svake godine početkom godine (siječanj/veljača) Općina raspisuje javni
          natječaj za financiranje programa i projekata udruga. Ukupna sredstva
          variraju ovisno o proračunu, ali tipično iznose{' '}
          <strong>50.000-100.000 kuna godišnje</strong>.
        </p>

        <div className="not-prose mt-6 rounded-xl border border-neutral-200 bg-white p-5">
          <h4 className="font-semibold text-neutral-900">Uvjeti za prijavu</h4>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
              Udruga mora biti registrirana u Registru udruga RH
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
              Sjedište ili djelovanje na području Općine Veliki Bukovec
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
              Program mora biti od interesa za lokalnu zajednicu
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
              Uredno izvještavanje o prethodnim projektima (ako je primjenjivo)
            </li>
          </ul>
          <Link
            href="/obavijesti?kategorija=natjecaj"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Aktualni natječaji →
          </Link>
        </div>

        <h3>Potrebni dokumenti za prijavu</h3>
        <p>Prijava na natječaj mora sadržavati:</p>

        <div className="not-prose mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600" />
              <span>
                <strong>Obrazac prijave</strong> - ispunjen i potpisan od
                ovlaštene osobe
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600" />
              <span>
                <strong>Opis programa/projekta</strong> - ciljevi, aktivnosti,
                očekivani rezultati
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600" />
              <span>
                <strong>Proračun projekta</strong> - detaljna razrada troškova
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600" />
              <span>
                <strong>Izvadak iz Registra udruga</strong> - ne stariji od 3
                mjeseca
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600" />
              <span>
                <strong>Financijsko izvješće</strong> za prethodnu godinu (ako
                postoji)
              </span>
            </li>
          </ul>
          <Link
            href="/dokumenti?kategorija=obrasci"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <FileText className="h-4 w-4" />
            Preuzmi obrasce za udruge
          </Link>
        </div>

        {/* Did you know? */}
        <div className="not-prose mt-6 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Jeste li znali?</p>
          <p className="mt-1 text-sm text-amber-700">
            NK Croatia Dubovica, osnovan 1976., morao je prestati s radom zbog{' '}
            <strong>&quot;nedostatka mladih&quot;</strong> koji bi igrali. To je znak
            vremena - dok udruge poput DVD-a opstaju zahvaljujući starijim
            članovima, sportski klubovi koji trebaju mlade teško preživljavaju
            demografsku krizu.
          </p>
        </div>

        <h3>Aktivne udruge na području općine</h3>
        <p>
          Na području općine djeluje desetak udruga civilnog društva, od kojih
          su najznačajniji dobrovoljni vatrogasci, sportski klubovi i udruge
          žena.
        </p>

        <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={Flame}
            title="DVD Veliki Bukovec"
            description="Dobrovoljno vatrogasno društvo - zaštita od požara i civilna zaštita"
          />
          <ServiceCard
            icon={Flame}
            title="DVD Dubovica"
            description="Osnovan 1928. - jedno od najstarijih DVD-a u okolici"
          />
          <ServiceCard
            icon={Flame}
            title="DVD Kapela Podravska"
            description="Aktivna zajednica vatrogasaca"
          />
          <ServiceCard
            icon={Users2}
            title="NK Bukovčan"
            description="Nogometni klub Veliki Bukovec"
          />
          <ServiceCard
            icon={Users2}
            title="NK Poljoprivrednik"
            description="Nogometni klub Kapela Podravska"
          />
          <ServiceCard
            icon={Heart}
            title="Udruge žena"
            description="Očuvanje tradicije, zajedničke aktivnosti i solidarnost"
          />
        </div>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Link
            href="/opcina/udruge"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Heart className="h-4 w-4" />
            Pogledaj sve udruge
          </Link>
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 py-2.5 font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <Phone className="h-4 w-4" />
            Kontaktirajte nas
          </Link>
        </div>
      </section>

      {/* Page metadata footer */}
      <footer className="not-prose mt-12 border-t border-neutral-100 pt-6">
        <p className="text-xs text-neutral-400">
          Posljednja izmjena: 31. siječnja 2026. • Izvori: Jedinstveni upravni
          odjel Općine Veliki Bukovec, velikibukovec.hr, SECAP dokument
        </p>
      </footer>
    </PageLayoutV2>
  );
}
