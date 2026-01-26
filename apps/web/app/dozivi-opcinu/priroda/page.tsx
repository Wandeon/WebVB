import { FadeIn } from '@repo/ui';
import Image from 'next/image';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Priroda | Doživi općinu | Općina Veliki Bukovec',
  description: 'Istražite prirodne ljepote Velikog Bukovca - rijeke Mura i Drava, Natura 2000 područja i očuvane ekosustave.',
};

export default function PrirodaPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <Image
          src="/images/experience/priroda.jpg"
          alt="Rijeka Drava u blizini Velikog Bukovca"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 to-transparent" />
        <div className="container relative mx-auto flex h-full items-end px-4 pb-8">
          <FadeIn>
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
              Priroda
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
                Općina Veliki Bukovec smještena je u iznimno vrijednom prirodnom
                okruženju, na području međurječja Mure i Drave.
              </p>

              <h2>Rijeke Mura i Drava</h2>
              <p>
                Područje općine obilježavaju dvije velike rijeke - Mura i Drava.
                Ove rijeke stvaraju jedinstvene poplavne šume i močvarna staništa
                bogata biodiverzitetom.
              </p>

              <h2>Natura 2000</h2>
              <p>
                Značajan dio područja općine uključen je u europsku ekološku mrežu
                Natura 2000, što svjedoči o iznimnoj vrijednosti ovdašnjih prirodnih
                staništa i vrsta.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
