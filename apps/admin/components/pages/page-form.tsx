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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TipTapEditor,
  toast,
} from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { pageFormSchema } from '@/lib/validations/page';

import type { z } from 'zod';

type PageFormValues = z.infer<typeof pageFormSchema>;

interface ParentOption {
  id: string;
  title: string;
  parentId: string | null;
}

interface PageFormData {
  id?: string;
  title: string;
  content: string;
  parentId: string | null;
  menuOrder: number;
}

interface PageFormProps {
  initialData?: PageFormData;
}

export function PageForm({ initialData }: PageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentOptions, setParentOptions] = useState<ParentOption[]>([]);
  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      content: initialData?.content ?? '',
      parentId: initialData?.parentId ?? null,
      menuOrder: initialData?.menuOrder ?? 0,
    },
  });

  const parentId = watch('parentId');

  // Fetch parent options
  useEffect(() => {
    async function fetchParents() {
      try {
        const excludeParam = initialData?.id ? `?excludeId=${initialData.id}` : '';
        const response = await fetch(`/api/pages/parents${excludeParam}`);
        const result = (await response.json()) as {
          success: boolean;
          data?: ParentOption[];
        };
        if (result.success && result.data) {
          setParentOptions(result.data);
        }
      } catch {
        // Silently fail - dropdown will just be empty
      }
    }
    void fetchParents();
  }, [initialData?.id]);

  const onSubmit = async (data: PageFormValues) => {
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/pages/${initialData?.id}` : '/api/pages';
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
          ? 'Stranica je uspješno ažurirana.'
          : 'Stranica je uspješno stvorena.',
        variant: 'success',
      });

      router.push('/pages');
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

  // Build hierarchical display for parent dropdown
  const getParentLabel = (option: ParentOption): string => {
    const parent = parentOptions.find((p) => p.id === option.parentId);
    if (parent) {
      return `— ${option.title}`;
    }
    return option.title;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
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
                placeholder="Unesite naslov stranice"
                error={Boolean(errors.title)}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-error">{errors.title.message}</p>
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
                placeholder="Unesite sadržaj stranice..."
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
            {/* Parent Page */}
            <div className="space-y-2">
              <Label htmlFor="parentId">Nadređena stranica</Label>
              <Select
                value={parentId ?? 'none'}
                onValueChange={(value) =>
                  setValue('parentId', value === 'none' ? null : value)
                }
              >
                <SelectTrigger id="parentId">
                  <SelectValue placeholder="Odaberite nadređenu stranicu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bez nadređene (glavna)</SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {getParentLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Menu Order */}
            <div className="space-y-2">
              <Label htmlFor="menuOrder">Redoslijed u izborniku</Label>
              <Input
                id="menuOrder"
                type="number"
                min={0}
                error={Boolean(errors.menuOrder)}
                {...register('menuOrder', { valueAsNumber: true })}
              />
              {errors.menuOrder && (
                <p className="text-sm text-error">{errors.menuOrder.message}</p>
              )}
              <p className="text-xs text-neutral-500">
                Manji broj = viša pozicija u izborniku
              </p>
            </div>
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
