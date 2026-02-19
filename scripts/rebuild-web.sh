#!/usr/bin/env bash
set -euo pipefail

# Configuration
REPO_DIR="/home/deploy/apps/admin-repo"
BUILD_DIR="${REPO_DIR}/apps/web/out"
RELEASE_DIR="/home/deploy/apps/web-releases"
LIVE_LINK="/home/deploy/apps/web-static"
LOCK_FILE="/tmp/webvb-rebuild.lock"
BASELINE_FILE="/home/deploy/apps/.web-build-filecount"
LOG_TAG="rebuild-web"
MAX_RELEASES=3

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$LOG_TAG] $*"; }
die() { log "FATAL: $*"; exit 1; }

# Pre-flight checks (#137, #160)
command -v pnpm >/dev/null 2>&1 || die "pnpm not found"
command -v node >/dev/null 2>&1 || die "node not found"
if command -v pg_isready >/dev/null 2>&1; then
  pg_isready -q || log "WARNING: Database not reachable"
fi

# Process group cleanup on exit/timeout (#106)
cleanup() {
  local pgrp
  pgrp=$(ps -o pgid= $$ | tr -d ' ')
  kill -TERM "-${pgrp}" 2>/dev/null || true
}
trap cleanup EXIT

# Locking (#110) -- blocking with 11 min timeout
exec 200>"${LOCK_FILE}"
flock -w 660 200 || die "Could not acquire lock within 660s"

log "Starting rebuild"

# Git pull with retry (#102)
cd "${REPO_DIR}"
for attempt in 1 2 3; do
  if git pull --ff-only origin main 2>&1; then
    log "Git pull succeeded (attempt ${attempt})"
    break
  fi
  if [ "${attempt}" -eq 3 ]; then
    die "Git pull failed after 3 attempts"
  fi
  sleep_time=$((5 * attempt * attempt))  # 5, 20, 45 seconds
  log "Git pull failed (attempt ${attempt}), retrying in ${sleep_time}s"
  sleep "${sleep_time}"
done

# Install dependencies
pnpm install --frozen-lockfile || die "pnpm install failed"

# Build
log "Building static site"
pnpm build --filter=@repo/web || die "Build failed"

# Gate A: Must have HTML files
html_count=$(find "${BUILD_DIR}" -name "*.html" | wc -l)
if [ "${html_count}" -lt 1 ]; then
  die "Gate A failed: No HTML files in build output"
fi

total_files=$(find "${BUILD_DIR}" -type f | wc -l)
log "Build produced ${total_files} files (${html_count} HTML)"

# Gate B: File count baseline check (#115, #119)
if [ "${SKIP_GATE_B:-0}" = "1" ]; then
  log "Gate B skipped (SKIP_GATE_B=1)"
else
  if [ -f "${BASELINE_FILE}" ]; then
    baseline=$(cat "${BASELINE_FILE}")
    # Validate baseline is numeric (#115)
    if ! [[ "${baseline}" =~ ^[0-9]+$ ]]; then
      log "WARNING: Baseline file corrupted (value: '${baseline}'), regenerating"
      baseline="${total_files}"
    fi
    if [ "${baseline}" -gt 0 ]; then
      deviation=$(( (total_files - baseline) * 100 / baseline ))
      abs_deviation=${deviation#-}
      if [ "${abs_deviation}" -gt 50 ]; then
        die "Gate B failed: File count deviated ${deviation}% from baseline (${total_files} vs ${baseline})"
      fi
    fi
  else
    log "No baseline file, creating initial baseline"
  fi
fi

# Prepare release directory
RELEASE_TAG="$(date '+%Y%m%d-%H%M%S')"
RELEASE_PATH="${RELEASE_DIR}/${RELEASE_TAG}"
mkdir -p "${RELEASE_DIR}"

# Atomic deploy (#128)
rsync -a --delay-updates "${BUILD_DIR}/" "${RELEASE_PATH}/" || die "rsync failed"

# Symlink swap (atomic)
ln -sfn "${RELEASE_PATH}" "${LIVE_LINK}.tmp"
mv -T "${LIVE_LINK}.tmp" "${LIVE_LINK}"
log "Deployed release ${RELEASE_TAG}"

# Write baseline AFTER successful swap (#140)
echo "${total_files}" > "${BASELINE_FILE}"

# Cleanup old releases (#124) -- non-fatal
(
  cd "${RELEASE_DIR}" 2>/dev/null && \
  ls -1t | tail -n +$((MAX_RELEASES + 1)) | xargs -r rm -rf
) || log "WARNING: Cleanup of old releases failed (non-fatal)"

log "Rebuild complete"
