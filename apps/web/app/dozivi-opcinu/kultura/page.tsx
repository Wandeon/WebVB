import {
  Calendar,
  Flame,
  Flower2,
  Heart,
  Music,
  Sparkles,
  Users,
  Wheat,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kultura i tradicija | Općina Veliki Bukovec',
  description:
    'Otkrijte bogatu kulturnu baštinu općine Veliki Bukovec - cvjećarsku tradiciju, vatrogasna društva, ženske udruge i narodni običaje Podravine.',
  openGraph: {
    title: 'Kultura i tradicija | Općina Veliki Bukovec',
    description: 'Cvjećarska tradicija, vatrogasna društva i narodni običaji Podravine.',
    images: ['/images/experience/kultura.webp'],
  },
};

const traditions = [
  {
    id: 'cvjecarstvo',
    name: 'Cvjećarska tradicija',
    icon: Flower2,
    description:
      'Općina Veliki Bukovec poznata je kao centar hrvatske proizvodnje cvijeća. Cvjećarska industrija počela se razvijati krajem jugoslavenskog razdoblja, a eksplodirala je 2000-ih godina. Danas se ovdje proizvodi čak 50% svih cvjetova u Hrvatskoj - krizanteme, geranije i sezonsko cvijeće koje krase domove diljem zemlje.',
    families: ['Obitelj Mađarić - jedan od najvećih proizvođača, 30+ godina iskustva'],
    highlight: 'Tuča u svibnju 2022. uništila je 50% hrvatske proizvodnje cvijeća.',
  },
  {
    id: 'vatrogastvo',
    name: 'Vatrogasna društva',
    icon: Flame,
    description:
      'Dobrovoljna vatrogasna društva (DVD) su srce društvenog života u svakom selu. DVD Dubovica osnovano je 1928. godine i do danas je "vrlo aktivno". DVD Veliki Bukovec jedno je od najstarijih u županiji. Vatrogasci nisu samo protupožarna zaštita - oni organizuju natjecanja, zabave i čuvaju zajedništvo.',
    highlights: [
      'DVD Dubovica - osnovano 1928., i danas aktivno',
      'DVD Veliki Bukovec - jedno od najstarijih u županiji',
      'Organiziraju Svi sveti, adventska druženja i lokalne proslave',
    ],
  },
  {
    id: 'zenske-udruge',
    name: 'Ženske udruge',
    icon: Heart,
    description:
      'Udruga žena Veliki Bukovec i "Kapelske žene" čuvaju tradicije, recepte i rukotvorine ovog kraja. Organiziraju događanja, održavaju folklor i tkaju socijalnu mrežu koja drži zajednicu na okupu. U vremenu kada mladi odlaze, ove udruge su ključne za očuvanje identiteta.',
    highlights: [
      'Udruga žena Veliki Bukovec - tradicijski recepti i rukotvorine',
      'Kapelske žene - organizacija događanja i folklor',
    ],
  },
  {
    id: 'zupa',
    name: 'Župni život',
    icon: Sparkles,
    description:
      'Župa sv. Franje Asiškoga objedinjuje sva tri naselja općine. Blagdan sv. Franje (4. listopada) je Dan općine. Krštenjakrštenja, vjenčanja i sprovodi - crkva i dalje strukturira životne prekretnice. Biskup varaždinski redovito posjećuje općinske proslave.',
    highlights: [
      'Dan općine: 4. listopada (blagdan sv. Franje)',
      'Nedavna krštenja: Joakim Vrbanić, Ivano Rak, Nika Kos (2025.)',
      'Župnik: Josip Vidović',
    ],
  },
];

const lostTraditions = [
  {
    name: 'Vršidba',
    description: 'Svečanost žetve i vršenja žita, nestala 1980-ih',
    icon: Wheat,
  },
  {
    name: 'Martinje',
    description: 'Blagoslov mladog vina, zamro kad su vinogradi ustupili mjesto kukuruzu',
    icon: Calendar,
  },
  {
    name: 'Fašnik',
    description: 'Pokladne povorke od kuće do kuće, danas samo školske proslave',
    icon: Music,
  },
  {
    name: 'Seoske večeri',
    description: 'Plesnjaci i druženja mladih, smanjeni ili nestali',
    icon: Users,
  },
];

