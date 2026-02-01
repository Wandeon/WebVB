import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProblemReportForm } from './problem-report-form';

describe('ProblemReportForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnImageUpload = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockReset();
    mockOnImageUpload.mockReset();
  });

  it('renders all required fields (problem type, location, description)', () => {
    render(<ProblemReportForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('Vrsta problema *')).toBeInTheDocument();
    expect(screen.getByLabelText('Lokacija *')).toBeInTheDocument();
    expect(screen.getByLabelText('Opis problema *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pošalji prijavu' })).toBeInTheDocument();
  });

  it('renders optional contact fields (name, email, phone)', () => {
    render(<ProblemReportForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('Ime i prezime')).toBeInTheDocument();
    expect(screen.getByLabelText('Email adresa')).toBeInTheDocument();
    expect(screen.getByLabelText('Telefon')).toBeInTheDocument();
  });

  it('shows privacy notice with link', () => {
    render(<ProblemReportForm onSubmit={mockOnSubmit} />);

    const link = screen.getByRole('link', { name: 'Politici privatnosti' });
    expect(link).toHaveAttribute('href', '/privatnost');
  });

  it('shows all problem type options in dropdown', async () => {
    const user = userEvent.setup();
    render(<ProblemReportForm onSubmit={mockOnSubmit} />);

    const selectTrigger = screen.getByLabelText('Vrsta problema *');
    await user.click(selectTrigger);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Ceste i prometnice' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Javna rasvjeta' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Otpad i čistoća' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Komunalna infrastruktura' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Ostalo' })).toBeInTheDocument();
    });
  });

  it('calls onSubmit with valid data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue({ success: true, message: 'Prijava poslana!' });

    render(<ProblemReportForm onSubmit={mockOnSubmit} />);

    // Select problem type
    const selectTrigger = screen.getByLabelText('Vrsta problema *');
    await user.click(selectTrigger);
    await user.click(screen.getByRole('option', { name: 'Ceste i prometnice' }));

    // Fill location
    await user.type(screen.getByLabelText('Lokacija *'), 'Glavna ulica 10');

    // Fill description
    await user.type(screen.getByLabelText('Opis problema *'), 'Oštećeni asfalt na cesti, opasno za vozače i pješake.');

    // Submit
    await user.click(screen.getByRole('button', { name: 'Pošalji prijavu' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          problemType: 'cesta',
          location: 'Glavna ulica 10',
          description: 'Oštećeni asfalt na cesti, opasno za vozače i pješake.',
          honeypot: '',
        })
      );
    });
  });

  it('displays success message after successful submission', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue({ success: true, message: 'Hvala na prijavi!' });

    render(<ProblemReportForm onSubmit={mockOnSubmit} />);

    // Select problem type
    const selectTrigger = screen.getByLabelText('Vrsta problema *');
    await user.click(selectTrigger);
    await user.click(screen.getByRole('option', { name: 'Javna rasvjeta' }));

    // Fill location
    await user.type(screen.getByLabelText('Lokacija *'), 'Park Bukovec');

    // Fill description
    await user.type(screen.getByLabelText('Opis problema *'), 'Ulična lampa ne radi već tjedan dana.');

    // Submit
    await user.click(screen.getByRole('button', { name: 'Pošalji prijavu' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Hvala na prijavi!');
    });
  });

  it('has hidden honeypot field', () => {
    render(<ProblemReportForm onSubmit={mockOnSubmit} />);

    const honeypotContainer = document.querySelector('[aria-hidden="true"]');
    expect(honeypotContainer).toBeInTheDocument();
    expect(honeypotContainer).toHaveClass('absolute', '-left-[9999px]');

    const honeypotInput = honeypotContainer?.querySelector('input');
    expect(honeypotInput).toBeInTheDocument();
    expect(honeypotInput).toHaveAttribute('tabindex', '-1');
    expect(honeypotInput).toHaveAttribute('autocomplete', 'off');
  });

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<ProblemReportForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: 'Pošalji prijavu' });
    await user.click(submitButton);

    await waitFor(() => {
      // Check error messages by their specific IDs to avoid matching placeholder text
      expect(document.getElementById('problemType-error')).toHaveTextContent('Odaberite vrstu problema');
      expect(document.getElementById('location-error')).toHaveTextContent('Lokacija je obavezna');
      expect(document.getElementById('description-error')).toHaveTextContent('Opis mora imati najmanje 10 znakova');
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('displays error message on submission failure', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue({ success: false, error: 'Server nije dostupan.' });

    render(<ProblemReportForm onSubmit={mockOnSubmit} />);

    // Fill required fields
    const selectTrigger = screen.getByLabelText('Vrsta problema *');
    await user.click(selectTrigger);
    await user.click(screen.getByRole('option', { name: 'Otpad i čistoća' }));

    await user.type(screen.getByLabelText('Lokacija *'), 'Centar sela');
    await user.type(screen.getByLabelText('Opis problema *'), 'Puno smeća na javnoj površini.');

    await user.click(screen.getByRole('button', { name: 'Pošalji prijavu' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Server nije dostupan.');
    });
  });

  it('does not show image upload section when onImageUpload is not provided', () => {
    render(<ProblemReportForm onSubmit={mockOnSubmit} />);

    expect(screen.queryByText('Fotografije (opcionalno, max 5)')).not.toBeInTheDocument();
    expect(screen.queryByText('Dodaj fotografiju')).not.toBeInTheDocument();
  });

  it('shows image upload section when onImageUpload is provided', () => {
    render(<ProblemReportForm onSubmit={mockOnSubmit} onImageUpload={mockOnImageUpload} />);

    expect(screen.getByText('Fotografije (opcionalno, max 5)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dodaj fotografiju' })).toBeInTheDocument();
  });

  it('has optional contact info in a fieldset with legend', () => {
    render(<ProblemReportForm onSubmit={mockOnSubmit} />);

    const fieldset = document.querySelector('fieldset');
    expect(fieldset).toBeInTheDocument();

    const legend = within(fieldset!).getByText('Kontakt podaci (opcionalno)');
    expect(legend).toBeInTheDocument();
  });

  it('disables submit button while loading', async () => {
    const user = userEvent.setup();
    let resolveSubmit: (value: { success: boolean }) => void;
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => { resolveSubmit = resolve; })
    );

    render(<ProblemReportForm onSubmit={mockOnSubmit} />);

    // Fill required fields
    const selectTrigger = screen.getByLabelText('Vrsta problema *');
    await user.click(selectTrigger);
    await user.click(screen.getByRole('option', { name: 'Komunalna infrastruktura' }));

    await user.type(screen.getByLabelText('Lokacija *'), 'Kod škole');
    await user.type(screen.getByLabelText('Opis problema *'), 'Puknuta cijev, curi voda na cestu.');

    await user.click(screen.getByRole('button', { name: 'Pošalji prijavu' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Slanje...' })).toBeDisabled();
    });

    resolveSubmit!({ success: true });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pošalji prijavu' })).not.toBeDisabled();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<ProblemReportForm onSubmit={mockOnSubmit} className="custom-class" />);

    const form = container.querySelector('form');
    expect(form).toHaveClass('custom-class');
  });
});
