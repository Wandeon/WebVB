/**
 * Next.js Instrumentation
 * Runs once when the server starts
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server (nodejs runtime), not edge
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startQueueWorker } = await import('./lib/ai/queue-worker');
    startQueueWorker();
  }
}
