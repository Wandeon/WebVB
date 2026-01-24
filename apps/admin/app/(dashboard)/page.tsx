import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';

import { Breadcrumbs } from '@/components/layout';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
            Nadzorna ploča
          </h1>
          <Breadcrumbs items={[{ label: 'Nadzorna ploča' }]} className="mt-1" />
        </div>
      </div>

      {/* Stats Cards Placeholder */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Posjetitelji danas</CardDescription>
            <CardTitle className="text-3xl">-</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500">Statistika dolazi uskoro</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Objave ovog mjeseca</CardDescription>
            <CardTitle className="text-3xl">-</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500">Statistika dolazi uskoro</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ukupno dokumenata</CardDescription>
            <CardTitle className="text-3xl">-</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500">Statistika dolazi uskoro</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Nepročitane poruke</CardDescription>
            <CardTitle className="text-3xl">-</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500">Statistika dolazi uskoro</p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>Dobrodošli u administraciju!</CardTitle>
          <CardDescription>
            Ovo je nadzorna ploča za upravljanje web stranicom Općine Veliki Bukovec.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">
            Koristite bočni izbornik za navigaciju do različitih sekcija. Funkcionalnosti će biti
            dodane u sljedećim sprintovima.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
