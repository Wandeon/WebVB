'use client';

import { DOCUMENT_MAX_SIZE_BYTES, DOCUMENT_MAX_SIZE_MB } from '@repo/shared';
import { cn } from '@repo/ui';
import { useCallback, useState } from 'react';

export interface DocumentUploadProps {
  onUploadComplete: (data: { id: string; fileUrl: string; fileSize: number }) => void;
  disabled?: boolean;
  className?: string;
}

export function DocumentUpload({
  onUploadComplete,
  disabled = false,
  className,
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Dozvoljeni format: PDF';
    }
    if (file.size > DOCUMENT_MAX_SIZE_BYTES) {
      return `Datoteka je prevelika (max ${DOCUMENT_MAX_SIZE_MB}MB)`;
    }
    return null;
  };

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });

        const result = (await response.json()) as {
          success: boolean;
          data?: { id: string; fileUrl: string; fileSize: number };
          error?: { message: string };
        };

        if (!result.success) {
          setError(result.error?.message ?? 'Greška pri učitavanju');
          return;
        }

        if (result.data) {
          onUploadComplete(result.data);
        }
      } catch {
        setError('Greška pri učitavanju dokumenta');
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        void uploadFile(file);
      }
    },
    [disabled, isUploading, uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
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

  return (
    <div className={className}>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'flex flex-col items-center justify-center',
          'w-full h-32 border-2 border-dashed rounded-lg cursor-pointer',
          'transition-colors',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50',
          error && 'border-error bg-red-50',
          (disabled || isUploading) && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="sr-only"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-neutral-600">Učitavanje...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <div>
              <span className="text-sm font-medium text-primary-600">
                Kliknite za odabir
              </span>
              <span className="text-sm text-neutral-500">
                {' '}
                ili povucite PDF
              </span>
            </div>
            <span className="text-xs text-neutral-400">
              PDF (max {DOCUMENT_MAX_SIZE_MB}MB)
            </span>
          </div>
        )}
      </label>

      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
