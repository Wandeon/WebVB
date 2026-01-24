# Phase 3 Remaining Infrastructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete Phase 3 infrastructure (sprints 3.6-3.9) to achieve production-ready deployment.

**Architecture:** Admin app deployed via PM2 on VPS (Tailscale access), automated PostgreSQL backups to R2, Cloudflare Pages for static site preview, monitoring via Sentry + UptimeRobot.

**Tech Stack:** PM2, Node.js 20, PostgreSQL 17, AWS CLI (R2), Cloudflare Pages, Sentry, UptimeRobot

**Constraints:**
- Domain nameservers CANNOT be changed yet
- 80/443 firewall tightening deferred until domain is proxied
- All VPS access via Tailscale (100.120.125.83)

---

## Task 1: Sprint 3.7 - Admin Deployment (PM2)

**Goal:** Deploy admin app on VPS, accessible via Tailscale.

**Files on VPS:**
- Create: `/home/deploy/apps/admin/` (app directory)
- Create: `/home/deploy/apps/admin/ecosystem.config.js` (PM2 config)
- Create: `/home/deploy/apps/admin/.env` (production env)

### Step 1.1: Install Node.js 20 on VPS

```bash
ssh deploy@100.120.125.83 '
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
'
```

**Expected:** `v20.x.x` and `10.x.x`

### Step 1.2: Install PM2 globally

```bash
ssh deploy@100.120.125.83 '
sudo npm install -g pm2
pm2 --version
'
```

**Expected:** PM2 version number

### Step 1.3: Install pnpm globally

```bash
ssh deploy@100.120.125.83 '
sudo npm install -g pnpm
pnpm --version
'
```

**Expected:** pnpm version number

### Step 1.4: Create app directory structure

```bash
ssh deploy@100.120.125.83 '
mkdir -p /home/deploy/apps/admin
mkdir -p /home/deploy/logs
'
```

### Step 1.5: Clone repository on VPS

```bash
ssh deploy@100.120.125.83 '
cd /home/deploy/apps
git clone https://github.com/Wandeon/WebVB.git admin-repo
cd admin-repo
git checkout main
'
```

### Step 1.6: Create production .env file

```bash
ssh deploy@100.120.125.83 '
# Merge database and R2 credentials into single .env
cat /root/.db_credentials > /home/deploy/apps/admin-repo/apps/admin/.env
cat /home/deploy/.env.r2 >> /home/deploy/apps/admin-repo/apps/admin/.env

# Add remaining env vars
cat >> /home/deploy/apps/admin-repo/apps/admin/.env << EOF

# App Config
NODE_ENV=production
PORT=3001

# Auth (generate new secret)
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
BETTER_AUTH_URL=http://100.120.125.83:3001

# Ollama (local)
OLLAMA_LOCAL_URL=http://127.0.0.1:11434
EOF

chmod 600 /home/deploy/apps/admin-repo/apps/admin/.env
'
```

### Step 1.7: Install dependencies and build

```bash
ssh deploy@100.120.125.83 '
cd /home/deploy/apps/admin-repo
pnpm install
pnpm build
'
```

**Expected:** Build completes without errors

### Step 1.8: Create PM2 ecosystem config

```bash
ssh deploy@100.120.125.83 '
cat > /home/deploy/apps/admin-repo/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: "vb-admin",
    cwd: "/home/deploy/apps/admin-repo/apps/admin",
    script: "node_modules/.bin/next",
    args: "start -p 3001",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "500M",
    env: {
      NODE_ENV: "production",
      PORT: 3001
    },
    error_file: "/home/deploy/logs/admin-error.log",
    out_file: "/home/deploy/logs/admin-out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  }]
}
EOF
'
```

### Step 1.9: Start app with PM2

```bash
ssh deploy@100.120.125.83 '
cd /home/deploy/apps/admin-repo
pm2 start ecosystem.config.js
pm2 save
'
```

### Step 1.10: Configure PM2 startup on boot

```bash
ssh deploy@100.120.125.83 '
pm2 startup systemd -u deploy --hp /home/deploy
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
pm2 save
'
```

### Step 1.11: Verify deployment

```bash
ssh deploy@100.120.125.83 '
pm2 status
curl -s http://127.0.0.1:3001 | head -20
'
```

**Expected:** PM2 shows "vb-admin" as "online", curl returns HTML

### Step 1.12: Gate verification

