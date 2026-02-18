import { exec } from 'node:child_process';

import { logger } from './logger';

const rebuildLogger = logger.child({ module: 'rebuild' });

const REBUILD_SCRIPT = '/home/deploy/scripts/rebuild-web.sh';
const DEBOUNCE_MS = 300_000; // 5 minutes

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let buildInProgress = false;
let pendingReason: string | null = null;

/**
 * Triggers a static site rebuild after content changes.
 * Debounced (5 min) so bulk edits only cause one build.
 * The shell script uses flock for cross-process locking,
 * validates the build output, and deploys atomically via symlink swap.
 */
export function triggerRebuild(reason: string): void {
  rebuildLogger.info({ reason }, 'Rebuild requested');

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    startBuild(reason);
  }, DEBOUNCE_MS);
}

function startBuild(reason: string): void {
  if (buildInProgress) {
    rebuildLogger.info({ reason }, 'Build in progress, queuing');
    pendingReason = reason;
    return;
  }

  buildInProgress = true;
  rebuildLogger.info({ reason }, 'Starting static site rebuild');

  exec(
    `bash ${REBUILD_SCRIPT}`,
    { timeout: 600_000, env: { ...process.env, HOME: '/home/deploy' } },
    (error, _stdout, stderr) => {
      buildInProgress = false;

      if (error) {
        rebuildLogger.error({ error: error.message, stderr }, 'Rebuild failed');
      } else {
        rebuildLogger.info({ reason }, 'Rebuild completed successfully');
      }

      if (pendingReason) {
        const next = pendingReason;
        pendingReason = null;
        rebuildLogger.info({ reason: next }, 'Processing queued rebuild');
        startBuild(next);
      }
    }
  );
}
