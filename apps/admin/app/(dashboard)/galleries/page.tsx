import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

import { Breadcrumbs } from '@/components/layout';

export default function GalleriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">Galerija</h1>
        <Breadcrumbs items={[{ label: 'Galerija' }]} className="mt-1" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Galerija</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">Upravljanje galerijom dolazi u Sprintu 1.9.</p>
        </CardContent>
      </Card>
    </div>
  );
}
