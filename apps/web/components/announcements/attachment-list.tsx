'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Download, FileText } from 'lucide-react';

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

interface AttachmentListProps {
  attachments: Attachment[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeLabel(fileName: string, mimeType: string): string {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('word')) return 'DOC';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'XLS';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PPT';
  const extension = fileName.split('.').pop()?.trim();
  return extension ? extension.toUpperCase() : 'Datoteka';
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  if (attachments.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" aria-hidden="true" />
          Dokumenti za preuzimanje
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {attachments.map((attachment) => (
            <li key={attachment.id}>
              <a
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={attachment.fileName}
                aria-label={`${attachment.fileName} (otvara se u novoj kartici)`}
                className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-neutral-900 group-hover:text-primary-600">
                    {attachment.fileName}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {getFileTypeLabel(attachment.fileName, attachment.mimeType)} •{' '}
                    {formatFileSize(attachment.fileSize)}
                  </p>
                  <p className="text-xs text-neutral-400">
                    Otvara se u novoj kartici
                  </p>
                </div>
                <Download
                  className="h-5 w-5 flex-shrink-0 text-neutral-400 transition-colors group-hover:text-primary-600"
                  aria-hidden="true"
                />
                <span className="sr-only">Preuzmi dokument</span>
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
