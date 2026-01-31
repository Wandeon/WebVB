// apps/web/app/sigurnost/page.tsx
// NIS2 Security Overview - Cybersecurity compliance
// Last updated: 2026-01-31
import {
  CheckCircle2,
  Database,
  FileText,
  Key,
  Lock,
  MonitorCheck,
  Network,
  Server,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sigurnost i NIS2 | Općina Veliki Bukovec',
  description:
    'Pregled sigurnosne arhitekture web stranice Općine Veliki Bukovec u skladu s NIS2 direktivom EU.',
  openGraph: {
    title: 'Sigurnost i NIS2 | Općina Veliki Bukovec',
    description: 'Transparentan pregled implementiranih sigurnosnih mjera prema NIS2 standardima.',
  },
};

const pageSections: PageSection[] = [
  { id: 'pregled', label: 'Pregled' },
  { id: 'arhitektura', label: 'Arhitektura' },
  { id: 'pristup', label: 'Kontrola pristupa' },
  { id: 'enkripcija', label: 'Enkripcija' },
  { id: 'infrastruktura', label: 'Infrastruktura' },
  { id: 'nadzor', label: 'Nadzor' },
  { id: 'odgovornost', label: 'Odgovornost' },
];

function StatusBadge({ status }: { status: 'ok' | 'warning' }) {
  if (status === 'ok') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
        <CheckCircle2 className="h-3 w-3" />
        Implementirano
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
      Planirano
    </span>
  );
}

