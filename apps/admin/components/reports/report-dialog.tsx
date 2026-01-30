'use client';

import { PROBLEM_TYPE_LABELS } from '@repo/shared';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import Image from 'next/image';

import type { ProblemReport } from './columns';

const STATUS_LABELS: Record<string, string> = {
  new: 'Nova',
  in_progress: 'U obradi',
  resolved: 'Riješeno',
  rejected: 'Odbijeno',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  new: 'warning',
  in_progress: 'secondary',
  resolved: 'success',
  rejected: 'danger',
};

interface ReportDialogProps {
  report: ProblemReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (report: ProblemReport, status: string) => void;
}

export function ReportDialog({
  report,
  open,
  onOpenChange,
  onStatusChange,
}: ReportDialogProps) {
  if (!report) return null;

  const statusLabel = STATUS_LABELS[report.status] ?? report.status;
  const statusVariant = STATUS_VARIANTS[report.status] ?? 'default';
  const problemTypeLabel = PROBLEM_TYPE_LABELS[report.problemType] ?? report.problemType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Prijava problema
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </DialogTitle>
          <DialogDescription>
            {new Date(report.createdAt).toLocaleDateString('hr-HR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-neutral-500">Vrsta problema</h4>
              <p className="mt-1 text-neutral-900">{problemTypeLabel}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-neutral-500">Lokacija</h4>
              <p className="mt-1 text-neutral-900">{report.location}</p>
            </div>
          </div>

          {(report.reporterName || report.reporterEmail || report.reporterPhone) && (
            <div className="grid grid-cols-3 gap-4 rounded-md bg-neutral-50 p-3">
              {report.reporterName && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Ime</h4>
                  <p className="mt-1 text-neutral-900">{report.reporterName}</p>
                </div>
              )}
              {report.reporterEmail && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">E-mail</h4>
                  <p className="mt-1 text-neutral-900">{report.reporterEmail}</p>
                </div>
              )}
              {report.reporterPhone && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Telefon</h4>
                  <p className="mt-1 text-neutral-900">{report.reporterPhone}</p>
                </div>
              )}
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-neutral-500">Opis problema</h4>
            <div className="mt-1 whitespace-pre-wrap rounded-md bg-neutral-50 p-4 text-neutral-900">
              {report.description}
            </div>
          </div>

          {report.images && report.images.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-neutral-500 mb-2">Slike</h4>
              <div className="grid grid-cols-2 gap-2">
                {report.images.map((image, index) => (
                  <div key={index} className="relative aspect-video overflow-hidden rounded-md border">
                    <Image
                      src={image.url}
                      alt={image.caption ?? `Slika ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-xs text-white">
                        {image.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.resolutionNotes && (
            <div>
              <h4 className="text-sm font-medium text-neutral-500">Bilješke rješenja</h4>
              <div className="mt-1 whitespace-pre-wrap rounded-md bg-green-50 p-4 text-neutral-900">
                {report.resolutionNotes}
              </div>
            </div>
          )}

          {report.resolvedAt && (
            <div className="text-sm text-neutral-500">
              Riješeno:{' '}
              {new Date(report.resolvedAt).toLocaleDateString('hr-HR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:gap-0">
          {report.status === 'new' && (
            <Button
              variant="outline"
              onClick={() => {
                onStatusChange(report, 'in_progress');
                onOpenChange(false);
              }}
            >
              <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
              Označi u obradi
            </Button>
          )}
          {report.status !== 'resolved' && (
            <Button
              variant="outline"
              onClick={() => {
                onStatusChange(report, 'resolved');
                onOpenChange(false);
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Označi riješeno
            </Button>
          )}
          {report.status !== 'rejected' && (
            <Button
              variant="outline"
              onClick={() => {
                onStatusChange(report, 'rejected');
                onOpenChange(false);
              }}
            >
              <XCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Odbij prijavu
            </Button>
          )}
          {report.reporterEmail && (
            <Button asChild>
              <a href={`mailto:${report.reporterEmail}?subject=Prijava problema - ${report.location}`}>
                Kontaktiraj
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
