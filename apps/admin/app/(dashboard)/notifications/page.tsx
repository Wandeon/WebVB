import { Suspense } from 'react';

import { NotificationsSend } from './notifications-send';

export const metadata = {
  title: 'Push Obavijesti | Admin',
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">Push Obavijesti</h1>
        <p className="mt-1 text-neutral-600">
          Pošalji obavijest pretplatnicima na mobilne uređaje
        </p>
      </div>

      <Suspense fallback={<div className="animate-pulse h-96 bg-neutral-100 rounded-lg" />}>
        <NotificationsSend />
      </Suspense>
    </div>
  );
}
