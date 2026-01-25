'use client';

import { Card, CardContent, CardHeader, CardTitle, toast } from '@repo/ui';
import { useCallback, useState } from 'react';

import { ImageGrid } from './image-grid';
import { ImageUploadZone } from './image-upload-zone';

import type { GalleryImage } from '@repo/shared';

interface UploadedImage {
  imageUrl: string;
  thumbnailUrl: string | null;
}

interface ImageManagerProps {
  galleryId: string;
  initialImages: GalleryImage[];
  initialCoverImage: string | null;
  onCoverChange?: (coverImage: string | null) => void;
}

export function ImageManager({
  galleryId,
  initialImages,
  initialCoverImage,
  onCoverChange,
}: ImageManagerProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [coverImage, setCoverImage] = useState<string | null>(initialCoverImage);
  const [isLoading, setIsLoading] = useState(false);

  // Add new images
  const handleUploadComplete = useCallback(
    async (uploadedImages: UploadedImage[]) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/galleries/${galleryId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: uploadedImages }),
        });

        const result = (await response.json()) as {
          success: boolean;
          data?: GalleryImage[];
          error?: { message: string };
        };

        if (!result.success || !result.data) {
          throw new Error(result.error?.message ?? 'Greska pri dodavanju slika');
        }

        setImages((prev) => [...prev, ...result.data!]);
        toast({
          title: 'Uspjeh',
          description: `Dodano ${result.data.length} slika u galeriju.`,
          variant: 'success',
        });
      } catch (error) {
        toast({
          title: 'Greska',
          description: error instanceof Error ? error.message : 'Greska pri dodavanju slika',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [galleryId]
  );

  // Delete image
  const handleDeleteImage = useCallback(
    async (imageId: string) => {
      const imageToDelete = images.find((img) => img.id === imageId);
      if (!imageToDelete) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/galleries/${galleryId}/images/${imageId}`, {
          method: 'DELETE',
        });

        const result = (await response.json()) as {
          success: boolean;
          error?: { message: string };
        };

        if (!result.success) {
          throw new Error(result.error?.message ?? 'Greska pri brisanju slike');
        }

        setImages((prev) => prev.filter((img) => img.id !== imageId));

        // If deleted image was the cover, clear the cover
        if (coverImage === imageToDelete.imageUrl) {
          setCoverImage(null);
          onCoverChange?.(null);
        }

        toast({
          title: 'Uspjeh',
          description: 'Slika je obrisana.',
          variant: 'success',
        });
      } catch (error) {
        toast({
          title: 'Greska',
          description: error instanceof Error ? error.message : 'Greska pri brisanju slike',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [galleryId, images, coverImage, onCoverChange]
  );

  // Reorder images
  const handleReorder = useCallback(
    async (imageIds: string[]) => {
      // Optimistic update
      const reorderedImages = imageIds
        .map((id) => images.find((img) => img.id === id))
        .filter((img): img is GalleryImage => img !== undefined);
      setImages(reorderedImages);

      try {
        const response = await fetch(`/api/galleries/${galleryId}/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageIds }),
        });

        const result = (await response.json()) as {
          success: boolean;
          error?: { message: string };
        };

        if (!result.success) {
          throw new Error(result.error?.message ?? 'Greska pri promjeni redoslijeda');
        }
      } catch (error) {
        // Revert on error
        setImages(images);
        toast({
          title: 'Greska',
          description: error instanceof Error ? error.message : 'Greska pri promjeni redoslijeda',
          variant: 'destructive',
        });
      }
    },
    [galleryId, images]
  );

  // Set cover image
  const handleSetCover = useCallback(
    async (imageUrl: string) => {
      // Don't update if already the cover
      if (coverImage === imageUrl) return;

      const previousCover = coverImage;
      setCoverImage(imageUrl);

      try {
        const response = await fetch(`/api/galleries/${galleryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coverImage: imageUrl }),
        });

        const result = (await response.json()) as {
          success: boolean;
          error?: { message: string };
        };

        if (!result.success) {
          throw new Error(result.error?.message ?? 'Greska pri postavljanju naslovne slike');
        }

        onCoverChange?.(imageUrl);
        toast({
          title: 'Uspjeh',
          description: 'Naslovna slika je postavljena.',
          variant: 'success',
        });
      } catch (error) {
        // Revert on error
        setCoverImage(previousCover);
        toast({
          title: 'Greska',
          description: error instanceof Error ? error.message : 'Greska pri postavljanju naslovne slike',
          variant: 'destructive',
        });
      }
    },
    [galleryId, coverImage, onCoverChange]
  );

  // Update caption
  const handleUpdateCaption = useCallback(
    async (imageId: string, caption: string | null) => {
      // Optimistic update
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, caption } : img
        )
      );

      try {
        const response = await fetch(`/api/galleries/${galleryId}/images/${imageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption }),
        });

        const result = (await response.json()) as {
          success: boolean;
          error?: { message: string };
        };

        if (!result.success) {
          throw new Error(result.error?.message ?? 'Greska pri azuriranju opisa');
        }

        toast({
          title: 'Uspjeh',
          description: 'Opis slike je azuriran.',
          variant: 'success',
        });
      } catch (error) {
        // Revert on error - refetch would be better but keeping it simple
        toast({
          title: 'Greska',
          description: error instanceof Error ? error.message : 'Greska pri azuriranju opisa',
          variant: 'destructive',
        });
      }
    },
    [galleryId]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slike galerije</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ImageUploadZone
          onUploadComplete={(imgs) => void handleUploadComplete(imgs)}
          disabled={isLoading}
        />
        <ImageGrid
          images={images}
          currentCoverImage={coverImage}
          onSetCover={(url) => void handleSetCover(url)}
          onUpdateCaption={(id, caption) => void handleUpdateCaption(id, caption)}
          onDeleteImage={(id) => void handleDeleteImage(id)}
          onReorder={(ids) => void handleReorder(ids)}
        />
      </CardContent>
    </Card>
  );
}
