'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../primitives/select';

export interface YearFilterProps {
  years: number[];
  className?: string;
}

export function YearFilter({ years, className }: YearFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = searchParams.get('godina');

  const handleYearChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all') {
        params.delete('godina');
      } else {
        params.set('godina', value);
      }
      params.delete('stranica'); // Reset to page 1
      router.push(`/dokumenti?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <Select value={currentYear || 'all'} onValueChange={handleYearChange}>
      <SelectTrigger className={cn('w-[180px]', className)}>
        <SelectValue placeholder="Odaberi godinu" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Sve godine</SelectItem>
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
