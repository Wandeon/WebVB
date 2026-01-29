'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ANNOUNCEMENT_CATEGORY_OPTIONS,
  type AnnouncementCategory,
} from '@repo/shared';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  TipTapEditor,
  toast,
} from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { announcementSchema } from '@/lib/validations/announcement';

import { AttachmentUploader } from './attachment-uploader';

import type { z } from 'zod';

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

interface AnnouncementFormData {
  id?: string;
  title: string;
  content?: string | null;
  excerpt?: string | null;
  category: AnnouncementCategory;
  validFrom?: Date | null;
  validUntil?: Date | null;
  publishedAt?: Date | null;
  attachments?: Attachment[];
}

interface AnnouncementFormProps {
  initialData?: AnnouncementFormData;
}

function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0] ?? '';
}

export function AnnouncementForm({ initialData }: AnnouncementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [announcementId, setAnnouncementId] = useState<string | null>(
    initialData?.id ?? null
  );
  const [attachments, setAttachments] = useState<Attachment[]>(
    initialData?.attachments ?? []
  );
  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      content: initialData?.content ?? '',
      excerpt: initialData?.excerpt ?? '',
      category: initialData?.category ?? 'obavijest',
      validFrom: initialData?.validFrom ?? null,
      validUntil: initialData?.validUntil ?? null,
      publishedAt: initialData?.publishedAt ?? null,
    },
  });

  const category = watch('category');

  const onSubmit = async (data: AnnouncementFormValues, publish: boolean) => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        publishedAt: publish ? new Date().toISOString() : null,
      };

      const url = isEditing
        ? `/api/announcements/${initialData?.id}`
        : '/api/announcements';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          success: false;
          error?: { message?: string };
        };
        throw new Error(errorData.error?.message ?? 'Došlo je do greške');
      }

      const responseData = (await response.json()) as {
        success: boolean;
        data?: { id: string };
      };

      // If this is a new announcement, update the ID for attachment uploads
      if (!isEditing && responseData.data?.id) {
        setAnnouncementId(responseData.data.id);
      }

      toast({
        title: 'Uspjeh',
        description: isEditing
          ? 'Obavijest je uspješno ažurirana.'
          : publish
            ? 'Obavijest je uspješno objavljena.'
            : 'Obavijest je spremljena kao skica.',
        variant: 'success',
      });

      router.push('/announcements');
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

  const handlePublish = handleSubmit((data) => onSubmit(data, true));
  const handleSaveDraft = handleSubmit((data) => onSubmit(data, false));

  const handleCancel = () => {
    router.back();
  };

  return (
    <form className="grid gap-6 lg:grid-cols-3">
      {/* Main Content - 2/3 width on desktop */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Sadržaj</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" required>
                Naslov
              </Label>
              <Input
                id="title"
                placeholder="Unesite naslov obavijesti"
                error={Boolean(errors.title)}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-error">{errors.title.message}</p>
              )}
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Sažetak</Label>
              <Textarea
                id="excerpt"
                placeholder="Kratki sažetak obavijesti (opcionalno)"
                rows={3}
                error={Boolean(errors.excerpt)}
                {...register('excerpt')}
              />
              {errors.excerpt && (
                <p className="text-sm text-error">{errors.excerpt.message}</p>
              )}
            </div>

            {/* Content - TipTap Editor */}
            <div className="space-y-2">
              <Label htmlFor="content">Sadržaj</Label>
              <TipTapEditor
                value={watch('content') ?? ''}
                onChange={(html) =>
                  setValue('content', html, { shouldValidate: true })
                }
                placeholder="Unesite sadržaj obavijesti (opcionalno)..."
                error={Boolean(errors.content)}
              />
              {errors.content && (
                <p className="text-sm text-error">{errors.content.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attachments */}
        <AttachmentUploader
          announcementId={announcementId}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          disabled={isSubmitting}
        />
      </div>

      {/* Settings Sidebar - 1/3 width on desktop */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Postavke</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" required>
                Kategorija
              </Label>
              <Select
                value={category}
                onValueChange={(value) =>
                  setValue('category', value as AnnouncementCategory)
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Odaberite kategoriju" />
                </SelectTrigger>
                <SelectContent>
                  {ANNOUNCEMENT_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-error">{errors.category.message}</p>
              )}
            </div>

            {/* Valid From */}
            <div className="space-y-2">
              <Label htmlFor="validFrom">Vrijedi od</Label>
              <Input
                id="validFrom"
                type="date"
                defaultValue={formatDateForInput(initialData?.validFrom)}
                onChange={(e) =>
                  setValue(
                    'validFrom',
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
              />
              {errors.validFrom && (
                <p className="text-sm text-error">{errors.validFrom.message}</p>
              )}
            </div>

            {/* Valid Until */}
            <div className="space-y-2">
              <Label htmlFor="validUntil">Vrijedi do</Label>
              <Input
                id="validUntil"
                type="date"
                defaultValue={formatDateForInput(initialData?.validUntil)}
                onChange={(e) =>
                  setValue(
                    'validUntil',
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
              />
              {errors.validUntil && (
                <p className="text-sm text-error">
                  {errors.validUntil.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => void handlePublish()}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Spremanje...' : 'Objavi'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void handleSaveDraft()}
                disabled={isSubmitting}
              >
                Spremi kao skicu
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
