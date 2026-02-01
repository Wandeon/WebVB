import { Suspense } from 'react';

import { NotificationsSend } from './notifications-send';
import { NotificationsStats } from './notifications-stats';

export const metadata = {
  title: 'Push Obavijesti | Admin',
};

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">Push Obavijesti</h1>
        <p className="mt-1 text-neutral-600">
          Pregledaj statistiku i pošalji obavijesti pretplatnicima
        </p>
      </div>

      {/* Health & Stats Section */}
      <Suspense fallback={<div className="animate-pulse h-48 bg-neutral-100 rounded-lg" />}>
        <NotificationsStats />
      </Suspense>

      {/* Divider */}
      <div className="border-t border-neutral-200" />

      {/* Send Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">Nova obavijest</h2>
        <Suspense fallback={<div className="animate-pulse h-96 bg-neutral-100 rounded-lg" />}>
          <NotificationsSend />
        </Suspense>
      </div>
    </div>
  );
}
