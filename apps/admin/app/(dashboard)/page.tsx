import { Eye, FileText, FolderOpen, Inbox } from 'lucide-react';

import {
  CategoryChart,
  QuickActions,
  RecentActivity,
  StatsCard,
  TopPages,
  VisitorsChart,
} from '@/components/dashboard';
import { Breadcrumbs } from '@/components/layout';
import { mockDashboardStats } from '@/lib/mock-data';

export default function DashboardPage() {
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
            Nadzorna ploča
          </h1>
          <Breadcrumbs items={[{ label: 'Nadzorna ploča' }]} className="mt-1" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Posjetitelji danas"
          value={stats.visitorsToday}
          icon={Eye}
          trend={{ value: stats.visitorsTrend, isPositive: stats.visitorsTrend > 0 }}
          description="U odnosu na jučer"
        />
        <StatsCard
          title="Objave ovog mjeseca"
          value={stats.postsThisMonth}
          icon={FileText}
          trend={{ value: stats.postsTrend, isPositive: stats.postsTrend > 0 }}
          description="U odnosu na prošli mjesec"
        />
        <StatsCard
          title="Ukupno dokumenata"
          value={stats.totalDocuments}
          icon={FolderOpen}
          trend={{ value: stats.documentsTrend, isPositive: stats.documentsTrend > 0 }}
          description="Novih ovaj mjesec"
        />
        <StatsCard
          title="Nepročitane poruke"
          value={stats.unreadMessages}
          icon={Inbox}
          description="Čeka odgovor"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <VisitorsChart />
        <CategoryChart />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Activity and Top Pages */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <TopPages />
      </div>
    </div>
  );
}
