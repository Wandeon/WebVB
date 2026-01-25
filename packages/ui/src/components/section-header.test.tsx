import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SectionHeader } from './section-header';

describe('SectionHeader', () => {
  it('renders title and description', () => {
    render(<SectionHeader title="Najnovije vijesti" description="Opis sekcije" />);

    expect(
      screen.getByRole('heading', { name: 'Najnovije vijesti' })
    ).toBeInTheDocument();
    expect(screen.getByText('Opis sekcije')).toBeInTheDocument();
  });

  it('renders link when link props provided', () => {
    render(
      <SectionHeader title="Događanja" linkText="Sva događanja" linkHref="/dogadanja" />
    );

    expect(screen.getByRole('link', { name: 'Sva događanja' })).toHaveAttribute(
      'href',
      '/dogadanja'
    );
  });
});
