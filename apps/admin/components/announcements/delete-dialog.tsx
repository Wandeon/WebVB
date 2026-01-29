'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from '@repo/ui';
import { useState } from 'react';

interface DeleteDialogProps {
  announcementId: string;
  announcementTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteDialog({
  announcementId,
  announcementTitle,
  open,
  onOpenChange,
  onSuccess,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          success: false;
          error?: { message?: string };
        };
        throw new Error(errorData.error?.message ?? 'Brisanje nije uspjelo');
      }

      toast({
        title: 'Uspjeh',
        description: 'Obavijest je uspješno obrisana.',
        variant: 'success',
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Greška',
        description:
          error instanceof Error ? error.message : 'Došlo je do greške',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Brisanje obavijesti</DialogTitle>
          <DialogDescription>
            Jeste li sigurni da želite obrisati obavijest &quot;{announcementTitle}&quot;?
            Ova radnja se ne može poništiti. Svi privici će također biti obrisani.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Odustani
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
          >
            {isDeleting ? 'Brisanje...' : 'Obriši'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
