import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PhotoGrid } from './photo-grid';

vi.mock('yet-another-react-lightbox', () => ({
  default: () => null,
}));

describe('PhotoGrid', () => {
  it('shows a fallback when an image fails to load', () => {
    render(
      <PhotoGrid
        images={[
          {
            id: 'image-1',
            imageUrl: 'https://example.com/photo.jpg',
            thumbnailUrl: 'https://example.com/thumb.jpg',
            caption: 'Proslava',
          },
        ]}
      />
    );

    const image = screen.getByRole('img', { name: 'Proslava' });
    fireEvent.error(image);

    expect(screen.getByText('Fotografija nije dostupna')).toBeInTheDocument();
  });
});
