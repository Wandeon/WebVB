// apps/web/app/izjava-o-pristupacnosti/page.tsx
// Izjava o pristupačnosti - EU Directive 2016/2102 compliance
// Last updated: 2026-01-31
import {
  Accessibility,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Keyboard,
  Mail,
  MessageSquare,
  Monitor,
  Phone,
  Settings,
  Smartphone,
  Volume2,
} from 'lucide-react';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Izjava o pristupačnosti | Općina Veliki Bukovec',
  description:
    'Izjava o pristupačnosti web stranice Općine Veliki Bukovec sukladno Direktivi EU 2016/2102 o pristupačnosti web-mjesta tijela javnog sektora.',
  openGraph: {
    title: 'Izjava o pristupačnosti | Općina Veliki Bukovec',
    description: 'Obvezujemo se osigurati pristupačnost web stranice svim korisnicima.',
  },
};

const pageSections: PageSection[] = [
  { id: 'izjava', label: 'Izjava' },
  { id: 'status', label: 'Status usklađenosti' },
  { id: 'pristupacnost', label: 'Značajke' },
  { id: 'ogranicenja', label: 'Ograničenja' },
  { id: 'povratne', label: 'Povratne informacije' },
  { id: 'provedba', label: 'Provedba' },
];

export default function IzjavaOPristupacnostiPage() {
  return (
    <PageLayoutV2
      title="Izjava o pristupačnosti"
      subtitle="Pristupačnost za sve korisnike"
      sections={pageSections}
    >
      {/* Izjava */}
      <section id="izjava" className="scroll-mt-24">
        <div className="mb-8 rounded-xl border border-primary-200 bg-primary-50 p-6">
          <div className="flex items-start gap-4">
            <Accessibility className="mt-1 h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-primary-900">
                Naša obveza pristupačnosti
              </h3>
              <p className="text-primary-800">
                Općina Veliki Bukovec obvezuje se osigurati pristupačnost svoje web stranice u
                skladu s Direktivom (EU) 2016/2102 Europskog parlamenta i Vijeća o pristupačnosti
                internetskih stranica i mobilnih aplikacija tijela javnog sektora.
              </p>
            </div>
          </div>
        </div>

        <p className="mb-6 text-lg leading-relaxed text-neutral-700">
          Ova izjava o pristupačnosti odnosi se na web stranicu{' '}
          <strong>velikibukovec.hr</strong>. Nastojimo osigurati da naša web stranica bude
          pristupačna svim korisnicima, uključujući osobe s invaliditetom.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <Eye className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Vizualna pristupačnost</div>
            <div className="text-sm text-neutral-600">Kontrast i čitljivost</div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <Keyboard className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Navigacija tipkovnicom</div>
            <div className="text-sm text-neutral-600">Bez miša</div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <Smartphone className="mx-auto mb-2 h-8 w-8 text-primary-600" />
            <div className="font-semibold text-neutral-900">Responzivni dizajn</div>
            <div className="text-sm text-neutral-600">Svi uređaji</div>
          </div>
        </div>
      </section>

      {/* Status usklađenosti */}
      <section id="status" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <CheckCircle2 className="h-7 w-7 text-primary-600" />
          Status usklađenosti
        </h2>

        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="mb-3 text-lg font-semibold text-green-900">Djelomično usklađeno</h3>
          <p className="text-green-800">
            Ova web stranica <strong>djelomično je usklađena</strong> sa standardom WCAG 2.1 razine
            AA zbog iznimaka navedenih u nastavku.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900">Primijenjeni standardi:</h3>
          <ul className="space-y-2 text-neutral-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              Web Content Accessibility Guidelines (WCAG) 2.1 razina AA
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              Direktiva (EU) 2016/2102
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              Zakon o pristupačnosti (NN 17/23)
            </li>
          </ul>
        </div>
      </section>

      {/* Značajke pristupačnosti */}
      <section id="pristupacnost" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <Settings className="h-7 w-7 text-primary-600" />
          Značajke pristupačnosti
        </h2>

        <p className="mb-6 text-lg text-neutral-700">
          Naša web stranica uključuje sljedeće značajke pristupačnosti:
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-neutral-900">Navigacija tipkovnicom</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Sve funkcije dostupne su putem tipkovnice. Koristite Tab za navigaciju i Enter za
              aktivaciju.
            </p>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-neutral-900">Dovoljan kontrast</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Tekst ima dovoljan kontrast u odnosu na pozadinu prema WCAG 2.1 AA standardu.
            </p>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-neutral-900">Responzivni dizajn</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Stranica se prilagođava veličini ekrana i radi na svim uređajima.
            </p>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-neutral-900">Kompatibilnost s čitačima</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Sadržaj je strukturiran za kompatibilnost s čitačima ekrana.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
          <h3 className="mb-3 font-semibold text-neutral-900">Dodatne mogućnosti preglednika:</h3>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li>• Povećanje teksta: Ctrl/Cmd + Plus</li>
            <li>• Smanjenje teksta: Ctrl/Cmd + Minus</li>
            <li>• Vraćanje na zadano: Ctrl/Cmd + 0</li>
          </ul>
        </div>
      </section>

      {/* Ograničenja */}
      <section id="ogranicenja" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <AlertTriangle className="h-7 w-7 text-amber-600" />
          Poznata ograničenja
        </h2>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <p className="mb-4 text-amber-800">
            Unatoč našim naporima, neki dijelovi web stranice možda nisu potpuno pristupačni:
          </p>
          <ul className="space-y-3 text-amber-800">
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <span>
                <strong>PDF dokumenti:</strong> Neki stariji PDF dokumenti možda nemaju potpunu
                tekstualnu pristupačnost. Radimo na njihovoj konverziji.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <span>
                <strong>Slike:</strong> Neke starije slike možda nemaju alternativni tekst.
                Kontinuirano dodajemo opise.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <span>
                <strong>Videozapisi:</strong> Stariji videozapisi možda nemaju titlove. Novi sadržaji
                bit će potpuno pristupačni.
              </span>
            </li>
          </ul>
        </div>

        <p className="mt-6 text-neutral-700">
          Aktivno radimo na uklanjanju ovih ograničenja. Ako naiđete na problem s pristupačnošću,
          molimo vas da nas kontaktirate.
        </p>
      </section>

      {/* Povratne informacije */}
      <section id="povratne" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <MessageSquare className="h-7 w-7 text-primary-600" />
          Povratne informacije
        </h2>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="mb-6 text-neutral-700">
            Vaše povratne informacije o pristupačnosti naše web stranice su nam važne. Ako imate
            poteškoća s pristupom sadržaju ili želite prijaviti problem s pristupačnošću, molimo
            kontaktirajte nas:
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
          </div>

          <div className="mt-6 rounded-lg bg-neutral-50 p-4">
            <h3 className="mb-2 font-semibold text-neutral-900">Pri kontaktiranju navedite:</h3>
            <ul className="space-y-1 text-sm text-neutral-700">
              <li>• URL stranice na kojoj ste naišli na problem</li>
              <li>• Opis problema</li>
              <li>• Preglednik i uređaj koji koristite</li>
              <li>• Pomoćnu tehnologiju koju koristite (ako je primjenjivo)</li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-neutral-700">
          Nastojat ćemo odgovoriti na vaš upit u roku od <strong>15 radnih dana</strong>.
        </p>
      </section>

      {/* Postupak provedbe */}
      <section id="provedba" className="scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-neutral-900">
          <ExternalLink className="h-7 w-7 text-primary-600" />
          Postupak provedbe
        </h2>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="mb-6 text-neutral-700">
            Ako niste zadovoljni našim odgovorom na vašu prijavu o pristupačnosti, možete podnijeti
            pritužbu tijelu nadležnom za provedbu:
          </p>

          <div className="rounded-lg bg-neutral-50 p-5">
            <h3 className="mb-3 font-semibold text-neutral-900">Povjerenik za informiranje</h3>
            <p className="mb-4 text-neutral-700">
              Nadzorno tijelo za pristupačnost web stranica tijela javnog sektora u Republici
              Hrvatskoj.
            </p>
            <a
              href="https://pristupinfo.hr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-600 hover:underline"
            >
              www.pristupinfo.hr
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
          <h3 className="mb-2 font-semibold text-neutral-900">Informacije o ovoj izjavi</h3>
          <ul className="space-y-1 text-sm text-neutral-700">
            <li>
              <strong>Datum izrade:</strong> 31. siječnja 2026.
            </li>
            <li>
              <strong>Metoda procjene:</strong> Samoocjena
            </li>
            <li>
              <strong>Datum posljednjeg pregleda:</strong> 31. siječnja 2026.
            </li>
          </ul>
        </div>
      </section>
    </PageLayoutV2>
  );
}
