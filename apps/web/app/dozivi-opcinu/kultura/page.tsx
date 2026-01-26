import { FadeIn } from '@repo/ui';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kultura i tradicija | Doživi općinu | Općina Veliki Bukovec',
  description: 'Upoznajte kulturu i tradiciju Velikog Bukovca - lokalne običaje, manifestacije i bogato folklorno nasljeđe.',
};

export default function KulturaPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <Image
          src="/images/experience/kultura.jpg"
          alt="Tradicijska manifestacija u Velikom Bukovcu"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 to-transparent" />
        <div className="container relative mx-auto flex h-full items-end px-4 pb-8">
          <FadeIn>
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
              Kultura i tradicija
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="prose prose-neutral mx-auto max-w-3xl">
            <FadeIn>
              <p className="lead">
                Veliki Bukovec njeguje bogatu kulturnu tradiciju koja se prenosi
                s generacije na generaciju.
              </p>

              <h2>Folklor i običaji</h2>
              <p>
                Lokalna folklorna društva čuvaju tradicijske nošnje, pjesme i
                plesove ovoga kraja. Međimurski folklor prepoznatljiv je po
                živopisnim nošnjama i karakterističnim melodijama.
              </p>

              <h2>Manifestacije</h2>
              <p>
                Tijekom godine održavaju se brojne kulturne manifestacije koje
                okupljaju mještane i posjetitelje. Od tradicionalnih sajmova do
                suvremenih kulturnih događanja.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
