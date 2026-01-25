'use client';

import { Button, Input, Label } from '@repo/ui';
import { Search, X } from 'lucide-react';

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
  upcomingOnly: boolean;
  onUpcomingOnlyChange: (value: boolean) => void;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  upcomingOnly,
  onUpcomingOnlyChange,
}: DataTableToolbarProps) {
  const hasFilters = searchValue || fromDate || toDate || upcomingOnly;

  const clearFilters = () => {
    onSearchChange('');
    onFromDateChange('');
    onToDateChange('');
    onUpcomingOnlyChange(false);
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
          placeholder="Pretrazi dogadaje..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* From date picker */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="from-date" className="text-sm text-neutral-600">
          Od datuma
        </Label>
        <Input
          id="from-date"
          type="date"
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
          className="w-[160px]"
        />
      </div>

      {/* To date picker */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="to-date" className="text-sm text-neutral-600">
          Do datuma
        </Label>
        <Input
          id="to-date"
          type="date"
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
          className="w-[160px]"
        />
      </div>

      {/* Upcoming only toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={upcomingOnly}
          onClick={() => onUpcomingOnlyChange(!upcomingOnly)}
          className={`
            relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            ${upcomingOnly ? 'bg-primary-600' : 'bg-neutral-200'}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
              transition duration-200 ease-in-out
              ${upcomingOnly ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
        <Label
          htmlFor="upcoming-only"
          className="text-sm text-neutral-600 cursor-pointer"
          onClick={() => onUpcomingOnlyChange(!upcomingOnly)}
        >
          Samo nadolazeca
        </Label>
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
