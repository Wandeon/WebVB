import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PostCard } from './post-card';

describe('PostCard', () => {
  it('renders title, excerpt, and link', () => {
    render(
      <PostCard
        title="Nova vijest"
        excerpt="Sažetak vijesti"
        slug="nova-vijest"
        category="Novosti"
        featuredImage="https://example.com/poster.jpg"
        publishedAt={new Date('2024-02-01T10:00:00.000Z')}
      />
    );

    expect(screen.getByRole('link', { name: /Nova vijest/ })).toHaveAttribute(
      'href',
      '/vijesti/nova-vijest'
    );
    expect(screen.getByText('Sažetak vijesti')).toBeInTheDocument();
    expect(screen.getByText('Novosti')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Nova vijest' })).toHaveAttribute(
      'src',
      'https://example.com/poster.jpg'
    );
  });
});
