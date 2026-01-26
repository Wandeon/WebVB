'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PROBLEM_TYPES, problemReportSchema, type ProblemReportData } from '@repo/shared';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';
import { Label } from '../primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../primitives/select';
import { Textarea } from '../primitives/textarea';

export interface ProblemReportFormProps {
  onSubmit: (data: ProblemReportData) => Promise<{ success: boolean; message?: string; error?: string }>;
  onImageUpload?: (file: File) => Promise<{ url: string } | null>;
  className?: string;
}

interface UploadedImage {
  url: string;
  file?: File;
  preview?: string;
}

export function ProblemReportForm({ onSubmit, onImageUpload, className }: ProblemReportFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedImagesRef = useRef<UploadedImage[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProblemReportData>({
    resolver: zodResolver(problemReportSchema),
    defaultValues: {
      location: '',
      description: '',
      reporterName: '',
      reporterEmail: '',
      reporterPhone: '',
      images: [],
      honeypot: '',
    },
  });

  const selectedProblemType = watch('problemType');

  const revokePreview = (image: UploadedImage) => {
    if (image.preview) {
      URL.revokeObjectURL(image.preview);
    }
  };

  useEffect(() => {
    uploadedImagesRef.current = uploadedImages;
  }, [uploadedImages]);

  useEffect(() => {
    return () => {
      uploadedImagesRef.current.forEach(revokePreview);
    };
  }, []);

  const handleProblemTypeChange = (value: ProblemReportData['problemType']) => {
    setValue('problemType', value, { shouldValidate: true });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onImageUpload || !event.target.files?.length) return;

    const file = event.target.files[0];
    if (!file) return;

    if (uploadedImages.length >= 5) {
      return;
    }

    setIsUploading(true);
    try {
      const result = await onImageUpload(file);
      if (result) {
        const newImage: UploadedImage = {
          url: result.url,
          preview: URL.createObjectURL(file),
        };
        const newImages = [...uploadedImages, newImage];
        setUploadedImages(newImages);
        setValue(
          'images',
          newImages.map((img) => ({ url: img.url })),
          { shouldValidate: true }
        );
      }
    } catch {
      // Upload failed silently
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = uploadedImages[index];
    if (imageToRemove) {
      revokePreview(imageToRemove);
    }
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setValue(
      'images',
      newImages.map((img) => ({ url: img.url })),
      { shouldValidate: true }
    );
  };

  const onFormSubmit = async (data: ProblemReportData) => {
    setStatus('loading');
    setMessage('');
    try {
      const result = await onSubmit(data);
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Prijava uspješno poslana!');
        reset();
        uploadedImages.forEach(revokePreview);
        setUploadedImages([]);
      } else {
        setStatus('error');
        setMessage(result.error || 'Došlo je do greške.');
      }
    } catch {
      setStatus('error');
      setMessage('Došlo je do greške. Pokušajte ponovno.');
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(onFormSubmit)(e)} className={cn('space-y-6', className)} noValidate>
      {/* Honeypot - hidden */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input type="text" {...register('honeypot')} tabIndex={-1} autoComplete="off" />
      </div>

      {/* Problem Type */}
      <div className="space-y-2">
        <Label htmlFor="problemType">Vrsta problema *</Label>
        <Select value={selectedProblemType ?? ''} onValueChange={handleProblemTypeChange}>
          <SelectTrigger
            id="problemType"
            aria-invalid={!!errors.problemType}
            aria-describedby={errors.problemType ? 'problemType-error' : undefined}
          >
            <SelectValue placeholder="Odaberite vrstu problema" />
          </SelectTrigger>
          <SelectContent>
            {PROBLEM_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.problemType && (
          <p id="problemType-error" className="text-sm text-red-600">
            {errors.problemType.message}
          </p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Lokacija *</Label>
        <Input
          id="location"
          placeholder="npr. Ulica i kućni broj, blizina poznatog objekta..."
          {...register('location')}
          aria-invalid={!!errors.location}
          aria-describedby={errors.location ? 'location-error' : undefined}
        />
        {errors.location && (
          <p id="location-error" className="text-sm text-red-600">
            {errors.location.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Opis problema *</Label>
        <Textarea
          id="description"
          rows={5}
          placeholder="Opišite problem što detaljnije..."
          {...register('description')}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Image Upload - only shown if onImageUpload prop is provided */}
      {onImageUpload && (
        <div className="space-y-2">
          <Label>Fotografije (opcionalno, max 5)</Label>
          <div className="space-y-3">
            {/* Thumbnails */}
            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.preview || image.url}
                      alt={`Uploaded ${index + 1}`}
                      className="h-20 w-20 rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                      aria-label={`Ukloni sliku ${index + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {uploadedImages.length < 5 && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handleFileSelect(e)}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Učitavanje...' : 'Dodaj fotografiju'}
                </Button>
              </div>
            )}
          </div>
          {errors.images && (
            <p className="text-sm text-red-600">{errors.images.message}</p>
          )}
        </div>
      )}

      {/* Optional Contact Info */}
      <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
        <legend className="px-2 text-sm font-medium text-neutral-700">Kontakt podaci (opcionalno)</legend>

        <div className="space-y-2">
          <Label htmlFor="reporterName">Ime i prezime</Label>
          <Input id="reporterName" {...register('reporterName')} />
          {errors.reporterName && (
            <p className="text-sm text-red-600">{errors.reporterName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reporterEmail">Email adresa</Label>
          <Input id="reporterEmail" type="email" {...register('reporterEmail')} />
          {errors.reporterEmail && (
            <p className="text-sm text-red-600">{errors.reporterEmail.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reporterPhone">Telefon</Label>
          <Input id="reporterPhone" type="tel" {...register('reporterPhone')} />
          {errors.reporterPhone && (
            <p className="text-sm text-red-600">{errors.reporterPhone.message}</p>
          )}
        </div>
      </fieldset>

      {/* Success/Error Messages */}
      {status === 'success' && (
        <div className="rounded-md bg-green-50 p-4 text-green-800" role="alert">
          {message}
        </div>
      )}
      {status === 'error' && (
        <div className="rounded-md bg-red-50 p-4 text-red-800" role="alert">
          {message}
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? 'Slanje...' : 'Pošalji prijavu'}
      </Button>
    </form>
  );
}
