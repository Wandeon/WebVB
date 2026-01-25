'use client';

import { USER_ROLE_OPTIONS, USER_ROLES } from '@repo/shared';
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@repo/ui';
import { AlertCircle, Plus, RotateCcw, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Breadcrumbs } from '@/components/layout';
import { useAuth } from '@/components/providers/session-provider';
import { DataTable, type UserRow } from '@/components/users';
import { isAdmin } from '@/lib/permissions';

interface UsersResponse {
  success: boolean;
  data?: {
    data: UserRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: { message: string };
}

export default function UsersPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Filter state
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Data state
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = user?.id ?? '';
  const userRole = (user?.role ?? USER_ROLES.STAFF);
  const hasAdminAccess = isAdmin(userRole);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter);

      const response = await fetch(`/api/users?${params.toString()}`);
      const result = (await response.json()) as UsersResponse;

      if (result.success && result.data) {
        setUsers(result.data.data);
      } else {
        throw new Error(result.error?.message ?? 'Greska prilikom dohvacanja korisnika');
      }
    } catch (error) {
      toast({
        title: 'Greska',
        description: error instanceof Error ? error.message : 'Nije moguce ucitati korisnike',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    if (hasAdminAccess) {
      void fetchUsers();
    }
  }, [fetchUsers, hasAdminAccess]);

  // Handle edit
  const handleEdit = useCallback(
    (userRow: UserRow) => {
      router.push(`/users/${userRow.id}`);
    },
    [router]
  );

  // Handle toggle active
  const handleToggleActive = useCallback(
    async (userRow: UserRow) => {
      try {
        const response = await fetch(`/api/users/${userRow.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: !userRow.active }),
        });

        if (!response.ok) {
          const result = (await response.json()) as { error?: { message: string } };
          throw new Error(result.error?.message ?? 'Operacija nije uspjela');
        }

        toast({
          title: 'Uspjeh',
          description: userRow.active
            ? 'Korisnik je uspjesno deaktiviran.'
            : 'Korisnik je uspjesno aktiviran.',
          variant: 'success',
        });

        void fetchUsers();
      } catch (error) {
        toast({
          title: 'Greska',
          description: error instanceof Error ? error.message : 'Operacija nije uspjela',
          variant: 'destructive',
        });
      }
    },
    [fetchUsers]
  );

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  // Reset filters
  const handleReset = () => {
    setSearch('');
    setSearchInput('');
    setRoleFilter('all');
  };

  const hasFilters = search || roleFilter !== 'all';

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show error if user doesn't have admin access
  if (!hasAdminAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
            Korisnici
          </h1>
          <Breadcrumbs items={[{ label: 'Korisnici' }]} className="mt-1" />
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
              Pristup odbijen
            </CardTitle>
            <CardDescription className="text-red-600">
              Nemate ovlasti za pristup ovoj stranici. Samo administratori mogu upravljati korisnicima.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
            Korisnici
          </h1>
          <Breadcrumbs items={[{ label: 'Korisnici' }]} className="mt-1" />
        </div>
        <Button asChild>
          <Link href="/users/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Novi korisnik
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 py-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <Input
            placeholder="Pretrazi korisnike..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-64"
          />
          <Button type="submit" variant="outline" size="icon" aria-label="Pretrazi">
            <Search className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Uloga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sve uloge</SelectItem>
            {USER_ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Ponisti filtere
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          data={users}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
