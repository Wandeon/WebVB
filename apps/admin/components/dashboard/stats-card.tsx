import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">{title}</CardTitle>
        {Icon && (
          <div className="rounded-lg bg-primary-100 p-2">
            <Icon className="h-4 w-4 text-primary-600" aria-hidden="true" focusable="false" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-neutral-900">{value}</p>
          {trend && (
            <span
              className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-neutral-500">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
