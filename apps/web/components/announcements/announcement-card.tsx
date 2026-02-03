'use client';

import { ANNOUNCEMENT_CATEGORIES } from '@repo/shared';
import { Badge, Card, CardContent, CardHeader } from '@repo/ui';
import { Calendar, FileText, Paperclip } from 'lucide-react';
import Link from 'next/link';

import type { AnnouncementCategory } from '@repo/shared';

interface AnnouncementCardProps {
  title: string;
  excerpt: string | null;
  slug: string;
  category: AnnouncementCategory;
  validFrom: Date | null;
  validUntil: Date | null;
  publishedAt: Date | null;
  attachmentCount: number;
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getValidityStatus(
  validFrom: Date | null,
  validUntil: Date | null
): { label: string; variant: 'success' | 'warning' | 'danger' } | null {
  const now = new Date();

  if (validUntil) {
    if (validUntil < now) {
      return { label: 'Isteklo', variant: 'danger' };
    }
  }

  if (validFrom) {
    if (validFrom > now) {
      return { label: 'Planirano', variant: 'warning' };
    }
  }

  return null;
}

export function AnnouncementCard({
  title,
  excerpt,
  slug,
  category,
  validFrom,
  validUntil,
  publishedAt,
  attachmentCount,
}: AnnouncementCardProps) {
  const categoryLabel = ANNOUNCEMENT_CATEGORIES[category] || category;
  const validityStatus = getValidityStatus(validFrom, validUntil);

  return (
    <Card className="group h-full transition-shadow hover:shadow-md">
      <Link href={`/obavijesti/${slug}`} className="block h-full">
        <CardHeader className="pb-2">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {categoryLabel}
            </Badge>
            {validityStatus && (
              <Badge variant={validityStatus.variant} className="text-xs">
                {validityStatus.label}
              </Badge>
            )}
          </div>
          <h3 className="line-clamp-2 font-semibold text-neutral-900 transition-colors group-hover:text-primary-600">
            {title}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          {excerpt && (
            <p className="mb-4 line-clamp-3 text-sm text-neutral-600">
              {excerpt}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
            {publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                Objavljeno {formatDate(publishedAt)}
              </span>
            )}
            {validUntil && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" aria-hidden="true" />
                Rok: {formatDate(validUntil)}
              </span>
            )}
            {attachmentCount > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" aria-hidden="true" />
                {attachmentCount} {attachmentCount === 1 ? 'privitak' : 'privitaka'}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
