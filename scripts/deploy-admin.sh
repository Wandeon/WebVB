#!/usr/bin/env bash
#
# deploy-admin.sh - Automated deployment script for VPS
#
# Called by GitHub Actions workflow after SSH connection.
# Pulls latest code, builds both apps, and restarts services.
#
set -euo pipefail

APP_DIR="${APP_DIR:-/home/deploy/apps/admin-repo}"
PM2_APP_NAME="${PM2_APP_NAME:-vb-admin}"
ADMIN_HOST="${ADMIN_HOST:-127.0.0.1}"
ADMIN_PORT="${ADMIN_PORT:-3001}"

log() {
  printf '[%s] %s\n' "$(date +"%Y-%m-%d %H:%M:%S")" "$1"
}

error() {
  printf '[%s] ERROR: %s\n' "$(date +"%Y-%m-%d %H:%M:%S")" "$1" >&2
  exit 1
}

cd "$APP_DIR" || error "Failed to cd to $APP_DIR"

# Load environment from apps/admin/.env
if [[ -f apps/admin/.env ]]; then
  set -a
  source apps/admin/.env
  set +a
  log "Loaded apps/admin/.env"
elif [[ -f .env ]]; then
  set -a
  source .env
  set +a
  log "Loaded .env"
fi

# Verify DATABASE_URL
[[ -z "${DATABASE_URL:-}" ]] && error "DATABASE_URL not set"

log "Fetching latest code..."
git fetch --prune origin
git reset --hard origin/main
git clean -fd

log "Cleaning build artifacts and locks..."
rm -rf apps/*/.next apps/web/out .turbo
# Ensure clean directories exist (no stale locks)
mkdir -p apps/admin/.next apps/web/.next

log "Installing dependencies (including dev deps for build)..."
NODE_ENV=development pnpm install --no-frozen-lockfile

log "Generating Prisma client..."
pnpm --filter @repo/database db:generate

log "Running database migrations..."
pnpm --filter @repo/database db:migrate || log "No pending migrations"

log "Running data migrations..."
pnpm --filter @repo/database fix-page-slugs || log "Page slug migration completed or skipped"

log "Rebuilding search index..."
pnpm --filter @repo/database backfill-search || log "Search index rebuild completed or skipped"

log "Building admin app..."
pnpm --filter @repo/admin build

log "Building web app (static export)..."
# Ensure NEXT_PUBLIC_API_URL is set for client-side API calls
if [[ -z "${NEXT_PUBLIC_API_URL:-}" ]]; then
  if [[ "$ADMIN_HOST" == "127.0.0.1" || "$ADMIN_HOST" == "localhost" ]]; then
    export NEXT_PUBLIC_API_URL="http://${ADMIN_HOST}:${ADMIN_PORT}"
  else
    error "NEXT_PUBLIC_API_URL must be set explicitly for non-local deployments"
  fi
fi

if [[ -z "${NEXT_PUBLIC_SITE_URL:-}" ]]; then
  if [[ "$ADMIN_HOST" == "127.0.0.1" || "$ADMIN_HOST" == "localhost" ]]; then
    export NEXT_PUBLIC_SITE_URL="http://${ADMIN_HOST}"
  else
    error "NEXT_PUBLIC_SITE_URL must be set explicitly for non-local deployments"
  fi
fi

log "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
pnpm --filter @repo/web build

log "Deploying static web files..."
WEB_OUT_DIR="$APP_DIR/apps/web/out"
WEB_STATIC_DIR="/home/deploy/apps/web-static"
if [[ -d "$WEB_OUT_DIR" ]]; then
  # Clear old static files and copy new ones
  rm -rf "$WEB_STATIC_DIR"/*
  cp -r "$WEB_OUT_DIR"/* "$WEB_STATIC_DIR/"
  log "Static files deployed to $WEB_STATIC_DIR ($(ls -1 "$WEB_STATIC_DIR"/*.html 2>/dev/null | wc -l) HTML files)"
else
  error "Web output directory not found: $WEB_OUT_DIR"
fi

log "Reloading PM2 process..."
if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
  pm2 reload "$PM2_APP_NAME" --update-env
else
  log "PM2 process not found, starting..."
  HOSTNAME="$ADMIN_HOST" PORT="$ADMIN_PORT" pm2 start pnpm --name "$PM2_APP_NAME" -- --filter @repo/admin start -- --hostname "$ADMIN_HOST" --port "$ADMIN_PORT"
  pm2 save
fi

log "Health check (admin)..."
curl --fail --silent "http://${ADMIN_HOST}:${ADMIN_PORT}/api/healthz" > /dev/null

log "Deployment completed."
log "Admin: http://${ADMIN_HOST}:${ADMIN_PORT}/"
log "Web:   http://${ADMIN_HOST}/"
