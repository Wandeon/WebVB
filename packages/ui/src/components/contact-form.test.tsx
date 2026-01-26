import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ContactForm } from './contact-form';

describe('ContactForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockReset();
  });

  it('renders all form fields', () => {
    render(<ContactForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('Ime i prezime *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email adresa *')).toBeInTheDocument();
    expect(screen.getByLabelText('Predmet')).toBeInTheDocument();
    expect(screen.getByLabelText('Poruka *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pošalji poruku' })).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    render(<ContactForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: 'Pošalji poruku' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Ime je obavezno')).toBeInTheDocument();
    });
    expect(screen.getByText('Unesite ispravnu email adresu')).toBeInTheDocument();
    expect(screen.getByText('Poruka mora imati najmanje 10 znakova')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue({ success: true, message: 'Poruka poslana!' });

    render(<ContactForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('Ime i prezime *'), 'Ivan Horvat');
    await user.type(screen.getByLabelText('Email adresa *'), 'ivan@example.com');
    await user.type(screen.getByLabelText('Predmet'), 'Upit o natjecaju');
    await user.type(screen.getByLabelText('Poruka *'), 'Ovo je testna poruka koja ima barem 10 znakova.');

    const submitButton = screen.getByRole('button', { name: 'Pošalji poruku' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Ivan Horvat',
        email: 'ivan@example.com',
        subject: 'Upit o natjecaju',
        message: 'Ovo je testna poruka koja ima barem 10 znakova.',
        honeypot: '',
      });
    });
  });

  it('displays success message after successful submission', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue({ success: true, message: 'Hvala na poruci!' });

    render(<ContactForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('Ime i prezime *'), 'Ivan Horvat');
    await user.type(screen.getByLabelText('Email adresa *'), 'ivan@example.com');
    await user.type(screen.getByLabelText('Poruka *'), 'Ovo je testna poruka koja ima barem 10 znakova.');

    await user.click(screen.getByRole('button', { name: 'Pošalji poruku' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Hvala na poruci!');
    });
  });

  it('displays default success message when message is not provided', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue({ success: true });

    render(<ContactForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('Ime i prezime *'), 'Ivan Horvat');
    await user.type(screen.getByLabelText('Email adresa *'), 'ivan@example.com');
    await user.type(screen.getByLabelText('Poruka *'), 'Ovo je testna poruka koja ima barem 10 znakova.');

    await user.click(screen.getByRole('button', { name: 'Pošalji poruku' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Poruka uspješno poslana!');
    });
  });

  it('displays error message on submission failure', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue({ success: false, error: 'Server nije dostupan.' });

    render(<ContactForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('Ime i prezime *'), 'Ivan Horvat');
    await user.type(screen.getByLabelText('Email adresa *'), 'ivan@example.com');
    await user.type(screen.getByLabelText('Poruka *'), 'Ovo je testna poruka koja ima barem 10 znakova.');

    await user.click(screen.getByRole('button', { name: 'Pošalji poruku' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Server nije dostupan.');
    });
  });

  it('displays default error message when error is not provided', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue({ success: false });

    render(<ContactForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('Ime i prezime *'), 'Ivan Horvat');
    await user.type(screen.getByLabelText('Email adresa *'), 'ivan@example.com');
    await user.type(screen.getByLabelText('Poruka *'), 'Ovo je testna poruka koja ima barem 10 znakova.');

    await user.click(screen.getByRole('button', { name: 'Pošalji poruku' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Došlo je do greške.');
    });
  });

  it('displays error message when onSubmit throws', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValue(new Error('Network error'));

    render(<ContactForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('Ime i prezime *'), 'Ivan Horvat');
    await user.type(screen.getByLabelText('Email adresa *'), 'ivan@example.com');
    await user.type(screen.getByLabelText('Poruka *'), 'Ovo je testna poruka koja ima barem 10 znakova.');

    await user.click(screen.getByRole('button', { name: 'Pošalji poruku' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Došlo je do greške. Pokušajte ponovno.');
    });
  });

  it('has hidden honeypot field with tabindex=-1 and autocomplete=off', () => {
    render(<ContactForm onSubmit={mockOnSubmit} />);

    const honeypotContainer = document.querySelector('[aria-hidden="true"]');
    expect(honeypotContainer).toBeInTheDocument();
    expect(honeypotContainer).toHaveClass('absolute', '-left-[9999px]');

    const honeypotInput = honeypotContainer?.querySelector('input');
    expect(honeypotInput).toBeInTheDocument();
    expect(honeypotInput).toHaveAttribute('tabindex', '-1');
    expect(honeypotInput).toHaveAttribute('autocomplete', 'off');
  });

  it('disables submit button while loading', async () => {
    const user = userEvent.setup();
    let resolveSubmit: (value: { success: boolean }) => void;
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => { resolveSubmit = resolve; })
    );

    render(<ContactForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('Ime i prezime *'), 'Ivan Horvat');
    await user.type(screen.getByLabelText('Email adresa *'), 'ivan@example.com');
    await user.type(screen.getByLabelText('Poruka *'), 'Ovo je testna poruka koja ima barem 10 znakova.');

    await user.click(screen.getByRole('button', { name: 'Pošalji poruku' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Slanje...' })).toBeDisabled();
    });

    resolveSubmit!({ success: true });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pošalji poruku' })).not.toBeDisabled();
    });
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue({ success: true });

    render(<ContactForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('Ime i prezime *');
    const emailInput = screen.getByLabelText('Email adresa *');
    const messageInput = screen.getByLabelText('Poruka *');

    await user.type(nameInput, 'Ivan Horvat');
    await user.type(emailInput, 'ivan@example.com');
    await user.type(messageInput, 'Ovo je testna poruka koja ima barem 10 znakova.');

    await user.click(screen.getByRole('button', { name: 'Pošalji poruku' }));

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
      expect(messageInput).toHaveValue('');
    });
  });

  it('applies custom className', () => {
    const { container } = render(<ContactForm onSubmit={mockOnSubmit} className="custom-class" />);

    const form = container.querySelector('form');
    expect(form).toHaveClass('custom-class');
  });
});
