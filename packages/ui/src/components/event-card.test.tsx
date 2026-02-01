import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EventCard } from './event-card';

describe('EventCard', () => {
  it('renders event details and poster image', () => {
    render(
      <EventCard
        id="event-1"
        title="Seoska fešta"
        description="<p>Druženje i glazba</p>"
        eventDate={new Date('2024-05-10T18:30:00.000Z')}
        eventTime={new Date('1970-01-01T18:30:00.000Z')}
        endDate={null}
        location="Veliki Bukovec"
        posterImage="https://example.com/event.jpg"
      />
    );

    expect(screen.getByRole('link', { name: /Seoska fešta/ })).toHaveAttribute(
      'href',
      '/dogadanja/event-1'
    );
    expect(screen.getByText('Druženje i glazba')).toBeInTheDocument();
    expect(screen.getByText('Veliki Bukovec')).toBeInTheDocument();
    expect(screen.getByText(/u 18:30/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Seoska fešta' })).toHaveAttribute(
      'src',
      'https://example.com/event.jpg'
    );
  });

  it('renders a date range for multi-day events', () => {
    render(
      <EventCard
        id="event-2"
        title="Dani općine"
        description={null}
        eventDate={new Date('2026-06-10T00:00:00.000Z')}
        eventTime={new Date('1970-01-01T09:00:00.000Z')}
        endDate={new Date('2026-06-12T00:00:00.000Z')}
        location={null}
        posterImage={null}
      />
    );

    expect(screen.getByText(/Od .* do .*/)).toBeInTheDocument();
    expect(screen.getByText(/Početak u 09:00/)).toBeInTheDocument();
  });
});
