#!/usr/bin/env bash
set -euo pipefail

DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}"
BACKUP_DIR="${BACKUP_DIR:-/home/deploy/backups}"

R2_BUCKET="${CLOUDFLARE_R2_BUCKET_NAME:?CLOUDFLARE_R2_BUCKET_NAME is required}"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID is required}"
ACCESS_KEY_ID="${CLOUDFLARE_R2_ACCESS_KEY_ID:?CLOUDFLARE_R2_ACCESS_KEY_ID is required}"
SECRET_ACCESS_KEY="${CLOUDFLARE_R2_SECRET_ACCESS_KEY:?CLOUDFLARE_R2_SECRET_ACCESS_KEY is required}"
R2_PREFIX="${R2_PREFIX:-backups}"
R2_ENDPOINT="https://${ACCOUNT_ID}.r2.cloudflarestorage.com"

RESTORE_KEY="${RESTORE_KEY:-}"
CONFIRM_RESTORE="${CONFIRM_RESTORE:-}"

log() {
  printf '[%s] %s\n' "$(date +"%Y-%m-%d %H:%M:%S")" "$1"
}

if [[ "$CONFIRM_RESTORE" != "YES" ]]; then
  log "Refusing to restore without CONFIRM_RESTORE=YES."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

export AWS_ACCESS_KEY_ID="$ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$SECRET_ACCESS_KEY"

if [[ -z "$RESTORE_KEY" ]]; then
  RESTORE_KEY="$(aws s3 ls "s3://${R2_BUCKET}/${R2_PREFIX}/" --endpoint-url "$R2_ENDPOINT" | tail -1 | awk '{print $4}')"
fi

if [[ -z "$RESTORE_KEY" ]]; then
  log "No backup files found in s3://${R2_BUCKET}/${R2_PREFIX}/"
  exit 1
fi

RESTORE_FILE="${BACKUP_DIR}/${RESTORE_KEY}"

log "Downloading backup ${RESTORE_KEY}..."
aws s3 cp "s3://${R2_BUCKET}/${R2_PREFIX}/${RESTORE_KEY}" "$RESTORE_FILE" \
  --endpoint-url "$R2_ENDPOINT" \
  --only-show-errors

log "Restoring database from ${RESTORE_FILE}..."
gunzip -c "$RESTORE_FILE" | psql "$DATABASE_URL"

log "Restore completed successfully."
