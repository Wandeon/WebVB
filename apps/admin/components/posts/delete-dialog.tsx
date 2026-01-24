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
  postId: string;
  postTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteDialog({
  postId,
  postTitle,
  open,
  onOpenChange,
  onSuccess,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
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
        description: 'Objava je uspješno obrisana.',
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
          <DialogTitle>Brisanje objave</DialogTitle>
          <DialogDescription>
            Jeste li sigurni da želite obrisati objavu &quot;{postTitle}&quot;?
            Ova radnja se ne može poništiti.
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
