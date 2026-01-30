'use client';

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui';
import { Archive, Mail, MailOpen } from 'lucide-react';

import type { ContactMessage } from './columns';

const STATUS_LABELS: Record<string, string> = {
  new: 'Nova',
  read: 'Pročitana',
  replied: 'Odgovoreno',
  archived: 'Arhivirana',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  new: 'warning',
  read: 'secondary',
  replied: 'success',
  archived: 'default',
};

interface MessageDialogProps {
  message: ContactMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (message: ContactMessage, status: string) => void;
}

export function MessageDialog({
  message,
  open,
  onOpenChange,
  onStatusChange,
}: MessageDialogProps) {
  if (!message) return null;

  const statusLabel = STATUS_LABELS[message.status] ?? message.status;
  const statusVariant = STATUS_VARIANTS[message.status] ?? 'default';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Poruka od {message.name}
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </DialogTitle>
          <DialogDescription>
            {message.email} •{' '}
            {new Date(message.createdAt).toLocaleDateString('hr-HR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {message.subject && (
            <div>
              <h4 className="text-sm font-medium text-neutral-500">Predmet</h4>
              <p className="mt-1 text-neutral-900">{message.subject}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-neutral-500">Poruka</h4>
            <div className="mt-1 whitespace-pre-wrap rounded-md bg-neutral-50 p-4 text-neutral-900">
              {message.message}
            </div>
          </div>

          {message.repliedAt && (
            <div className="text-sm text-neutral-500">
              Odgovoreno:{' '}
              {new Date(message.repliedAt).toLocaleDateString('hr-HR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:gap-0">
          {message.status === 'new' && (
            <Button
              variant="outline"
              onClick={() => {
                onStatusChange(message, 'read');
                onOpenChange(false);
              }}
            >
              <MailOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              Označi pročitano
            </Button>
          )}
          {message.status !== 'replied' && (
            <Button
              variant="outline"
              onClick={() => {
                onStatusChange(message, 'replied');
                onOpenChange(false);
              }}
            >
              <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
              Označi odgovoreno
            </Button>
          )}
          {message.status !== 'archived' && (
            <Button
              variant="outline"
              onClick={() => {
                onStatusChange(message, 'archived');
                onOpenChange(false);
              }}
            >
              <Archive className="mr-2 h-4 w-4" aria-hidden="true" />
              Arhiviraj
            </Button>
          )}
          <Button asChild>
            <a href={`mailto:${message.email}?subject=Re: ${message.subject ?? 'Upit s web stranice'}`}>
              Odgovori e-mailom
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
