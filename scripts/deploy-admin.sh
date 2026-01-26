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

log "Installing dependencies..."
pnpm install --frozen-lockfile

log "Generating Prisma client..."
pnpm --filter @repo/database db:generate

log "Running database migrations..."
pnpm --filter @repo/database db:migrate:deploy || log "No pending migrations"

log "Building admin app..."
pnpm --filter @repo/admin build

log "Building web app (static export)..."
pnpm --filter @repo/web build

log "Reloading PM2 process..."
if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
  pm2 reload "$PM2_APP_NAME"
else
  log "PM2 process not found, starting..."
  pm2 start pnpm --name "$PM2_APP_NAME" -- --filter @repo/admin start
  pm2 save
fi

log "Deployment completed."
log "Admin: http://100.120.125.83:3001/"
log "Web:   http://100.120.125.83/"