function SecurityItem({
  title,
  description,
  status = 'ok',
}: {
  title: string;
  description: string;
  status?: 'ok' | 'warning';
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-100 py-3 last:border-0">
      <div>
        <div className="font-medium text-neutral-900">{title}</div>
        <div className="text-sm text-neutral-600">{description}</div>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

export default function SigurnostPage() {
  return (
    <PageLayoutV2
      title="Sigurnost i NIS2"
      subtitle="Pregled sigurnosne arhitekture"
      sections={pageSections}
    >
      {/* Pregled */}
      <section id="pregled" className="scroll-mt-24">
        <div className="mb-8 rounded-xl border border-primary-200 bg-primary-50 p-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-primary-900">
                NIS2 sigurnosna arhitektura
              </h3>
              <p className="text-primary-800">
                Ova web stranica izrađena je prema načelima kibernetičke sigurnosti definiranima
                NIS2 direktivom Europske unije. U nastavku je transparentan pregled implementiranih
                sigurnosnih mjera.
              </p>
            </div>
          </div>
        </div>

        <p className="mb-6 text-lg leading-relaxed text-neutral-700">
          NIS2 (Network and Information Security Directive 2) je direktiva EU-a koja postavlja
          standarde za kibernetičku sigurnost javnog sektora i kritične infrastrukture. Kao javna
          ustanova, Općina Veliki Bukovec primjenjuje ova načela u svom digitalnom poslovanju.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <Shield className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Sigurnost po dizajnu</div>
            <div className="text-sm text-neutral-600">Statička arhitektura</div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <Lock className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Višeslojna zaštita</div>
            <div className="text-sm text-neutral-600">Defense in depth</div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <MonitorCheck className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Kontinuirani nadzor</div>
            <div className="text-sm text-neutral-600">24/7 monitoring</div>
          </div>
        </div>
      </section>

      {/* Arhitektura */}
      <section id="arhitektura" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Server className="h-7 w-7 text-primary-600" />
          Sigurnosna arhitektura
        </h2>

        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <SecurityItem
            title="Statička javna stranica"
            description="Javni dio stranice nema izvršni kod na poslužitelju - eliminira napadne vektore"
          />
          <SecurityItem
            title="Izolirana administracija"
            description="Administrativno sučelje na zasebnoj poddomeni s dodatnom zaštitom"
          />
          <SecurityItem
            title="Bez naslijeđenih ranjivosti"
            description="Moderna arhitektura (Next.js, TypeScript) umjesto WordPress/PHP sustava"
          />
          <SecurityItem
            title="SQL injection zaštita"
            description="Javna stranica: bez baze podataka. Admin: parametrizirani upiti putem ORM-a"
          />
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            <strong>Prednost statičke arhitekture:</strong> Za razliku od tradicionalnih CMS sustava
            (WordPress, Joomla), statička stranica ne izvršava kod na poslužitelju prilikom
            korisničkih zahtjeva. To eliminira većinu uobičajenih napada poput SQL injection, XSS i
            remote code execution.
          </p>
        </div>
      </section>

      {/* Kontrola pristupa */}
      <section id="pristup" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <UserCheck className="h-7 w-7 text-primary-600" />
          Kontrola pristupa
        </h2>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <SecurityItem
            title="Kontrola pristupa temeljena na ulogama (RBAC)"
            description="Tri razine ovlasti: super admin, administrator, osoblje"
          />
          <SecurityItem
            title="Višefaktorska autentikacija (2FA)"
            description="TOTP aplikacije (Google Authenticator, Authy) za dodatnu zaštitu"
          />
          <SecurityItem
            title="Strogi zahtjevi za lozinke"
            description="Minimalno 12 znakova, provjera kompleksnosti"
          />
          <SecurityItem
            title="Upravljanje sesijama"
            description="Ograničenje trajanja, maksimalno 5 istovremenih uređaja"
          />
          <SecurityItem
            title="Zaštita od brute-force napada"
            description="Ograničenje broja pokušaja prijave po IP adresi"
          />
        </div>
      </section>

      {/* Enkripcija */}
      <section id="enkripcija" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Key className="h-7 w-7 text-primary-600" />
          Enkripcija i sigurnost podataka
        </h2>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <SecurityItem
            title="TLS enkripcija (HTTPS)"
            description="Sva komunikacija enkriptirana end-to-end putem Cloudflare SSL"
          />
          <SecurityItem
            title="Sigurno hashiranje lozinki"
            description="bcrypt algoritam s visokim faktorom troška"
          />
          <SecurityItem
            title="Enkripcija podataka u mirovanju"
            description="Baza podataka na enkriptiranom disku"
          />
          <SecurityItem
            title="HSTS (HTTP Strict Transport Security)"
            description="Prisilno korištenje HTTPS-a nakon pokretanja produkcije"
            status="warning"
          />
        </div>
      </section>

      {/* Infrastruktura */}
      <section id="infrastruktura" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Network className="h-7 w-7 text-primary-600" />
          Sigurnost infrastrukture
        </h2>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <SecurityItem title="Vatrozid (UFW)" description="Zadana politika: blokiraj sve dolazne" />
          <SecurityItem
            title="SSH pristup samo ključem"
            description="Onemogućena autentikacija lozinkom, pristup samo putem VPN-a"
          />
          <SecurityItem
            title="Fail2ban zaštita"
            description="Automatsko blokiranje IP adresa nakon neuspjelih pokušaja"
          />
          <SecurityItem
            title="Izolacija servisa"
            description="Baza podataka i interni servisi dostupni samo lokalno"
          />
          <SecurityItem
            title="DDoS zaštita"
            description="Cloudflare štiti od distribuiranih napada uskraćivanja usluge"
          />
        </div>
      </section>

      {/* Nadzor */}
      <section id="nadzor" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <MonitorCheck className="h-7 w-7 text-primary-600" />
          Nadzor i zapisivanje
        </h2>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <SecurityItem
            title="Praćenje grešaka"
            description="Centralizirano praćenje grešaka u stvarnom vremenu"
          />
          <SecurityItem
            title="Nadzor dostupnosti"
            description="24/7 praćenje dostupnosti stranice s automatskim upozorenjima"
          />
          <SecurityItem
            title="Revizijski zapisi"
            description="Bilježenje svih administrativnih radnji (tko, što, kada)"
          />
          <SecurityItem
            title="Sigurnosne kopije"
            description="Dnevne automatske kopije s 90-dnevnim zadržavanjem"
          />
          <SecurityItem
            title="Test oporavka"
            description="Planirano kvartalno testiranje oporavka iz sigurnosnih kopija"
            status="warning"
          />
        </div>
      </section>

      {/* Odgovornost */}
      <section id="odgovornost" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <FileText className="h-7 w-7 text-primary-600" />
          Upravljanje i odgovornost
        </h2>

        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <SecurityItem
            title="Definirani postupak odgovora na incidente"
            description="Dokumentirane procedure za sigurnosne incidente"
          />
          <SecurityItem
            title="Mogućnost prijave incidenata (24-72h)"
            description="Revizijski zapisi i definiran lanac kontakata"
          />
          <SecurityItem
            title="Dodijeljena odgovornost"
            description="Definiran vlasnik sustava i tehnički administrator"
          />
          <SecurityItem
            title="Upravljanje promjenama"
            description="Git-based CI/CD s potpunom revizijskom sljedivošću"
          />
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="mb-4 font-semibold text-neutral-900">Sažetak usklađenosti</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-neutral-700">Kritičnih problema: 0</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-amber-600" />
              <span className="text-neutral-700">Upozorenja: 2 (planirano)</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-neutral-600">
            Sustav je usklađen s NIS2 načelima. Dva upozorenja odnose se na operativne aktivnosti
            koje su planirane: omogućavanje HSTS-a nakon pokretanja produkcijske domene i provođenje
            prvog kvartalnog testa oporavka.
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mt-12 rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        <p className="text-sm text-neutral-600">
          <strong>Napomena:</strong> Ovaj pregled opisuje implementirane tehničke i organizacijske
          mjere. Ne predstavlja formalnu certifikaciju osim ako nije izričito navedeno. Za dodatne
          informacije o sigurnosti možete nas kontaktirati putem{' '}
          <a href="/kontakt" className="text-primary-600 hover:underline">
            kontakt obrasca
          </a>
          .
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Posljednja izmjena: 31. siječnja 2026. | Sljedeća revizija: 30. travnja 2026.
        </p>
      </section>
    </PageLayoutV2>
  );
}
