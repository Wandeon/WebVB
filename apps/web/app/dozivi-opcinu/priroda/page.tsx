import { Droplets, Leaf, Mountain, Sprout, TreeDeciduous, Wind } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Priroda | Općina Veliki Bukovec',
  description:
    'Istražite prirodne ljepote općine Veliki Bukovec - rijeke Plitvica i Bednja, plodnu podravsku ravnicu i bogatu flora i faunu ovog kraja.',
  openGraph: {
    title: 'Priroda | Općina Veliki Bukovec',
    description: 'Rijeke, ravnice i plodna zemlja - prirodna bogatstva Podravine.',
    images: ['/images/experience/priroda.webp'],
  },
};

const naturalFeatures = [
  {
    id: 'plitvica',
    name: 'Rijeka Plitvica',
    icon: Droplets,
    description:
      'Plitvica protječe kroz Dubovicu, dijeleći selo na Gornju i Donju Dubovicu. Ova rijeka je u prošlosti pokretala mlin obitelji Toplak koji je 1930-ih godina proizvodio električnu energiju - prije mnogih gradova u Hrvatskoj! Plitvica se ulijeva u Dravu i kroz povijest je davala život ovom kraju.',
    fact: 'Dubovica je imala struju iz vlastitog mlina prije mnogih hrvatskih gradova.',
  },
  {
    id: 'bednja',
    name: 'Rijeka Bednja',
    icon: Droplets,
    description:
      'Bednja odvodi vode iz Zagorskih brda i na ravnici Podravine često izlazi iz korita. Tešku glinastu zemlju ("ilovača") teško upija vodu, što čini ovaj kraj sklonim poplavama. Stanovnici su kroz stoljeća naučili živjeti s vodom - lokalna uzrečica kaže: "Drava daje, Drava uzima."',
    fact: 'Mreža odvodnih kanala pretvorila je nekadašnje močvare u plodno poljoprivredno zemljište.',
  },
  {
    id: 'tlo',
    name: 'Plodna podravska zemlja',
    icon: Sprout,
    description:
      'Teška glinasta zemlja, poznata kao "ilovača", iznimno je plodna. Lokalni stanovnici za nju kažu: "Imamo zlato pod nogama." Visoka razina podzemnih voda (samo 1 metar do vode na nekim mjestima) omogućuje bujnu vegetaciju, ali zahtijeva stalnu brigu oko odvodnje.',
    fact: 'Ovaj kraj proizvodi 50% svih cvjetova u Hrvatskoj zahvaljujući kvaliteti tla.',
  },
  {
    id: 'suma',
    name: 'Šuma Križančija',
    icon: TreeDeciduous,
    description:
      'Stoljetna šuma hrasta i bukve koja je pripadala vlastelinu Draškoviću. Kvalitetno drvo iz ove šume bilo je izvor bogatstva plemićke obitelji. U šumi se nalazi skrivena kapelica Križančija - privatna kapela Draškovića.',
    fact: 'Tradicija drvoprerađivačke industrije nastavlja se i danas kroz tvrtke poput Požgaj.',
  },
];

const seasons = [
  {
    name: 'Proljeće',
    icon: Sprout,
    description: 'Cvjetanje staklenika, buđenje prirode nakon zime',
    color: 'bg-green-100 text-green-700',
  },
  {
    name: 'Ljeto',
    icon: Leaf,
    description: 'Žetva, obilje u vrtovima i poljima',
    color: 'bg-yellow-100 text-yellow-700',
  },
  {
    name: 'Jesen',
    icon: Wind,
    description: 'Berba, podravska magla, priprema za zimu',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    name: 'Zima',
    icon: Mountain,
    description: 'Sjeverac puše, vrijeme za druženje i pripremu',
    color: 'bg-blue-100 text-blue-700',
  },
];

