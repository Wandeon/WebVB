# VPS Staging Environment Setup

Deploy both admin (backend) and web (static frontend) to a fresh VPS with IP:port access.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        VPS                              │
│                                                         │
│   :80 ──► Caddy ──► /srv/web/out (static files)        │
│                                                         │
│   :3001 ──► Caddy ──► localhost:3001 (admin app)       │
│                                                         │
│   :5432 ──► PostgreSQL (internal only)                 │
│                                                         │
│   Admin App (Node.js) runs as systemd service          │
└─────────────────────────────────────────────────────────┘

Access:
  Frontend:  http://YOUR_VPS_IP/
  Admin:     http://YOUR_VPS_IP:3001/
```

## Prerequisites

- Fresh Ubuntu 22.04+ VPS
- SSH access as root or sudo user
- Git repo accessible (GitHub/GitLab)

---

## Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git unzip build-essential

# Create app user (optional but recommended)
sudo useradd -m -s /bin/bash appuser
```

## Step 2: Install Node.js 20+

```bash
# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v20.x+
npm --version
```

## Step 3: Install pnpm

```bash
# Install pnpm globally
sudo npm install -g pnpm

# Verify
pnpm --version
```

## Step 4: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER velikibukovec WITH PASSWORD 'CHANGE_THIS_PASSWORD';
CREATE DATABASE velikibukovec_staging OWNER velikibukovec;
GRANT ALL PRIVILEGES ON DATABASE velikibukovec_staging TO velikibukovec;
EOF

# Verify connection
PGPASSWORD='CHANGE_THIS_PASSWORD' psql -h localhost -U velikibukovec -d velikibukovec_staging -c '\conninfo'
```

## Step 5: Install Caddy

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

# Verify
caddy version
```

## Step 6: Clone and Build the Project

```bash
# Create deployment directory
sudo mkdir -p /srv
sudo chown $USER:$USER /srv
cd /srv

# Clone repository (replace with your repo URL)
git clone https://github.com/YOUR_USERNAME/VelikiBukovec_web.git app
cd app

# Install dependencies
pnpm install

# Create environment files (see Step 7 first)
```

## Step 7: Environment Configuration

### Admin App (`/srv/app/apps/admin/.env`)

```bash
cat > /srv/app/apps/admin/.env <<'EOF'
# Database
DATABASE_URL="postgresql://velikibukovec:CHANGE_THIS_PASSWORD@localhost:5432/velikibukovec_staging"

# NextAuth
NEXTAUTH_URL="http://YOUR_VPS_IP:3001"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# App
NODE_ENV="production"

# File uploads (local storage for staging)
UPLOAD_DIR="/srv/app/uploads"
NEXT_PUBLIC_UPLOAD_URL="http://YOUR_VPS_IP:3001/uploads"

# Public API URL (for web app to call)
NEXT_PUBLIC_API_URL="http://YOUR_VPS_IP:3001"
EOF
```

### Web App (`/srv/app/apps/web/.env`)

```bash
cat > /srv/app/apps/web/.env <<'EOF'
# Site URL (for canonical URLs, sitemap, etc.)
NEXT_PUBLIC_SITE_URL="http://YOUR_VPS_IP"

# API URL for client-side fetching
NEXT_PUBLIC_API_URL="http://YOUR_VPS_IP:3001"

# Database (needed for static generation)
DATABASE_URL="postgresql://velikibukovec:CHANGE_THIS_PASSWORD@localhost:5432/velikibukovec_staging"
EOF
```

### Generate NextAuth Secret

```bash
openssl rand -base64 32
# Use this output in NEXTAUTH_SECRET
```

## Step 8: Database Migration & Seed

```bash
cd /srv/app

# Generate Prisma client
pnpm --filter @repo/database db:generate

# Run migrations
pnpm --filter @repo/database db:migrate

# Seed with test data (optional)
pnpm --filter @repo/database db:seed
```

## Step 9: Build Applications

```bash
cd /srv/app

# Build shared packages first
pnpm --filter @repo/shared build
pnpm --filter @repo/ui build

# Build admin app
pnpm --filter @repo/admin build

# Build web app (static export)
pnpm --filter @repo/web build

# Verify static output exists
ls -la apps/web/out/
```

## Step 10: Create Upload Directory

```bash
sudo mkdir -p /srv/app/uploads
sudo chown $USER:$USER /srv/app/uploads
```

## Step 11: Systemd Service for Admin App

