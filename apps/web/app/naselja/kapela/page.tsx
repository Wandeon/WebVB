import type { Metadata } from 'next';

import { PageLayoutV2 } from '../../../components/page-layout-v2';
import type { PageSection } from '../../../lib/navigation';

export const metadata: Metadata = {
  title: 'Kapela Podravska | Općina Veliki Bukovec',
  description: 'Kapela Podravska - naselje uz rijeku Bednju s dugom poviješću',
};

const pageSections: PageSection[] = [
  { id: 'o-selu', label: 'O selu' },
  { id: 'znamenitosti', label: 'Znamenitosti' },
  { id: 'galerija', label: 'Galerija' },
];

export default function KapelaPage() {
  return (
    <PageLayoutV2
      title="Kapela Podravska"
      subtitle="Uz rijeku Bednju"
      heroImage="/images/hero/veliki-bukovec-hero-2.jpg"
      sections={pageSections}
    >
      <section id="o-selu">
        <h2>O selu</h2>
        <p>
          Kapela Podravska je naselje smješteno uz rijeku Bednju. Poznato je po
          bogatoj povijesti i aktivnoj zajednici koja čuva tradiciju kraja.
        </p>
        <p>
          Tijekom poplava koje su pogodile regiju, mještani Kapele Podravske
          pokazali su iznimnu solidarnost i sposobnost samoorganizacije u
          zaštiti svojih domova.
        </p>
      </section>

      <section id="znamenitosti">
        <h2>Znamenitosti</h2>
        <p>Znamenitosti i kulturna baština sela...</p>
      </section>

      <section id="galerija">
        <h2>Galerija</h2>
        <p>Fotografije sela i okolice uskoro...</p>
      </section>
    </PageLayoutV2>
  );
}
