import {
  Briefcase,
  Building2,
  Factory,
  Mail,
  MapPin,
  Phone,
  Store,
  Users,
} from 'lucide-react';

import { PageLayoutV2 } from '../../components/page-layout-v2';
import {
  companyGroups,
  getTotalCompanies,
  getTotalEmployees,
  groupObrtiBySettlement,
  obrti,
  settlements,
} from '../../lib/business-directory';

import type { PageSection } from '../../lib/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Poduzetništvo | Općina Veliki Bukovec',
  description:
    'Popis aktivnih obrta i tvrtki na području Općine Veliki Bukovec. Drvoprerada, poljoprivreda, usluge i trgovina.',
  openGraph: {
    title: 'Poduzetništvo | Općina Veliki Bukovec',
    description:
      'Aktivni obrti i tvrtke na području općine Veliki Bukovec - pregled po naseljima i djelatnostima.',
  },
};

const pageSections: PageSection[] = [
  { id: 'pregled', label: 'Pregled' },
  { id: 'obrti', label: 'Obrti' },
  { id: 'tvrtke', label: 'Tvrtke' },
];

const totalEmployees = getTotalEmployees();
const totalCompanies = getTotalCompanies();
const groupedObrti = groupObrtiBySettlement(obrti);

export default function PoduzetniStvoPage() {
  return (
    <PageLayoutV2
      title="Poduzetništvo"
      subtitle="Obrti i tvrtke na području Općine Veliki Bukovec"
      sections={pageSections}
    >
      {/* Overview */}
      <section id="pregled" className="scroll-mt-24">
        <h2>Pregled</h2>
        <div className="not-prose mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={Store} label="Obrti" value={obrti.length} />
          <StatCard icon={Building2} label="Tvrtke" value={totalCompanies} />
          <StatCard icon={Users} label="Zaposlenih" value={`${totalEmployees}+`} />
          <StatCard icon={MapPin} label="Naselja" value={settlements.length} />
        </div>
        <p>
          Na području Općine Veliki Bukovec djeluje{' '}
          <strong>{obrti.length} obrta</strong> i{' '}
          <strong>{totalCompanies} tvrtki</strong> s ukupno preko{' '}
          <strong>{totalEmployees} zaposlenih</strong>. Dominantne djelatnosti su
          drvoprerada, peradarska proizvodnja, obrada metala, transport i usluge.
        </p>
      </section>

      {/* Obrti section */}
      <section id="obrti" className="scroll-mt-24">
        <h2>Obrti</h2>
        <p>
          Na području općine registrirano je {obrti.length} aktivnih obrta u tri
          naselja.
        </p>

        <div className="not-prose space-y-8">
          {settlements.map((settlement) => {
            const items = groupedObrti[settlement];
            if (items.length === 0) return null;
            return (
              <div key={settlement}>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-900">
                  <MapPin className="h-4 w-4 text-primary-600" />
                  {settlement}
                  <span className="ml-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                    {items.length}
                  </span>
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((item, i) => (
                    <div
                      key={`${item.name}-${i}`}
                      className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50">
                          <Briefcase className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-neutral-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-neutral-500">
                            {item.owner}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-neutral-500">
                        {item.fullName}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.address} {item.houseNumber}
                        </span>
                        {item.phone && item.phoneTel && (
                          <a
                            href={item.phoneTel}
                            className="flex items-center gap-1 text-primary-600 hover:text-primary-800"
                          >
                            <Phone className="h-3 w-3" />
                            {item.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Companies section */}
      <section id="tvrtke" className="scroll-mt-24">
        <h2>Tvrtke</h2>
        <p>
          Na području općine registrirano je {totalCompanies} tvrtki. Najveći
          poslodavci su Stolarija Pečenec, Požgaj grupa i PG Orehovec grupa.
        </p>

        <div className="not-prose space-y-8">
          {companyGroups.map((group) => (
            <div key={group.name}>
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-lg font-semibold text-neutral-900">
                  {group.name}
                </h3>
                {group.totalEmployees > 0 && (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                    {group.totalEmployees} zaposlenih
                  </span>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.companies.map((company, i) => (
                  <div
                    key={`${company.shortName}-${i}`}
                    className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                        <Factory className="h-4 w-4 text-neutral-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-neutral-900">
                          {company.shortName}
                        </h4>
                        <p className="text-sm text-neutral-500">
                          {company.activity}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {company.address}, {company.settlement}
                      </span>
                      {company.employees > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {company.employees} zaposlenih
                        </span>
                      )}
                    </div>
                    {(company.email || company.director) && (
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                        {company.director && (
                          <span>{company.director}</span>
                        )}
                        {company.email && (
                          <a
                            href={`mailto:${company.email}`}
                            className="flex items-center gap-1 text-primary-600 hover:text-primary-800"
                          >
                            <Mail className="h-3 w-3" />
                            {company.email}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageLayoutV2>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
      <Icon className="mx-auto h-6 w-6 text-primary-600" />
      <div className="mt-1 text-2xl font-bold text-neutral-900">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}
