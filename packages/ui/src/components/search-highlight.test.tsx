import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SearchHighlight } from './search-highlight';

describe('SearchHighlight', () => {
  it('renders plain text without markup', () => {
    render(<SearchHighlight text="Općina Veliki Bukovec" />);

    expect(screen.getByText('Općina Veliki Bukovec')).toBeInTheDocument();
  });

  it('renders highlighted segments using mark elements', () => {
    render(<SearchHighlight text="Pozdrav <mark>svijete</mark>" />);

    const highlighted = screen.getByText('svijete');
    expect(highlighted.tagName).toBe('MARK');
  });

  it('strips unsupported HTML tags from input', () => {
    const { container } = render(
      <SearchHighlight text="Test <strong>bold</strong> <mark>naglasak</mark>" />
    );

    expect(container.querySelector('strong')).toBeNull();
    expect(container.textContent).toContain('bold');
  });

  it('returns null for empty text', () => {
    const { container } = render(<SearchHighlight text="" />);

    expect(container.firstChild).toBeNull();
  });
});
