import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { FileText, Inbox, MessageSquare, Pencil } from 'lucide-react';

import { mockRecentActivity } from '@/lib/mock-data';

const actionIcons: Record<string, typeof FileText> = {
  objavio: FileText,
  'dodao dokument': FileText,
  'primljena poruka': Inbox,
  ažurirao: Pencil,
};

const actionColors: Record<string, string> = {
  objavio: 'bg-green-100 text-green-600',
  'dodao dokument': 'bg-blue-100 text-blue-600',
  'primljena poruka': 'bg-yellow-100 text-yellow-600',
  ažurirao: 'bg-purple-100 text-purple-600',
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nedavna aktivnost</CardTitle>
        <CardDescription>Posljednje akcije u sustavu</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockRecentActivity.map((activity) => {
            const Icon = actionIcons[activity.action] ?? MessageSquare;
            const colorClass = actionColors[activity.action] ?? 'bg-neutral-100 text-neutral-600';

            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${colorClass}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" focusable="false" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-neutral-500">{activity.action}</span>{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-neutral-400">{activity.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
