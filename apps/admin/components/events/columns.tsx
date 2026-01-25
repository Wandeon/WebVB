'use client';

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui';
import { Calendar, ImageIcon, MapPin, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { ColumnDef } from '@tanstack/react-table';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string | null;
  endDate: string | null;
  location: string | null;
  posterImage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GetColumnsOptions {
  onDelete: (event: Event) => void;
}

function formatEventDate(event: Event): string {
  const startDate = new Date(event.eventDate);
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  let dateStr = startDate.toLocaleDateString('hr-HR', dateOptions);

  // Add end date if different from start date
  if (event.endDate) {
    const endDate = new Date(event.endDate);
    if (endDate.getTime() !== startDate.getTime()) {
      dateStr += ` - ${endDate.toLocaleDateString('hr-HR', dateOptions)}`;
    }
  }

  // Add time if available
  if (event.eventTime) {
    const time = new Date(event.eventTime);
    const timeStr = time.toLocaleTimeString('hr-HR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    dateStr += ` u ${timeStr}`;
  }

  return dateStr;
}

function isPastEvent(event: Event): boolean {
  const eventDate = new Date(event.eventDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate < today;
}

export function getColumns({ onDelete }: GetColumnsOptions): ColumnDef<Event>[] {
  return [
    {
      accessorKey: 'posterImage',
      header: '',
      cell: ({ row }) => {
        const posterImage = row.original.posterImage;
        return (
          <div className="flex items-center justify-center w-12 h-12">
            {posterImage ? (
              <Image
                src={posterImage}
                alt={row.original.title}
                width={48}
                height={48}
                className="rounded object-cover w-12 h-12"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-neutral-100 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'title',
      header: 'Naslov',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <Link
            href={`/events/${event.id}/edit`}
            className="font-medium text-primary-600 hover:underline"
          >
            {event.title}
          </Link>
        );
      },
    },
    {
      accessorKey: 'eventDate',
      header: 'Datum',
      cell: ({ row }) => {
        const event = row.original;
        const isPast = isPastEvent(event);

        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-400" aria-hidden="true" />
            <span className="text-sm">{formatEventDate(event)}</span>
            {isPast && (
              <Badge variant="secondary" className="ml-2">
                Proslo
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Lokacija',
      cell: ({ row }) => {
        const location = row.original.location;
        return location ? (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-neutral-400" aria-hidden="true" />
            <span className="text-sm text-neutral-600">{location}</span>
          </div>
        ) : (
          <span className="text-neutral-400">-</span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Otvori izbornik">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/events/${event.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Uredi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(event)}
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Obrisi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
