'use client';

import { USER_ROLE_LABELS, type UserRole } from '@repo/shared';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { MoreHorizontal, Pencil, UserCheck, UserX } from 'lucide-react';

import type { ColumnDef } from '@tanstack/react-table';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

interface GetColumnsOptions {
  onEdit: (user: UserRow) => void;
  onToggleActive: (user: UserRow) => void | Promise<void>;
  currentUserId: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'd. MMMM yyyy.', { locale: hr });
}

function getRoleBadgeVariant(role: UserRole): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'super_admin':
      return 'default';
    case 'admin':
      return 'secondary';
    case 'staff':
    default:
      return 'outline';
  }
}

export function getColumns({
  onEdit,
  onToggleActive,
  currentUserId,
}: GetColumnsOptions): ColumnDef<UserRow>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Ime',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{user.name}</span>
            {!user.active && (
              <Badge variant="outline" className="text-neutral-500">
                Neaktivan
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
        return (
          <span className="text-sm text-neutral-600">{row.original.email}</span>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Uloga',
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge variant={getRoleBadgeVariant(role)}>
            {USER_ROLE_LABELS[role]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Kreiran',
      cell: ({ row }) => {
        return (
          <span className="text-sm text-neutral-600">
            {formatDate(row.original.createdAt)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const user = row.original;
        const isCurrentUser = user.id === currentUserId;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Otvori izbornik">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                Uredi
              </DropdownMenuItem>
              {!isCurrentUser && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={user.active ? 'text-red-600 focus:text-red-600' : 'text-green-600 focus:text-green-600'}
                    onClick={() => void onToggleActive(user)}
                  >
                    {user.active ? (
                      <>
                        <UserX className="mr-2 h-4 w-4" aria-hidden="true" />
                        Deaktiviraj
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                        Aktiviraj
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
