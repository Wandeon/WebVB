import type { Metadata } from 'next';

import { PageLayoutV2 } from '../../../components/page-layout-v2';
import type { PageSection } from '../../../lib/navigation';

export const metadata: Metadata = {
  title: 'Dubovica | Općina Veliki Bukovec',
  description: 'Dubovica - mirno selo poznato po kapeli Uzvišenja svetog Križa',
};

const pageSections: PageSection[] = [
  { id: 'o-selu', label: 'O selu' },
  { id: 'znamenitosti', label: 'Znamenitosti' },
  { id: 'galerija', label: 'Galerija' },
];

export default function DubovicaPage() {
  return (
    <PageLayoutV2
      title="Dubovica"
      subtitle="Mirno podravsko selo"
      heroImage="/images/hero/veliki-bukovec-hero-3.jpg"
      sections={pageSections}
    >
      <section id="o-selu">
        <h2>O selu</h2>
        <p>
          Dubovica je mirno selo u sastavu Općine Veliki Bukovec. Poznato je po
          poljoprivrednoj tradiciji i živoj seoskoj zajednici.
        </p>
        <p>
          Selo ima bogatu tradiciju zajedničkog rada na seoskim projektima.
          Mještani su poznati po gostoljubivosti i očuvanju običaja svojih predaka.
        </p>
      </section>

      <section id="znamenitosti">
        <h2>Znamenitosti</h2>
        <h3>Kapela Uzvišenja sv. Križa</h3>
        <p>
          Kapela izgrađena 1974. godine na mjestu koje je nekada bilo "šikara i močvara".
          Gradnju je vodio preč. Ivan Lončar uz pomoć mještana koji su vlastitim rukama
          i sredstvima podigli ovo svetište.
        </p>
      </section>

      <section id="galerija">
        <h2>Galerija</h2>
        <p>Fotografije sela i okolice uskoro...</p>
      </section>
    </PageLayoutV2>
  );
}
