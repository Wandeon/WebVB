import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DocumentUpload } from './document-upload';

describe('DocumentUpload', () => {
  it('renders drop zone with instructions', () => {
    render(<DocumentUpload onUploadComplete={vi.fn()} />);
    expect(screen.getByText('Kliknite za odabir')).toBeInTheDocument();
    expect(screen.getByText(/povucite PDF/)).toBeInTheDocument();
  });

  it('shows file type hint', () => {
    render(<DocumentUpload onUploadComplete={vi.fn()} />);
    expect(screen.getByText(/PDF \(max 20MB\)/)).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<DocumentUpload onUploadComplete={vi.fn()} disabled />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeDisabled();
  });

  it('accepts only PDF files', () => {
    render(<DocumentUpload onUploadComplete={vi.fn()} />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'application/pdf');
  });

  it('shows error for invalid file type', async () => {
    render(<DocumentUpload onUploadComplete={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', {
      value: [invalidFile],
    });

    fireEvent.change(input);

    expect(await screen.findByText('Dozvoljeni format: PDF')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DocumentUpload onUploadComplete={vi.fn()} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
