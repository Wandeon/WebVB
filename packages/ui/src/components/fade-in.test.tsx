import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FadeIn } from './fade-in';

describe('FadeIn', () => {
  it('renders children content', () => {
    render(
      <FadeIn>
        <span>Animirani sadržaj</span>
      </FadeIn>
    );

    expect(screen.getByText('Animirani sadržaj')).toBeInTheDocument();
  });
});
