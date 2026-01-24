import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

import { Breadcrumbs } from '@/components/layout';

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">Poruke</h1>
        <Breadcrumbs items={[{ label: 'Poruke' }]} className="mt-1" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Poruke</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">Inbox poruka dolazi u Fazi 5.</p>
        </CardContent>
      </Card>
    </div>
  );
}
