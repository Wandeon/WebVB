import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImageUpload } from './image-upload';

// Mock fetch for the delete call
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('ImageUpload', () => {
  const defaultProps = {
    value: null,
    onChange: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders drop zone when no value', () => {
    render(<ImageUpload {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Zona za prijenos slike' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Kliknite za odabir/)).toBeInTheDocument();
    expect(screen.getByText(/povucite sliku/)).toBeInTheDocument();
  });

  it('renders image preview when value provided', () => {
    render(
      <ImageUpload {...defaultProps} value="https://example.com/image.jpg" />
    );

    const image = screen.getByRole('img', { name: 'Preview' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('shows remove button on preview', () => {
    render(
      <ImageUpload {...defaultProps} value="https://example.com/image.jpg" />
    );

    const removeButton = screen.getByRole('button', { name: 'Ukloni sliku' });
    expect(removeButton).toBeInTheDocument();
  });

  it('calls onRemove when remove clicked', async () => {
    const handleRemove = vi.fn();
    render(
      <ImageUpload
        {...defaultProps}
        value="https://example.com/image.jpg"
        onRemove={handleRemove}
      />
    );

    const removeButton = screen.getByRole('button', { name: 'Ukloni sliku' });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(handleRemove).toHaveBeenCalledTimes(1);
      expect(handleRemove).toHaveBeenCalledWith(undefined);
    });
  });

  it('calls delete API and onRemove with imageId when remove clicked with imageId', async () => {
    const handleRemove = vi.fn();
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));

    render(
      <ImageUpload
        {...defaultProps}
        value="https://example.com/uploads/test-id/large.webp"
        imageId="test-id"
        onRemove={handleRemove}
      />
    );

    const removeButton = screen.getByRole('button', { name: 'Ukloni sliku' });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/upload?id=test-id', { method: 'DELETE' });
      expect(handleRemove).toHaveBeenCalledWith('test-id');
    });
  });

  it('shows file type hint', () => {
    render(<ImageUpload {...defaultProps} />);

    expect(screen.getByText(/JPEG, PNG, WebP, GIF/)).toBeInTheDocument();
    expect(screen.getByText(/maks. 10MB/)).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<ImageUpload {...defaultProps} disabled />);

    const dropZone = screen.getByRole('button', {
      name: 'Zona za prijenos slike',
    });
    expect(dropZone).toHaveClass('cursor-not-allowed');
    expect(dropZone).toHaveClass('opacity-50');
    expect(dropZone).toHaveAttribute('tabindex', '-1');
  });

  it('hides remove button when disabled', () => {
    render(
      <ImageUpload
        {...defaultProps}
        value="https://example.com/image.jpg"
        disabled
      />
    );

    const removeButton = screen.getByRole('button', { name: 'Ukloni sliku' });
    expect(removeButton).toHaveClass('hidden');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ImageUpload {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows dragging state on dragover', () => {
    render(<ImageUpload {...defaultProps} />);

    const dropZone = screen.getByRole('button', {
      name: 'Zona za prijenos slike',
    });

    fireEvent.dragOver(dropZone);

    expect(dropZone).toHaveClass('border-primary-500');
    expect(dropZone).toHaveClass('bg-primary-50');
  });

  it('removes dragging state on dragleave', () => {
    render(<ImageUpload {...defaultProps} />);

    const dropZone = screen.getByRole('button', {
      name: 'Zona za prijenos slike',
    });

    fireEvent.dragOver(dropZone);
    fireEvent.dragLeave(dropZone);

    expect(dropZone).not.toHaveClass('border-primary-500');
    expect(dropZone).not.toHaveClass('bg-primary-50');
  });
});
