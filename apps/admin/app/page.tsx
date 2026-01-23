'use client';

import { APP_NAME } from '@repo/shared';
import { Button } from '@repo/ui';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/components/providers/session-provider';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>{APP_NAME} - Admin</h1>
        <Button variant="secondary" onClick={handleLogout}>
          Odjava
        </Button>
      </div>

      <div style={{
        padding: '1.5rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        marginBottom: '1rem',
      }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Dobrodošli!</h2>
        <p>Prijavljeni ste kao: <strong>{user?.email}</strong></p>
        <p>Uloga: <strong>{user?.role || 'staff'}</strong></p>
      </div>

      <p>Administratorske funkcije bit će dodane u sljedećim sprintovima.</p>
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
