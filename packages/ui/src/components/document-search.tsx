'use client';

import { Search, X } from 'lucide-react';
import { useCallback, useState } from 'react';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';

export interface DocumentSearchProps {
  onSearch: (query: string) => void;
  className?: string;
}

export function DocumentSearch({ onSearch, className }: DocumentSearchProps) {
  const [query, setQuery] = useState('');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <Input
        type="search"
        placeholder="Pretraži dokumente..."
        value={query}
        onChange={handleChange}
        className="pl-10 pr-10"
        aria-label="Pretraži dokumente"
        autoComplete="off"
        enterKeyHint="search"
      />
      {query && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          aria-label="Obriši pretragu"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
