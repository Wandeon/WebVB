import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DocumentCard } from './document-card';

describe('DocumentCard', () => {
  it('renders a download link for safe URLs', () => {
    render(
      <DocumentCard
        title="Test dokument"
        fileUrl="https://example.com/test.pdf"
        fileSize={1200}
        createdAt={new Date('2024-01-01')}
      />
    );

    const link = screen.getByRole('link', { name: 'Preuzmi Test dokument' });
    expect(link).toHaveAttribute('href', 'https://example.com/test.pdf');
  });

  it('disables download when URL is unsafe', () => {
    render(
      <DocumentCard
        title="Opasan dokument"
        fileUrl="javascript:alert(1)"
        fileSize={null}
        createdAt={new Date('2024-01-01')}
      />
    );

    expect(
      screen.queryByRole('link', { name: 'Preuzmi Opasan dokument' })
    ).not.toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'Preuzmi' });
    expect(button).toBeDisabled();
  });
});
