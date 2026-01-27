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

  it('renders TipTap JSON content as HTML', () => {
    const tipTapContent = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello from TipTap' }],
        },
      ],
    });

    const { container } = render(<ArticleContent content={tipTapContent} />);

    expect(container.querySelector('p')).toHaveTextContent('Hello from TipTap');
  });

  it('renders TipTap JSON with images', () => {
    const tipTapContent = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: { src: 'https://example.com/image.jpg', alt: 'Test image' },
        },
      ],
    });

    const { container } = render(<ArticleContent content={tipTapContent} />);

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/image.jpg');
  });
});
