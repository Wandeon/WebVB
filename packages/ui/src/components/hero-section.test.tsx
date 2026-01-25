import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HeroSection } from './hero-section';

describe('HeroSection', () => {
  it('renders fallback content when no post is provided', () => {
    render(<HeroSection post={null} />);

    expect(
      screen.getByRole('heading', { name: 'Dobrodošli u Općinu Veliki Bukovec' })
    ).toBeInTheDocument();
  });

  it('renders featured post details', () => {
    render(
      <HeroSection
        post={{
          title: 'Veliki projekt',
          excerpt: 'Sažetak vijesti',
          slug: 'veliki-projekt',
          category: 'Novosti',
          featuredImage: 'https://example.com/hero.jpg',
          publishedAt: new Date('2024-03-01T09:00:00.000Z'),
        }}
      />
    );

    expect(screen.getByRole('heading', { name: 'Veliki projekt' })).toBeInTheDocument();
    expect(screen.getByText('Sažetak vijesti')).toBeInTheDocument();
    expect(screen.getByText('Novosti')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pročitaj više' })).toHaveAttribute(
      'href',
      '/vijesti/veliki-projekt'
    );
    expect(screen.getByRole('img', { name: 'Veliki projekt' })).toHaveAttribute(
      'src',
      'https://example.com/hero.jpg'
    );
  });
});
