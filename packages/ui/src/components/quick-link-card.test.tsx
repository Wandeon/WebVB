import { render, screen } from '@testing-library/react';
import { forwardRef } from 'react';
import { describe, expect, it } from 'vitest';

import { QuickLinkCard } from './quick-link-card';

import type { LucideIcon, LucideProps } from 'lucide-react';

const MockIcon: LucideIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg ref={ref} {...props} />
));

MockIcon.displayName = 'MockIcon';

describe('QuickLinkCard', () => {
  it('renders internal link without external attributes', () => {
    render(
      <QuickLinkCard
        title="Dokumenti"
        description="Službeni dokumenti"
        href="/dokumenti"
        icon={MockIcon}
      />
    );

    const link = screen.getByRole('link', { name: /Dokumenti/ });
    expect(link).toHaveAttribute('href', '/dokumenti');
    expect(link).not.toHaveAttribute('target');
  });

  it('renders external link with target and rel', () => {
    render(
      <QuickLinkCard
        title="e-Savjetovanja"
        description="Vanjska poveznica"
        href="https://example.com"
        icon={MockIcon}
      />
    );

    const link = screen.getByRole('link', { name: /e-Savjetovanja/ });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
