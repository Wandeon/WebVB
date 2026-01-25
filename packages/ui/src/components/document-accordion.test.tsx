import { render, screen } from '@testing-library/react';
// @ts-expect-error -- __setSearchParams is provided by test-helpers alias
import { __setSearchParams } from 'next/navigation';
import { describe, expect, it } from 'vitest';

import { DocumentAccordion } from './document-accordion';

describe('DocumentAccordion', () => {
  const categories = [
    { value: 'proracun', label: 'Proračun' },
    { value: 'natjecaji', label: 'Natječaji' },
  ];

  it('preserves the year filter in category links', () => {
    __setSearchParams({ godina: '2023' });

    render(
      <DocumentAccordion
        categories={categories}
        activeCategory="proracun"
        counts={{ proracun: 1, natjecaji: 2 }}
      />
    );

    const activeLink = screen.getByRole('link', { name: /Proračun/i });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    expect(activeLink.getAttribute('href')).toContain('godina=2023');
  });
});
