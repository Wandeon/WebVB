import { fireEvent, render, screen } from '@testing-library/react';
import { __setPathname } from 'next/navigation';
import { beforeEach, describe, expect, it } from 'vitest';

import { NavMenu } from './nav-menu';

describe('NavMenu', () => {
  const items = [
    {
      title: 'Naslovnica',
      href: '/',
    },
    {
      title: 'Organizacija',
      href: '/organizacija',
      items: [
        { title: 'Općinska uprava', href: '/organizacija/uprava' },
        { title: 'Općinsko vijeće', href: '/organizacija/vijece' },
      ],
    },
  ];

  beforeEach(() => {
    __setPathname('/organizacija/uprava');
  });

  it('renders navigation with aria-label', () => {
    render(<NavMenu items={items} />);

    expect(
      screen.getByRole('navigation', { name: 'Glavna navigacija' })
    ).toBeInTheDocument();
  });

  it('marks parent trigger as active when on child route', () => {
    render(<NavMenu items={items} />);

    const parentTrigger = screen.getByRole('button', { name: 'Organizacija' });
    expect(parentTrigger).toHaveAttribute('aria-current', 'page');
    expect(parentTrigger).toHaveClass('text-primary-600');
  });

  it('highlights active dropdown item and sets aria-current', () => {
    render(<NavMenu items={items} />);

    const trigger = screen.getByRole('button', { name: 'Organizacija' });
    fireEvent.pointerDown(trigger);

    const activeLink = screen.getByRole('menuitem', { name: 'Općinska uprava' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    expect(activeLink).toHaveClass('text-primary-600');
    expect(activeLink).toHaveClass('font-semibold');
  });
});
