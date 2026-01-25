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

import type { Page } from './columns';

interface DeleteDialogProps {
  page: Page | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteDialog({
  page,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Obrisati stranicu?</AlertDialogTitle>
          <AlertDialogDescription>
            Jeste li sigurni da zelite obrisati stranicu &quot;{page?.title}&quot;?
            {page?.children && page.children.length > 0 && (
              <span className="block mt-2 text-amber-600">
                Ova stranica ima {page.children.length} podstranica koje ce ostati bez nadredene stranice.
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
