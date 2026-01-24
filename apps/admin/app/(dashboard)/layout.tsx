'use client';

import { Toaster } from '@repo/ui';
import { useState } from 'react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Header, MobileSidebar, Sidebar } from '@/components/layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-neutral-50">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
