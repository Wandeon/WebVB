// apps/web/app/privatnost/page.tsx
// Politika privatnosti - GDPR compliance
// Last updated: 2026-01-31
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Eye,
  FileText,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';
import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politika privatnosti | Općina Veliki Bukovec',
  description:
    'Politika privatnosti Općine Veliki Bukovec - kako prikupljamo, koristimo i štitimo vaše osobne podatke u skladu s GDPR-om.',
  openGraph: {
    title: 'Politika privatnosti | Općina Veliki Bukovec',
    description: 'Zaštita osobnih podataka u skladu s Općom uredbom o zaštiti podataka (GDPR).',
  },
};

const pageSections: PageSection[] = [
  { id: 'pregled', label: 'Pregled' },
  { id: 'voditelj', label: 'Voditelj obrade' },
  { id: 'podaci', label: 'Osobni podaci' },
  { id: 'prava', label: 'Vaša prava' },
  { id: 'kolacici', label: 'Kolačići' },
  { id: 'kontakt', label: 'Kontakt' },
];

export default function PrivatnostPage() {
  return (
    <PageLayoutV2
      title="Politika privatnosti"
      subtitle="Zaštita vaših osobnih podataka"
      sections={pageSections}
    >
      {/* Pregled */}
      <section id="pregled" className="scroll-mt-24">
        <div className="mb-8 rounded-xl border border-primary-200 bg-primary-50 p-6">
          <div className="flex items-start gap-4">
            <Shield className="mt-1 h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-primary-900">
                Vaša privatnost je naš prioritet
              </h3>
              <p className="text-primary-800">
                Općina Veliki Bukovec obrađuje osobne podatke u skladu s Općom uredbom o zaštiti
                podataka (GDPR) i Zakonom o provedbi Opće uredbe o zaštiti podataka. Ova politika
                objašnjava kako prikupljamo, koristimo i štitimo vaše podatke.
              </p>
            </div>
          </div>
        </div>

        <p className="mb-6 text-lg leading-relaxed text-neutral-700">
          Posvećeni smo zaštiti privatnosti svih građana, posjetitelja naše web stranice i
          korisnika naših usluga. Transparentnost u obradi podataka temeljna je vrijednost našeg
          rada.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <Lock className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Sigurnost</div>
            <div className="text-sm text-neutral-600">Zaštita podataka</div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <Eye className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Transparentnost</div>
            <div className="text-sm text-neutral-600">Jasna pravila</div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <UserCheck className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Vaša prava</div>
            <div className="text-sm text-neutral-600">Kontrola podataka</div>
          </div>
        </div>
      </section>

      {/* Voditelj obrade */}
      <section id="voditelj" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Database className="h-7 w-7 text-primary-600" />
          Voditelj obrade podataka
        </h2>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Općina Veliki Bukovec</h3>
          <div className="space-y-3 text-neutral-700">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
              <span>Veliki Bukovec 53, 42231 Veliki Bukovec</span>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
              <span>042 214 093</span>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
              <span>opcina.veliki.bukovec@gmail.com</span>
            </div>
          </div>

          <div className="mt-6 border-t border-neutral-200 pt-6">
            <h4 className="mb-3 font-semibold text-neutral-900">Službenik za zaštitu podataka</h4>
            <p className="text-neutral-700">
              Za sva pitanja vezana uz zaštitu osobnih podataka možete kontaktirati našeg službenika
              za zaštitu podataka putem e-maila:{' '}
              <a
                href="mailto:opcina.veliki.bukovec@gmail.com"
                className="text-primary-600 hover:underline"
              >
                opcina.veliki.bukovec@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Osobni podaci */}
      <section id="podaci" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <FileText className="h-7 w-7 text-primary-600" />
          Koje podatke prikupljamo
        </h2>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">
              Automatski prikupljeni podaci
            </h3>
            <p className="mb-4 text-neutral-700">
              Kada posjetite našu web stranicu, automatski prikupljamo:
            </p>
            <ul className="space-y-2 text-neutral-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                IP adresu (anonimiziranu za analitiku)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Vrstu preglednika i uređaja
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Stranice koje ste posjetili
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Vrijeme posjeta
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">
              Podaci koje vi pružate
            </h3>
            <p className="mb-4 text-neutral-700">
              Kada koristite naše usluge ili nas kontaktirate, možete pružiti:
            </p>
            <ul className="space-y-2 text-neutral-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Ime i prezime
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Adresu e-pošte i broj telefona
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Adresu stanovanja
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Sadržaj vaših upita i prijava
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Svrha obrade</h3>
            <p className="mb-4 text-neutral-700">Vaše podatke koristimo za:</p>
            <ul className="space-y-2 text-neutral-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Pružanje javnih usluga i obradu zahtjeva
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Komunikaciju s građanima
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Poboljšanje naših usluga i web stranice
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                Ispunjavanje zakonskih obveza
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Vaša prava */}
      <section id="prava" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Users className="h-7 w-7 text-primary-600" />
          Vaša prava
        </h2>

        <p className="mb-6 text-lg text-neutral-700">
          Prema GDPR-u imate sljedeća prava u vezi s vašim osobnim podacima:
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-semibold text-neutral-900">Pravo na pristup</h3>
            <p className="text-sm text-neutral-600">
              Imate pravo zatražiti kopiju osobnih podataka koje imamo o vama.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-semibold text-neutral-900">Pravo na ispravak</h3>
            <p className="text-sm text-neutral-600">
              Možete zatražiti ispravak netočnih ili nepotpunih podataka.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-semibold text-neutral-900">Pravo na brisanje</h3>
            <p className="text-sm text-neutral-600">
              U određenim slučajevima možete zatražiti brisanje svojih podataka.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-semibold text-neutral-900">Pravo na ograničenje</h3>
            <p className="text-sm text-neutral-600">
              Možete zatražiti ograničenje obrade vaših podataka.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-semibold text-neutral-900">Pravo na prenosivost</h3>
            <p className="text-sm text-neutral-600">
              Imate pravo primiti svoje podatke u strukturiranom formatu.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-semibold text-neutral-900">Pravo na prigovor</h3>
            <p className="text-sm text-neutral-600">
              Možete uložiti prigovor na obradu vaših osobnih podataka.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-amber-600" />
            <div>
              <h3 className="mb-2 font-semibold text-amber-900">Pritužba nadzornom tijelu</h3>
              <p className="text-amber-800">
                Ako smatrate da je obrada vaših osobnih podataka u suprotnosti s GDPR-om, imate
                pravo podnijeti pritužbu Agenciji za zaštitu osobnih podataka (AZOP).
              </p>
              <a
                href="https://azop.hr"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-amber-700 underline hover:text-amber-900"
              >
                www.azop.hr
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Kolačići i praćenje */}
      <section id="kolacici" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Database className="h-7 w-7 text-primary-600" />
          Kolačići i praćenje
        </h2>

        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-green-900">Bez praćenja trećih strana</h3>
          <p className="text-green-800">
            Ova web stranica <strong>ne koristi</strong> Google Analytics, Facebook Pixel,
            marketinške piksele niti druge alate za praćenje trećih strana. Ne prodajemo niti
            dijelimo vaše podatke s oglašivačima.
          </p>
        </div>

        <p className="mb-6 text-lg text-neutral-700">
          Koristimo minimalne kolačiće potrebne za funkcioniranje stranice:
        </p>

        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-semibold text-neutral-900">Neophodni kolačići</h3>
            <p className="text-sm text-neutral-600">
              Potrebni za osnovne funkcije stranice (npr. pamćenje vašeg izbora o kolačićima).
              Ne možete ih isključiti.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-semibold text-neutral-900">Cloudflare analitika</h3>
            <p className="text-sm text-neutral-600">
              Cloudflare pruža osnovne podatke o prometu (broj posjeta, geografska distribucija)
              bez identificiranja pojedinačnih korisnika. Ovi podaci ne napuštaju Cloudflare
              infrastrukturu.
            </p>
          </div>
        </div>

        <p className="mt-6 text-neutral-600">
          Više informacija o kolačićima i kako ih kontrolirati možete pronaći na{' '}
          <a
            href="https://www.aboutcookies.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            www.aboutcookies.org
          </a>
          .
        </p>
      </section>

      {/* Kontakt */}
      <section id="kontakt" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Mail className="h-7 w-7 text-primary-600" />
          Kontaktirajte nas
        </h2>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="mb-6 text-neutral-700">
            Za sva pitanja vezana uz zaštitu osobnih podataka ili ostvarivanje vaših prava, možete
            nas kontaktirati:
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary-600" />
              <a
                href="mailto:opcina.veliki.bukovec@gmail.com"
                className="text-primary-600 hover:underline"
              >
                opcina.veliki.bukovec@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary-600" />
              <span>042 214 093</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary-600" />
              <span>Veliki Bukovec 53, 42231 Veliki Bukovec</span>
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
