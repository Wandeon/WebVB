import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ShareButtons } from './share-buttons';

describe('ShareButtons', () => {
  it('exposes accessible share actions', () => {
    render(<ShareButtons url="https://example.com/vijest" title="Test" />);

    expect(
      screen.getByRole('group', { name: 'Podijeli vijest' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Podijeli na Facebook' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Kopiraj poveznicu' })
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
