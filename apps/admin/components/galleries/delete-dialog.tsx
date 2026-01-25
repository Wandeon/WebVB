'use client';

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

import type { Gallery } from './columns';

interface DeleteDialogProps {
  gallery: Gallery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteDialog({
  gallery,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Obrisati galeriju?</AlertDialogTitle>
          <AlertDialogDescription>
            Jeste li sigurni da zelite obrisati galeriju &quot;{gallery?.name}&quot;?
            {gallery && gallery.imageCount > 0 && (
              <span className="block mt-2 font-medium text-amber-600">
                Upozorenje: Ova galerija sadrzi {gallery.imageCount}{' '}
                {gallery.imageCount === 1 ? 'sliku' : gallery.imageCount >= 2 && gallery.imageCount <= 4 ? 'slike' : 'slika'}.
              </span>
            )}
            <span className="block mt-2">Ova radnja se ne moze ponistiti.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Odustani</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Brisanje...' : 'Obrisi'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
