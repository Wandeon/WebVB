// apps/web/app/uvjeti-koristenja/page.tsx
// Uvjeti korištenja - Terms of Service with AI disclosure
// Last updated: 2026-01-31
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Copyright,
  ExternalLink,
  FileText,
  Gavel,
  Mail,
  Scale,
  Shield,
  Sparkles,
  UserX,
} from 'lucide-react';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uvjeti korištenja | Općina Veliki Bukovec',
  description:
    'Uvjeti korištenja web stranice Općine Veliki Bukovec - pravila korištenja, autorska prava, AI-generirani sadržaj i odgovornosti.',
  openGraph: {
    title: 'Uvjeti korištenja | Općina Veliki Bukovec',
    description: 'Pravila i uvjeti korištenja službene web stranice Općine Veliki Bukovec.',
  },
};

const pageSections: PageSection[] = [
  { id: 'pregled', label: 'Pregled' },
  { id: 'koristenje', label: 'Korištenje' },
  { id: 'ai-sadrzaj', label: 'AI sadržaj' },
  { id: 'autorska-prava', label: 'Autorska prava' },
  { id: 'odgovornost', label: 'Odgovornost' },
  { id: 'izmjene', label: 'Izmjene' },
];

export default function UvjetiKoristenjaPage() {
  return (
    <PageLayoutV2
      title="Uvjeti korištenja"
      subtitle="Pravila korištenja web stranice"
      sections={pageSections}
    >
      {/* Pregled */}
      <section id="pregled" className="scroll-mt-24">
        <div className="mb-8 rounded-xl border border-primary-200 bg-primary-50 p-6">
          <div className="flex items-start gap-4">
            <Gavel className="mt-1 h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-primary-900">
                Dobrodošli na našu web stranicu
              </h3>
              <p className="text-primary-800">
                Korištenjem web stranice Općine Veliki Bukovec (velikibukovec.hr) prihvaćate ove
                uvjete korištenja. Molimo vas da ih pažljivo pročitate prije korištenja naših
                usluga.
              </p>
            </div>
          </div>
        </div>

        <p className="mb-6 text-lg leading-relaxed text-neutral-700">
          Ovi uvjeti korištenja uređuju vaš pristup i korištenje web stranice, uključujući sve
          sadržaje, funkcionalnosti i usluge koje nudimo.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <Scale className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Pravila</div>
            <div className="text-sm text-neutral-600">Jasni uvjeti</div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <Shield className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Zaštita</div>
            <div className="text-sm text-neutral-600">Vaših prava</div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <Sparkles className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Transparentnost</div>
            <div className="text-sm text-neutral-600">AI disclosure</div>
          </div>
        </div>
      </section>

      {/* Korištenje stranice */}
      <section id="koristenje" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <FileText className="h-7 w-7 text-primary-600" />
          Korištenje web stranice
        </h2>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Dopušteno korištenje</h3>
            <ul className="space-y-2 text-neutral-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Pristup javnim informacijama i vijestima
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Preuzimanje javno dostupnih dokumenata
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Korištenje kontakt obrazaca za legitimne upite
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Dijeljenje sadržaja uz navođenje izvora
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-red-900">
              <UserX className="h-5 w-5" />
              Zabranjeno korištenje
            </h3>
            <ul className="space-y-2 text-red-800">
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                Pokušaji neovlaštenog pristupa sustavu
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                Distribuiranje zlonamjernog softvera
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                Automatsko prikupljanje podataka (scraping) bez dozvole
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                Lažno predstavljanje ili obmanjivanje
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* AI-generirani sadržaj */}
      <section id="ai-sadrzaj" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Bot className="h-7 w-7 text-primary-600" />
          AI-generirani sadržaj
        </h2>

        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="mt-1 h-8 w-8 shrink-0 text-blue-600" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-blue-900">
                Transparentnost o korištenju umjetne inteligencije
              </h3>
              <p className="text-blue-800">
                Na ovoj web stranici koristimo tehnologije umjetne inteligencije (AI) kao pomoć u
                izradi određenog sadržaja. Obvezujemo se na potpunu transparentnost o tome kako i
                kada koristimo AI.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">
              Kako koristimo AI
            </h3>
            <ul className="space-y-3 text-neutral-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <span>
                  <strong>Pomoć u pisanju:</strong> AI može pomoći u sažimanju i strukturiranju
                  informativnog sadržaja poput vijesti i obavijesti.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <span>
                  <strong>Prijevod i prilagodba:</strong> AI može pomoći u jezičnoj obradi sadržaja.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <span>
                  <strong>Organizacija informacija:</strong> AI pomaže u kategorizaciji i
                  strukturiranju podataka.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">
              Ljudski nadzor
            </h3>
            <p className="mb-4 text-neutral-700">
              Sav sadržaj generiran uz pomoć AI prolazi kroz ljudski pregled i odobrenje prije
              objave:
            </p>
            <ul className="space-y-2 text-neutral-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Provjera točnosti činjenica
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Verifikacija izvora informacija
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Uređivanje i prilagodba kontekstu
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Konačno odobrenje od strane zaposlenika Općine
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-amber-600" />
              <div>
                <h3 className="mb-2 font-semibold text-amber-900">Važna napomena</h3>
                <p className="text-amber-800">
                  AI ne zamjenjuje službenu komunikaciju. Za pravno obvezujuće informacije, službene
                  dokumente i odluke, uvijek se obratite izravno Jedinstvenom upravnom odjelu
                  Općine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Autorska prava */}
      <section id="autorska-prava" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Copyright className="h-7 w-7 text-primary-600" />
          Autorska prava i intelektualno vlasništvo
        </h2>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="mb-6 text-neutral-700">
            Sav sadržaj na ovoj web stranici, uključujući tekst, slike, grafike, logotipe i dizajn,
            vlasništvo je Općine Veliki Bukovec ili se koristi uz dopuštenje vlasnika prava.
          </p>

          <div className="space-y-4">
            <div className="rounded-lg bg-neutral-50 p-4">
              <h3 className="mb-2 font-semibold text-neutral-900">Dopušteno:</h3>
              <ul className="space-y-1 text-sm text-neutral-700">
                <li>• Dijeljenje sadržaja uz navođenje izvora</li>
                <li>• Korištenje za osobne, nekomercijalne svrhe</li>
                <li>• Citiranje uz pravilno navođenje</li>
              </ul>
            </div>
            <div className="rounded-lg bg-neutral-50 p-4">
              <h3 className="mb-2 font-semibold text-neutral-900">Zabranjeno bez dozvole:</h3>
              <ul className="space-y-1 text-sm text-neutral-700">
                <li>• Komercijalno korištenje sadržaja</li>
                <li>• Izmjena ili prilagodba bez odobrenja</li>
                <li>• Korištenje grba i logotipa Općine</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ograničenje odgovornosti */}
      <section id="odgovornost" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Shield className="h-7 w-7 text-primary-600" />
          Ograničenje odgovornosti
        </h2>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Točnost informacija</h3>
            <p className="text-neutral-700">
              Nastojimo osigurati da su sve informacije na web stranici točne i ažurne. Međutim, ne
              možemo jamčiti apsolutnu točnost svih podataka. Za službene i pravno obvezujuće
              informacije, kontaktirajte nas izravno.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Vanjske poveznice</h3>
            <p className="text-neutral-700">
              Naša web stranica može sadržavati poveznice na vanjske web stranice. Ne snosimo
              odgovornost za sadržaj, politike privatnosti ili prakse tih stranica.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Dostupnost usluge</h3>
            <p className="text-neutral-700">
              Nastojimo održavati web stranicu dostupnom 24 sata dnevno, ali ne možemo jamčiti
              neprekinutu dostupnost. Povremeno može doći do prekida zbog održavanja ili tehničkih
              problema.
            </p>
          </div>
        </div>
      </section>

      {/* Izmjene uvjeta */}
      <section id="izmjene" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <ExternalLink className="h-7 w-7 text-primary-600" />
          Izmjene uvjeta korištenja
        </h2>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="mb-6 text-neutral-700">
            Zadržavamo pravo izmjene ovih uvjeta korištenja u bilo kojem trenutku. Značajne izmjene
            bit će objavljene na ovoj stranici s datumom stupanja na snagu.
          </p>

          <p className="mb-6 text-neutral-700">
            Nastavkom korištenja web stranice nakon objave izmjena prihvaćate nove uvjete.
          </p>

          <div className="rounded-lg bg-neutral-50 p-5">
            <h3 className="mb-3 font-semibold text-neutral-900">Kontakt za pitanja</h3>
            <p className="mb-4 text-neutral-700">
              Ako imate pitanja o ovim uvjetima korištenja, možete nas kontaktirati:
            </p>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary-600" />
              <a
                href="mailto:opcina.veliki.bukovec@gmail.com"
                className="text-primary-600 hover:underline"
              >
                opcina.veliki.bukovec@gmail.com
              </a>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-neutral-500">
          Posljednja izmjena: 31. siječnja 2026.
        </p>
      </section>
    </PageLayoutV2>
  );
}
