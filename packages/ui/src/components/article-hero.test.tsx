import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ArticleHero } from './article-hero';

describe('ArticleHero', () => {
  it('renders featured image alt text and time element', () => {
    const publishedAt = new Date('2024-02-01T10:00:00.000Z');
    const { container } = render(
      <ArticleHero
        title="Nova vijest"
        category="novosti"
        categoryLabel="Novosti"
        publishedAt={publishedAt}
        featuredImage="https://example.com/hero.jpg"
      />
    );

    expect(container.querySelector('img')).toHaveAttribute(
      'alt',
      'Fotografija uz vijest: Nova vijest'
    );
    expect(container.querySelector('time')).toHaveAttribute(
      'datetime',
      publishedAt.toISOString()
    );
  });
});
