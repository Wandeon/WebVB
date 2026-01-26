import { FadeIn } from '@repo/ui';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Znamenitosti | Doživi općinu | Općina Veliki Bukovec',
  description: 'Otkrijte povijesne znamenitosti Velikog Bukovca - crkvu sv. Lovre, dvorac Drašković i druge kulturne dragocjenosti.',
};

export default function ZnamenitostiPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <Image
          src="/images/experience/znamenitosti.jpg"
          alt="Crkva sv. Lovre u Velikom Bukovcu"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 to-transparent" />
        <div className="container relative mx-auto flex h-full items-end px-4 pb-8">
          <FadeIn>
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
              Znamenitosti
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
                Veliki Bukovec bogat je kulturnom i povijesnom baštinom koja svjedoči
                o dugoj tradiciji ovoga kraja.
              </p>

              <h2>Crkva sv. Lovre</h2>
              <p>
                Župna crkva sv. Lovre dominantna je građevina u središtu mjesta.
                Izgrađena u baroknom stilu, crkva predstavlja važno kulturno i
                duhovno središte zajednice.
              </p>

              <h2>Dvorac Drašković</h2>
              <p>
                Povijesni dvorac obitelji Drašković svjedoči o bogatoj aristokratskoj
                prošlosti ovoga kraja. Dvorac i okolni park čine važan dio kulturne
                baštine općine.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
