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
import { useState } from 'react';

import { DocumentUpload } from './document-upload';

interface UploadedFile {
  id: string;
  fileUrl: string;
  fileSize: number;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: currentYear - 1990 + 2 },
  (_, i) => currentYear + 1 - i
);

export function UploadDialog({ open, onOpenChange, onSuccess }: UploadDialogProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState(currentYear.toString());
  const [subcategory, setSubcategory] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setYear(currentYear.toString());
    setSubcategory('');
    setUploadedFile(null);
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleUploadComplete = (data: { id: string; fileUrl: string; fileSize: number }) => {
    setUploadedFile(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Naslov je obavezan');
      return;
    }

    if (!category) {
      setError('Kategorija je obavezna');
      return;
    }

    if (!uploadedFile) {
      setError('Molimo učitajte PDF datoteku');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          year: parseInt(year, 10),
          subcategory: subcategory.trim() || null,
          fileUrl: uploadedFile.fileUrl,
          fileSize: uploadedFile.fileSize,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message: string };
      };

      if (!result.success) {
        setError(result.error?.message ?? 'Greška pri spremanju dokumenta');
        return;
      }

      handleOpenChange(false);
      onSuccess();
    } catch {
      setError('Greška pri spremanju dokumenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = title.trim() && category && uploadedFile;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dodaj dokument</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Naslov *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Unesite naslov dokumenta"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategorija *</Label>
            <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
              <SelectTrigger id="category">
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
              <Label htmlFor="year">Godina</Label>
              <Select value={year} onValueChange={setYear} disabled={isSubmitting}>
                <SelectTrigger id="year">
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
              <Label htmlFor="subcategory">Podkategorija</Label>
              <Input
                id="subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Opcionalno"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>PDF datoteka *</Label>
            {uploadedFile ? (
              <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg bg-neutral-50">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-600"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    PDF ({formatFileSize(uploadedFile.fileSize)})
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFile(null)}
                  disabled={isSubmitting}
                >
                  Ukloni
                </Button>
              </div>
            ) : (
              <DocumentUpload
                onUploadComplete={handleUploadComplete}
                disabled={isSubmitting}
              />
            )}
          </div>

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
              {isSubmitting ? 'Spremanje...' : 'Spremi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