```bash
# From local machine
curl -s http://100.120.125.83:3001 | grep -o "<title>.*</title>"
```

**Gate:** Admin app responds on Tailscale IP port 3001

---

## Task 2: Sprint 3.8 - Backup Automation

**Goal:** Daily PostgreSQL backups to R2, 30-day retention.

**Files on VPS:**
- Create: `/home/deploy/scripts/backup-db.sh`
- Create: `/etc/cron.d/vb-backup`

### Step 2.1: Create backup script

```bash
ssh deploy@100.120.125.83 '
mkdir -p /home/deploy/scripts
mkdir -p /home/deploy/backups

cat > /home/deploy/scripts/backup-db.sh << "SCRIPT"
#!/bin/bash
set -euo pipefail

# Configuration
BACKUP_DIR="/home/deploy/backups"
DB_NAME="velikibukovec"
RETENTION_DAYS=30
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

# R2 Configuration
source /home/deploy/.env.r2
export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
R2_ENDPOINT="$R2_ENDPOINT"
R2_BUCKET="$R2_BUCKET_NAME"

log() { echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1"; }

log "Starting backup of $DB_NAME..."

# Create backup
sudo -u postgres pg_dump "$DB_NAME" | gzip > "$BACKUP_FILE"
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Local backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# Upload to R2
log "Uploading to R2..."
aws s3 cp "$BACKUP_FILE" "s3://${R2_BUCKET}/backups/$(basename $BACKUP_FILE)" \
    --endpoint-url "$R2_ENDPOINT" \
    --quiet

log "Upload complete"

# Clean old local backups
log "Cleaning local backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Clean old R2 backups
log "Cleaning R2 backups older than $RETENTION_DAYS days..."
CUTOFF_DATE=$(date -d "-${RETENTION_DAYS} days" +%Y-%m-%d)
aws s3 ls "s3://${R2_BUCKET}/backups/" --endpoint-url "$R2_ENDPOINT" | while read -r line; do
    FILE_DATE=$(echo "$line" | awk "{print \$1}")
    FILE_NAME=$(echo "$line" | awk "{print \$4}")
    if [[ "$FILE_DATE" < "$CUTOFF_DATE" && -n "$FILE_NAME" ]]; then
        aws s3 rm "s3://${R2_BUCKET}/backups/$FILE_NAME" --endpoint-url "$R2_ENDPOINT" --quiet
        log "Deleted old backup: $FILE_NAME"
    fi
done

log "Backup complete!"
SCRIPT

chmod +x /home/deploy/scripts/backup-db.sh
'
```

### Step 2.2: Test backup script manually

```bash
ssh deploy@100.120.125.83 '
/home/deploy/scripts/backup-db.sh
'
```

**Expected:** Backup created and uploaded to R2

### Step 2.3: Verify backup in R2

```bash
ssh deploy@100.120.125.83 '
source /home/deploy/.env.r2
export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
aws s3 ls "s3://$R2_BUCKET_NAME/backups/" --endpoint-url "$R2_ENDPOINT"
'
```

**Expected:** Backup file listed

### Step 2.4: Create cron job for daily backup

```bash
ssh deploy@100.120.125.83 '
echo "0 3 * * * deploy /home/deploy/scripts/backup-db.sh >> /home/deploy/logs/backup.log 2>&1" | sudo tee /etc/cron.d/vb-backup
sudo chmod 644 /etc/cron.d/vb-backup
'
```

**Expected:** Cron job created (runs daily at 3am)

### Step 2.5: Gate verification

```bash
ssh deploy@100.120.125.83 '
# Verify cron exists
cat /etc/cron.d/vb-backup

# Verify latest backup in R2
source /home/deploy/.env.r2
export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
aws s3 ls "s3://$R2_BUCKET_NAME/backups/" --endpoint-url "$R2_ENDPOINT" | tail -1
'
```

**Gate:** Cron job exists, at least one backup in R2

---

## Task 3: Sprint 3.6 (Partial) - Cloudflare Pages Preview

**Goal:** Deploy static public site to Cloudflare Pages (*.pages.dev subdomain).

**Constraint:** Cannot configure custom domain yet. Will use `vb-staging.pages.dev`.

**Files:**
- Verify: `apps/web/next.config.ts` (static export configured)

### Step 3.1: Verify static export configuration

```bash
cd /mnt/c/VelikiBukovec_web/.worktrees/infra-sprint-3
cat apps/web/next.config.ts | grep -A5 "output"
```

