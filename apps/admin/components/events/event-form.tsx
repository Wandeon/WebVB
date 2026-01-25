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
  TipTapEditor,
  toast,
} from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PosterUpload } from './poster-upload';

// Form-specific schema without transforms for react-hook-form compatibility
const formSchema = z.object({
  title: z
    .string()
    .min(2, 'Naslov mora imati najmanje 2 znaka')
    .max(200, 'Naslov moze imati najvise 200 znakova'),
  description: z.string().nullable().optional(),
  eventDate: z.string().min(1, 'Datum dogadanja je obavezan'),
  eventTime: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  location: z.string().max(200, 'Lokacija moze imati najvise 200 znakova').nullable().optional(),
  posterImage: z.string().url().nullable().optional(),
});

type EventFormValues = z.infer<typeof formSchema>;

interface EventFormData {
  id?: string;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string | null;
  endDate: string | null;
  location: string | null;
  posterImage: string | null;
}

interface EventFormProps {
  initialData?: EventFormData;
}

function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0] ?? '';
}

function formatTimeForInput(time: string | null | undefined): string {
  if (!time) return '';
  // If it's already in HH:mm format, return as is
  if (/^\d{2}:\d{2}$/.test(time)) return time;
  // If it's a full datetime string, extract the time
  if (time.includes('T')) {
    return time.split('T')[1]?.substring(0, 5) ?? '';
  }
  return time;
}

export function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? null,
      eventDate: formatDateForInput(initialData?.eventDate),
      eventTime: formatTimeForInput(initialData?.eventTime) || null,
      endDate: formatDateForInput(initialData?.endDate) || null,
      location: initialData?.location ?? null,
      posterImage: initialData?.posterImage ?? null,
    },
  });

  const posterImage = watch('posterImage');

  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/events/${initialData?.id}` : '/api/events';
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
        throw new Error(errorData.error?.message ?? 'Doslo je do greske');
      }

      toast({
        title: 'Uspjeh',
        description: isEditing
          ? 'Dogadanje je uspjesno azurirano.'
          : 'Dogadanje je uspjesno stvoreno.',
        variant: 'success',
      });

      router.push('/events');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Greska',
        description:
          error instanceof Error ? error.message : 'Doslo je do greske',
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
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="grid gap-6 lg:grid-cols-3">
      {/* Main Content - 2/3 width on desktop */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Osnovni podaci</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" required>
                Naslov
              </Label>
              <Input
                id="title"
                placeholder="Unesite naslov dogadanja"
                error={Boolean(errors.title)}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-error">{errors.title.message}</p>
              )}
            </div>

            {/* Description - TipTap Editor */}
            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <TipTapEditor
                value={watch('description') ?? ''}
                onChange={(html) =>
                  setValue('description', html || null, { shouldValidate: true })
                }
                placeholder="Unesite opis dogadanja..."
                error={Boolean(errors.description)}
              />
              {errors.description && (
                <p className="text-sm text-error">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datum i vrijeme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Event Date */}
              <div className="space-y-2">
                <Label htmlFor="eventDate" required>
                  Datum pocetka
                </Label>
                <Input
                  id="eventDate"
                  type="date"
                  error={Boolean(errors.eventDate)}
                  {...register('eventDate')}
                />
                {errors.eventDate && (
                  <p className="text-sm text-error">{errors.eventDate.message}</p>
                )}
              </div>

              {/* Event Time */}
              <div className="space-y-2">
                <Label htmlFor="eventTime">Vrijeme pocetka</Label>
                <Input
                  id="eventTime"
                  type="time"
                  error={Boolean(errors.eventTime)}
                  {...register('eventTime')}
                />
                {errors.eventTime && (
                  <p className="text-sm text-error">{errors.eventTime.message}</p>
                )}
                <p className="text-xs text-neutral-500">
                  Ostavite prazno za cjelodnevni dogadaj
                </p>
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">Datum zavrsetka</Label>
              <Input
                id="endDate"
                type="date"
                error={Boolean(errors.endDate)}
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-error">{errors.endDate.message}</p>
              )}
              <p className="text-xs text-neutral-500">
                Za visednevne dogadaje
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Sidebar - 1/3 width on desktop */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lokacija</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="location">Mjesto odrzavanja</Label>
              <Input
                id="location"
                placeholder="npr. Dom kulture"
                error={Boolean(errors.location)}
                {...register('location')}
              />
              {errors.location && (
                <p className="text-sm text-error">{errors.location.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Poster</CardTitle>
          </CardHeader>
          <CardContent>
            <PosterUpload
              value={posterImage ?? null}
              onChange={(url) => setValue('posterImage', url, { shouldValidate: true })}
              error={Boolean(errors.posterImage)}
              disabled={isSubmitting}
            />
            {errors.posterImage && (
              <p className="text-sm text-error mt-2">{errors.posterImage.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
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
      </div>
    </form>
  );
}
