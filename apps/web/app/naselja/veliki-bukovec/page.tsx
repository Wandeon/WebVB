import type { Metadata } from 'next';

import { PageLayoutV2 } from '../../../components/page-layout-v2';
import type { PageSection } from '../../../lib/navigation';

export const metadata: Metadata = {
  title: 'Veliki Bukovec | Općina Veliki Bukovec',
  description: 'Veliki Bukovec - administrativno središte općine s bogatom poviješću i tradicijom cvjećarstva',
};

const pageSections: PageSection[] = [
  { id: 'o-selu', label: 'O selu' },
  { id: 'znamenitosti', label: 'Znamenitosti' },
  { id: 'galerija', label: 'Galerija' },
];

export default function VelikiBukovecPage() {
  return (
    <PageLayoutV2
      title="Veliki Bukovec"
      subtitle="Administrativno središte općine"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      <section id="o-selu">
        <h2>O selu</h2>
        <p>
          Veliki Bukovec je administrativno središte istoimene općine u Varaždinskoj županiji.
          Smješten u srcu Podravine, selo je poznato po dugoj tradiciji cvjećarstva koja seže
          više od stoljeća unazad.
        </p>
        <p>
          Stanovništvo se tradicionalno bavi poljoprivredom, posebice uzgojem cvijeća i povrća.
          Cvjećari Velikog Bukovca opskrbljuju tržnice diljem Hrvatske prekrasnim cvijećem
          i presadicama.
        </p>
      </section>

      <section id="znamenitosti">
        <h2>Znamenitosti</h2>
        <h3>Dvorac Drašković</h3>
        <p>
          Barokno-klasicistički dvorac izgrađen između 1745. i 1755. godine.
          Predstavlja arhitektonski biser regije i svjedočanstvo bogate povijesti.
        </p>
        <h3>Crkva sv. Franje Asiškog</h3>
        <p>
          Župna crkva posvećena sv. Franji Asiškom, duhovno središte zajednice.
        </p>
      </section>

      <section id="galerija">
        <h2>Galerija</h2>
        <p>Fotografije sela i okolice uskoro...</p>
      </section>
    </PageLayoutV2>
  );
}
