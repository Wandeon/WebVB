'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  toast,
} from '@repo/ui';
import { FileText, GripVertical, Trash2, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

interface AttachmentUploaderProps {
  announcementId: string | null;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentUploader({
  announcementId,
  attachments,
  onAttachmentsChange,
  disabled = false,
}: AttachmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !announcementId) return;

      setIsUploading(true);

      try {
        for (const file of Array.from(files)) {
          // Validate file type
          if (file.type !== 'application/pdf') {
            toast({
              title: 'Greška',
              description: `Datoteka "${file.name}" nije PDF. Samo PDF datoteke su dozvoljene.`,
              variant: 'destructive',
            });
            continue;
          }

          // Validate file size (max 20MB)
          if (file.size > 20 * 1024 * 1024) {
            toast({
              title: 'Greška',
              description: `Datoteka "${file.name}" je prevelika. Maksimalna veličina je 20MB.`,
              variant: 'destructive',
            });
            continue;
          }

          // Upload file
          const formData = new FormData();
          formData.append('file', file);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Greška pri uploadu datoteke "${file.name}"`);
          }

          const uploadData = (await uploadResponse.json()) as {
            success: boolean;
            data?: { url: string };
          };

          if (!uploadData.success || !uploadData.data?.url) {
            throw new Error(`Greška pri uploadu datoteke "${file.name}"`);
          }

          // Add attachment to announcement
          const attachmentResponse = await fetch(
            `/api/announcements/${announcementId}/attachments`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fileName: file.name,
                fileUrl: uploadData.data.url,
                fileSize: file.size,
                mimeType: file.type,
              }),
            }
          );

          if (!attachmentResponse.ok) {
            throw new Error(`Greška pri dodavanju privitka "${file.name}"`);
          }

          const attachmentData = (await attachmentResponse.json()) as {
            success: boolean;
            data: Attachment;
          };

          if (attachmentData.success && attachmentData.data) {
            onAttachmentsChange([...attachments, attachmentData.data]);
          }
        }

        toast({
          title: 'Uspjeh',
          description: 'Privici su uspješno dodani.',
          variant: 'success',
        });
      } catch (error) {
        toast({
          title: 'Greška',
          description:
            error instanceof Error ? error.message : 'Greška pri uploadu',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [announcementId, attachments, onAttachmentsChange]
  );

  const handleDelete = useCallback(
    async (attachmentId: string) => {
      if (!announcementId) return;

      try {
        const response = await fetch(
          `/api/announcements/${announcementId}/attachments/${attachmentId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Greška pri brisanju privitka');
        }

        onAttachmentsChange(
          attachments.filter((att) => att.id !== attachmentId)
        );

        toast({
          title: 'Uspjeh',
          description: 'Privitak je uspješno obrisan.',
          variant: 'success',
        });
      } catch (error) {
        toast({
          title: 'Greška',
          description:
            error instanceof Error ? error.message : 'Greška pri brisanju',
          variant: 'destructive',
        });
      }
    },
    [announcementId, attachments, onAttachmentsChange]
  );

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder attachments locally for visual feedback
    const newAttachments = [...attachments];
    const removed = newAttachments.splice(draggedIndex, 1);
    const draggedItem = removed[0];
    if (draggedItem) {
      newAttachments.splice(index, 0, draggedItem);
      onAttachmentsChange(newAttachments);
      setDraggedIndex(index);
    }
  }, [draggedIndex, attachments, onAttachmentsChange]);

  const handleDragEnd = useCallback(async () => {
    if (!announcementId || draggedIndex === null) {
      setDraggedIndex(null);
      return;
    }

    try {
      const response = await fetch(
        `/api/announcements/${announcementId}/attachments`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attachmentIds: attachments.map((att) => att.id),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Greška pri ažuriranju redoslijeda');
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description:
          error instanceof Error
            ? error.message
            : 'Greška pri ažuriranju redoslijeda',
        variant: 'destructive',
      });
    } finally {
      setDraggedIndex(null);
    }
  }, [announcementId, attachments, draggedIndex]);

  if (!announcementId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Privici</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">
            Spremite obavijest kako biste mogli dodati privitke.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privici (PDF)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => void handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled || isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            {isUploading ? 'Učitavanje...' : 'Dodaj PDF'}
          </Button>
        </div>

        {/* Attachments list */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <div
                key={attachment.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={() => void handleDragEnd()}
                className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3"
              >
                <GripVertical
                  className="h-4 w-4 cursor-grab text-neutral-400"
                  aria-hidden="true"
                />
                <FileText className="h-5 w-5 text-red-600" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium text-neutral-900 hover:text-primary-600"
                  >
                    {attachment.fileName}
                  </a>
                  <p className="text-xs text-neutral-500">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleDelete(attachment.id)}
                  disabled={disabled}
                  aria-label={`Obriši ${attachment.fileName}`}
                >
                  <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {attachments.length === 0 && (
          <p className="text-sm text-neutral-500">
            Nema dodanih privitaka. Kliknite &quot;Dodaj PDF&quot; za učitavanje.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
