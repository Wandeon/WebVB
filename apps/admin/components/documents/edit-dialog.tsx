'use client';

import { DOCUMENT_CATEGORY_OPTIONS } from '@repo/shared';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { useEffect, useState } from 'react';

import type { DocumentWithUploader } from '@repo/database';

interface EditDialogProps {
  document: DocumentWithUploader | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: currentYear - 1990 + 2 },
  (_, i) => currentYear + 1 - i
);

export function EditDialog({ document, open, onOpenChange, onSuccess }: EditDialogProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setCategory(document.category);
      setYear(document.year?.toString() ?? currentYear.toString());
      setSubcategory(document.subcategory ?? '');
      setError(null);
    }
  }, [document]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!document) return;

    if (!title.trim()) {
      setError('Naslov je obavezan');
      return;
    }

    if (!category) {
      setError('Kategorija je obavezna');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          year: parseInt(year, 10),
          subcategory: subcategory.trim() || null,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message: string };
      };

      if (!result.success) {
        setError(result.error?.message ?? 'Greska pri azuriranju dokumenta');
        return;
      }

      handleOpenChange(false);
      onSuccess();
    } catch {
      setError('Greska pri azuriranju dokumenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = title.trim() && category;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Uredi dokument</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Naslov *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Unesite naslov dokumenta"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Kategorija *</Label>
            <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Odaberite kategoriju" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-year">Godina</Label>
              <Select value={year} onValueChange={setYear} disabled={isSubmitting}>
                <SelectTrigger id="edit-year">
                  <SelectValue placeholder="Odaberite godinu" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subcategory">Podkategorija</Label>
              <Input
                id="edit-subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Opcionalno"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <p className="text-sm text-neutral-500 italic">
            Za zamjenu PDF-a obrisite dokument i ucitajte novi.
          </p>

          {error && <p className="text-sm text-error">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Odustani
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? 'Spremanje...' : 'Spremi promjene'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
