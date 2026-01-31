// apps/web/app/usluge/page.tsx
import {
  Building,
  ClipboardList,
  ExternalLink,
  FileText,
  Flame,
  HandHeart,
  Heart,
  Landmark,
  Leaf,
  Phone,
  Receipt,
  Shield,
  Truck,
  Users2,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Usluge | Općina Veliki Bukovec',
  description:
    'Sve usluge Općine Veliki Bukovec na jednom mjestu - komunalno gospodarstvo, financije, usluge za građane i podrška udrugama.',
  openGraph: {
    title: 'Usluge | Općina Veliki Bukovec',
    description:
      'Sve usluge Općine Veliki Bukovec na jednom mjestu - komunalno gospodarstvo, financije, usluge za građane i podrška udrugama.',
    images: ['/images/hero/veliki-bukovec-hero-1.jpg'],
  },
};

const pageSections: PageSection[] = [
  { id: 'komunalno', label: 'Komunalno' },
  { id: 'financije', label: 'Financije' },
  { id: 'gradani', label: 'Za građane' },
  { id: 'udruge', label: 'Udruge' },
];

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  details?: string;
  link?: string;
  linkText?: string;
  external?: boolean;
}

function ServiceCard({
  icon: Icon,
  title,
  description,
  details,
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

export default function UslugePage() {
  return (
    <PageLayoutV2
      title="Usluge"
      subtitle="Sve usluge Općine Veliki Bukovec na jednom mjestu"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      {/* Komunalno Section */}
      <section id="komunalno" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary-600" />
          Komunalno
        </h2>
        <p className="text-lg leading-relaxed">
          Komunalno gospodarstvo brine se za održavanje javnih površina,
          infrastrukture i kvalitetu života u našoj općini.
        </p>

        <div className="not-prose mt-8 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={Truck}
            title="Odvoz otpada"
            description="Redoviti odvoz komunalnog i reciklabilnog otpada prema rasporedu"
            link="/odvoz-otpada"
            linkText="Raspored odvoza"
          />
          <ServiceCard
            icon={Leaf}
            title="Javne površine"
            description="Održavanje parkova, cesta, javne rasvjete i zelenih površina"
          />
          <ServiceCard
            icon={Flame}
            title="Dimnjačarski poslovi"
            description="Redoviti pregledi i čišćenje dimnjaka za sigurnost građana"
            details="Ovlašteni dimnjačar: Darko Novak, tel: 098 XXX XXXX"
          />
          <ServiceCard
            icon={Building}
            title="Groblja"
            description="Upravljanje i održavanje mjesnih grobalja"
          />
        </div>

        <div className="not-prose mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h4 className="flex items-center gap-2 font-semibold text-amber-900">
            <Phone className="h-4 w-4" />
            Prijava komunalnog problema
          </h4>
          <p className="mt-2 text-sm text-amber-800">
            Uočili ste oštećenje ceste, problema s rasvjetom ili nelegalno
            odlaganje otpada? Prijavite nam!
          </p>
          <Link
            href="/prijava-problema"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900"
          >
            Prijavite problem →
          </Link>
        </div>
      </section>

      {/* Financije Section */}
      <section id="financije" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary-600" />
          Financije
        </h2>
        <p className="text-lg leading-relaxed">
          Transparentno upravljanje javnim sredstvima - proračun, izvještaji i
          financijski dokumenti dostupni svim građanima.
        </p>

        <div className="not-prose mt-8 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={Receipt}
            title="Proračun"
            description="Godišnji proračun općine s detaljnim planiranjem prihoda i rashoda"
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
          <ServiceCard
            icon={HandHeart}
            title="Donacije i sponzorstva"
            description="Pregled primljenih donacija i dodijeljenih sponzorstava"
          />
          <ServiceCard
            icon={ClipboardList}
            title="Javna nabava"
            description="Postupci javne nabave objavljuju se na EOJN portalu"
            link="https://eojn.nn.hr/"
            linkText="EOJN portal"
            external
          />
        </div>

        <div className="not-prose mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <h4 className="font-semibold text-neutral-900">
            Sudjelovanje građana u planiranju proračuna
          </h4>
          <p className="mt-2 text-sm text-neutral-600">
            Pozivamo sve građane da sudjeluju u kreiranju proračuna za sljedeću
            godinu. Svoje prijedloge možete dostaviti putem kontakt obrasca ili
            osobno u općinskoj upravi.
          </p>
        </div>
      </section>

      {/* Za građane Section */}
      <section id="gradani" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Users2 className="h-5 w-5 text-primary-600" />
          Za građane
        </h2>
        <p className="text-lg leading-relaxed">
          Sve što vam treba na jednom mjestu - obrasci, zahtjevi i informacije
          za građane.
        </p>

        <div className="not-prose mt-8 grid gap-4 sm:grid-cols-2">
          <ServiceCard
            icon={FileText}
            title="Obrasci i zahtjevi"
            description="Preuzmite obrasce za različite upravne postupke"
            link="/dokumenti?kategorija=obrasci"
            linkText="Svi obrasci"
          />
          <ServiceCard
            icon={Shield}
            title="Pristup informacijama"
            description="Ostvarite pravo na pristup informacijama sukladno zakonu"
            link="/dokumenti/pravo-na-pristup-informacijama"
            linkText="Više informacija"
          />
          <ServiceCard
            icon={Building}
            title="Društveni domovi"
            description="Rezervacija prostora društvenih domova za događanja"
            details="Kontaktirajte JUO za rezervacije"
          />
          <ServiceCard
            icon={Shield}
            title="Civilna zaštita"
            description="Informacije o sustavu civilne zaštite i postupanju u izvanrednim situacijama"
          />
        </div>

        <div className="not-prose mt-8 rounded-xl border border-primary-200 bg-primary-50 p-5">
          <h4 className="flex items-center gap-2 font-semibold text-primary-900">
            <Phone className="h-4 w-4" />
            Radno vrijeme za stranke
          </h4>
          <div className="mt-2 text-sm text-primary-800">
            <p>Ponedjeljak - Petak: 8:00 - 14:00</p>
            <p className="mt-1">Telefon: 042 719 001</p>
            <p>Email: opcina@velikibukovec.hr</p>
          </div>
        </div>
      </section>

      {/* Udruge Section */}
      <section id="udruge" className="scroll-mt-24">
        <h2 className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary-600" />
          Udruge
        </h2>
        <p className="text-lg leading-relaxed">
          Općina podržava rad udruga civilnog društva kroz financiranje programa
          i projekata od interesa za opće dobro.
        </p>

        <div className="not-prose mt-8 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-900">
              Javni natječaj za udruge
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Svake godine Općina raspisuje javni natječaj za financiranje
              programa i projekata udruga. Natječaj se objavljuje početkom
              godine.
            </p>
            <Link
              href="/obavijesti?kategorija=natjecaj"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Aktualni natječaji →
            </Link>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-900">
              Uvjeti financiranja
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                Udruga mora biti registrirana i djelovati na području općine
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                Program mora biti od interesa za lokalnu zajednicu
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                Uredno izvještavanje o prethodnim projektima
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-900">
              Dokumenti za prijavu
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Potrebni obrasci za prijavu na natječaj dostupni su u sekciji
              dokumenata.
            </p>
            <Link
              href="/dokumenti?kategorija=obrasci"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <FileText className="h-4 w-4" />
              Obrasci za udruge
            </Link>
          </div>
        </div>

        <div className="not-prose mt-8">
          <Link
            href="/opcina/udruge"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Heart className="h-4 w-4" />
            Pogledaj sve udruge
          </Link>
        </div>
      </section>
    </PageLayoutV2>
  );
}
