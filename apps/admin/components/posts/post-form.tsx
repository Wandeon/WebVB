'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { POST_CATEGORY_OPTIONS, type PostCategory } from '@repo/shared';
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

import { postSchema } from '@/lib/validations/post';

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormData {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  category: PostCategory;
  isFeatured: boolean;
  publishedAt?: Date | null;
}

interface PostFormProps {
  initialData?: PostFormData;
}

export function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      content: initialData?.content ?? '',
      excerpt: initialData?.excerpt ?? '',
      category: initialData?.category ?? 'aktualnosti',
      isFeatured: initialData?.isFeatured ?? false,
      publishedAt: initialData?.publishedAt ?? null,
    },
  });

  const category = watch('category');
  const isFeatured = watch('isFeatured');

  const onSubmit = async (data: PostFormValues, publish: boolean) => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        publishedAt: publish ? new Date().toISOString() : null,
      };

      const url = isEditing
        ? `/api/posts/${initialData?.id}`
        : '/api/posts';
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

      toast({
        title: 'Uspjeh',
        description: isEditing
          ? 'Objava je uspješno ažurirana.'
          : publish
            ? 'Objava je uspješno objavljena.'
            : 'Objava je spremljena kao skica.',
        variant: 'success',
      });

      router.push('/posts');
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
                placeholder="Unesite naslov objave"
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
                placeholder="Kratki sažetak objave (opcionalno)"
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
              <Label htmlFor="content" required>
                Sadržaj
              </Label>
              <TipTapEditor
                value={watch('content')}
                onChange={(html) =>
                  setValue('content', html, { shouldValidate: true })
                }
                placeholder="Unesite sadržaj objave..."
                error={Boolean(errors.content)}
              />
              {errors.content && (
                <p className="text-sm text-error">{errors.content.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
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
                  setValue('category', value as PostCategory)
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Odaberite kategoriju" />
                </SelectTrigger>
                <SelectContent>
                  {POST_CATEGORY_OPTIONS.map((option) => (
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

            {/* Featured Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setValue('isFeatured', e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <Label htmlFor="isFeatured" className="cursor-pointer">
                Istaknuta objava
              </Label>
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
