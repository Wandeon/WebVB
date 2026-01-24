'use client';

import { DOCUMENT_CATEGORIES } from '@repo/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui';
import { useState } from 'react';

import type { DocumentWithUploader } from '@repo/database';

interface DeleteDialogProps {
  document: DocumentWithUploader | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DeleteDialog({ document, open, onOpenChange, onSuccess }: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const handleDelete = async () => {
    if (!document) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        setError('Dokument je vec obrisan ili nije pronaden');
        return;
      }

      const result = (await response.json()) as {
        success: boolean;
        error?: { message: string };
      };

      if (!result.success) {
        setError(result.error?.message ?? 'Greska pri brisanju dokumenta');
        return;
      }

      handleOpenChange(false);
      onSuccess();
    } catch {
      setError('Greska pri brisanju dokumenta');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!document) return null;

  const categoryKey = document.category as keyof typeof DOCUMENT_CATEGORIES;
  const categoryLabel = DOCUMENT_CATEGORIES[categoryKey] ?? document.category;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Brisanje dokumenta</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>Jeste li sigurni da zelite obrisati ovaj dokument?</p>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm">
                <dl className="space-y-1">
                  <div className="flex">
                    <dt className="w-24 font-medium text-neutral-700">Naslov:</dt>
                    <dd className="text-neutral-600">{document.title}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 font-medium text-neutral-700">Kategorija:</dt>
                    <dd className="text-neutral-600">{categoryLabel}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 font-medium text-neutral-700">Godina:</dt>
                    <dd className="text-neutral-600">{document.year ?? '-'}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 font-medium text-neutral-700">Velicina:</dt>
                    <dd className="text-neutral-600">{formatFileSize(document.fileSize)}</dd>
                  </div>
                </dl>
              </div>
              <p className="text-neutral-500">Ova radnja se ne moze ponistiti.</p>
              {error && <p className="text-error">{error}</p>}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Odustani</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="bg-error hover:bg-red-700 focus:ring-error"
          >
            {isDeleting ? 'Brisanje...' : 'Obrisi'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
