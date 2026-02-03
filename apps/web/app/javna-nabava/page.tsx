// apps/web/app/javna-nabava/page.tsx
// Gold standard page following Blueprint pattern
// Last updated: 2026-02-02
// Sources: velikibukovec.hr/juo-opcine/javna-nabava/
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Gavel,
  Scale,
  ScrollText,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Javna nabava | Općina Veliki Bukovec',
  description:
    'Javna nabava Općine Veliki Bukovec - planovi nabave, pravilnici, evidencije ugovora i izjave o nepostojanju sukoba interesa. Transparentnost u poslovanju.',
  openGraph: {
    title: 'Javna nabava | Općina Veliki Bukovec',
    description:
      'Planovi nabave, pravilnici i evidencije ugovora Općine Veliki Bukovec.',
    images: ['/images/hero/veliki-bukovec-hero-1.jpg'],
  },
};

const pageSections: PageSection[] = [
  { id: 'pregled', label: 'Pregled' },
  { id: 'planovi', label: 'Planovi nabave' },
  { id: 'pravilnici', label: 'Pravilnici' },
  { id: 'evidencije', label: 'Evidencije' },
  { id: 'sukob-interesa', label: 'Sukob interesa' },
];

interface DocumentCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  year?: number;
  items?: { title: string; href?: string }[];
  href?: string;
  external?: boolean;
}

