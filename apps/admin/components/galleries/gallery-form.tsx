'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  toast,
} from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form-specific schema without transforms for react-hook-form compatibility
const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Naziv mora imati najmanje 2 znaka')
    .max(200, 'Naziv može imati najviše 200 znakova'),
  description: z.string().nullable().optional(),
  eventDate: z.string().nullable().optional(),
});

type GalleryFormValues = z.infer<typeof formSchema>;

interface GalleryFormData {
  id?: string;
  name: string;
  description: string | null;
  eventDate: string | null;
}

interface GalleryFormProps {
  initialData?: GalleryFormData;
}

function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0] ?? '';
}

export function GalleryForm({ initialData }: GalleryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GalleryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? null,
      eventDate: formatDateForInput(initialData?.eventDate) || null,
    },
  });

  const onSubmit = async (data: GalleryFormValues) => {
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/galleries/${initialData?.id}` : '/api/galleries';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          success: false;
          error?: { message?: string };
        };
        throw new Error(errorData.error?.message ?? 'Došlo je do greške');
      }

      toast({
        title: 'Uspjeh',
        description: isEditing
          ? 'Galerija je uspješno ažurirana.'
          : 'Galerija je uspješno stvorena.',
        variant: 'success',
      });

      router.push('/galleries');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Greška',
        description:
          error instanceof Error ? error.message : 'Došlo je do greške',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Uredi galeriju' : 'Nova galerija'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" required>
              Naziv
            </Label>
            <Input
              id="name"
              placeholder="Unesite naziv galerije"
              error={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-error">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              placeholder="Unesite opis galerije (opcionalno)"
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-error">{errors.description.message}</p>
            )}
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <Label htmlFor="eventDate">Datum događanja</Label>
            <Input
              id="eventDate"
              type="date"
              error={Boolean(errors.eventDate)}
              {...register('eventDate')}
            />
            {errors.eventDate && (
              <p className="text-sm text-error">{errors.eventDate.message}</p>
            )}
            <p className="text-xs text-neutral-500">
              Datum kada se događaj odvijao (opcionalno)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Spremanje...' : 'Spremi'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Odustani
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
