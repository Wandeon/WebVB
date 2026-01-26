'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactFormData } from '@repo/shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';
import { Label } from '../primitives/label';
import { Textarea } from '../primitives/textarea';

export interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<{ success: boolean; message?: string; error?: string }>;
  className?: string;
}

export function ContactForm({ onSubmit, className }: ContactFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', subject: '', message: '', honeypot: '' },
  });

  const onFormSubmit = async (data: ContactFormData) => {
    setStatus('loading');
    setMessage('');
    try {
      const result = await onSubmit(data);
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Poruka uspješno poslana!');
        reset();
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
    <form onSubmit={(e) => void handleSubmit(onFormSubmit)(e)} className={cn('space-y-4', className)} noValidate>
      {/* Honeypot - hidden */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input type="text" {...register('honeypot')} tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Ime i prezime *</Label>
        <Input id="name" {...register('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
        {errors.name && <p id="name-error" className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email adresa *</Label>
        <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
        {errors.email && <p id="email-error" className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Predmet</Label>
        <Input id="subject" {...register('subject')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Poruka *</Label>
        <Textarea id="message" rows={5} {...register('message')} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} />
        {errors.message && <p id="message-error" className="text-sm text-red-600">{errors.message.message}</p>}
      </div>

      {status === 'success' && <div className="rounded-md bg-green-50 p-4 text-green-800" role="alert">{message}</div>}
      {status === 'error' && <div className="rounded-md bg-red-50 p-4 text-red-800" role="alert">{message}</div>}

      <Button type="submit" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? 'Slanje...' : 'Pošalji poruku'}
      </Button>
    </form>
  );
}
