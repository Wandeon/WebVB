import { ANNOUNCEMENT_CATEGORIES, type AnnouncementCategory } from '@repo/shared';
import { FileText } from 'lucide-react';
import Link from 'next/link';

import { cn } from '../lib/utils';
import { Badge } from '../primitives/badge';

export interface AnnouncementCompactCardProps {
  title: string;
  slug: string;
  category: string;
  publishedAt: Date | null;
  attachmentCount?: number;
  className?: string;
}

export function AnnouncementCompactCard({
  title,
  slug,
  category,
  publishedAt,
  attachmentCount = 0,
  className,
}: AnnouncementCompactCardProps) {
  const formattedDate = publishedAt
    ? new Intl.DateTimeFormat('hr-HR', {
        day: 'numeric',
        month: 'short',
      }).format(new Date(publishedAt))
    : null;

  const categoryLabel =
    ANNOUNCEMENT_CATEGORIES[category as AnnouncementCategory] ?? category;

  return (
    <Link
      href={`/obavijesti/${slug}`}
      className={cn(
        'group block rounded-lg border border-neutral-200 bg-white p-3 transition-all hover:border-primary-300 hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
              {categoryLabel}
            </Badge>
            {formattedDate && (
              <span className="text-[10px] text-neutral-400">{formattedDate}</span>
            )}
          </div>
          <h4 className="line-clamp-2 text-sm font-medium text-neutral-900 group-hover:text-primary-600">
            {title}
          </h4>
        </div>
        {attachmentCount > 0 && (
          <div className="flex shrink-0 items-center gap-0.5 text-neutral-400">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-[10px]">{attachmentCount}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
