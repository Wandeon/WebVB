import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EventHero } from './event-hero';

describe('EventHero', () => {
  it('shows a fallback when the poster image fails', () => {
    render(<EventHero title="Fešta" posterImage="https://example.com/poster.jpg" />);

    const image = screen.getByRole('img', { name: 'Fešta' });
    fireEvent.error(image);

    expect(screen.getByText('Naslovna fotografija nije dostupna')).toBeInTheDocument();
  });
});
