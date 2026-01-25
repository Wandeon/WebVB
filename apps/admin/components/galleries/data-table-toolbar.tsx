'use client';

import { Button, Input } from '@repo/ui';
import { Search, X } from 'lucide-react';

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
}: DataTableToolbarProps) {
  const hasFilters = Boolean(searchValue);

  const clearFilters = () => {
    onSearchChange('');
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden="true"
        />
        <Input
          placeholder="Pretrazi galerije..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Clear filters button */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
          <X className="mr-1 h-4 w-4" aria-hidden="true" />
          Ocisti filtere
        </Button>
      )}
    </div>
  );
}
