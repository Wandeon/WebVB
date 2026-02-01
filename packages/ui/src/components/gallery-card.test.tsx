import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GalleryCard } from './gallery-card';

describe('GalleryCard', () => {
  it('renders a fallback when the cover image fails', () => {
    render(
      <GalleryCard
        name="Galerija"
        slug="galerija"
        coverImage="https://example.com/cover.jpg"
        imageCount={3}
        eventDate={null}
      />
    );

    const image = screen.getByRole('img', { name: 'Galerija' });
    fireEvent.error(image);

    expect(screen.getByText('Naslovna fotografija nije dostupna')).toBeInTheDocument();
  });
});
