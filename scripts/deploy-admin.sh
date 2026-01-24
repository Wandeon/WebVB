#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/deploy/apps/admin-repo}"
PM2_APP_NAME="${PM2_APP_NAME:-vb-admin}"

log() {
  printf '[%s] %s\n' "$(date +"%Y-%m-%d %H:%M:%S")" "$1"
}

cd "$APP_DIR"

log "Fetching latest code..."
git fetch --prune
git checkout main
git pull --ff-only

log "Installing dependencies..."
pnpm install --frozen-lockfile

log "Running database migrations..."
pnpm db:migrate

log "Building admin app..."
pnpm build --filter @repo/admin

log "Reloading PM2 process..."
pm2 reload "$PM2_APP_NAME"

log "Deployment completed."
