'use client';

import { getPublicEnv } from '@repo/shared';
import { ContactForm } from '@repo/ui';

import type { ContactFormData } from '@repo/shared';

const { NEXT_PUBLIC_API_URL } = getPublicEnv();
const API_URL = NEXT_PUBLIC_API_URL;

type ContactApiResponse = {
  success: boolean;
  data?: { message?: string };
  error?: { message?: string };
};

async function submitContactForm(data: ContactFormData): Promise<{ success: boolean; message?: string; error?: string }> {
  const response = await fetch(`${API_URL}/api/public/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const payload = (await response.json()) as ContactApiResponse;
  const result: { success: boolean; message?: string; error?: string } = {
    success: payload.success,
  };
  if (payload.data?.message) result.message = payload.data.message;
  if (payload.error?.message) result.error = payload.error.message;
  return result;
}

export function ContactFormWrapper() {
  return <ContactForm onSubmit={submitContactForm} />;
}
