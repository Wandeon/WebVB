import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { FileText, Inbox, MessageSquare, Pencil } from 'lucide-react';

interface ActivityItem {
  id: string;
  action: string;
  target: string;
  user: string;
  timestamp: string;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

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

function formatTimeAgo(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Upravo';
  if (diffMins < 60) return `Prije ${diffMins} min`;
  if (diffHours < 24) return `Prije ${diffHours} h`;
  if (diffDays === 1) return 'Jučer';
  if (diffDays < 7) return `Prije ${diffDays} dana`;
  return date.toLocaleDateString('hr-HR');
}

export function RecentActivity({ items }: RecentActivityProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nedavna aktivnost</CardTitle>
          <CardDescription>Posljednje akcije u sustavu</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-neutral-500">Nema nedavne aktivnosti.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nedavna aktivnost</CardTitle>
        <CardDescription>Posljednje akcije u sustavu</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((activity) => {
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
                  <p className="text-xs text-neutral-400">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
