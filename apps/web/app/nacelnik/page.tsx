// apps/web/app/nacelnik/page.tsx
import type { Metadata } from 'next';

import { PageLayoutV2 } from '../../components/page-layout-v2';
import type { PageSection } from '../../lib/navigation';

export const metadata: Metadata = {
  title: 'Načelnik | Općina Veliki Bukovec',
  description: 'Ivan Modrić - Općinski načelnik Općine Veliki Bukovec',
};

const pageSections: PageSection[] = [
  { id: 'o-nacelniku', label: 'O načelniku' },
  { id: 'program-rada', label: 'Program rada' },
  { id: 'dokumenti', label: 'Dokumenti' },
  { id: 'kontakt', label: 'Kontakt' },
];

export default function NacelnikPage() {
  return (
    <PageLayoutV2
      title="Ivan Modrić"
      subtitle="Općinski načelnik"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      <section id="o-nacelniku">
        <h2>O načelniku</h2>
        <div className="not-prose mb-6 flex flex-col gap-6 sm:flex-row">
          <div className="h-48 w-40 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-200">
            {/* Photo placeholder - add actual image */}
            <div className="flex h-full items-center justify-center text-neutral-400">
              Fotografija
            </div>
          </div>
          <div>
            <p className="text-lg text-neutral-700">
              <strong>Ivan Modrić</strong> je općinski načelnik Općine Veliki Bukovec.
              Rođen je 17. travnja 2000. godine u Varaždinu, a trenutno živi u Velikom Bukovcu.
            </p>
            <p className="mt-3 text-neutral-600">
              Osnovnu školu završio je u Velikom Bukovcu, a srednju školu u Varaždinu
              (strojarska i prometna škola). Po struci je strojarski/računalni tehničar.
            </p>
          </div>
        </div>
        <p>
          Opisuje se kao radišan, pošten i odgovoran mladi čovjek, uvijek spreman pomoći
          i uključiti se u život zajednice. Njegove vrijednosti temelje se na poštenju,
          radu i solidarnosti zajednice kao temelju za uspjeh općine.
        </p>
      </section>

      <section id="program-rada">
        <h2>Program rada</h2>
        <p>
          Program rada načelnika za mandatno razdoblje 2025.-2029. uključuje:
        </p>
        <ul>
          <li>Unapređenje komunalne infrastrukture</li>
          <li>Poticanje lokalnog gospodarstva</li>
          <li>Poboljšanje kvalitete života građana</li>
          <li>Transparentnost u radu uprave</li>
        </ul>
        <p>
          Detaljni programi i izvješća o radu dostupni su u sekciji dokumenata.
        </p>
      </section>

      <section id="dokumenti">
        <h2>Dokumenti</h2>
        <div className="not-prose grid gap-4 sm:grid-cols-2">
          <a
            href="#"
            className="rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="font-medium text-neutral-900">Izjava o imovinskom stanju</div>
            <div className="mt-1 text-sm text-neutral-500">PDF dokument</div>
          </a>
          <a
            href="#"
            className="rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="font-medium text-neutral-900">Program rada 2025-2029</div>
            <div className="mt-1 text-sm text-neutral-500">PDF dokument</div>
          </a>
          <a
            href="#"
            className="rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="font-medium text-neutral-900">Godišnji plan rada</div>
            <div className="mt-1 text-sm text-neutral-500">PDF dokument</div>
          </a>
          <a
            href="#"
            className="rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="font-medium text-neutral-900">Izvješće o radu</div>
            <div className="mt-1 text-sm text-neutral-500">PDF dokument</div>
          </a>
        </div>
      </section>

      <section id="kontakt">
        <h2>Kontakt</h2>
        <div className="not-prose rounded-xl bg-primary-50 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-primary-700">Ured načelnika</div>
              <div className="mt-1 text-neutral-700">Općina Veliki Bukovec</div>
              <div className="text-neutral-600">Trg svetog Franje 425</div>
              <div className="text-neutral-600">42231 Veliki Bukovec</div>
            </div>
            <div>
              <div className="text-sm font-medium text-primary-700">Radno vrijeme</div>
              <div className="mt-1 text-neutral-700">Ponedjeljak - Petak</div>
              <div className="text-neutral-600">07:00 - 15:00</div>
              <div className="mt-3">
                <div className="text-sm font-medium text-primary-700">Telefon</div>
                <div className="text-neutral-700">042/840-040</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayoutV2>
  );
}
