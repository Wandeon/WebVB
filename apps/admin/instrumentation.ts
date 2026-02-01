/**
 * Next.js Instrumentation
 * Runs once when the server starts
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server (nodejs runtime), not edge
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  const { checkDatabaseHealth, db } = await import('@repo/database');
  const { getAdminAuthEnv, getDatabaseEnv, getRuntimeEnv } = await import('@repo/shared');
  const { logger } = await import('./lib/logger');
  const { shutdownQueueWorker, startQueueWorker } = await import('./lib/ai/queue-worker');

  try {
    getRuntimeEnv();
    getAdminAuthEnv();
    getDatabaseEnv();

    const database = await checkDatabaseHealth();
    if (!database.ok) {
      throw new Error('Baza podataka nije dostupna tijekom pokretanja.');
    }

    logger.info({ latencyMs: database.latencyMs }, 'Database connection verified');
    startQueueWorker();
  } catch (error) {
    logger.error({ error }, 'Startup checks failed');
    throw error;
  }

  let shuttingDown = false;
  const handleShutdown = async (signal: string) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;

    logger.warn({ signal }, 'Shutdown signal received, stopping services');

    try {
      await shutdownQueueWorker();
    } catch (error) {
      logger.error({ error }, 'Failed to stop AI queue worker');
    }

    try {
      await db.$disconnect();
    } catch (error) {
      logger.error({ error }, 'Failed to close database connection');
    }
  };

  process.once('SIGTERM', () => {
    void handleShutdown('SIGTERM');
  });
  process.once('SIGINT', () => {
    void handleShutdown('SIGINT');
  });
}
