'use client';

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
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Sve' },
  { value: 'new', label: 'Nove' },
  { value: 'read', label: 'Pročitane' },
  { value: 'replied', label: 'Odgovorene' },
  { value: 'archived', label: 'Arhivirane' },
];

export function DataTableToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onReset,
}: DataTableToolbarProps) {
  const [searchInput, setSearchInput] = useState(search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput);
  };

  const hasFilters = search || (status && status !== 'all');

  return (
    <div className="flex flex-wrap items-center gap-4 py-4">
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <Input
          placeholder="Pretraži poruke..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-64"
        />
        <Button type="submit" variant="outline" size="icon" aria-label="Pretraži">
          <Search className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <Select value={status || 'all'} onValueChange={onStatusChange}>
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
          Poništi filtere
        </Button>
      )}
    </div>
  );
}
