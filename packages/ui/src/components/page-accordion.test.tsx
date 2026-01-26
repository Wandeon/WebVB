import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageAccordion } from './page-accordion';

const mockPages = [
  { slug: 'organizacija/uprava', title: 'Opcinska uprava' },
  { slug: 'organizacija/vijece', title: 'Opcinsko vijece' },
];

describe('PageAccordion', () => {
  it('renders section title in trigger', () => {
    render(
      <PageAccordion
        pages={mockPages}
        currentSlug="organizacija/uprava"
        sectionTitle="Organizacija"
      />
    );
    expect(screen.getByRole('button', { name: /Organizacija/i })).toBeInTheDocument();
  });

  it('shows current page title in collapsed state', () => {
    render(
      <PageAccordion
        pages={mockPages}
        currentSlug="organizacija/uprava"
        sectionTitle="Organizacija"
        currentTitle="Opcinska uprava"
      />
    );
    // The title appears both in trigger (as current title) and in content (as link)
    // Verify it's in the trigger by checking within the button
    const trigger = screen.getByRole('button', { name: /Organizacija/i });
    expect(trigger).toHaveTextContent('Opcinska uprava');
  });

  it('renders all page links in content', () => {
    render(
      <PageAccordion
        pages={mockPages}
        currentSlug="organizacija/uprava"
        sectionTitle="Organizacija"
      />
    );
    expect(screen.getByRole('link', { name: 'Opcinska uprava' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Opcinsko vijece' })).toBeInTheDocument();
  });

  it('marks active page with aria-current', () => {
    render(
      <PageAccordion
        pages={mockPages}
        currentSlug="organizacija/uprava"
        sectionTitle="Organizacija"
      />
    );
    const activeLink = screen.getByRole('link', { name: 'Opcinska uprava' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  it('applies correct href to links', () => {
    render(
      <PageAccordion
        pages={mockPages}
        currentSlug="organizacija/uprava"
        sectionTitle="Organizacija"
      />
    );
    const link = screen.getByRole('link', { name: 'Opcinsko vijece' });
    expect(link).toHaveAttribute('href', '/organizacija/vijece');
  });
});
