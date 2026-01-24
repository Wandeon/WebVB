import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';

import { mockTopPages } from '@/lib/mock-data';

export function TopPages() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Najpopularnije stranice</CardTitle>
        <CardDescription>Stranice s najviše pregleda ovaj tjedan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTopPages.map((page, index) => (
            <div
              key={page.path}
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{page.title}</p>
                  <p className="text-xs text-neutral-500">{page.path}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900">
                  {page.views.toLocaleString('hr-HR')}
                </span>
                <span className="text-xs text-neutral-500">pregleda</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
