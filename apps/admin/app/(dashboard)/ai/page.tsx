import { Suspense } from 'react';

import { AiQueueStatus } from './ai-queue-status';

export const metadata = {
  title: 'AI | Admin',
};

export default function AiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">AI Sustav</h1>
        <p className="mt-1 text-neutral-600">
          Pregled AI zadataka i statusa sustava
        </p>
      </div>

      <Suspense fallback={<div className="animate-pulse h-96 bg-neutral-100 rounded-lg" />}>
        <AiQueueStatus />
      </Suspense>
    </div>
  );
}
