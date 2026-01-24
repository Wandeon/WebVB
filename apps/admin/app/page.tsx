'use client';

import { APP_NAME } from '@repo/shared';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui';
import { useRouter } from 'next/navigation';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/components/providers/session-provider';
import { signOut } from '@/lib/auth-client';

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-neutral-900">
            {APP_NAME} - Admin
          </h1>
          <Button variant="secondary" onClick={() => void handleLogout()}>
            Odjava
          </Button>
        </div>

        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Dobrodošli!</CardTitle>
            <CardDescription>
              Prijavljeni ste u administracijsko sučelje
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-neutral-700">
              Email: <span className="font-medium">{user?.email}</span>
            </p>
            <p className="text-neutral-700">
              Uloga:{' '}
              <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-sm font-medium text-primary-800">
                {user?.role || 'staff'}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sprint 0.4 - UI Foundation</CardTitle>
            <CardDescription>Tailwind CSS v4 + shadcn/ui components</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600">
              Administratorske funkcije bit će dodane u sljedećim sprintovima.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="primary" size="sm">
                Primary
              </Button>
              <Button variant="secondary" size="sm">
                Secondary
              </Button>
              <Button variant="outline" size="sm">
                Outline
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function AdminHomePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
