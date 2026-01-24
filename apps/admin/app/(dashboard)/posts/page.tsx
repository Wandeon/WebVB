import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

import { Breadcrumbs } from '@/components/layout';

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">Objave</h1>
        <Breadcrumbs items={[{ label: 'Objave' }]} className="mt-1" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Objave</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">Upravljanje objavama dolazi u Sprintu 1.3.</p>
        </CardContent>
      </Card>
    </div>
  );
}