**Expected:** `output: 'export'` configured

### Step 3.2: Build static site locally

```bash
cd /mnt/c/VelikiBukovec_web/.worktrees/infra-sprint-3
pnpm build --filter=@repo/web
ls -la apps/web/out/
```

**Expected:** Static files in `apps/web/out/`

### Step 3.3: Connect repository to Cloudflare Pages

**Manual step in Cloudflare Dashboard:**
1. Go to Cloudflare Dashboard → Pages
2. Create project → Connect to Git
3. Select repository: `Wandeon/WebVB`
4. Configure build:
   - Build command: `pnpm build --filter=@repo/web`
   - Build output directory: `apps/web/out`
   - Root directory: `/`
   - Environment variables: `NODE_VERSION=20`
5. Deploy

**Expected:** Project created, initial deploy triggered

### Step 3.4: Verify Pages deployment

```bash
curl -s https://webvb.pages.dev | head -20
```

**Expected:** HTML response from static site

### Step 3.5: Gate verification

**Gate:** `https://<project>.pages.dev` returns static site content

**Note:** Firewall tightening (locking 80/443 to Cloudflare IPs) deferred until domain nameservers changed.

---

## Task 4: Sprint 3.9 - Monitoring Setup

**Goal:** Error tracking via Sentry, uptime monitoring via UptimeRobot.

### Step 4.1: Create Sentry project

**Manual step:**
1. Go to sentry.io → Create Project
2. Platform: Next.js
3. Project name: `velikibukovec-admin`
4. Copy DSN

### Step 4.2: Install Sentry SDK in admin app

```bash
cd /mnt/c/VelikiBukovec_web/.worktrees/infra-sprint-3
pnpm add @sentry/nextjs --filter=@repo/admin
```

### Step 4.3: Configure Sentry in admin app

Create `apps/admin/sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
});
```

Create `apps/admin/sentry.server.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
});
```

### Step 4.4: Add Sentry DSN to VPS environment

```bash
ssh deploy@100.120.125.83 '
echo "SENTRY_DSN=<your-sentry-dsn>" >> /home/deploy/apps/admin-repo/apps/admin/.env
'
```

### Step 4.5: Configure UptimeRobot

**Manual step:**
1. Go to uptimerobot.com → Add New Monitor
2. Monitor Type: HTTP(s)
3. Friendly Name: `VB Admin (Tailscale)`
4. URL: `http://100.120.125.83:3001` (Note: requires UptimeRobot to be on Tailscale, or use different approach)

**Alternative for admin:** Monitor via Tailscale-accessible endpoint or skip until public URL available.

**For Pages site:**
1. Add New Monitor
2. URL: `https://webvb.pages.dev`
3. Monitoring Interval: 5 minutes

### Step 4.6: Redeploy admin with Sentry

```bash
ssh deploy@100.120.125.83 '
cd /home/deploy/apps/admin-repo
git pull
pnpm install
pnpm build
pm2 restart vb-admin
'
```

### Step 4.7: Gate verification

```bash
# Verify Sentry is initialized (check logs)
ssh deploy@100.120.125.83 'pm2 logs vb-admin --lines 20 | grep -i sentry'

# Verify UptimeRobot (check dashboard for green status)
```

**Gate:** Sentry DSN configured, UptimeRobot monitoring Pages site

---

## Summary

| Sprint | Task | Gate | Status |
|--------|------|------|--------|
| 3.7 | Admin Deployment | PM2 serves admin on VPS | Pending |
| 3.8 | Backup Automation | Daily DB backup to R2 | Pending |
| 3.6 | Cloudflare Pages | Preview deploys working (*.pages.dev) | Pending |
| 3.9 | Monitoring Setup | Sentry + UptimeRobot configured | Pending |

**Deferred:** Firewall tightening (80/443 to Cloudflare IPs only) - requires domain nameserver change.

---

## Execution Order

1. **Task 1 (Sprint 3.7)** - Admin deployment first (other tasks may need app running)
2. **Task 2 (Sprint 3.8)** - Backup automation (depends on DB, independent of app)
3. **Task 3 (Sprint 3.6)** - Cloudflare Pages (can run in parallel)
4. **Task 4 (Sprint 3.9)** - Monitoring (needs app deployed first)

**Estimated total:** 4 tasks, ~30-45 minutes execution time
