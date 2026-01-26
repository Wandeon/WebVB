import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ExperienceCard } from './experience-card';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

describe('ExperienceCard', () => {
  const defaultProps = {
    title: 'Test Title',
    description: 'Test description',
    image: '/test.jpg',
    imageAlt: 'Test alt',
    href: '/test',
  };

  it('renders title and description', () => {
    render(<ExperienceCard {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders image with alt text', () => {
    render(<ExperienceCard {...defaultProps} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Test alt');
  });

  it('links to href', () => {
    render(<ExperienceCard {...defaultProps} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
  });
});
