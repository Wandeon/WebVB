'use client';

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
} from '@repo/ui';
import {
  Activity,
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Loader2,
  Megaphone,
  Newspaper,
  RefreshCw,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface TopicCounts {
  waste: number;
  news: number;
  events: number;
  announcements: number;
}

interface RecentSend {
  id: string;
  topic: string;
  title: string;
  sentAt: string;
  successCount: number;
  failureCount: number;
  recipientCount: number;
}

interface LastSuccessfulSend {
  sentAt: string;
  title: string;
  successCount: number;
}

interface HealthStatus {
  pushConfigured: boolean;
  hasCronSecret: boolean;
  hasVapidKeys: boolean;
  status: 'healthy' | 'degraded';
}

interface StatsData {
  subscriptions: {
    total: number;
    byTopic: TopicCounts;
  };
  sends: {
    recent: RecentSend[];
    lastSuccessful: LastSuccessfulSend | null;
  };
  health: HealthStatus;
}

interface ApiResponse {
  success: boolean;
  data?: StatsData;
  error?: { message: string };
}

const TOPIC_ICONS: Record<string, typeof Bell> = {
  waste: Trash2,
  news: Newspaper,
  events: Calendar,
  announcements: Megaphone,
};

const TOPIC_LABELS: Record<string, string> = {
  waste: 'Odvoz',
  news: 'Vijesti',
  events: 'Događanja',
  announcements: 'Obavijesti',
};

export function NotificationsStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await fetch('/api/push/stats');
      const data = (await response.json()) as ApiResponse;

      if (data.success && data.data) {
        setStats(data.data);
      } else {
        toast({
          title: 'Greška',
          description: data.error?.message || 'Nije moguće učitati statistiku.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće učitati statistiku.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-neutral-500">
          Nije moguće učitati statistiku
        </CardContent>
      </Card>
    );
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `prije ${diffDays} dana`;
    if (diffHours > 0) return `prije ${diffHours} sati`;
    if (diffMins > 0) return `prije ${diffMins} min`;
    return 'upravo sada';
  };

  return (
    <div className="space-y-6">
      {/* Health Status Banner */}
      <Card
        className={
          stats.health.status === 'healthy'
            ? 'border-green-200 bg-green-50'
            : 'border-amber-200 bg-amber-50'
        }
      >
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {stats.health.status === 'healthy' ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              )}
              <div>
                <p className="font-medium text-neutral-900">
                  {stats.health.status === 'healthy'
                    ? 'Sustav obavijesti je zdrav'
                    : 'Sustav obavijesti ima problema'}
                </p>
                <div className="mt-1 flex items-center gap-3 text-sm">
                  <span
                    className={`flex items-center gap-1 ${
                      stats.health.pushConfigured ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {stats.health.pushConfigured ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    Push
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      stats.health.hasVapidKeys ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {stats.health.hasVapidKeys ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    VAPID
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      stats.health.hasCronSecret ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {stats.health.hasCronSecret ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    Cron
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => fetchStats(true)}
              disabled={isRefreshing}
              className="rounded-lg p-2 hover:bg-white/50 transition-colors"
              title="Osvježi"
            >
              <RefreshCw
                className={`h-5 w-5 text-neutral-600 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Subscribers */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.subscriptions.total}</p>
                <p className="text-sm text-neutral-500">Ukupno pretplatnika</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic Breakdown */}
        {Object.entries(stats.subscriptions.byTopic).map(([topic, count]) => {
          const Icon = TOPIC_ICONS[topic] || Bell;
          const label = TOPIC_LABELS[topic] || topic;
          return (
            <Card key={topic}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
                    <Icon className="h-6 w-6 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{count}</p>
                    <p className="text-sm text-neutral-500">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Last Send & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Last Successful Send */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Posljednje slanje
            </CardTitle>
            <CardDescription>Zadnja uspješna obavijest</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.sends.lastSuccessful ? (
              <div className="space-y-2">
                <p className="font-medium text-neutral-900">
                  {stats.sends.lastSuccessful.title}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    {stats.sends.lastSuccessful.successCount} uspješno
                  </span>
                  <span className="text-neutral-400">
                    {formatTimeAgo(stats.sends.lastSuccessful.sentAt)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 text-sm">Još nema poslanih obavijesti</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              Nedavna aktivnost
            </CardTitle>
            <CardDescription>Posljednjih 5 slanja</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.sends.recent.length === 0 ? (
              <p className="text-neutral-500 text-sm">Nema nedavnih slanja</p>
            ) : (
              <div className="space-y-3">
                {stats.sends.recent.map((send) => (
                  <div
                    key={send.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline" className="shrink-0">
                        {TOPIC_LABELS[send.topic] || send.topic}
                      </Badge>
                      <span className="truncate text-neutral-600">{send.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-green-600">{send.successCount}</span>
                      {send.failureCount > 0 && (
                        <span className="text-red-500">/{send.failureCount}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
