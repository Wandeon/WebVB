import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

import { Breadcrumbs } from '@/components/layout';

export default function StaticPagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">Stranice</h1>
        <Breadcrumbs items={[{ label: 'Stranice' }]} className="mt-1" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Stranice</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">Upravljanje stranicama dolazi u Sprintu 1.7.</p>
        </CardContent>
      </Card>
    </div>
  );
}
