// apps/web/app/vijece/page.tsx
import type { Metadata } from 'next';

import { Calendar, FileText, Mail, Phone, Users } from 'lucide-react';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';

export const metadata: Metadata = {
  title: 'Općinsko vijeće | Općina Veliki Bukovec',
  description:
    'Općinsko vijeće Općine Veliki Bukovec - članovi vijeća, sjednice i dokumenti',
};

const pageSections: PageSection[] = [
  { id: 'clanovi', label: 'Članovi vijeća' },
  { id: 'sjednice', label: 'Sjednice' },
  { id: 'dokumenti', label: 'Dokumenti' },
];

interface CouncilMember {
  name: string;
  role?: string;
  party: string;
}

const councilMembers: CouncilMember[] = [
  { name: 'Miran Stjepan Posavec', role: 'Predsjednik', party: 'HDZ' },
  { name: 'Mirko Mikulčić', role: 'Potpredsjednik', party: 'HDZ' },
  { name: 'Darko Trstenjak', party: 'HDZ' },
  { name: 'Željko Pintarić', party: 'HDZ' },
  { name: 'Josip Pintarić', party: 'HDZ' },
  { name: 'Dragutin Matoša', party: 'SDP' },
  { name: 'Marijan Špoljar', party: 'SDP' },
];

export default function VjecePage() {
  return (
    <PageLayoutV2
      title="Općinsko vijeće"
      subtitle="Predstavničko tijelo građana Općine Veliki Bukovec"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      <section id="clanovi" className="scroll-mt-24">
        <h2>Članovi vijeća</h2>
        <p>
          Općinsko vijeće Općine Veliki Bukovec broji 7 članova izabranih na
          lokalnim izborima. Vijeće donosi odluke o svim pitanjima od lokalnog
          značaja koja su u nadležnosti općine.
        </p>

        <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {councilMembers.map((member) => (
            <div
              key={member.name}
              className="rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-primary-300"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="font-medium text-neutral-900">{member.name}</div>
              {member.role && (
                <div className="mt-1 text-sm font-medium text-primary-600">
                  {member.role}
                </div>
              )}
              <div className="mt-1 text-sm text-neutral-500">{member.party}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="sjednice" className="scroll-mt-24">
        <h2>Sjednice</h2>
        <p>
          Općinsko vijeće održava redovite sjednice prema godišnjem planu rada.
          Sve sjednice su javne, a građani mogu prisustvovati uz prethodnu najavu.
        </p>

        <div className="not-prose mt-6 rounded-xl bg-primary-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
              <Calendar className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <div className="font-medium text-neutral-900">
                Raspored sjednica
              </div>
              <p className="mt-1 text-neutral-600">
                Sjednice se održavaju prema potrebi, u pravilu jednom mjesečno.
                Obavijesti o zakazanim sjednicama objavljuju se na službenoj
                oglasnoj ploči i web stranici općine.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
                <Phone className="h-4 w-4" />
                Informacije
              </div>
              <div className="mt-2 text-neutral-700">042/840-040</div>
            </div>
            <div className="rounded-lg bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <div className="mt-2 text-neutral-700">
                opcina@velikibukovec.hr
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dokumenti" className="scroll-mt-24">
        <h2>Dokumenti</h2>
        <p>
          Dokumenti Općinskog vijeća uključuju zapisnike sjednica, odluke,
          pravilnike i druge službene akte.
        </p>

        <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
          <a
            href="/dokumenti?kategorija=sjednice"
            aria-label="Zapisnici sjednica - otvori stranicu dokumenata"
            className="group rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-primary-600" />
              <div>
                <div className="font-medium text-neutral-900">
                  Zapisnici sjednica
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                  Zapisnici i odluke sa sjednica vijeća
                </div>
              </div>
            </div>
          </a>
          <a
            href="/dokumenti?kategorija=statut"
            aria-label="Statut općine - otvori stranicu dokumenata"
            className="group rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-primary-600" />
              <div>
                <div className="font-medium text-neutral-900">Statut općine</div>
                <div className="mt-1 text-sm text-neutral-500">
                  Temeljni akt o ustrojstvu i djelovanju općine
                </div>
              </div>
            </div>
          </a>
          <a
            href="/dokumenti?kategorija=sjednice"
            aria-label="Poslovnik vijeća - otvori stranicu dokumenata"
            className="group rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-primary-600" />
              <div>
                <div className="font-medium text-neutral-900">
                  Poslovnik vijeća
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                  Pravila o radu Općinskog vijeća
                </div>
              </div>
            </div>
          </a>
          <a
            href="/dokumenti"
            aria-label="Svi dokumenti - otvori stranicu dokumenata"
            className="group rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-primary-600" />
              <div>
                <div className="font-medium text-neutral-900">Svi dokumenti</div>
                <div className="mt-1 text-sm text-neutral-500">
                  Pregled svih službenih dokumenata
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>
    </PageLayoutV2>
  );
}
