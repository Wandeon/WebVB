import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { PlaceHero } from './place-hero';

// Mock window.matchMedia for reduced motion detection
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('PlaceHero', () => {
  const defaultProps = {
    imageSrc: '/test-image.jpg',
    headline: 'Test Headline',
    subline: 'Test Subline',
    primaryCta: { label: 'Primary', href: '/primary' },
    secondaryCta: { label: 'Secondary', href: '/secondary' },
  };

  it('renders headline and subline', () => {
    render(<PlaceHero {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Headline');
    expect(screen.getByText('Test Subline')).toBeInTheDocument();
  });

  it('renders both CTA buttons', () => {
    render(<PlaceHero {...defaultProps} />);

    expect(screen.getByRole('link', { name: 'Primary' })).toHaveAttribute('href', '/primary');
    expect(screen.getByRole('link', { name: 'Secondary' })).toHaveAttribute('href', '/secondary');
  });

  it('renders hero image', () => {
    render(<PlaceHero {...defaultProps} />);

    // Image has alt="" for decorative purposes, so it has presentation role
    const img = screen.getByRole('presentation');
    expect(img).toHaveAttribute('src', '/test-image.jpg');
  });

  it('renders trust line when provided', () => {
    render(
      <PlaceHero
        {...defaultProps}
        trustLine={{
          hours: 'Mon-Fri 9-5',
          hoursHref: '/contact',
          address: '123 Main St',
          addressHref: 'https://maps.google.com',
        }}
      />
    );

    expect(screen.getByText('Mon-Fri 9-5')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
  });
});
