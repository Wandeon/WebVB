import { fireEvent, render, screen } from '@testing-library/react';
// @ts-expect-error -- __setPathname is provided by test-helpers alias
import { __setPathname } from 'next/navigation';
import { beforeEach, describe, expect, it } from 'vitest';

import { MobileDrawer } from './mobile-drawer';

describe('MobileDrawer', () => {
  const items = [
    {
      title: 'Organizacija',
      href: '/organizacija',
      items: [
        { title: 'Općinska uprava', href: '/organizacija/uprava' },
        { title: 'Općinsko vijeće', href: '/organizacija/vijece' },
      ],
    },
    {
      title: 'Kontakt',
      href: '/kontakt',
    },
  ];

  beforeEach(() => {
    __setPathname('/organizacija/uprava');
  });

  it('highlights parent group when child route is active', () => {
    render(<MobileDrawer items={items} />);

    fireEvent.click(screen.getByRole('button', { name: 'Izbornik' }));

    const parentLabel = screen.getByText('Organizacija');
    expect(parentLabel).toHaveClass('text-primary-600');
  });

  it('marks active link with aria-current and focus styles', () => {
    render(<MobileDrawer items={items} />);

    fireEvent.click(screen.getByRole('button', { name: 'Izbornik' }));

    const activeLink = screen.getByRole('link', { name: 'Općinska uprava' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    expect(activeLink).toHaveClass('text-primary-600');
    expect(activeLink).toHaveClass('focus-visible:ring-2');
  });

  it('applies focus-visible styles to top-level links', () => {
    render(<MobileDrawer items={items} />);

    fireEvent.click(screen.getByRole('button', { name: 'Izbornik' }));

    const contactLink = screen.getByRole('link', { name: 'Kontakt' });
    expect(contactLink).toHaveClass('focus-visible:ring-2');
  });
});
