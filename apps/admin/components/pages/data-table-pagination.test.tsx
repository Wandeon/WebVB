import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DataTablePagination } from './data-table-pagination';

describe('DataTablePagination', () => {
  it('renders zero-state counts when there are no items', () => {
    render(
      <DataTablePagination
        page={1}
        totalPages={0}
        limit={20}
        total={0}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );

    expect(
      screen.getByText('Prikazuje 0-0 od 0 stranica')
    ).toBeInTheDocument();
  });

  it('uses the correct aria label for the next page button', () => {
    render(
      <DataTablePagination
        page={1}
        totalPages={2}
        limit={20}
        total={30}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Sljedeća stranica')).toBeInTheDocument();
  });
});
