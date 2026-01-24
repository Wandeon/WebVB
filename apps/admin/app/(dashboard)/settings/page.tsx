import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

import { Breadcrumbs } from '@/components/layout';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">Postavke</h1>
        <Breadcrumbs items={[{ label: 'Postavke' }]} className="mt-1" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Postavke</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">Postavke profila i sustava dolaze u Sprintu 1.10.</p>
        </CardContent>
      </Card>
    </div>
  );
}
