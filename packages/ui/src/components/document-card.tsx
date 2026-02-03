import { FileText, Download } from 'lucide-react';

import { cn } from '../lib/utils';
import { Badge } from '../primitives/badge';
import { Button } from '../primitives/button';

export interface DocumentCardProps {
  title: string;
  fileUrl: string;
  fileSize: number | null;
  createdAt: Date;
  className?: string;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

function getSafeFileUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function DocumentCard({
  title,
  fileUrl,
  fileSize,
  createdAt,
  className,
}: DocumentCardProps) {
  const safeFileUrl = getSafeFileUrl(fileUrl);

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/50',
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-medium text-neutral-900">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>Objavljeno {formatDate(createdAt)}</span>
            {fileSize && (
              <>
                <span>•</span>
                <Badge variant="secondary" className="text-xs">
                  {formatFileSize(fileSize)}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
      {safeFileUrl ? (
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <a
            href={safeFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Preuzmi ${title}`}
          >
            <Download className="mr-2 h-4 w-4" />
            Preuzmi
          </a>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled
          aria-disabled="true"
        >
          <Download className="mr-2 h-4 w-4" />
          Preuzmi
        </Button>
      )}
    </div>
  );
}
