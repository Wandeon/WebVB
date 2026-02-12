'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import type { UmamiMetric } from '@/lib/umami-types';

interface DevicesCountriesProps {
  devices: UmamiMetric[];
  countries: UmamiMetric[];
}

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#3b82f6',
  mobile: '#f59e0b',
  tablet: '#10b981',
};

const DEVICE_LABELS: Record<string, string> = {
  desktop: 'Desktop',
  mobile: 'Mobitel',
  tablet: 'Tablet',
};

const COUNTRY_NAMES: Record<string, string> = {
  HR: 'Hrvatska',
  DE: 'Njemačka',
  AT: 'Austrija',
  SI: 'Slovenija',
  BA: 'Bosna i Hercegovina',
  RS: 'Srbija',
  HU: 'Mađarska',
  IT: 'Italija',
  US: 'SAD',
  GB: 'Velika Britanija',
  FR: 'Francuska',
  CH: 'Švicarska',
  CZ: 'Češka',
  SK: 'Slovačka',
  PL: 'Poljska',
  NL: 'Nizozemska',
  BE: 'Belgija',
  SE: 'Švedska',
  NO: 'Norveška',
  DK: 'Danska',
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { x: string; y: number } }>;
}) {
  if (!active || !payload?.length || !payload[0]) return null;
  const { x, y } = payload[0].payload;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md">
      <p className="text-sm">
        {DEVICE_LABELS[x.toLowerCase()] ?? x}: {y}
      </p>
    </div>
  );
}

export function DevicesCountries({ devices, countries }: DevicesCountriesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uređaji i zemlje</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Donut chart for devices */}
        {devices.length === 0 ? (
          <p className="py-4 text-center text-xs text-neutral-400">Nema podataka o uređajima.</p>
        ) : (
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-600">Uređaji</p>
            <div className="h-[180px]" role="img" aria-label="Uređaji">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devices}
                    dataKey="y"
                    nameKey="x"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {devices.map((entry) => (
                      <Cell
                        key={entry.x}
                        fill={DEVICE_COLORS[entry.x.toLowerCase()] ?? '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs text-neutral-600">
              {devices.map((d) => (
                <div key={d.x} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: DEVICE_COLORS[d.x.toLowerCase()] ?? '#64748b' }}
                  />
                  {DEVICE_LABELS[d.x.toLowerCase()] ?? d.x}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Countries table */}
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-600">Zemlje</p>
          {countries.length === 0 ? (
            <p className="py-4 text-center text-xs text-neutral-400">Nema podataka.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {countries.map((country) => (
                  <tr key={country.x} className="border-b border-neutral-100 last:border-0">
                    <td className="py-1.5 text-neutral-900">
                      {COUNTRY_NAMES[country.x] ?? country.x}
                    </td>
                    <td className="py-1.5 text-right tabular-nums text-neutral-700">{country.y}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
