'use client';

import { Search } from 'lucide-react';

interface SearchTriggerProps {
  onOpen: () => void;
}

export function SearchTrigger({ onOpen }: SearchTriggerProps) {
  return (
    <>
      {/* Desktop: Input-like button */}
      <button
        type="button"
        onClick={onOpen}
        className="hidden items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-neutral-100 md:flex"
        aria-label="Pretraži stranicu"
      >
        <Search className="h-4 w-4" />
        <span className="text-neutral-400">Pretraži...</span>
        <kbd className="ml-2 rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-xs font-medium text-neutral-400">
          ⌘K
        </kbd>
      </button>

      {/* Mobile: Icon button only */}
      <button
        type="button"
        onClick={onOpen}
        className="flex items-center justify-center rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 md:hidden"
        aria-label="Pretraži stranicu"
      >
        <Search className="h-5 w-5" />
      </button>
    </>
  );
}
