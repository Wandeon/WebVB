'use client';

import { cn } from '@repo/ui';
import { ImagePlus, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';

interface UploadedImage {
  imageUrl: string;
  thumbnailUrl: string | null;
}

interface ImageUploadZoneProps {
  onUploadComplete: (images: UploadedImage[]) => void;
  disabled?: boolean;
  className?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ImageUploadZone({
  onUploadComplete,
  disabled = false,
  className,
}: ImageUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Nepodrzani format. Dozvoljeni formati: JPEG, PNG, WebP, GIF';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Datoteka je prevelika. Maksimalna velicina je 10MB';
    }
    return null;
  }, []);

  const uploadSingleFile = useCallback(
    async (file: File): Promise<UploadedImage | null> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'galleries');

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
        throw new Error(result.error?.message ?? 'Prijenos nije uspio');
      }

      return {
        imageUrl: result.data.large,
        thumbnailUrl: result.data.thumb,
      };
    },
    []
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      // Validate all files first
      const validFiles: File[] = [];
      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      setError(null);
      setIsUploading(true);
      setUploadProgress({ current: 0, total: validFiles.length });

      const uploadedImages: UploadedImage[] = [];

      try {
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          if (!file) continue;

          setUploadProgress({ current: i + 1, total: validFiles.length });

          const uploaded = await uploadSingleFile(file);
          if (uploaded) {
            uploadedImages.push(uploaded);
          }
        }

        if (uploadedImages.length > 0) {
          onUploadComplete(uploadedImages);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Greska pri prijenosu slika. Pokusajte ponovno.'
        );
      } finally {
        setIsUploading(false);
        setUploadProgress({ current: 0, total: 0 });
      }
    },
    [validateFile, uploadSingleFile, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        void uploadFiles(files);
      }
    },
    [disabled, isUploading, uploadFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isUploading) {
        setIsDragging(true);
      }
    },
    [disabled, isUploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) {
        void uploadFiles(files);
      }
      e.target.value = '';
    },
    [uploadFiles]
  );

  return (
    <div className={className}>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2',
          'w-full h-40 rounded-lg border-2 border-dashed',
          'transition-colors cursor-pointer',
          isDragging && 'border-primary-500 bg-primary-50',
          error && !isDragging && 'border-error bg-red-50',
          !isDragging && !error && 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50',
          (disabled || isUploading) && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="sr-only"
        />

        {isUploading ? (
          <>
            <Upload className="h-8 w-8 text-primary-500 animate-pulse" aria-hidden="true" />
            <p className="text-sm text-neutral-600">
              Ucitavanje {uploadProgress.current} od {uploadProgress.total}...
            </p>
          </>
        ) : (
          <>
            <ImagePlus className="h-8 w-8 text-neutral-400" aria-hidden="true" />
            <p className="text-sm text-neutral-600 text-center px-4">
              <span className="font-medium text-primary-600">Povucite slike</span>
              {' '}ili kliknite za odabir
            </p>
            <p className="text-xs text-neutral-400">PNG, JPG, WebP, GIF (maks. 10MB)</p>
          </>
        )}
      </label>

      {error && (
        <p className="mt-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
