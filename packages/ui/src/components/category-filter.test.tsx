import { render, screen } from '@testing-library/react';
// @ts-expect-error -- __setSearchParams is provided by test-helpers alias
import { __setSearchParams } from 'next/navigation';
import { describe, expect, it } from 'vitest';

import { CategoryFilter } from './category-filter';

describe('CategoryFilter', () => {
  const categories = [
    { value: 'aktualnosti', label: 'Opcinske aktualnosti' },
    { value: 'sport', label: 'Sport' },
  ];

  it('highlights the all option when the URL category is invalid', () => {
    __setSearchParams({ kategorija: 'nepoznato' });
    render(<CategoryFilter categories={categories} allLabel="Sve vijesti" />);

    const allButton = screen.getByRole('button', { name: 'Sve vijesti' });
    // Active button has text-white (bg-primary-600 is on child motion.div)
    expect(allButton).toHaveClass('text-white');
  });

  it('highlights the matching category when the URL category is valid', () => {
    __setSearchParams({ kategorija: 'sport' });
    render(<CategoryFilter categories={categories} allLabel="Sve vijesti" />);

    const categoryButton = screen.getByRole('button', { name: 'Sport' });
    // Active button has text-white (bg-primary-600 is on child motion.div)
    expect(categoryButton).toHaveClass('text-white');
  });
});
