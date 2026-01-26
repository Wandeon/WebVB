import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageSidebar } from './page-sidebar';

const mockPages = [
  { slug: 'organizacija/uprava', title: 'Opcinska uprava' },
  { slug: 'organizacija/vijece', title: 'Opcinsko vijece' },
];

describe('PageSidebar', () => {
  it('renders all sibling pages as links', () => {
    render(
      <PageSidebar
        pages={mockPages}
        currentSlug="organizacija/uprava"
        sectionTitle="Organizacija"
      />
    );

    expect(screen.getByRole('link', { name: /Opcinska uprava/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Opcinsko vijece/i })).toBeInTheDocument();
  });

  it('highlights the current page with aria-current', () => {
    render(
      <PageSidebar
        pages={mockPages}
        currentSlug="organizacija/uprava"
        sectionTitle="Organizacija"
      />
    );

    const activeLink = screen.getByRole('link', { name: /Opcinska uprava/i });
    expect(activeLink).toHaveAttribute('aria-current', 'page');

    const inactiveLink = screen.getByRole('link', { name: /Opcinsko vijece/i });
    expect(inactiveLink).not.toHaveAttribute('aria-current');
  });

  it('renders section title', () => {
    render(
      <PageSidebar
        pages={mockPages}
        currentSlug="organizacija/uprava"
        sectionTitle="Organizacija"
      />
    );

    expect(screen.getByRole('heading', { name: /Organizacija/i })).toBeInTheDocument();
  });
});
