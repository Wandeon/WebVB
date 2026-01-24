'use client';

import { DOCUMENT_CATEGORY_OPTIONS } from '@repo/shared';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';

interface DataTableToolbarProps {
  search: string;
  category: string;
  year: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onReset: () => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1990 + 2 }, (_, i) => currentYear + 1 - i);

export function DataTableToolbar({
  search,
  category,
  year,
  onSearchChange,
  onCategoryChange,
  onYearChange,
  onReset,
}: DataTableToolbarProps) {
  const [searchInput, setSearchInput] = useState(search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput);
  };

  const hasFilters = search || category !== 'all' || year !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-4 py-4">
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <Input
          placeholder="Pretrazi dokumente..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-64"
        />
        <Button type="submit" variant="outline" size="icon" aria-label="Pretrazi">
          <Search className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Kategorija" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Sve kategorije</SelectItem>
          {DOCUMENT_CATEGORY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Godina" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Sve godine</SelectItem>
          {yearOptions.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          onClick={() => {
            setSearchInput('');
            onReset();
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Ponisti filtere
        </Button>
      )}
    </div>
  );
}
