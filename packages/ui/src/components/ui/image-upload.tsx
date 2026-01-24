'use client';

import { useCallback, useRef, useState } from 'react';

import { cn } from '../../lib/utils';

export interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Nepodržani format. Dozvoljeni formati: JPEG, PNG, WebP, GIF';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Datoteka je prevelika. Maksimalna veličina je 10MB';
    }
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Prijenos nije uspio');
        }

        const data = (await response.json()) as { url: string };
        onChange(data.url);
      } catch {
        setError('Greška pri prijenosu slike. Pokušajte ponovno.');
      } finally {
        setIsLoading(false);
      }
    },
    [onChange, validateFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isLoading) {
        setIsDragging(true);
      }
    },
    [disabled, isLoading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isLoading) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        void uploadFile(file);
      }
    },
    [disabled, isLoading, uploadFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void uploadFile(file);
      }
      // Reset input value to allow re-selecting the same file
      e.target.value = '';
    },
    [uploadFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled && !isLoading) {
      inputRef.current?.click();
    }
  }, [disabled, isLoading]);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setError(null);
      onRemove();
    },
    [onRemove]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isLoading) {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [disabled, isLoading]
  );

  // Preview state - show image
  if (value) {
    return (
      <div className={cn('relative group', className)}>
        <img
          src={value}
          alt="Preview"
          className="w-full h-48 object-cover rounded-lg"
        />
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          aria-label="Ukloni sliku"
          className={cn(
            'absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-black/70 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white',
            disabled && 'hidden'
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

  // Drop zone state
  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Zona za prijenos slike"
        className={cn(
          'h-48 border-2 border-dashed rounded-lg',
          'flex flex-col items-center justify-center gap-2',
          'cursor-pointer transition-colors',
          isDragging && 'border-primary-500 bg-primary-50',
          error && 'border-error bg-red-50',
          !isDragging && !error && 'border-neutral-300 hover:border-neutral-400',
          (disabled || isLoading) && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={disabled || isLoading}
          className="hidden"
          aria-hidden="true"
        />

        {isLoading ? (
          <>
            <div className="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-neutral-600">Učitavanje...</p>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-neutral-400"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <p className="text-sm text-neutral-600">
              <span className="font-medium text-primary-600">
                Kliknite za odabir
              </span>{' '}
              ili povucite sliku
            </p>
            <p className="text-xs text-neutral-400">
              JPEG, PNG, WebP, GIF (maks. 10MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