export default function PrirodaPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <Image
          src="/images/experience/priroda.webp"
          alt="Prirodni krajolici općine Veliki Bukovec"
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
            <span>Priroda</span>
          </nav>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Priroda
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90 md:text-xl">
            Rijeke, ravnice i plodna zemlja - blagoslovi i izazovi podravskog kraja
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-neutral-700">
            Općina Veliki Bukovec smještena je na istočnom rubu Varaždinske županije, u
            podravskoj nizini gdje se susreću rijeke Bednja, Plitvica i Drava. Ova ravnica,
            nadmorske visine 140-150 metara, obilježena je plodnom zemljom i bogatstvom voda -
            blagoslovima koji donose obilje, ali i izazovima kojima su se stanovnici učili
            odupirati kroz stoljeća.
          </p>
          <blockquote className="mt-6 border-l-4 border-primary-500 pl-6 italic text-neutral-600">
            &ldquo;Drava daje, Drava uzima&rdquo; - lokalna uzrečica koja opisuje život uz vode
          </blockquote>
        </div>
      </section>

      {/* Natural Features */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-neutral-900 md:text-3xl">
          Prirodna bogatstva
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {naturalFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="flex items-center gap-4 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-white p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
                    <Icon className="h-7 w-7 text-primary-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-neutral-900">
                    {feature.name}
                  </h3>
                </div>
                <div className="p-6">
                  <p className="leading-relaxed text-neutral-600">{feature.description}</p>
                  <div className="mt-4 rounded-lg bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                      <span className="mr-2">💡</span>
                      {feature.fact}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Climate & Seasons */}
      <section className="bg-gradient-to-b from-green-50 to-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center font-display text-2xl font-bold text-neutral-900 md:text-3xl">
            Godišnja doba u Podravini
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-neutral-600">
            Svako godišnje doba donosi svoje ljepote i izazove - od proljetnog cvjetanja
            staklenika do zimskog sjeveraca
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {seasons.map((season) => {
              const Icon = season.icon;
              return (
                <div
                  key={season.name}
                  className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm"
                >
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${season.color}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-neutral-900">
                    {season.name}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600">{season.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flood Resilience */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center font-display text-2xl font-bold text-neutral-900 md:text-3xl">
            Život s vodom
          </h2>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8">
            <p className="leading-relaxed text-blue-900">
              Stanovnici ovog kraja kroz stoljeća su naučili živjeti s vodenom stihijom. Kip
              sv. Ivana Nepomuka iz 1764. godine na raskrižju svjedoči o stoljetnoj borbi s
              poplavama. Kada je sredinom 2010-ih godina došla najgora poplava u 40 godina,
              mještani Kapele su sami prosjekli cestu da stvore provizorni odvodni kanal -
              &ldquo;brigada vreća s pijeskom&rdquo; mobilizira se brže od države.
            </p>
            <p className="mt-4 leading-relaxed text-blue-900">
              Mnoga kućanstva i danas drže motorne pumpe za obranu podruma. Ta samoorganizacija
              i snalažljivost obilježje su karaktera ovog kraja - ljudi koji se oslanjaju jedni
              na druge, a ne čekaju pomoć od drugih.
            </p>
          </div>
        </div>
      </section>

      {/* Agriculture Quote */}
      <section className="bg-neutral-100 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <blockquote className="font-display text-2xl font-medium italic text-neutral-700 md:text-3xl">
              &ldquo;Imamo zlato pod nogama&rdquo;
            </blockquote>
            <p className="mt-4 text-neutral-500">
              - lokalna uzrečica o kvaliteti podravskog tla
            </p>
            <p className="mx-auto mt-8 max-w-xl text-neutral-600">
              Ta plodna zemlja omogućila je razvoj cvjećarske industrije koja je ovaj kraj
              učinila centrom hrvatske proizvodnje cvijeća. Krizanteme, geranije i sezonsko
              cvijeće iz naših staklenika krase domove diljem Hrvatske.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl bg-green-600 p-8 text-center text-white md:p-12">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Istražite više</h2>
          <p className="mx-auto mt-4 max-w-xl text-green-100">
            Upoznajte povijesne znamenitosti i kulturnu baštinu naše općine
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/dozivi-opcinu/znamenitosti"
              className="rounded-lg bg-white px-6 py-3 font-medium text-green-600 transition-colors hover:bg-green-50"
            >
              Znamenitosti
            </Link>
            <Link
              href="/dozivi-opcinu/kultura"
              className="rounded-lg border-2 border-white px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              Kultura i tradicija
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