```bash
sudo cat > /etc/systemd/system/velikibukovec-admin.service <<'EOF'
[Unit]
Description=Veliki Bukovec Admin App
After=network.target postgresql.service

[Service]
Type=simple
User=appuser
Group=appuser
WorkingDirectory=/srv/app/apps/admin
ExecStart=/usr/bin/node /srv/app/apps/admin/.next/standalone/apps/admin/server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=vb-admin
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=HOSTNAME=0.0.0.0

[Install]
WantedBy=multi-user.target
EOF

# If not using standalone output, use this instead:
sudo cat > /etc/systemd/system/velikibukovec-admin.service <<'EOF'
[Unit]
Description=Veliki Bukovec Admin App
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/srv/app/apps/admin
ExecStart=/usr/bin/npx next start -p 3001 -H 0.0.0.0
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=vb-admin
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable velikibukovec-admin
sudo systemctl start velikibukovec-admin

# Check status
sudo systemctl status velikibukovec-admin

# View logs
sudo journalctl -u velikibukovec-admin -f
```

## Step 12: Configure Caddy

```bash
sudo cat > /etc/caddy/Caddyfile <<'EOF'
# Frontend - Static files on port 80
:80 {
    root * /srv/app/apps/web/out

    # Enable file server
    file_server

    # SPA fallback - try files, then index.html
    try_files {path} {path}.html {path}/ /index.html

    # Cache static assets
    @static {
        path /_next/* /images/* /fonts/* *.css *.js *.ico *.png *.jpg *.svg *.woff2
    }
    header @static Cache-Control "public, max-age=31536000, immutable"

    # Security headers
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    # Gzip compression
    encode gzip

    log {
        output file /var/log/caddy/web-access.log
    }
}

# Admin API/App on port 3001
:3001 {
    reverse_proxy localhost:3001

    # Handle uploads directory
    handle_path /uploads/* {
        root * /srv/app
        file_server
    }

    log {
        output file /var/log/caddy/admin-access.log
    }
}
EOF

# Create log directory
sudo mkdir -p /var/log/caddy

# Validate config
sudo caddy validate --config /etc/caddy/Caddyfile

# Reload Caddy
sudo systemctl reload caddy

# Check status
sudo systemctl status caddy
```

## Step 13: Firewall Configuration

```bash
# Allow HTTP, HTTPS, and admin port
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 22/tcp  # SSH

# Enable firewall
sudo ufw enable
sudo ufw status
```

## Step 14: Verify Deployment

```bash
# Check admin service
curl http://localhost:3001/api/health  # If you have a health endpoint

# Check from outside (replace with your VPS IP)
curl http://YOUR_VPS_IP/
curl http://YOUR_VPS_IP:3001/
```

---

## Deployment Script (All-in-One)

Save as `/srv/deploy.sh` for quick redeployments:

```bash
#!/bin/bash
set -e

cd /srv/app

echo ">>> Pulling latest code..."
git pull origin main

echo ">>> Installing dependencies..."
pnpm install

echo ">>> Building packages..."
pnpm --filter @repo/shared build
pnpm --filter @repo/ui build

echo ">>> Running migrations..."
pnpm --filter @repo/database db:migrate

echo ">>> Building admin..."
pnpm --filter @repo/admin build

echo ">>> Building web (static)..."
pnpm --filter @repo/web build

echo ">>> Restarting admin service..."
sudo systemctl restart velikibukovec-admin

echo ">>> Done! Checking services..."
sudo systemctl status velikibukovec-admin --no-pager
curl -s http://localhost:3001/ | head -5 || echo "Admin may need a moment to start..."

echo ""
echo "Frontend: http://$(curl -s ifconfig.me)/"
echo "Admin:    http://$(curl -s ifconfig.me):3001/"
```

Make executable:
```bash
chmod +x /srv/deploy.sh
```

---

## Troubleshooting

### Admin won't start
```bash
# Check logs
sudo journalctl -u velikibukovec-admin -n 50 --no-pager

# Check if port is in use
sudo lsof -i :3001

# Run manually to see errors
cd /srv/app/apps/admin && NODE_ENV=production npx next start -p 3001
```

### Static files not loading
```bash
# Check Caddy logs
sudo tail -f /var/log/caddy/web-access.log

# Verify files exist
ls -la /srv/app/apps/web/out/

# Check Caddy config
sudo caddy validate --config /etc/caddy/Caddyfile
```

### Database connection issues
```bash
# Test connection
PGPASSWORD='your_password' psql -h localhost -U velikibukovec -d velikibukovec_staging

# Check PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### Permission issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /srv/app
sudo chown -R www-data:www-data /srv/app/apps/web/out  # If using www-data
```

---

## Quick Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend (static) | 80 | `http://VPS_IP/` |
| Admin (Next.js) | 3001 | `http://VPS_IP:3001/` |
| PostgreSQL | 5432 | localhost only |

| Command | Description |
|---------|-------------|
| `sudo systemctl restart velikibukovec-admin` | Restart admin app |
| `sudo systemctl reload caddy` | Reload Caddy config |
| `sudo journalctl -u velikibukovec-admin -f` | Admin logs |
| `sudo tail -f /var/log/caddy/*.log` | Caddy logs |
| `/srv/deploy.sh` | Full redeploy |
