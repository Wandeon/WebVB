import { DOCUMENT_CATEGORIES, type DocumentCategory } from '@repo/shared';
import { Download, FileText } from 'lucide-react';

import { cn } from '../lib/utils';

export interface DocumentListItemProps {
  title: string;
  category: string;
  fileUrl: string;
  fileSize?: number | null;
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentListItem({
  title,
  category,
  fileUrl,
  fileSize,
  className,
}: DocumentListItemProps) {
  const categoryLabel =
    DOCUMENT_CATEGORIES[category as DocumentCategory] ?? category;

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-50',
        className
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
        <FileText className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900 group-hover:text-primary-600">
          {title}
        </p>
        <p className="text-xs text-neutral-500">
          {categoryLabel}
          {fileSize && ` • ${formatFileSize(fileSize)}`}
        </p>
      </div>
      <Download className="h-4 w-4 shrink-0 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
    </a>
  );
}
