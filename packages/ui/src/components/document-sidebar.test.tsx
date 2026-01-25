import { render, screen } from '@testing-library/react';
// @ts-expect-error -- __setSearchParams is provided by test-helpers alias
import { __setSearchParams } from 'next/navigation';
import { describe, expect, it } from 'vitest';

import { DocumentSidebar } from './document-sidebar';

describe('DocumentSidebar', () => {
  const categories = [
    { value: 'proracun', label: 'Proračun' },
    { value: 'natjecaji', label: 'Natječaji' },
  ];

  it('preserves the year filter and resets pagination on category change', () => {
    __setSearchParams({ godina: '2024', stranica: '2' });

    render(
      <DocumentSidebar
        categories={categories}
        activeCategory={undefined}
        counts={{ proracun: 2, natjecaji: 4 }}
      />
    );

    const allLink = screen.getByRole('link', { name: /Sve kategorije/i });
    expect(allLink).toHaveAttribute('href', '/dokumenti?godina=2024');

    const categoryLink = screen.getByRole('link', { name: /Proračun/i });
    const href = categoryLink.getAttribute('href') ?? '';
    expect(href).toContain('godina=2024');
    expect(href).toContain('kategorija=proracun');
    expect(href).not.toContain('stranica=');
  });
});
