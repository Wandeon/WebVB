'use client';

import { POST_CATEGORY_OPTIONS } from '@repo/shared';
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
  status: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Sve' },
  { value: 'published', label: 'Objavljeno' },
  { value: 'draft', label: 'Skica' },
];

export function DataTableToolbar({
  search,
  category,
  status,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onReset,
}: DataTableToolbarProps) {
  const [searchInput, setSearchInput] = useState(search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput);
  };

  const hasFilters = search || category || status !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-4 py-4">
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <Input
          placeholder="Pretrazi objave..."
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
          {POST_CATEGORY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
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
