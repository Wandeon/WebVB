import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NewsletterSignup } from './newsletter-signup';

describe('NewsletterSignup', () => {
  it('submits email when handler is provided', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    render(<NewsletterSignup onSubmit={handleSubmit} />);

    const input = screen.getByLabelText('Email adresa za pretplatu');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith('test@example.com');
    });

    expect(
      await screen.findByText('Hvala na prijavi! Provjerite svoj email za potvrdu.')
    ).toBeInTheDocument();
  });

  it('shows unavailable state when handler is missing', () => {
    render(<NewsletterSignup />);

    expect(
      screen.getByText('Trenutno ne primamo nove prijave na newsletter.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pretplati se' })).toBeDisabled();
  });
});
