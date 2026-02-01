import { Building2, Church, Landmark, MapPin, TreePine } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Znamenitosti | Općina Veliki Bukovec',
  description:
    'Otkrijte bogatu povijesnu baštinu općine Veliki Bukovec - dvorac Drašković, crkvu sv. Franje Asiškoga, kapelu Svetog Križa i druge povijesne znamenitosti.',
  openGraph: {
    title: 'Znamenitosti | Općina Veliki Bukovec',
    description: 'Dvorac Drašković, crkva sv. Franje Asiškoga i povijesna baština Podravine.',
    images: ['/images/experience/znamenitosti.webp'],
  },
};

const landmarks = [
  {
    id: 'dvorac-draskovic',
    name: 'Dvorac Drašković',
    period: '1745-1755',
    description:
      'Barokni dvorac koji je sagradio grof Josip Kazimir Drašković sredinom 18. stoljeća. Okružen je parkom u engleskom stilu od 11 hektara koji je 1963. godine proglašen zaštićenim hortikulturnim spomenikom. Obitelj Drašković je ovdje stolovala od 1643. godine kada im je car Ferdinand III. darovao posjed.',
    location: 'Veliki Bukovec',
    icon: Building2,
    highlight: 'Park je nacionalno zaštićeni spomenik od 1963.',
  },
  {
    id: 'crkva-sv-franje',
    name: 'Crkva sv. Franje Asiškoga',
    period: '1820',
    description:
      'Župna crkva klasicističkog stila koju su dali sagraditi grof Karlo Drašković i njegova supruga Elizabeta. Crkva je srce župe koja obuhvaća sva tri naselja općine. U crkvi su pokopani članovi obitelji Drašković, a blagdan sv. Franje (4. listopada) je Dan općine.',
    location: 'Veliki Bukovec',
    icon: Church,
    highlight: 'Blagdan sv. Franje je Dan općine Veliki Bukovec.',
  },
  {
    id: 'kip-sv-ivana-nepomuka',
    name: 'Kip sv. Ivana Nepomuka',
    period: '1764',
    description:
      'Barokni kameni stup podignut na raskrižju kao zaštita od poplava. Na stupu je grb obitelji Nádasdy. Sveti Ivan Nepomuk je zaštitnik od poplava, što govori o stoljetnoj borbi stanovništva s vodenom stihijom rijeka Bednje i Plitvice.',
    location: 'Veliki Bukovec',
    icon: Landmark,
    highlight: 'Svjedoči o stoljetnoj borbi s poplavama.',
  },
  {
    id: 'kapela-svetog-kriza',
    name: 'Kapela Svetog Križa',
    period: '1974',
    description:
      'Kapelu je dao sagraditi župnik prebendator Ivan Lončar, poznat kao "svećenik-graditelj". Kapela je postala središte duhovnog života Dubovice i okolice. Prebendator Lončar je 2025. godine posthumno odlikovan za svoj doprinos zajednici.',
    location: 'Dubovica',
    icon: Church,
    highlight: 'Djelo legendarnog "svećenika-graditelja".',
  },
  {
    id: 'krizancija',
    name: 'Crkvica Križančija',
    period: '18. stoljeće',
    description:
      'Privatna kapelica obitelji Drašković skrivena u šumi Križančija. Šuma je poznata po kvalitetnoj hrastovini i bukovini koja je stoljećima bila izvor prihoda vlastelina. Danas je teško pristupačna, ali čuva duh plemićke prošlosti.',
    location: 'Šuma Križančija',
    icon: TreePine,
    highlight: 'Skrivena u šumi poznata po kvalitetnoj hrastovini.',
  },
];

export default function ZnamenitostiPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <Image
          src="/images/experience/znamenitosti.webp"
          alt="Povijesne znamenitosti općine Veliki Bukovec"
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
            <span>Znamenitosti</span>
          </nav>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Znamenitosti
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90 md:text-xl">
            Četiri stoljeća povijesti utkane u dvorce, crkve i kapele podravskog kraja
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-neutral-700">
            Općina Veliki Bukovec čuva bogatu povijesnu baštinu koja seže u doba kada je ovaj
            kraj bio granična utvrda protiv osmanskih prodora. Od sredine 16. stoljeća, kada su
            prvi doseljenici našli utočište u ovim krajevima, do danas - svaka generacija je
            ostavila svoj trag u kamenu, drvu i sjećanju.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-neutral-700">
            Obitelj Drašković, koja je posjed dobila 1643. godine od cara Ferdinanda III.,
            ostavila je najdublji pečat - od baroknog dvorca i parka do župne crkve koja i
            danas okuplja vjernike iz sva tri naselja općine.
          </p>
        </div>
      </section>

      {/* Landmarks Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="space-y-8">
          {landmarks.map((landmark, index) => {
            const Icon = landmark.icon;
            const isEven = index % 2 === 0;

            return (
              <article
                key={landmark.id}
                className={`flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:flex-row ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Icon/Visual Side */}
                <div className="flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-8 lg:w-1/3">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                      <Icon className="h-10 w-10 text-primary-600" />
                    </div>
                    <div className="text-sm font-medium text-primary-600">{landmark.period}</div>
                    <div className="mt-1 flex items-center justify-center gap-1 text-xs text-neutral-500">
                      <MapPin className="h-3 w-3" />
                      {landmark.location}
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 p-6 lg:p-8">
                  <h2 className="font-display text-2xl font-bold text-neutral-900">
                    {landmark.name}
                  </h2>
                  <p className="mt-4 leading-relaxed text-neutral-600">{landmark.description}</p>
                  <div className="mt-4 rounded-lg border-l-4 border-primary-500 bg-primary-50 p-4">
                    <p className="text-sm font-medium text-primary-800">{landmark.highlight}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Historical Context */}
      <section className="bg-neutral-100 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold text-neutral-900 md:text-3xl">
              Povijesni kontekst
            </h2>
            <p className="mt-6 text-neutral-600">
              Sredinom 16. stoljeća, ovaj kraj je bio granično područje prema Osmanskom Carstvu.
              Tek nakon pobjede kod Siska 1593. godine, naseljavanja postaju stabilna. Udovica
              Barbara Turoczy htjela je posjed darovati Keglevićima, ali car Ferdinand III. je
              1643. godine cijeli posjed - sedam sela i šumu Križančiju - darovao grofu Ivanu
              Draškoviću.
            </p>
            <p className="mt-4 text-neutral-600">
              Tako je počelo gotovo tri stoljeća vladavine Draškovića koja je trajala do
              nacionalizacije 1945. godine. Obitelj se vratila 1990-ih, ali dvorac nikada nije
              postao turistička atrakcija - ostaje tihi svjedok burne prošlosti.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl bg-primary-600 p-8 text-center text-white md:p-12">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Istražite više</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-100">
            Otkrijte prirodne ljepote i kulturnu baštinu naše općine
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/dozivi-opcinu/priroda"
              className="rounded-lg bg-white px-6 py-3 font-medium text-primary-600 transition-colors hover:bg-primary-50"
            >
              Priroda
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
