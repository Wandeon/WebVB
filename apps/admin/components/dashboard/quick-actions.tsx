import { buttonVariants, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { FolderOpen, Inbox, Plus } from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    label: 'Nova objava',
    href: '/posts/new',
    icon: Plus,
    variant: 'primary' as const,
  },
  {
    label: 'Dodaj dokument',
    href: '/documents/new',
    icon: FolderOpen,
    variant: 'outline' as const,
  },
  {
    label: 'Pregled poruka',
    href: '/messages',
    icon: Inbox,
    variant: 'outline' as const,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Brze akcije</CardTitle>
        <CardDescription>Često korištene funkcije</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className={buttonVariants({ variant: action.variant })}>
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
