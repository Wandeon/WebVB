#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/home/deploy/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-90}"
DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}"

R2_BUCKET="${CLOUDFLARE_R2_BUCKET_NAME:?CLOUDFLARE_R2_BUCKET_NAME is required}"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID is required}"
ACCESS_KEY_ID="${CLOUDFLARE_R2_ACCESS_KEY_ID:?CLOUDFLARE_R2_ACCESS_KEY_ID is required}"
SECRET_ACCESS_KEY="${CLOUDFLARE_R2_SECRET_ACCESS_KEY:?CLOUDFLARE_R2_SECRET_ACCESS_KEY is required}"
R2_PREFIX="${R2_PREFIX:-backups}"
R2_ENDPOINT="https://${ACCOUNT_ID}.r2.cloudflarestorage.com"

DATE_STAMP="$(date +%Y-%m-%d_%H-%M-%S)"
BACKUP_FILE="${BACKUP_DIR}/velikibukovec_${DATE_STAMP}.sql.gz"

log() {
  printf '[%s] %s\n' "$(date +"%Y-%m-%d %H:%M:%S")" "$1"
}

mkdir -p "$BACKUP_DIR"

export AWS_ACCESS_KEY_ID="$ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$SECRET_ACCESS_KEY"

log "Starting database backup..."
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"
log "Local backup created: ${BACKUP_FILE}"

log "Uploading backup to R2..."
aws s3 cp "$BACKUP_FILE" "s3://${R2_BUCKET}/${R2_PREFIX}/$(basename "$BACKUP_FILE")" \
  --endpoint-url "$R2_ENDPOINT" \
  --only-show-errors
log "Upload complete."

log "Removing local backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

log "Removing R2 backups older than ${RETENTION_DAYS} days..."
CUTOFF_DATE="$(date -d "-${RETENTION_DAYS} days" +%Y-%m-%d)"
aws s3 ls "s3://${R2_BUCKET}/${R2_PREFIX}/" --endpoint-url "$R2_ENDPOINT" | while read -r line; do
  FILE_DATE="$(echo "$line" | awk '{print $1}')"
  FILE_NAME="$(echo "$line" | awk '{print $4}')"
  if [[ -n "$FILE_NAME" && "$FILE_DATE" < "$CUTOFF_DATE" ]]; then
    aws s3 rm "s3://${R2_BUCKET}/${R2_PREFIX}/${FILE_NAME}" --endpoint-url "$R2_ENDPOINT" --only-show-errors
    log "Deleted old backup: ${FILE_NAME}"
  fi
done

log "Backup completed successfully."
