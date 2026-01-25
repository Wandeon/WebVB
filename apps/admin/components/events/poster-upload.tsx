'use client';

import { cn } from '@repo/ui';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';

interface PosterUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  error?: boolean;
  disabled?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function PosterUpload({
  value,
  onChange,
  error,
  disabled = false,
}: PosterUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Nepodrzani format. Dozvoljeni formati: JPEG, PNG, WebP, GIF';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Datoteka je prevelika. Maksimalna velicina je 5MB';
    }
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      setUploadError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'events');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = (await response.json()) as {
          success: boolean;
          data?: { large: string; medium: string; thumb: string; id: string };
          error?: { message: string };
        };

        if (!result.success || !result.data) {
          setUploadError(result.error?.message ?? 'Prijenos nije uspio');
          return;
        }

        onChange(result.data.large);
      } catch {
        setUploadError('Greska pri prijenosu slike. Pokusajte ponovno.');
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        void uploadFile(file);
      }
    },
    [disabled, isUploading, uploadFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isUploading) {
        setDragActive(true);
      }
    },
    [disabled, isUploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void uploadFile(file);
      }
      e.target.value = '';
    },
    [uploadFile]
  );

  const handleRemove = useCallback(() => {
    setUploadError(null);
    onChange(null);
  }, [onChange]);

  // Preview state - show image
  if (value) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-neutral-200">
        <Image
          src={value}
          alt="Poster dogadanja"
          fill
          className="object-cover"
          sizes="(max-width: 384px) 100vw, 384px"
        />
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          aria-label="Ukloni poster"
          className={cn(
            'absolute top-2 right-2 p-2 rounded-full',
            'bg-error text-white',
            'hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2',
            'transition-colors',
            disabled && 'hidden'
          )}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  // Drop zone state
  return (
    <div>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2',
          'aspect-video w-full rounded-lg border-2 border-dashed',
          'transition-colors cursor-pointer',
          dragActive && 'border-primary-500 bg-primary-50',
          error && !dragActive && 'border-error bg-red-50',
          !dragActive && !error && 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50',
          (disabled || isUploading) && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="sr-only"
        />

        {isUploading ? (
          <>
            <Upload className="h-8 w-8 text-primary-500 animate-pulse" aria-hidden="true" />
            <p className="text-sm text-neutral-600">Ucitavanje...</p>
          </>
        ) : (
          <>
            <ImagePlus className="h-8 w-8 text-neutral-400" aria-hidden="true" />
            <p className="text-sm text-neutral-600 text-center px-4">
              <span className="font-medium text-primary-600">Kliknite za odabir</span>
              {' '}ili povucite sliku
            </p>
            <p className="text-xs text-neutral-400">PNG, JPG, WebP, GIF (maks. 5MB)</p>
          </>
        )}
      </label>

      {uploadError && (
        <p className="mt-2 text-sm text-error" role="alert">
          {uploadError}
        </p>
      )}
    </div>
  );
}
