import { exec } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';

import { logger } from './logger';

const rebuildLogger = logger.child({ module: 'rebuild' });

// ---------------------------------------------------------------------------
// Shell script requirements (documented here; actual changes are VPS-side)
// ---------------------------------------------------------------------------
// NOTE: rebuild-web.sh must use `flock` (blocking) not `flock -n` (non-blocking)
// to prevent builds from being silently skipped. See GitHub issue #110

// NOTE: rebuild-web.sh should validate .web-build-filecount before comparing.
// If corrupted (not a number), regenerate from current release. See GitHub issue #115

// NOTE: rebuild-web.sh must write baseline AFTER successful symlink swap,
// not before. See GitHub issue #140

const REBUILD_SCRIPT = '/home/deploy/scripts/rebuild-web.sh';
const DEBOUNCE_MS = 300_000; // 5 minutes
const PENDING_FILE = '/tmp/webvb-rebuild-pending.json';
const MIN_BUILD_COOLDOWN_MS = 60_000; // 1 minute between builds

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let buildInProgress = false;
let pendingReasons: string[] = [];
let lastBuildCompletedAt = 0;

// ---------------------------------------------------------------------------
// Pending state persistence (survives process restarts)
// ---------------------------------------------------------------------------
function persistPendingRebuild(reasons: string[]): void {
  writeFileSync(PENDING_FILE, JSON.stringify({ reasons, timestamp: Date.now() }));
}

function checkPendingRebuild(): void {
  if (!existsSync(PENDING_FILE)) return;
  try {
    const data = JSON.parse(readFileSync(PENDING_FILE, 'utf8')) as {
      reasons: string[];
      timestamp: number;
    };
    if (Date.now() - data.timestamp < 30 * 60_000) {
      rebuildLogger.info(
        { reasons: data.reasons },
        'Recovering pending rebuild from previous session'
      );
      startBuild(data.reasons.join(', '));
    }
    unlinkSync(PENDING_FILE);
  } catch {
    /* ignore corrupt file */
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Internal build logic
// ---------------------------------------------------------------------------
function startBuild(reason: string): void {
  if (buildInProgress) {
    rebuildLogger.info({ reason }, 'Build in progress, queuing');
    pendingReasons.push(reason);
    persistPendingRebuild(pendingReasons);
    return;
  }

  const timeSinceLastBuild = Date.now() - lastBuildCompletedAt;
  if (timeSinceLastBuild < MIN_BUILD_COOLDOWN_MS) {
    rebuildLogger.info(
      { reason, cooldownRemaining: MIN_BUILD_COOLDOWN_MS - timeSinceLastBuild },
      'Cooldown active, queuing'
    );
    pendingReasons.push(reason);
    persistPendingRebuild(pendingReasons);
    setTimeout(() => {
      if (pendingReasons.length > 0 && !buildInProgress) {
        const next = pendingReasons.splice(0).join(', ');
        startBuild(next);
      }
    }, MIN_BUILD_COOLDOWN_MS - timeSinceLastBuild);
    return;
  }

  buildInProgress = true;
  rebuildLogger.info({ reason }, 'Starting static site rebuild');

  exec(
    `bash ${REBUILD_SCRIPT}`,
    { timeout: 600_000, env: { ...process.env, HOME: '/home/deploy' } },
    (error, _stdout, stderr) => {
      try {
        if (error) {
          rebuildLogger.error({ error: error.message, stderr }, 'Rebuild failed');
        } else {
          rebuildLogger.info({ reason }, 'Rebuild completed successfully');
        }
      } finally {
        lastBuildCompletedAt = Date.now();
        buildInProgress = false;

        if (pendingReasons.length > 0) {
          const next = pendingReasons.splice(0).join(', ');
          rebuildLogger.info({ reason: next }, 'Processing queued rebuild');
          startBuild(next);
        }
      }
    }
  );
}

// ---------------------------------------------------------------------------
// Startup: recover any pending rebuild from a previous session
// ---------------------------------------------------------------------------
checkPendingRebuild();