function DocumentCard({
  icon: Icon,
  title,
  description,
  year,
  items,
  href,
  external,
}: DocumentCardProps) {
  const content = (
    <div className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-primary-200 hover:shadow-md">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
          <Icon className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700">
            {title}
            {year && <span className="ml-2 text-sm text-neutral-500">({year})</span>}
          </h3>
          {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
        </div>
        {href && (
          <div className="shrink-0">
            {external ? (
              <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-primary-500" />
            ) : (
              <Download className="h-4 w-4 text-neutral-400 group-hover:text-primary-500" />
            )}
          </div>
        )}
      </div>
      {items && items.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-neutral-600">
              <FileText className="h-3 w-3 text-neutral-400" />
              {item.href ? (
                <a
                  href={item.href}
                  className="hover:text-primary-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.title}
                </a>
              ) : (
                item.title
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'highlight';
}

function InfoCard({ icon: Icon, title, children, variant = 'default' }: InfoCardProps) {
  return (
    <div
      className={`rounded-xl p-5 ${
        variant === 'highlight'
          ? 'border-2 border-primary-200 bg-primary-50'
          : 'border border-neutral-200 bg-white shadow-sm'
      }`}
    >
      <div className="mb-3 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            variant === 'highlight' ? 'bg-primary-200' : 'bg-primary-100'
          }`}
        >
          <Icon
            className={`h-5 w-5 ${variant === 'highlight' ? 'text-primary-700' : 'text-primary-600'}`}
          />
        </div>
        <h3 className="font-semibold text-neutral-900">{title}</h3>
      </div>
      <div className="text-sm text-neutral-600">{children}</div>
    </div>
  );
}

export default function JavnaNabavaPage() {
  return (
    <PageLayoutV2
      title="Javna nabava"
      subtitle="Transparentnost i zakonitost u nabavi roba, radova i usluga"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      {/* Pregled Section */}
      <section id="pregled" className="scroll-mt-24">
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-neutral-900">O javnoj nabavi</h2>
          <p className="text-lg text-neutral-600">
            Općina Veliki Bukovec provodi postupke javne nabave u skladu sa Zakonom o javnoj nabavi
            (NN 120/16, 114/22) i internim pravilnicima. Ovdje možete pronaći sve dokumente vezane
            uz planiranje, provedbu i evidenciju nabave.
          </p>
        </div>

        {/* Quick links */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard icon={BookOpen} title="Elektronički oglasnik" variant="highlight">
            <p className="mb-3">
              Svi postupci javne nabave objavljuju se u Elektroničkom oglasniku javne nabave
              Republike Hrvatske.
            </p>
            <a
              href="https://eojn.nn.hr/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline"
            >
              Posjeti EOJN <ExternalLink className="h-3 w-3" />
            </a>
          </InfoCard>

          <InfoCard icon={Scale} title="Proračunska transparentnost">
            <p className="mb-3">
              Pratite izvršenje proračuna i financijske izvještaje Općine na portalu proračunske
              transparentnosti.
            </p>
            <a
              href="https://proracun.hr/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline"
            >
              Otvori portal <ExternalLink className="h-3 w-3" />
            </a>
          </InfoCard>

          <InfoCard icon={Shield} title="Načela nabave">
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <FileCheck className="h-3 w-3 text-green-500" />
                Sloboda tržišnog natjecanja
              </li>
              <li className="flex items-center gap-2">
                <FileCheck className="h-3 w-3 text-green-500" />
                Jednaki tretman svih ponuditelja
              </li>
              <li className="flex items-center gap-2">
                <FileCheck className="h-3 w-3 text-green-500" />
                Transparentnost postupaka
              </li>
              <li className="flex items-center gap-2">
                <FileCheck className="h-3 w-3 text-green-500" />
                Razmjernost i proporcionalnost
              </li>
            </ul>
          </InfoCard>
        </div>
      </section>

      {/* Planovi nabave Section */}
      <section id="planovi" className="scroll-mt-24 pt-12">
        <h2 className="mb-6 text-2xl font-bold text-neutral-900">Planovi nabave</h2>
        <p className="mb-6 text-neutral-600">
          Plan nabave definira sve nabave koje Općina planira provesti tijekom godine. Izmjene i
          dopune plana objavljuju se prema potrebi.
        </p>

        <div className="space-y-6">
          {/* 2026 */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-800">
              <Calendar className="h-5 w-5 text-primary-500" />
              2026. godina
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <DocumentCard
                icon={ScrollText}
                title="Plan nabave za 2026. godinu"
                description="Osnovni plan nabave za tekuću godinu"
                href="/dokumenti?category=javna-nabava&year=2026"
              />
            </div>
          </div>

          {/* 2025 */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-800">
              <Calendar className="h-5 w-5 text-primary-500" />
              2025. godina
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <DocumentCard
                icon={ScrollText}
                title="Plan nabave za 2025. godinu"
                description="Plan nabave s izmjenama i dopunama"
                items={[
                  { title: 'I. Izmjena i dopuna' },
                  { title: 'II. Izmjena i dopuna' },
                  { title: 'III. Izmjena i dopuna' },
                  { title: 'IV. Izmjena i dopuna' },
                  { title: 'V. - IX. Izmjene i dopune' },
                ]}
                href="/dokumenti?category=javna-nabava&year=2025"
              />
              <DocumentCard
                icon={FileText}
                title="Evidencija ugovora 2025."
                description="Registar sklopljenih ugovora o nabavi"
                href="/dokumenti?category=javna-nabava&year=2025"
              />
            </div>
          </div>

          {/* Arhiva */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="mb-3 font-semibold text-neutral-800">Arhiva prethodnih godina</h3>
            <p className="mb-4 text-sm text-neutral-600">
              Planovi nabave i evidencije za godine 2014. - 2024. dostupni su u arhivi dokumenata.
            </p>
            <Link
              href="/dokumenti?category=javna-nabava"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              <FileText className="h-4 w-4" />
              Pregledaj arhivu
            </Link>
          </div>
        </div>
      </section>

      {/* Pravilnici Section */}
      <section id="pravilnici" className="scroll-mt-24 pt-12">
        <h2 className="mb-6 text-2xl font-bold text-neutral-900">Pravilnici</h2>
        <p className="mb-6 text-neutral-600">
          Interni akti koji reguliraju postupke javne nabave u Općini Veliki Bukovec.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DocumentCard
            icon={Gavel}
            title="Pravilnik o provedbi postupaka javne nabave"
            description="Pravilnik koji uređuje provedbu postupaka javne nabave Općine Veliki Bukovec sukladno Zakonu o javnoj nabavi."
            href="/dokumenti?pretraga=pravilnik+javna+nabava"
          />
          <DocumentCard
            icon={Gavel}
            title="Pravilnik o provedbi jednostavne nabave"
            description="Pravilnik za nabave procijenjene vrijednosti manje od pragova za primjenu Zakona o javnoj nabavi."
            href="/dokumenti?pretraga=jednostavna+nabava"
          />
          <DocumentCard
            icon={Gavel}
            title="Pravilnik o nabavi bagatelne vrijednosti"
            description="Pravilnik za nabave male vrijednosti do 26.540,00 EUR."
            href="/dokumenti?pretraga=bagatelna+nabava"
          />
        </div>
      </section>

      {/* Evidencije Section */}
      <section id="evidencije" className="scroll-mt-24 pt-12">
        <h2 className="mb-6 text-2xl font-bold text-neutral-900">Evidencije i izvršenja</h2>
        <p className="mb-6 text-neutral-600">
          Evidencije sklopljenih ugovora i izvršenje planova nabave po godinama.
        </p>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-neutral-700">Godina</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-700">
                  Evidencija ugovora
                </th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-700">
                  Izvršenje plana
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {[2025, 2024, 2023, 2022].map((year) => (
                <tr key={year} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{year}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dokumenti?pretraga=evidencija+ugovora+${year}`}
                      className="text-primary-600 hover:underline"
                    >
                      Preuzmi
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {year < 2025 ? (
                      <Link
                        href={`/dokumenti?pretraga=izvrsenje+plana+${year}`}
                        className="text-primary-600 hover:underline"
                      >
                        Preuzmi
                      </Link>
                    ) : (
                      <span className="text-neutral-400">U tijeku</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sukob interesa Section */}
      <section id="sukob-interesa" className="scroll-mt-24 pt-12">
        <h2 className="mb-6 text-2xl font-bold text-neutral-900">Izjave o nepostojanju sukoba interesa</h2>
        <p className="mb-6 text-neutral-600">
          Sukladno članku 80. Zakona o javnoj nabavi, dužnosnici Općine podnijeli su izjave o
          nepostojanju sukoba interesa s gospodarskim subjektima.
        </p>

        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-200">
              <Shield className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Status: Bez sukoba interesa</h3>
              <p className="text-sm text-green-700">
                Svi dužnosnici potvrdili su nepostojanje sukoba interesa
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/60 p-3">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-neutral-800">Načelnik</p>
                <p className="text-sm text-neutral-600">
                  Izjava o nepostojanju sukoba interesa s gospodarskim subjektima
                </p>
              </div>
              <FileCheck className="ml-auto h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/60 p-3">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-neutral-800">Zamjenik načelnika</p>
                <p className="text-sm text-neutral-600">
                  Izjava o nepostojanju sukoba interesa s gospodarskim subjektima
                </p>
              </div>
              <FileCheck className="ml-auto h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/60 p-3">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-neutral-800">Predsjednik Općinskog vijeća</p>
                <p className="text-sm text-neutral-600">
                  Izjava o nepostojanju sukoba interesa s gospodarskim subjektima
                </p>
              </div>
              <FileCheck className="ml-auto h-5 w-5 text-green-500" />
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-white/40 p-3">
            <p className="text-xs text-green-700">
              <AlertCircle className="mr-1 inline h-3 w-3" />
              Izjave se ažuriraju prema potrebi i objavljuju sukladno zakonskim odredbama.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="mt-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-8 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold">Imate pitanja o javnoj nabavi?</h2>
          <p className="mb-6 text-primary-100">
            Za sve upite vezane uz postupke javne nabave obratite se Jedinstvenom upravnom odjelu
            Općine Veliki Bukovec.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/kontakt"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-primary-700 transition-colors hover:bg-primary-50"
            >
              Kontaktirajte nas
            </Link>
            <a
              href="https://eojn.nn.hr/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              EOJN portal <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </PageLayoutV2>
  );
}
