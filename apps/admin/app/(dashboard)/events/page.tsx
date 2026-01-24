import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

import { Breadcrumbs } from '@/components/layout';

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">Događanja</h1>
        <Breadcrumbs items={[{ label: 'Događanja' }]} className="mt-1" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Događanja</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">Kalendar događanja dolazi u Sprintu 1.8.</p>
        </CardContent>
      </Card>
    </div>
  );
}
