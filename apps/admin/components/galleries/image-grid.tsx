'use client';

import { Button, cn, Input } from '@repo/ui';
import { GripVertical, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';

import type { GalleryImage } from '@repo/shared';

interface ImageGridProps {
  images: GalleryImage[];
  currentCoverImage: string | null;
  onSetCover: (imageUrl: string) => void;
  onUpdateCaption: (imageId: string, caption: string | null) => void;
  onDeleteImage: (imageId: string) => void;
  onReorder: (imageIds: string[]) => void;
}

export function ImageGrid({
  images,
  currentCoverImage,
  onSetCover,
  onUpdateCaption,
  onDeleteImage,
  onReorder,
}: ImageGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionValue, setCaptionValue] = useState('');

  const handleDragStart = useCallback(
    (e: React.DragEvent, imageId: string) => {
      setDraggedId(imageId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', imageId);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, imageId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedId && draggedId !== imageId) {
        setDragOverId(imageId);
      }
    },
    [draggedId]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      setDragOverId(null);

      if (!draggedId || draggedId === targetId) {
        setDraggedId(null);
        return;
      }

      const currentIds = images.map((img) => img.id);
      const draggedIndex = currentIds.indexOf(draggedId);
      const targetIndex = currentIds.indexOf(targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedId(null);
        return;
      }

      // Remove dragged item and insert at target position
      const newIds = [...currentIds];
      newIds.splice(draggedIndex, 1);
      newIds.splice(targetIndex, 0, draggedId);

      onReorder(newIds);
      setDraggedId(null);
    },
    [draggedId, images, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const handleStartEditCaption = useCallback((image: GalleryImage) => {
    setEditingCaption(image.id);
    setCaptionValue(image.caption ?? '');
  }, []);

  const handleSaveCaption = useCallback(
    (imageId: string) => {
      onUpdateCaption(imageId, captionValue.trim() || null);
      setEditingCaption(null);
      setCaptionValue('');
    },
    [captionValue, onUpdateCaption]
  );

  const handleCancelEditCaption = useCallback(() => {
    setEditingCaption(null);
    setCaptionValue('');
  }, []);

  const handleCaptionKeyDown = useCallback(
    (e: React.KeyboardEvent, imageId: string) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveCaption(imageId);
      } else if (e.key === 'Escape') {
        handleCancelEditCaption();
      }
    },
    [handleSaveCaption, handleCancelEditCaption]
  );

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        Galerija nema slika. Dodajte slike iznad.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((image) => {
        const isCover = currentCoverImage === image.imageUrl;
        const isDragging = draggedId === image.id;
        const isDragOver = dragOverId === image.id;
        const isEditingThis = editingCaption === image.id;

        return (
          <div
            key={image.id}
            draggable
            onDragStart={(e) => handleDragStart(e, image.id)}
            onDragOver={(e) => handleDragOver(e, image.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, image.id)}
            onDragEnd={handleDragEnd}
            className={cn(
              'relative group rounded-lg border bg-white overflow-hidden',
              'transition-all duration-200',
              isDragging && 'opacity-50 scale-95',
              isDragOver && 'ring-2 ring-primary-500 ring-offset-2',
              !isDragging && 'hover:shadow-md'
            )}
          >
            {/* Drag handle */}
            <div
              className={cn(
                'absolute top-2 left-2 z-10 p-1 rounded bg-black/50 cursor-grab',
                'opacity-0 group-hover:opacity-100 transition-opacity'
              )}
              title="Povuci za promjenu redoslijeda"
            >
              <GripVertical className="h-4 w-4 text-white" />
            </div>

            {/* Cover indicator */}
            {isCover && (
              <div className="absolute top-2 right-2 z-10 p-1 rounded bg-yellow-500">
                <Star className="h-4 w-4 text-white fill-white" />
              </div>
            )}

            {/* Image */}
            <div className="aspect-square relative">
              <Image
                src={image.thumbnailUrl ?? image.imageUrl}
                alt={image.caption ?? 'Slika galerije'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
            </div>

            {/* Caption and actions */}
            <div className="p-2 space-y-2">
              {isEditingThis ? (
                <div className="space-y-1">
                  <Input
                    value={captionValue}
                    onChange={(e) => setCaptionValue(e.target.value)}
                    onKeyDown={(e) => handleCaptionKeyDown(e, image.id)}
                    placeholder="Opis slike..."
                    className="text-xs h-7"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSaveCaption(image.id)}
                      className="h-6 text-xs px-2"
                    >
                      Spremi
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEditCaption}
                      className="h-6 text-xs px-2"
                    >
                      Odustani
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStartEditCaption(image)}
                  className={cn(
                    'w-full text-left text-xs truncate',
                    'hover:text-primary-600 transition-colors',
                    image.caption ? 'text-neutral-700' : 'text-neutral-400 italic'
                  )}
                  title="Klikni za uredivanje opisa"
                >
                  {image.caption || 'Dodaj opis...'}
                </button>
              )}

              {/* Action buttons */}
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant={isCover ? 'primary' : 'outline'}
                  onClick={() => onSetCover(image.imageUrl)}
                  className="h-7 flex-1"
                  title={isCover ? 'Naslovna slika' : 'Postavi kao naslovnu sliku'}
                >
                  <Star
                    className={cn('h-3 w-3', isCover && 'fill-current')}
                  />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onDeleteImage(image.id)}
                  className="h-7 text-error hover:text-error hover:bg-red-50"
                  title="Obrisi sliku"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