export default function KulturaPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <Image
          src="/images/experience/kultura.webp"
          alt="Kulturna manifestacija u općini Veliki Bukovec"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-neutral-900/20" />
        <div className="container relative z-10 mx-auto flex h-full flex-col justify-end px-4 pb-12">
          <nav className="mb-4 text-sm text-white/70">
            <Link href="/" className="hover:text-white">
              Početna
            </Link>
            <span className="mx-2">/</span>
            <span>Kultura i tradicija</span>
          </nav>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Kultura i tradicija
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90 md:text-xl">
            Cvjećari, vatrogasci i ženske udruge - ljudi koji čuvaju dušu zajednice
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-neutral-700">
            Kultura općine Veliki Bukovec nije u muzejima i galerijama - ona živi u ljudima.
            U cvjećarima koji u staklenicima uzgajaju krizanteme za cijelu Hrvatsku. U
            vatrogascima čija društva postoje gotovo stotinu godina. U ženama koje čuvaju
            recepte svojih baka i organiziraju zajedničke proslave.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-neutral-700">
            Dok mladi odlaze u gradove, ove udruge i tradicije održavaju zajednicu živom.
            One su odgovor na pitanje: tko će ostati kada svi odu?
          </p>
        </div>
      </section>

      {/* Living Traditions */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-neutral-900 md:text-3xl">
          Žive tradicije
        </h2>
        <div className="space-y-8">
          {traditions.map((tradition) => {
            const Icon = tradition.icon;
            return (
              <article
                key={tradition.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Icon Header */}
                  <div className="flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-8 lg:w-64">
                    <div className="text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                        <Icon className="h-10 w-10 text-amber-600" />
                      </div>
                      <h3 className="mt-4 font-display text-lg font-bold text-neutral-900">
                        {tradition.name}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 lg:p-8">
                    <p className="leading-relaxed text-neutral-600">{tradition.description}</p>

                    {'families' in tradition && tradition.families && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-neutral-500">
                          Istaknute obitelji:
                        </h4>
                        <ul className="mt-2 space-y-1">
                          {tradition.families.map((family) => (
                            <li key={family} className="text-sm text-neutral-600">
                              • {family}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {'highlights' in tradition && tradition.highlights && (
                      <div className="mt-4 rounded-lg bg-neutral-50 p-4">
                        <ul className="space-y-1">
                          {tradition.highlights.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-neutral-600">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {'highlight' in tradition && tradition.highlight && (
                      <div className="mt-4 rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">{tradition.highlight}</p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Lost Traditions */}
      <section className="bg-neutral-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center font-display text-2xl font-bold text-neutral-900 md:text-3xl">
            Tradicije koje blijede
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-neutral-600">
            Neke tradicije žive samo u sjećanju starijih - svjedoci vremena kada je selo bilo
            samodostatna zajednica
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {lostTraditions.map((tradition) => {
              const Icon = tradition.icon;
              return (
                <div
                  key={tradition.name}
                  className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                    <Icon className="h-7 w-7 text-neutral-400" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-neutral-700">
                    {tradition.name}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-500">{tradition.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Character of Villages */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-neutral-900 md:text-3xl">
          Tri sela, tri karaktera
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-neutral-900">Veliki Bukovec</h3>
            <p className="mt-1 text-sm text-primary-600">Srce i glava općine</p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Administrativno i feudalno središte. Ovdje je dvorac, župna crkva, škola i općinska
              uprava. Najraznolikija ekonomija - od drvoprerađivačke industrije do prijevozništva.
              Čuvari lokalne baštine, umjereni ponos.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-neutral-900">Kapela Podravska</h3>
            <p className="mt-1 text-sm text-primary-600">Radišni konji</p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Poduzetno i otporno selo. Centar cvjećarske proizvodnje s brojnim staklenicima.
              Pilana Pečenec, snažan OPG sektor. Praktični ljudi bez sentimentalnosti -
              &ldquo;ljudi koji stvari čine da rastu&rdquo;.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-neutral-900">Dubovica</h3>
            <p className="mt-1 text-sm text-primary-600">Sanjiva stara duša</p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Najstariji karakter, skromna i intimna. Rijeka Plitvica dijeli selo na Gornju i
              Donju. Nekad je imala vlastitu struju, nogometni klub i mlin. Danas tiha
              melankolija, ali jak osjećaj zajedništva.
            </p>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="bg-primary-600 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <blockquote className="font-display text-2xl font-medium italic md:text-3xl">
              &ldquo;Imamo tri sela, jednu općinu - i svako selo ima svoju dušu&rdquo;
            </blockquote>
            <p className="mt-8 text-primary-100">
              Unatoč različitim karakterima, sela su ujedinjena zajedničkim izazovima i
              zajedničkim odgovorima. Kada dođe poplava, svi pune vreće. Kada je žetva,
              svi pomažu. Ta solidarnost je možda najveća kulturna vrijednost ovog kraja.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl bg-amber-500 p-8 text-center text-white md:p-12">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Istražite više</h2>
          <p className="mx-auto mt-4 max-w-xl text-amber-100">
            Upoznajte povijesne znamenitosti i prirodne ljepote naše općine
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/dozivi-opcinu/znamenitosti"
              className="rounded-lg bg-white px-6 py-3 font-medium text-amber-600 transition-colors hover:bg-amber-50"
            >
              Znamenitosti
            </Link>
            <Link
              href="/dozivi-opcinu/priroda"
              className="rounded-lg border-2 border-white px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              Priroda
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
