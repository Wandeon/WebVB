import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

import { Breadcrumbs } from '@/components/layout';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Prijave problema
        </h1>
        <Breadcrumbs items={[{ label: 'Prijave problema' }]} className="mt-1" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Prijave problema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">Upravljanje prijavama dolazi u Fazi 5.</p>
        </CardContent>
      </Card>
    </div>
  );
}
