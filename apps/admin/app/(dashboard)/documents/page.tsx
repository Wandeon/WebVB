import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

import { Breadcrumbs } from '@/components/layout';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">Dokumenti</h1>
        <Breadcrumbs items={[{ label: 'Dokumenti' }]} className="mt-1" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dokumenti</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">Upravljanje dokumentima dolazi u Sprintu 1.6.</p>
        </CardContent>
      </Card>
    </div>
  );
}
