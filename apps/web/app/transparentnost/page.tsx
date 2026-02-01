// apps/web/app/transparentnost/page.tsx
// Transparentnost i javne informacije - Open Governance
// Last updated: 2026-01-31
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  FolderOpen,
  Scale,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transparentnost | Općina Veliki Bukovec',
  description:
    'Transparentnost i javne informacije Općine Veliki Bukovec - pristup dokumentima, odlukama i proračunu.',
  openGraph: {
    title: 'Transparentnost | Općina Veliki Bukovec',
    description: 'Javne informacije su dostupne svim građanima prema načelu transparentnosti.',
  },
};

const pageSections: PageSection[] = [
  { id: 'nacelo', label: 'Načelo' },
  { id: 'dokumenti', label: 'Dokumenti' },
  { id: 'odluke', label: 'Odluke' },
  { id: 'proracun', label: 'Proračun' },
  { id: 'objave', label: 'Objave' },
  { id: 'pristup', label: 'Pristup informacijama' },
];

export default function TransparentnostPage() {
  return (
    <PageLayoutV2
      title="Transparentnost"
      subtitle="Javne informacije za sve građane"
      sections={pageSections}
    >
      {/* Načelo */}
      <section id="nacelo" className="scroll-mt-24">
        <div className="mb-8 rounded-xl border border-primary-200 bg-primary-50 p-6">
          <div className="flex items-start gap-4">
            <Scale className="mt-1 h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-primary-900">
                Transparentnost po zadanom
              </h3>
              <p className="text-primary-800">
                Općina Veliki Bukovec primjenjuje načelo javnosti u svom radu. Sve informacije od
                javnog značaja dostupne su građanima, osim onih zaštićenih zakonom.
              </p>
            </div>
          </div>
        </div>

        <p className="mb-6 text-lg leading-relaxed text-neutral-700">
          Vjerujemo da transparentnost gradi povjerenje između lokalne uprave i građana. Objavljujemo
          dokumente, odluke i financijske podatke kako bi svaki građanin mogao pratiti rad općine.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <FileText className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Javni dokumenti</div>
            <div className="text-sm text-neutral-600">Slobodan pristup</div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <Calendar className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Jasni datumi</div>
            <div className="text-sm text-neutral-600">Objave s vremenskom oznakom</div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <FolderOpen className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Arhiva</div>
            <div className="text-sm text-neutral-600">Trajno čuvanje</div>
          </div>
        </div>
      </section>

      {/* Dokumenti */}
      <section id="dokumenti" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <FileText className="h-7 w-7 text-primary-600" />
          Javni dokumenti
        </h2>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="mb-6 text-neutral-700">
            Svi službeni dokumenti općine dostupni su na stranici Dokumenti:
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="font-medium text-neutral-900">Statut i opći akti</div>
                <div className="text-sm text-neutral-600">Temeljni dokumenti općine</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="font-medium text-neutral-900">Pravilnici i odluke</div>
                <div className="text-sm text-neutral-600">Regulatorni dokumenti</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="font-medium text-neutral-900">Javni natječaji</div>
                <div className="text-sm text-neutral-600">Natječaji za radna mjesta i nabavu</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="font-medium text-neutral-900">Obrasci i zahtjevi</div>
                <div className="text-sm text-neutral-600">Dokumenti za građane</div>
              </div>
            </div>
          </div>

          <Link
            href="/dokumenti"
            className="mt-6 inline-flex items-center gap-2 text-primary-600 hover:underline"
          >
            Pregledaj sve dokumente
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Odluke */}
      <section id="odluke" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Users className="h-7 w-7 text-primary-600" />
          Odluke i zapisnici
        </h2>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="mb-6 text-neutral-700">
            Odluke Općinskog vijeća i zapisnici sa sjednica javno su dostupni:
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
              <h3 className="mb-2 font-semibold text-neutral-900">Općinsko vijeće</h3>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li>• Zapisnici sa sjednica</li>
                <li>• Donesene odluke</li>
                <li>• Dnevni redovi</li>
              </ul>
              <Link
                href="/organizacija/vijece"
                className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"
              >
                Više o vijeću <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
              <h3 className="mb-2 font-semibold text-neutral-900">Načelnik</h3>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li>• Odluke načelnika</li>
                <li>• Rješenja</li>
                <li>• Izvješća</li>
              </ul>
              <Link
                href="/organizacija/nacelnik"
                className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"
              >
                Više o načelniku <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Proračun */}
      <section id="proracun" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <BookOpen className="h-7 w-7 text-primary-600" />
          Proračun i financije
        </h2>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="mb-6 text-neutral-700">
            Financijsko poslovanje općine transparentno je i dostupno javnosti:
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="font-medium text-neutral-900">Godišnji proračun</div>
                <div className="text-sm text-neutral-600">
                  Plan prihoda i rashoda za tekuću godinu
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="font-medium text-neutral-900">Izvršenje proračuna</div>
                <div className="text-sm text-neutral-600">Polugodišnja i godišnja izvješća</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="font-medium text-neutral-900">Financijska izvješća</div>
                <div className="text-sm text-neutral-600">Bilanca, račun prihoda i rashoda</div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-primary-200 bg-primary-50 p-4">
            <p className="text-sm text-primary-800">
              <strong>Proračun u malom:</strong> Pojednostavljeni prikaz proračuna dostupan je u
              sklopu dokumentacije za lakše razumijevanje građana.
            </p>
          </div>
        </div>
      </section>

      {/* Objave */}
      <section id="objave" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Clock className="h-7 w-7 text-primary-600" />
          Pravila objavljivanja
        </h2>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="mb-6 text-neutral-700">Pridržavamo se jasnih pravila objavljivanja:</p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="font-medium text-neutral-900">Datum objave</div>
                <div className="text-sm text-neutral-600">
                  Svaki dokument i vijest ima jasno označen datum objave
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="font-medium text-neutral-900">Arhiviranje</div>
                <div className="text-sm text-neutral-600">
                  Starije objave ostaju dostupne u arhivi
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="font-medium text-neutral-900">Ažuriranje</div>
                <div className="text-sm text-neutral-600">
                  Izmjene postojećih dokumenata jasno su označene
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="font-medium text-neutral-900">Kategorizacija</div>
                <div className="text-sm text-neutral-600">
                  Dokumenti su organizirani po vrsti i godini
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pristup informacijama */}
      <section id="pristup" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Scale className="h-7 w-7 text-primary-600" />
          Pravo na pristup informacijama
        </h2>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="mb-6 text-neutral-700">
            Sukladno Zakonu o pravu na pristup informacijama (NN 25/13, 85/15, 69/22), imate pravo
            zatražiti bilo koju informaciju koju posjeduje Općina Veliki Bukovec.
          </p>

          <div className="rounded-lg bg-neutral-50 p-5">
            <h3 className="mb-3 font-semibold text-neutral-900">Kako podnijeti zahtjev:</h3>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li>
                <strong>E-mail:</strong>{' '}
                <a
                  href="mailto:opcina.veliki.bukovec@gmail.com"
                  className="text-primary-600 hover:underline"
                >
                  opcina.veliki.bukovec@gmail.com
                </a>
              </li>
              <li>
                <strong>Pošta:</strong> Veliki Bukovec 53, 42231 Veliki Bukovec
              </li>
              <li>
                <strong>Osobno:</strong> U uredovnom vremenu općine
              </li>
            </ul>
          </div>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <strong>Rok za odgovor:</strong> Na zahtjev za pristup informacijama odgovaramo u roku
              od 15 dana. U složenijim slučajevima rok se može produžiti za dodatnih 15 dana uz
              obavijest podnositelju.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
          <h3 className="mb-2 font-semibold text-neutral-900">Službenik za informiranje</h3>
          <p className="text-sm text-neutral-700">
            Za sva pitanja vezana uz pristup informacijama možete kontaktirati službenika za
            informiranje putem e-maila:{' '}
            <a
              href="mailto:opcina.veliki.bukovec@gmail.com"
              className="text-primary-600 hover:underline"
            >
              opcina.veliki.bukovec@gmail.com
            </a>
          </p>
        </div>
      </section>

      {/* Footer note */}
      <section className="mt-12 rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        <p className="text-sm text-neutral-600">
          <strong>Napomena:</strong> Ova stranica opisuje načela transparentnosti kojima se vodimo.
          Za konkretne dokumente posjetite stranicu{' '}
          <Link href="/dokumenti" className="text-primary-600 hover:underline">
            Dokumenti
          </Link>
          . Za upite koristite{' '}
          <Link href="/kontakt" className="text-primary-600 hover:underline">
            kontakt obrazac
          </Link>
          .
        </p>
        <p className="mt-2 text-xs text-neutral-500">Posljednja izmjena: 31. siječnja 2026.</p>
      </section>
    </PageLayoutV2>
  );
}
