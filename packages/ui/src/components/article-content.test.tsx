import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ArticleContent } from './article-content';

describe('ArticleContent', () => {
  it('sanitizes unsafe html before rendering', () => {
    const { container } = render(
      <ArticleContent content="<p>Siguran tekst</p><script>alert('xss')</script>" />
    );

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('p')).toHaveTextContent('Siguran tekst');
  });
});
