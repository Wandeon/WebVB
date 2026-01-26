import { Clock } from 'lucide-react';

import { cn } from '../lib/utils';

export interface WorkingHoursItem {
  days: string;
  hours: string;
}

export interface WorkingHoursProps {
  items: WorkingHoursItem[];
  className?: string;
}

export function WorkingHours({ items, className }: WorkingHoursProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-primary-600">
        <Clock className="h-5 w-5" />
        <span className="font-semibold">Radno vrijeme</span>
      </div>
      <dl className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <dt className="text-neutral-600">{item.days}</dt>
            <dd className="font-medium">{item.hours}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
